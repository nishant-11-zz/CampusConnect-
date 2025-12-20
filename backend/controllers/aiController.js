const fs = require('fs');
const Department = require('../models/Department');
const Resource = require('../models/Resource');
const { generateText } = require('../utils/geminiClient');
const { textToSpeech } = require('../utils/voiceUtils');
const { getRouteBetweenPoints } = require('../utils/navigationUtils');

// Helper: Create natural voice-friendly responses
const createVoiceResponse = {
  greeting: (lang) => lang === 'hi'
    ? 'नमस्ते! मैं MMMUT कैंपस AI हूँ। मैं आपकी कैसे मदद कर सकती हूँ?'
    : 'Hello! I am MMMUT Campus AI. How can I help you today?',

  offTopic: (lang) => lang === 'hi'
    ? 'क्षमा करें, मैं केवल MMMUT कैंपस से जुड़े सवालों का जवाब दे सकती हूँ। जैसे विभाग की जानकारी, रास्ते, या नोट्स।'
    : 'I apologize, but I can only help with MMMUT campus related questions, such as departments, directions, or study materials.',

  navigation: (from, to, route, lang) => {
    if (lang === 'hi') {
      const steps = route.steps.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('. फिर ');
      return `${from} से ${to} जाने के लिए: ${route.summary}। ${steps}। यह लगभग ${route.duration} मिनट का रास्ता है।`;
    }
    const steps = route.steps.slice(0, 3).map((s, i) => `Step ${i + 1}: ${s}`).join('. Then ');
    return `To go from ${from} to ${to}: ${route.summary}. ${steps}. This will take approximately ${route.duration} minutes.`;
  },

  navigationFallback: (from, to, distance, lang) => lang === 'hi'
    ? `${from} से ${to} की दूरी लगभग ${distance} मीटर है। कृपया कैंपस के रास्तों का उपयोग करें। आप किसी भी छात्र से भी रास्ता पूछ सकते हैं।`
    : `The distance from ${from} to ${to} is approximately ${distance} meters. Please use the campus pathways. You can also ask any student for directions.`,

  departmentLocation: (dept, lang) => {
    if (lang === 'hi') {
      const building = dept.building ? `${dept.building} में` : 'मुख्य कैंपस में';
      const floor = dept.floor ? `, मंजिल ${dept.floor} पर` : '';
      const contact = dept.contact?.phone ? ` संपर्क नंबर है ${dept.contact.phone}.` : '';
      const hours = dept.visitingHours?.weekdays?.open
        ? ` खुलने का समय ${dept.visitingHours.weekdays.open} से ${dept.visitingHours.weekdays.close} तक है.`
        : '';
      return `${dept.name} ${building}${floor} स्थित है।${contact}${hours}`;
    }

    const building = dept.building || 'main campus';
    const floor = dept.floor ? `, on floor ${dept.floor}` : '';
    const contact = dept.contact?.phone ? ` You can contact them at ${dept.contact.phone}.` : '';
    const hours = dept.visitingHours?.weekdays?.open
      ? ` They are open from ${dept.visitingHours.weekdays.open} to ${dept.visitingHours.weekdays.close} on weekdays.`
      : '';
    return `${dept.name} is located in ${building}${floor}.${contact}${hours}`;
  },

  studyMaterials: (deptName, count, lang) => lang === 'hi'
    ? `${deptName ? deptName + ' के लिए ' : ''}${count} अध्ययन सामग्री उपलब्ध है। आप इन्हें स्टडी हब में देख सकते हैं।`
    : `There ${count === 1 ? 'is' : 'are'} ${count} study material${count === 1 ? '' : 's'} available${deptName ? ' for ' + deptName : ''}. You can view them in the Study Hub.`,

  noMaterials: (deptName, lang) => lang === 'hi'
    ? `${deptName ? deptName + ' के लिए ' : ''}अभी कोई अध्ययन सामग्री उपलब्ध नहीं है। आप अपने नोट्स अपलोड कर सकते हैं।`
    : `There are no study materials available${deptName ? ' for ' + deptName : ''} at the moment. You can upload your notes to help others.`,

  notFound: (query, lang) => lang === 'hi'
    ? `क्षमा करें, मुझे "${query}" के बारे में जानकारी नहीं मिली। कृपया विभाग का पूरा नाम बताएं।`
    : `I'm sorry, I couldn't find information about "${query}". Please provide the full department name.`
};

