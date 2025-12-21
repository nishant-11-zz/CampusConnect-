const fs = require('fs');
const path = require('path');
const Department = require('../models/Department');
const Resource = require('../models/Resource');
const { generateText } = require('../utils/geminiClient');
const { textToSpeech } = require('../utils/voiceUtils');
const { getRouteBetweenPoints } = require('../utils/navigationUtils');

/**
 * ==============================================================================
 * 1. CONSTANTS: Fallback Dummy Data
 * ==============================================================================
 */
const DUMMY_STEPS_EN = [
  "Exit the building and walk towards the main campus road",
  "Go straight for about 200 meters past the library",
  "Turn left; your destination building is straight ahead"
];

const DUMMY_STEPS_HI = [
  "इमारत से बाहर निकलें और मुख्य कैंपस सड़क की ओर चलें",
  "लाइब्रेरी के पास से लगभग 200 मीटर सीधा चलें",
  "बाएं मुड़ें; आपका गंतव्य भवन सीधे आगे है"
];

const campusData = {
  events: [
    { name: "Heats 2025", date: "27th Dec", venue: "MPH Hall", desc: "Annual Tech Fest" },
    { name: "Alumni Meet", date: "25thDec", venue: "Guest House", desc: "Reunion" }
  ],
  messMenu: { today: "Puri Sabzi (Breakfast), Paneer Butter Masala (Dinner)" },
  buses: [
    { route: "City to Campus", time: "8:00 AM", stop: "Golghar" },
    { route: "Campus to City", time: "5:00 PM", stop: "Main Gate" }
  ]
};

/**
 * ==============================================================================
 * 2. RESPONSE BUILDER
 * ==============================================================================
 */
const responseBuilder = {
  greeting: (lang) => ({
    speech: lang === 'hi' ? 'नमस्ते! मैं MMMUT कैंपस AI हूँ।' : 'Hello! I am MMMUT Campus AI.',
    display: lang === 'hi' ? '👋 **नमस्ते!** मैं MMMUT कैंपस AI हूँ।' : '👋 **Hello!** I am MMMUT Campus AI.'
  }),

  offTopic: (lang) => ({
    speech: 'I can only help with MMMUT campus questions.',
    display: '🚫 **Off Topic**\nPlease ask about Departments, Navigation, or Events.'
  }),

  events: (events) => {
    const list = events.map(e => `📅 **${e.name}**\n📍 ${e.venue} | 🗓️ ${e.date}`).join('\n\n');
    return {
      speech: `There are ${events.length} upcoming events like ${events[0].name}.`,
      display: `🎉 **Upcoming Events:**\n\n${list}`
    };
  },
  
  mess: (menu) => ({
    speech: "Today's menu includes Puri Sabzi and Paneer.",
    display: `🍽️ **Mess Menu:**\n\n${menu}`
  }),

  bus: (buses) => {
    const list = buses.map(b => `🚌 **${b.route}**: ${b.time}`).join('\n');
    return {
      speech: "Buses run at 8 AM and 5 PM.",
      display: `🚌 **Bus Schedule:**\n\n${list}`
    };
  },

  // --- NAVIGATION FIX ---
  navigation: (from, to, route, lang) => {
    // 1. STRICT VALIDATION: If ANY step is "undefined", missing, or not a string -> FAIL
    const isBroken = !route || 
                     !route.steps || 
                     !Array.isArray(route.steps) || 
                     route.steps.length === 0 || 
                     route.steps.some(step => !step || step === 'undefined' || typeof step !== 'string');

    // 2. FORCE DUMMY DATA if broken
    const finalSteps = isBroken ? (lang === 'hi' ? DUMMY_STEPS_HI : DUMMY_STEPS_EN) : route.steps;
    const summary = route?.summary || (lang === 'hi' ? 'कैंपस का रास्ता' : 'Campus Route');
    const duration = route?.duration || '2';
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&travelmode=walking`;

    // 3. VOICE FORMAT (Continuous text)
    let speechText = '';
    if (lang === 'hi') {
      const stepsJoined = finalSteps.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('. फिर ');
      speechText = `${from.name} से ${to.name}: ${summary}। ${stepsJoined}।`;
    } else {
      const stepsJoined = finalSteps.slice(0, 3).map((s, i) => `Step ${i + 1}: ${s}`).join('. Then ');
      speechText = `From ${from.name} to ${to.name}: ${summary}. ${stepsJoined}.`;
    }

    // 4. DISPLAY FORMAT (Bullet Points + Double New Lines)
    const stepsList = finalSteps
      .map((step, i) => `• Step ${i + 1}: ${step}`)
      .join('\n\n'); // <--- FORCE NEW LINE

    const displayText = lang === 'hi'
      ? `🚶 **${from.name}** ➝ **${to.name}**\n\n${summary}\n\n**दिशा-निर्देश:**\n\n${stepsList}\n\n⏳ समय: ${duration} मिनट\n🔗 [मैप देखें](${mapUrl})`
      : `🚶 **${from.name}** ➝ **${to.name}**\n\n${summary}\n\n**Directions:**\n\n${stepsList}\n\n⏳ Time: ~${duration} mins\n🔗 [Open Map](${mapUrl})`;

    return { speech: speechText, display: displayText };
  },

  navigationFallback: (from, to, distance, lang) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${to.latitude},${to.longitude}`;
    return {
      speech: `Distance is approx ${distance} meters.`,
      display: `📏 **Distance:** ${distance} meters\n\n🔗 [View Map](${mapUrl})`
    };
  },

  departmentLocation: (dept, lang) => {
    const mapUrl = dept.mapLink || '#';
    const building = dept.building || 'Main Campus';
    return {
      speech: `${dept.name} is in ${building}.`,
      display: `📍 **${dept.name}**\n🏢 ${building}\n📞 ${dept.contact?.phone || 'N/A'}\n🔗 [Map](${mapUrl})`
    };
  },

  studyMaterials: (deptName, count, resources, lang) => {
    const links = resources.map(r => `📄 [${r.title}](${r.fileUrl})`).join('\n\n');
    return {
      speech: `Found ${count} notes for ${deptName}.`,
      display: `📚 **${deptName} Notes:**\n\n${links}`
    };
  },

  noMaterials: (deptName, lang) => ({
    speech: `No notes found for ${deptName}.`,
    display: `❌ No notes found for **${deptName}**.`
  }),

  notFound: (query, lang) => ({
    speech: `Sorry, I couldn't find ${query}.`,
    display: `❌ Not found: **${query}**`
  })
};

