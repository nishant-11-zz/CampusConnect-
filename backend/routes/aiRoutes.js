const express = require('express');
const router = express.Router();
const { askAI, askAIWithVoice } = require('../controllers/aiController');
const { forceCleanup } = require('../utils/voiceUtils');

// TEXT AI
router.post('/query', askAI);

// VOICE AI
router.post('/query/voice', askAIWithVoice);

// MANUAL CLEANUP (Safety feature for demo)
router.post('/cleanup-voices', async (req, res) => {
  try {
    await forceCleanup();
    res.json({ 
      answer: '🗑️ All voice files cleaned up successfully',
      message: 'Storage cleared'
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({ 
      answer: 'Cleanup failed. Check server logs.',
      error: error.message 
    });
  }
});

module.exports = router;