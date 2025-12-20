const fs = require('fs');
const path = require('path');
const Department = require('../models/Department');
const Resource = require('../models/Resource');
const { generateText } = require('../utils/geminiClient');
const { textToSpeech } = require('../utils/voiceUtils');
const { getRouteBetweenPoints } = require('../utils/navigationUtils');

// --- 1. CAMPUS KNOWLEDGE BASE (Mock Data) ---
const campusData = {
  events: [
    { name: "TechSrijan 2024", date: "25th Oct", venue: "MPH Hall", desc: "Annual Tech Fest" },
    { name: "Alumni Meet", date: "10th Nov", venue: "Guest House", desc: "Reunion of 1990 batch" },
    { name: "HackStorm", date: "Coming Soon", venue: "ITRC Lab", desc: "24-hour Hackathon" }
  ],
  messMenu: {
    monday: "Aloo Paratha (Breakfast), Rice/Dal (Lunch), Roti/Sabzi (Dinner)",
    tuesday: "Idli Sambar (Breakfast), Rajma Chawal (Lunch), Kheer (Dinner)",
    today: "Puri Sabzi (Special Breakfast), Paneer Butter Masala (Dinner)"
  },
  buses: [
    { route: "City to Campus", time: "8:00 AM", stop: "Golghar" },
    { route: "Campus to City", time: "5:00 PM", stop: "Main Gate" }
  ]
};