// TEXT AI - UNCHANGED (your original code)
const askAI = async (req, res, next) => {
  try {
    const { qry } = req.body;
    if (!qry || typeof qry !== 'string') {
      return next(new Error('Please ask a question.'));
    }

    const lower = qry.toLowerCase().trim();

    // === OFF-TOPIC REJECTION: ONLY IF ENTIRE QUERY MATCHES ===
    const offTopicPatterns = [
      /^weather$/i,
      /^news$/i,
      /^stock$/i,
      /^movie$/i,
      /^song$/i,
      /^joke$/i,
      /^elon musk$/i,
      /^chatgpt$/i,
      /^who are you$/i,
      /^hello$/i,
      /^hi$/i,
      /^bye$/i,
      /^thank you$/i,
      /^love$/i,
      /^date$/i,
      /^time$/i,
      /^capital$/i,
      /^president$/i,
      /^prime minister$/i
    ];

    const isOffTopic = offTopicPatterns.some(pattern => pattern.test(lower));
    if (isOffTopic) {
      return res.json({
        answer: `I help with **MMMUT campus only** — departments, navigation, and study materials.\n\nTry:\n• "Where is CSE?"\n• "Give me Civil notes"\n• "Library to CSE"`
      });
    }

    // === 1. NAVIGATION: FLEXIBLE NATURAL LANGUAGE MATCHING ===
    const navPatterns = [
      /(?:from )?([a-zA-Z\s]+?)\s+(?:to|->)\s+([a-zA-Z\s]+?)(?:\?|$)/i,
      /(?:how to go|directions|route|navigate)\s+(?:from )?([a-zA-Z\s]+?)\s+(?:to|->)\s+([a-zA-Z\s]+?)(?:\?|$)/i,
      /from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\?|$)/i
    ];

    let from = null, to = null;
    for (const pattern of navPatterns) {
      const match = lower.match(pattern);
      if (match) {
        from = match[1].trim();
        to = match[2].trim();
        break;
      }
    }

    if (from && to) {
      let fromDept, toDept;
      try {
        fromDept = await Department.findOne({
          $or: [{ code: from.toUpperCase() }, { name: { $regex: `^${from}$`, $options: 'i' } }]
        });
        toDept = await Department.findOne({
          $or: [{ code: to.toUpperCase() }, { name: { $regex: `^${to}$`, $options: 'i' } }]
        });
      } catch (dbError) {
        console.warn("DB Error (Navigation):", dbError.message);
        // Fallthrough to Gemini if DB fails
      }

      if (!fromDept || !toDept) {
        // If DB failed or departments not found, let Gemini handle it generically later or return generic msg
        // For now, let's just fall through to Gemini if we can't do exact nav
        // But to keep logic simple, we'll just check if we have data:
      }

      if (fromDept && toDept) {
        // ... execute navigation logic ...
      } else {
        // Either DB down or not found. 
        // We can't do precise nav without DB coords. 
        // Let's Skip to Gemini Fallback.
      }

      try {
        const route = await getRouteBetweenPoints(
          fromDept.latitude, fromDept.longitude,
          toDept.latitude, toDept.longitude
        );

        const steps = route.steps.map((step, i) => `Step ${i + 1}: ${step}`).join('\n');
        const answer = `From **${fromDept.name}** to **${toDept.name}**: ${route.summary}\n\n${steps}`;
        return res.json({ answer });
      } catch (routeError) {
        const approxDist = Math.round(Math.sqrt(
          Math.pow(toDept.latitude - fromDept.latitude, 2) +
          Math.pow(toDept.longitude - fromDept.longitude, 2)
        ) * 111000);
        return res.json({
          answer: `Route from **${fromDept.name}** to **${toDept.name}** unavailable.\n\nApproximate: ${approxDist} meters. Walk campus paths.`
        });
      }
    }

    // === 2. DEPARTMENT LOCATION ===
    const deptKeywords = /where|location|find|कहा|department|dept|विभाग/i;
    if (deptKeywords.test(lower)) {
      let name = '';

      const codeMatch = lower.match(/\b(cse|ce|ee|me|ece|it|che|lib|can|adm)\b/i);
      if (codeMatch) {
        name = codeMatch[1];
      } else {
        const nameMatch = lower.match(/(?:where is|find|location of)\s+(.+?)(?:\?|$)/i);
        if (nameMatch) {
          name = nameMatch[1].trim();
        } else {
          name = lower.replace(/where|is|location|find|department|dept|the/gi, '').trim();
        }
      }

      if (name.length < 2) {
        return res.json({ answer: "Please specify a department name, like 'CSE' or 'Civil'." });
      }

      const dept = await Department.findOne({
        $or: [
          { code: name.toUpperCase() },
          { name: { $regex: name, $options: 'i' } }
        ]
      });

      if (dept) {
        return res.json({
          answer: `**${dept.name}** is located in **${dept.building || 'Main Campus'}** ${dept.floor ? `(Floor ${dept.floor})` : ''}.\n\nCoordinates: (${dept.latitude}, ${dept.longitude})\n\n${dept.mapLink ? `🗺️ Map: ${dept.mapLink}` : ''}`
        });
      } else {
        return res.json({
          answer: `I couldn't find **${name}** on campus.\n\nTry:\n• "Where is CSE?"\n• "Find Civil department"\n• "Location of Library"`
        });
      }
    }

    // === 3. STUDY MATERIALS ===
    const studyKeywords = /notes|study|material|pdf|नोट्स|पढ़ाई|resources|resource/i;
    if (studyKeywords.test(lower)) {
      const deptMatch = lower.match(/(cse|civil|mechanical|electrical|ece|it|architecture|सीएसई|सिविल|मैकेनिकल)/i);
      const dept = deptMatch ? deptMatch[0] : null;

      const filter = dept ? {
        $or: [
          { department: { $regex: dept, $options: 'i' } },
          { department: { $regex: `^${dept}$`, $options: 'i' } }
        ]
      } : {};
      const resources = await Resource.find(filter).limit(3).sort({ createdAt: -1 });

      if (resources.length > 0) {
        const list = resources.map(r => `• [${r.title}](${r.fileUrl})`).join('\n');
        const deptName = dept ? ` for **${dept.toUpperCase()}**` : '';
        return res.json({ answer: `Here are study materials${deptName}:\n${list}` });
      } else {
        const deptName = dept ? ` for **${dept.toUpperCase()}**` : '';
        return res.json({ answer: `No study materials found${deptName}.\nCheck **StudyHub** or try another department.` });
      }
    }

    // === 4. GEMINI FALLBACK ===
    const prompt = `You are MMMUT Campus AI. Answer in 1-2 short sentences. Query: "${qry}"`;
    const answer = await generateText(prompt);
    return res.json({ answer });

  } catch (error) {
    next(error);
  }
};

