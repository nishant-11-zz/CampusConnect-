const fs = require('fs').promises;
const path = require('path');
const gtts = require('gtts');
require('dotenv').config();

const VOICES_DIR = path.join(__dirname, '../voices');
const MAX_VOICE_FILES = 5; // Keep only 5 most recent

// Ensure voices directory exists
const ensureVoicesDir = async () => {
  try {
    await fs.mkdir(VOICES_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create voices directory:', err);
  }
};

// Clean up old voice files (keep only 50 newest)
const cleanupOldFiles = async () => {
  try {
    const files = await fs.readdir(VOICES_DIR);
    const voiceFiles = files
      .filter(f => f.startsWith('voice_') && f.endsWith('.mp3'))
      .map(f => ({
        name: f,
        path: path.join(VOICES_DIR, f),
        mtime: null
      }));

    // Get file stats
    for (const file of voiceFiles) {
      try {
        const stats = await fs.stat(file.path);
        file.mtime = stats.mtimeMs;
      } catch (err) {
        console.warn(`Could not stat file ${file.name}:`, err.message);
      }
    }

    // Sort by modification time (newest first)
    voiceFiles.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));

    // Keep only the 50 newest
    const filesToDelete = voiceFiles.slice(MAX_VOICE_FILES);

    // Delete old files
    for (const file of filesToDelete) {
      try {
        await fs.unlink(file.path);
        console.log(`✓ Cleaned up old voice file: ${file.name}`);
      } catch (err) {
        console.warn(`✗ Failed to delete ${file.name}:`, err.message);
      }
    }

    if (filesToDelete.length > 0) {
      console.log(`🧹 Cleanup complete: ${filesToDelete.length} old file(s) removed.`);
    }
  } catch (err) {
    console.error('Voice cleanup failed:', err.message);
    // Don't throw – cleanup should never break TTS
  }
};

/**
 * TEXT PREPROCESSING FOR BETTER VOICE QUALITY
 * Makes text sound more natural when spoken
 */
const preprocessTextForVoice = (text, lang) => {
  let processed = text;

  // Remove markdown formatting (**, __, etc.)
  processed = processed.replace(/\*\*(.+?)\*\*/g, '$1'); // **bold**
  processed = processed.replace(/__(.+?)__/g, '$1'); // __bold__
  processed = processed.replace(/\[(.+?)\]\(.+?\)/g, '$1'); // [link](url)

  // Replace abbreviations with full words for clearer pronunciation
  if (lang === 'en') {
    processed = processed.replace(/\bCSE\b/g, 'C S E'); // Say letters separately
    processed = processed.replace(/\bECE\b/g, 'E C E');
    processed = processed.replace(/\bIT\b/g, 'I T');
    processed = processed.replace(/\bEE\b/g, 'E E');
    processed = processed.replace(/\bME\b/g, 'M E');
    processed = processed.replace(/\bCE\b/g, 'Civil Engineering'); // Full name for clarity
    
    // Add slight pauses at sentence boundaries
    processed = processed.replace(/\.\s+/g, '. '); // Normalize spaces
    processed = processed.replace(/\?\s+/g, '? ');
    processed = processed.replace(/!\s+/g, '! ');
  } else if (lang === 'hi') {
    // For Hindi, department codes are already clear
    // But we can improve number pronunciation
    processed = processed.replace(/(\d+)/g, ' $1 '); // Add spaces around numbers
  }

  // Remove any remaining special characters that might confuse TTS
  processed = processed.replace(/[•→←↑↓]/g, ''); // Remove bullets and arrows
  processed = processed.replace(/\n+/g, '. '); // Convert newlines to pauses
  processed = processed.replace(/\s{2,}/g, ' '); // Normalize multiple spaces
  
  return processed.trim();
};

/**
 * Generate speech and save to file using GTTS (FREE)
 * @param {string} text - Text to convert to speech
 * @param {string} lang - Language code ('en' or 'hi')
 * @returns {Promise<string>} Path to generated audio file
 */