// --- 2. RESPONSE BUILDER (Helper for Dual Output) ---
const responseBuilder = {
  greeting: (lang) => ({
    speech: lang === 'hi'
      ? 'नमस्ते! मैं MMMUT कैंपस AI हूँ। मैं विभागों, रास्तों, इवेंट्स और मेस के बारे में बता सकती हूँ।'
      : 'Hello! I am MMMUT Campus AI. I can help with Departments, Navigation, Events, and Mess Menu.',
    display: lang === 'hi'
      ? '👋 **नमस्ते!** मैं MMMUT कैंपस AI हूँ।\nमैं **विभागों**, **रास्तों**, **इवेंट्स** और **मेस** के साथ आपकी मदद कर सकती हूँ।'
      : '👋 **Hello!** I am MMMUT Campus AI.\nI can help you with **Departments**, **Navigation**, **Events**, **Mess Menu**, and **Transport**.'
  }),

  offTopic: (lang) => ({
    speech: lang === 'hi'
      ? 'क्षमा करें, मैं केवल कैंपस से जुड़े सवालों का जवाब दे सकती हूँ।'
      : 'I apologize, but I can only help with MMMUT campus related questions.',
    display: lang === 'hi'
      ? '🚫 **विषय से बाहर**\nमैं केवल MMMUT कैंपस (विभाग, रास्ते, नोट्स) के बारे में बात कर सकती हूँ।'
      : '🚫 **Off Topic**\nI can only help with MMMUT campus related questions (Departments, Navigation, Study Materials).'
  }),

  // NEW: Events Response
  events: (events) => {
    const list = events.map(e => `📅 **${e.name}**\n📍 ${e.venue} | 🗓️ ${e.date}`).join('\n\n');
    return {
      speech: `There are ${events.length} upcoming events, including ${events[0].name}.`,
      display: `🎉 **Upcoming Campus Events:**\n\n${list}`
    };
  },

  // NEW: Mess Menu Response
  mess: (menu) => ({
    speech: "Today's special is Puri Sabzi for breakfast and Paneer for dinner.",
    display: `🍽️ **Today's Mess Menu:**\n\n${menu}\n\n*(Standard Menu applied for other days)*`
  }),

  // NEW: Bus Schedule Response
  bus: (buses) => {
    const list = buses.map(b => `🚌 **${b.route}**: ${b.time} at ${b.stop}`).join('\n');
    return {
      speech: "The morning bus leaves at 8 AM from Golghar, and the evening bus leaves at 5 PM.",
      display: `🚌 **Bus Schedule:**\n\n${list}`
    };
  },

  navigation: (from, to, route, lang) => {
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&travelmode=walking`;
    if (lang === 'hi') {
      return {
        speech: `${from.name} से ${to.name} जाने के लिए: ${route.summary}। यह लगभग ${route.duration} मिनट का रास्ता है।`,
        display: `🚶 **${from.name}** ➝ **${to.name}**\n\n${route.summary}।\n⏳ समय: ${route.duration} मिनट\n\n🔗 **[गूगल मैप्स पर रास्ता देखें](${mapUrl})**`
      };
    }
    return {
      speech: `To go from ${from.name} to ${to.name}: ${route.summary}. This will take approximately ${route.duration} minutes.`,
      display: `🚶 **From ${from.name} to ${to.name}**\n\n${route.summary}.\n⏳ Time: ~${route.duration} mins\n\n🔗 **[Open Route in Google Maps](${mapUrl})**`
    };
  },

  navigationFallback: (from, to, distance, lang) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${to.latitude},${to.longitude}`;
    if (lang === 'hi') {
      return {
        speech: `${from.name} से ${to.name} की दूरी लगभग ${distance} मीटर है।`,
        display: `📏 दूरी: ${distance} मीटर\n\n🔗 **[मैप पर देखें](${mapUrl})**`
      };
    }
    return {
      speech: `The distance from ${from.name} to ${to.name} is approximately ${distance} meters.`,
      display: `📏 Distance: ${distance} meters\n\n🔗 **[View Destination on Map](${mapUrl})**`
    };
  },

  departmentLocation: (dept, lang) => {
    const mapUrl = dept.mapLink || `https://www.google.com/maps/search/?api=1&query=${dept.latitude},${dept.longitude}`;
    const contact = dept.contact?.phone || 'N/A';
    const hod = dept.hod?.name || 'N/A';
    
    if (lang === 'hi') {
      const building = dept.building ? `${dept.building} में` : 'मुख्य कैंपस में';
      return {
        speech: `${dept.name}, ${building} स्थित है।`,
        display: `📍 **${dept.name}**\n🏢 **स्थान:** ${dept.building}\n👤 **HOD:** ${hod}\n📞 **संपर्क:** ${contact}\n\n🗺️ **[लोकेशन मैप देखें](${mapUrl})**`
      };
    }
    const building = dept.building || 'Main Campus';
    return {
      speech: `${dept.name} is located in ${building}.`,
      display: `📍 **${dept.name}**\n🏢 **Location:** ${building}\n👤 **HOD:** ${hod}\n📞 **Contact:** ${contact}\n\n🗺️ **[View on Map](${mapUrl})**`
    };
  },

  studyMaterials: (deptName, count, resources, lang) => {
    const links = resources.map(r => `📄 **[${r.title}](${r.fileUrl})**`).join('\n');
    if (lang === 'hi') {
      return {
        speech: `${deptName} के लिए ${count} नोट्स मिले हैं।`,
        display: `📚 **${deptName} अध्ययन सामग्री (${count})**:\n\n${links}`
      };
    }
    return {
      speech: `I found ${count} study materials for ${deptName}.`,
      display: `📚 **${deptName} Study Materials (${count})**:\n\n${links}`
    };
  },

  noMaterials: (deptName, lang) => ({
    speech: lang === 'hi' ? `अभी ${deptName} के लिए कोई नोट्स उपलब्ध नहीं हैं।` : `No study materials found for ${deptName} at the moment.`,
    display: lang === 'hi' ? `❌ **${deptName}** के लिए कोई नोट्स नहीं मिले।` : `❌ No study materials found for **${deptName}**.`
  }),

  notFound: (query, lang) => ({
    speech: lang === 'hi' ? `क्षमा करें, मुझे ${query} नहीं मिला।` : `I'm sorry, I couldn't find ${query}.`,
    display: lang === 'hi' ? `❌ **"${query}"** नहीं मिला।` : `❌ I couldn't find **"${query}"**.`
  })
};

// --- 3. TEXT API ---
const askAI = async (req, res, next) => {
  try {
    const { qry } = req.body;
    if (!qry) return next(new Error('Please ask a question.'));
    const answer = await generateText(`Answer this about MMMUT: ${qry}`);
    res.json({ answer });
  } catch (error) { next(error); }
};