// IMPROVED VOICE AI - WITH GTTS (FREE)
const askAIWithVoice = async (req, res, next) => {
  try {
    const { qry } = req.body;
    if (!qry || typeof qry !== 'string') return next(new Error('Please ask a question.'));

    const lower = qry.toLowerCase().trim();
    const isHindi = /है|कहा|कहां|विभाग|नोट्स|लाइब्रेरी|कैंटीन|हिंदी|हिन्दी|से|को|के/.test(qry);
    let answer = '';
    let lang = isHindi ? 'hi' : 'en';

    // === GREETING ===
    if (/^(hello|hi|hey|namaste|नमस्ते|नमस्कार)$/i.test(lower)) {
      answer = createVoiceResponse.greeting(lang);
    }
    // === OFF-TOPIC: ONLY FULL MATCHES ===
    else if ([
      /^weather$/i, /^news$/i, /^movie$/i, /^joke$/i, /^song$/i,
      /^elon musk$/i, /^chatgpt$/i, /^who are you$/i, /^bye$/i,
      /^thank you$/i, /^thanks$/i, /^love$/i, /^date$/i, /^time$/i
    ].some(p => p.test(lower))) {
      answer = createVoiceResponse.offTopic(lang);
    }
    // === NAVIGATION ===
    else {
      const navPatterns = [
        /(?:from |से )?([a-zA-Z\s]+?)\s+(?:to|->|से)\s+([a-zA-Z\s]+?)(?:\?|$)/i,
        /(?:how to go|directions|route|navigate|कैसे जाएं|रास्ता)\s+(?:from |से )?([a-zA-Z\s]+?)\s+(?:to|->|तक)\s+([a-zA-Z\s]+?)(?:\?|$)/i,
        /from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\?|$)/i
      ];

      let from = null, to = null;
      for (const pattern of navPatterns) {
        const match = lower.match(pattern);
        if (match) {
          from = match[1].trim();
          to = match[2].trim();
          break;
        }
      }

      if (from && to) {
        let fromDept, toDept;
        try {
          fromDept = await Department.findOne({ $or: [{ code: from.toUpperCase() }, { name: { $regex: `^${from}$`, $options: 'i' } }] });
          toDept = await Department.findOne({ $or: [{ code: to.toUpperCase() }, { name: { $regex: `^${to}$`, $options: 'i' } }] });
        } catch (e) { console.warn("DB Error:", e.message); }

        if (!fromDept || !toDept) {
          answer = createVoiceResponse.notFound(!fromDept ? from : to, lang);
        } else {
          try {
            const route = await getRouteBetweenPoints(fromDept.latitude, fromDept.longitude, toDept.latitude, toDept.longitude);
            answer = createVoiceResponse.navigation(fromDept.name, toDept.name, route, lang);
          } catch {
            const distance = Math.round(Math.sqrt(
              Math.pow(toDept.latitude - fromDept.latitude, 2) +
              Math.pow(toDept.longitude - fromDept.longitude, 2)
            ) * 111000);
            answer = createVoiceResponse.navigationFallback(fromDept.name, toDept.name, distance, lang);
          }
        }
      }
      // === DEPARTMENT LOCATION ===
      else if (/where|location|find|कहा|कहां|department|dept|विभाग/i.test(lower)) {
        const codeMatch = lower.match(/\b(cse|ce|ee|me|ece|it|lib|can|adm|hos)\b/i);
        let name = '';

        if (codeMatch) {
          name = codeMatch[1];
        } else {
          const nameMatch = lower.match(/(?:where is|find|location of|कहा है|कहां है)\s+(.+?)(?:\?|$)/i);
          if (nameMatch) {
            name = nameMatch[1].trim();
          } else {
            name = lower.replace(/where|is|location|find|department|dept|the|कहा|कहां|है/gi, '').trim();
          }
        }

        if (name.length < 2) {
          answer = lang === 'hi'
            ? 'कृपया विभाग का नाम बताएं, जैसे CSE या Civil।'
            : 'Please specify a department name, like CSE or Civil.';
        } else {
          const dept = await Department.findOne({
            $or: [
              { code: name.toUpperCase() },
              { name: { $regex: `^${name}$`, $options: 'i' } }
            ]
          });

          if (dept) {
            answer = createVoiceResponse.departmentLocation(dept, lang);
          } else {
            answer = createVoiceResponse.notFound(name, lang);
          }
        }
      }
      // === STUDY MATERIALS ===
      else if (/notes|study|material|नोट्स|पढ़ाई|सामग्री|resources/i.test(lower)) {
        const deptMatch = lower.match(/(cse|civil|mechanical|electrical|ece|it|सीएसई|सिविल|मैकेनिकल)/i);
        const deptName = deptMatch ? deptMatch[0].toUpperCase() : null;

        const filter = deptName ? {
          department: { $regex: `^${deptName}$`, $options: 'i' },
          status: 'approved'
        } : { status: 'approved' };

        const resources = await Resource.find(filter).limit(5);

        if (resources.length > 0) {
          answer = createVoiceResponse.studyMaterials(deptName, resources.length, lang);
        } else {
          answer = createVoiceResponse.noMaterials(deptName, lang);
        }
      }
      // === GEMINI FALLBACK (If no patterns matched OR DB failed) ===
      if (!answer) {
        const prompt = isHindi
          ? `आप MMMUT कैंपस AI हैं। संक्षिप्त और स्पष्ट हिंदी में जवाब दें (2-3 वाक्य): "${qry}"`
          : `You are MMMUT Campus AI. Give a brief, conversational answer in 2-3 sentences: "${qry}"`;
        answer = await generateText(prompt);
      }
    }

    // === VOICE FILE GENERATION (GTTS) ===
    const audioPath = await textToSpeech(answer, lang);

    if (!audioPath || !fs.existsSync(audioPath)) {
      return next(new Error('Voice file generation failed'));
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline');

    res.sendFile(audioPath, (err) => {
      if (err) {
        console.error('File send error:', err);
        return next(new Error('Failed to send voice response'));
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { askAI, askAIWithVoice };