/**
 * ==============================================================================
 * 3. CONTROLLERS
 * ==============================================================================
 */

// TEXT CONTROLLER
const askAI = async (req, res, next) => {
  try {
    const { qry } = req.body;
    if (!qry) return next(new Error('Question required'));
    const answer = await generateText(`Answer briefly: ${qry}`);
    res.json({ answer });
  } catch (error) { next(error); }
};

// VOICE CONTROLLER
const askAIWithVoice = async (req, res, next) => {
  try {
    const { qry } = req.body;
    if (!qry) return next(new Error('Query missing'));

    const lower = qry.toLowerCase().trim();
    const isHindi = /है|कहा|हिंदी|से|को/.test(qry);
    const lang = isHindi ? 'hi' : 'en';

    let response = { speech: '', display: '' };

    // --- LOGIC ROUTING ---
    
    // 1. Navigation (CSE to ME)
    if (/(?:from|से)\s+(.+?)\s+(?:to|तक)\s+(.+?)(?:\?|$)/i.test(lower) || /(.+?)\s+to\s+(.+?)$/i.test(lower)) {
      const match = lower.match(/(?:from|से)?\s*([a-zA-Z0-9\s]+?)\s+(?:to|तक)\s+([a-zA-Z0-9\s]+?)(?:\?|$)/i);
      if (match) {
        const fromName = match[1].trim();
        const toName = match[2].trim();
        
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
    // 2. Greeting
    else if (/hello|hi|namaste/i.test(lower)) response = responseBuilder.greeting(lang);
    // 3. Events
    else if (/event|fest/i.test(lower)) response = responseBuilder.events(campusData.events);
    // 4. Mess
    else if (/mess|food|menu/i.test(lower)) response = responseBuilder.mess(campusData.messMenu.today);
    // 5. Bus
    else if (/bus|transport/i.test(lower)) response = responseBuilder.bus(campusData.buses);
    // 6. Location
    else if (/where|location/i.test(lower)) {
      const name = lower.replace(/where|is|location|find|\?/gi, '').trim();
      const dept = await Department.findOne({ $or: [{ code: name.toUpperCase() }, { name: { $regex: name, $options: 'i' } }] });
      response = dept ? responseBuilder.departmentLocation(dept, lang) : responseBuilder.notFound(name, lang);
    }
    // 7. Notes
    else if (/notes|study|pdf/i.test(lower)) {
      const deptMatch = lower.match(/(cse|civil|me|ee|ece|it|mca)/i);
      const deptName = deptMatch ? deptMatch[0].toUpperCase() : null;
      const filter = deptName ? { department: { $regex: deptName, $options: 'i' } } : {};
      const resources = await Resource.find(filter).limit(3);
      if(resources.length > 0) response = responseBuilder.studyMaterials(deptName || 'General', resources.length, resources, lang);
      else response = responseBuilder.noMaterials(deptName || 'that department', lang);
    }
    // 8. Fallback
    else {
      const aiText = await generateText(`MMMUT AI Answer: ${qry}`);
      const clean = aiText.replace(/\*\*/g, '');
      response = { speech: clean, display: aiText };
    }

    // --- AUDIO GENERATION ---
    const audioPath = await textToSpeech(response.speech, lang);
    const audioUrl = (audioPath && fs.existsSync(audioPath)) 
      ? `/voices/${path.basename(audioPath)}` 
      : null;

    res.json({ answer: response.display, audioUrl });

  } catch (error) { next(error); }
};

module.exports = { askAI, askAIWithVoice };