// --- 4. VOICE API (MAIN LOGIC) ---
const askAIWithVoice = async (req, res, next) => {
  try {
    const { qry } = req.body;
    if (!qry || typeof qry !== 'string') return next(new Error('Please ask a question.'));

    const lower = qry.toLowerCase().trim();
    const isHindi = /है|कहा|कहां|विभाग|नोट्स|लाइब्रेरी|कैंटीन|हिंदी|हिन्दी|से|को|के/.test(qry);
    const lang = isHindi ? 'hi' : 'en';

    let response = { speech: '', display: '' };

    // 1. GREETING
    if (/^(hello|hi|hey|namaste|नमस्ते|नमस्कार)$/i.test(lower)) {
        response = responseBuilder.greeting(lang);
    }
    // 2. OFF-TOPIC
    else if ([/^weather$/i, /^news$/i, /^movie$/i, /^song$/i, /^chatgpt$/i].some(p => p.test(lower))) {
        response = responseBuilder.offTopic(lang);
    }
    // 3. EVENTS (New)
    else if (/event|function|fest|hackathon|seminar/i.test(lower)) {
        response = responseBuilder.events(campusData.events);
    }
    // 4. MESS MENU (New)
    else if (/mess|food|lunch|dinner|breakfast|menu|khana/i.test(lower)) {
        response = responseBuilder.mess(campusData.messMenu.today);
    }
    // 5. BUS SCHEDULE (New)
    else if (/bus|transport|vehicle|schedule|timing/i.test(lower)) {
        response = responseBuilder.bus(campusData.buses);
    }
    // 6. NAVIGATION
    else if (/(?:from|से)\s+(.+?)\s+(?:to|तक)\s+(.+?)(?:\?|$)/i.test(lower)) {
        const navMatch = lower.match(/(?:from|से)\s+([a-zA-Z0-9\s]+)\s+(?:to|तक)\s+([a-zA-Z0-9\s]+)/i);
        if (navMatch) {
            const fromName = navMatch[1].trim(); 
            const toName = navMatch[2].trim();
            const fromDept = await Department.findOne({ $or: [{ code: fromName.toUpperCase() }, { name: { $regex: fromName, $options: 'i' } }] });
            const toDept = await Department.findOne({ $or: [{ code: toName.toUpperCase() }, { name: { $regex: toName, $options: 'i' } }] });

            if (fromDept && toDept) {
                try {
                    const route = await getRouteBetweenPoints(fromDept.latitude, fromDept.longitude, toDept.latitude, toDept.longitude);
                    response = responseBuilder.navigation(fromDept, toDept, route, lang);
                } catch (e) {
                    const dist = Math.round(Math.sqrt(Math.pow(toDept.latitude-fromDept.latitude,2) + Math.pow(toDept.longitude-fromDept.longitude,2)) * 111000);
                    response = responseBuilder.navigationFallback(fromDept, toDept, dist, lang);
                }
            } else {
                response = responseBuilder.notFound(fromDept ? toName : fromName, lang);
            }
        }
    }
    // 7. LOCATION
    else if (/where|location|find|कहा|department|dept|विभाग/i.test(lower)) {
        let name = lower.replace(/where|is|location|find|department|dept|the|of|located|situated|कहा|है|\?/gi, '').trim();
        const dept = await Department.findOne({
            $or: [{ code: name.toUpperCase() }, { name: { $regex: name, $options: 'i' } }]
        });
        if (dept) {
            response = responseBuilder.departmentLocation(dept, lang);
        } else {
            const aiText = await generateText(`Where is ${name} in MMMUT? Answer in 1 sentence.`);
            response = { speech: aiText, display: aiText };
        }
    }
    // 8. RESOURCES
    else if (/notes|study|material|pdf/i.test(lower)) {
        const deptMatch = lower.match(/(cse|civil|mechanical|electrical|ece|it|mca)/i);
        const deptName = deptMatch ? deptMatch[0].toUpperCase() : null;
        const filter = deptName ? { department: { $regex: deptName, $options: 'i' } } : {};
        const resources = await Resource.find(filter).limit(3);
        
        if (resources.length > 0) response = responseBuilder.studyMaterials(deptName || 'General', resources.length, resources, lang);
        else response = responseBuilder.noMaterials(deptName || 'that department', lang);
    }
    // 9. FALLBACK (Gemini)
    else {
        const prompt = isHindi 
            ? `MMMUT कैंपस AI के रूप में जवाब दें: "${qry}" (संक्षिप्त में)`
            : `You are MMMUT Campus AI. Answer briefly (2 sentences): "${qry}"`;
        
        const aiText = await generateText(prompt);
        const speechClean = aiText.replace(/\*\*/g, '').replace(/\[.*?\]/g, '');
        response = { speech: speechClean, display: aiText };
    }

    // === GENERATE VOICE ===
    const audioPath = await textToSpeech(response.speech, lang);
    if (!audioPath || !fs.existsSync(audioPath)) throw new Error('Voice generation failed');

    const filename = path.basename(audioPath);
    res.json({
        answer: response.display, 
        audioUrl: `/voices/${filename}`
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { askAI, askAIWithVoice };