const textToSpeech = async (text, lang = 'en') => {
  try {
    await ensureVoicesDir();

    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Validate and normalize language
    const supportedLangs = { 'en': 'en', 'hi': 'hi' };
    if (!supportedLangs[lang]) {
      console.warn(`Unsupported language: ${lang}, defaulting to English`);
      lang = 'en';
    }

    // Preprocess text for better voice quality
    const processedText = preprocessTextForVoice(text, lang);

    // Normalize text for filename (for caching)
    const cleanText = text
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 80) // Reduced from 100 to avoid long filenames
      .toLowerCase();
    const filename = `voice_${lang}_${cleanText}_${Date.now()}.mp3`;
    const filepath = path.join(VOICES_DIR, filename);

    // IMPROVED CACHING: Check if similar file exists within last 30 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const existingFiles = await fs.readdir(VOICES_DIR);
    
    for (const file of existingFiles) {
      if (file.startsWith(`voice_${lang}_${cleanText}`) && file.endsWith('.mp3')) {
        const cachedPath = path.join(VOICES_DIR, file);
        try {
          const stats = await fs.stat(cachedPath);
          // Reuse if less than 30 minutes old
          if (stats.mtimeMs > fiveMinutesAgo) {
            console.log(`♻️  Reusing cached voice: ${file}`);
            await cleanupOldFiles();
            return cachedPath;
          } else {
            // Delete old cache
            await fs.unlink(cachedPath);
            console.log(`🗑️  Removed expired cache: ${file}`);
          }
        } catch (err) {
          console.warn(`Cache check failed for ${file}:`, err.message);
        }
      }
    }

    // GTTS OPTIONS FOR BETTER QUALITY
    const gttsOptions = {
      lang: lang === 'hi' ? 'hi' : 'en',
      slow: false, // Use false for natural speed (true = slower, clearer for learners)
      host: 'https://translate.google.com', // Default host
    };

    console.log(`🎤 Generating voice (GTTS): ${lang.toUpperCase()} - "${processedText.substring(0, 50)}..."`);

    // Create GTTS instance
    const tts = new gtts(processedText, gttsOptions.lang, gttsOptions.slow);

    // Save to file (Promise wrapper for callback-based API)
    await new Promise((resolve, reject) => {
      tts.save(filepath, (err) => {
        if (err) {
          reject(new Error(`GTTS save failed: ${err.message}`));
        } else {
          resolve();
        }
      });
    });

    // Verify file was created
    const fileExists = await fs.access(filepath).then(() => true).catch(() => false);
    if (!fileExists) {
      throw new Error('Voice file was not created');
    }

    const stats = await fs.stat(filepath);
    console.log(`✓ Voice generated: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

    // Cleanup old files asynchronously (don't wait)
    setImmediate(cleanupOldFiles);

    return filepath;

  } catch (error) {
    console.error('❌ TTS Error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      throw new Error('Network error: Unable to reach Google TTS service. Please check your internet connection.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Google TTS service timeout. Please try again.');
    } else if (error.message.includes('403') || error.message.includes('blocked')) {
      throw new Error('Access denied by Google TTS. Your IP might be rate-limited. Try again later.');
    } else {
      throw new Error(`Failed to generate voice: ${error.message}`);
    }
  }
};

/**
 * UTILITY: Get voice file size and duration estimate
 * @param {string} filepath - Path to audio file
 * @returns {Promise<Object>} File info
 */
const getVoiceFileInfo = async (filepath) => {
  try {
    const stats = await fs.stat(filepath);
    // Rough estimate: MP3 is ~1KB per second of audio
    const estimatedDuration = Math.round(stats.size / 1024);
    return {
      sizeKB: (stats.size / 1024).toFixed(2),
      estimatedDurationSeconds: estimatedDuration,
      created: stats.birthtime
    };
  } catch (error) {
    console.error('Failed to get file info:', error.message);
    return null;
  }
};

/**
 * UTILITY: Manual cleanup trigger (for admin/debugging)
 */
const forceCleanup = async () => {
  console.log('🧹 Starting manual cleanup...');
  await cleanupOldFiles();
  console.log('✓ Manual cleanup complete');
};

module.exports = { 
  textToSpeech, 
  cleanupOldFiles,
  forceCleanup,
  getVoiceFileInfo
};