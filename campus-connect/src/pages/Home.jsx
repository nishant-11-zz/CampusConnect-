import React, { useState, useRef, useEffect } from 'react';

const Home = () => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [text, setText] = useState('');
    const [aiResponse, setAiResponse] = useState(null); // Store AI text response

    // Refs for speech and audio
    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());

    // Keep a ref to the latest handleVoiceQuery to avoid stale closures in useEffect
    const handleQueryRef = useRef(null);

    useEffect(() => {
        handleQueryRef.current = handleVoiceQuery;
    });

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US'; // Revert to US English (Most reliable)
            // recognition.lang = 'en-IN'; 

            recognition.onstart = () => {
                console.log("Mic Started");
                setIsListening(true);
                setText("Mic Active... Speak!"); // Visual confirmation
            };

            recognition.onsoundstart = () => {
                console.log("Sound detected");
            };

            recognition.onspeechstart = () => {
                console.log("Speech detected");
            };

            recognition.onend = () => {
                console.log("Mic Stopped");
                setIsListening(false);
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Show whatever we have (Interim or Final)
                const currentText = finalTranscript || interimTranscript;
                if (currentText) {
                    setText(currentText);
                }

                // Only submit if we have a final result
                if (finalTranscript) {
                    console.log("Final Transcript:", finalTranscript);

                    // Stop listening immediately to prevent duplicates
                    recognition.stop();
                    setIsListening(false);

                    if (handleQueryRef.current) {
                        handleQueryRef.current(finalTranscript);
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech Error:", event.error);
                setIsListening(false);

                if (event.error === 'no-speech') {
                    setText("❌ No sound detected. Please check your mic volume.");
                } else if (event.error === 'not-allowed') {
                    setText("❌ Mic Blocked. Allow in browser settings.");
                    alert("Microphone access denied. Please click the lock icon in the URL bar to enable.");
                } else if (event.error === 'network') {
                    setText("❌ Network error. Check connection.");
                } else {
                    setText(`Error: ${event.error}`);
                }
            };

            recognitionRef.current = recognition;
        }

        // Cleanup audio and recognition on unmount
        const audio = audioRef.current;
        return () => {
            audio.pause();
            audio.src = '';
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    // Helper to fully reset state for new interaction
    const resetInteraction = () => {
        setAiResponse(null);
        setText('');

        // Stop any playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        setIsSpeaking(false);
        setIsProcessing(false);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Browser doesn't support Speech API");

        if (isListening) {
            recognitionRef.current.stop();
            return;
        }

        // Start Listening
        resetInteraction();

        // Give a tiny delay to ensure clean state
        setTimeout(() => {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.warn("Retrying mic start...", e);
                recognitionRef.current.abort();
                setTimeout(() => recognitionRef.current.start(), 100);
            }
        }, 50);
    };

    const handleVoiceQuery = async (query) => {
        if (!query) return;

        // Reset previous response to show thinking orb
        setAiResponse(null);
        setIsProcessing(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/query/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qry: query })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);
            if (!response.ok) throw new Error(data.answer || "Network Error");

            // 1. Set text response (Swaps Orb -> Text Box)
            setAiResponse(data.answer);

            // 2. Play Audio (Base64)
            if (data.audio) {
                audioRef.current.src = data.audio;
                try {
                    await audioRef.current.play();
                } catch (e) {
                    console.log("Autoplay blocked/failed", e);
                    setIsSpeaking(true); // Show text anyway
                    setIsProcessing(false);
                    return;
                }

                audioRef.current.onplay = () => {
                    setIsProcessing(false);
                    setIsSpeaking(true);
                };

                audioRef.current.onended = () => {
                    setIsSpeaking(false);
                };
            } else {
                // If no audio, just show text
                setIsProcessing(false);
            }

        } catch (error) {
            console.error("AI Error:", error);
            setIsProcessing(false);
            setIsSpeaking(false);

            // Fallback TTS for errors
            const msg = error.message.includes("Backend")
                ? "I'm having trouble connecting to my backend."
                : "I couldn't process that request clearly.";

            const utterance = new SpeechSynthesisUtterance(msg);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // Reset UI for new query
            resetInteraction();
            handleVoiceQuery(text);
        }
    };

    // Greeting Text
    let greeting = "How can I help you?";
    if (isListening) greeting = "Listening...";
    else if (isProcessing) greeting = "Thinking...";
    else if (isSpeaking) greeting = ""; // Hide greeting when speaking (showing text box)

    return (
        <div className="ai-home-container">
            <div className="ai-content">
                {/* Greeting (Only show if NOT showing response) */}
                {!aiResponse && <h1 className="ai-greeting">{greeting}</h1>}

                {/* VISUALIZER vs TEXT RESPONSE */}
                {aiResponse ? (
                    <div
                        className="ai-response-box"
                        onClick={resetInteraction}
                        title="Click to ask another question"
                    >
                        <p>{aiResponse}</p>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '10px', display: 'block' }}>
                            (Click to ask again)
                        </span>
                    </div>
                ) : (
                    // ORB VISUALIZER
                    <div className={`fluid-orb-container ${isListening || isProcessing ? 'active' : ''}`}>
                        <div className="fluid-blob blob-1"></div>
                        <div className="fluid-blob blob-2"></div>
                        <div className="fluid-blob blob-3"></div>
                        <div className="orb-center-text">Hi</div>
                    </div>
                )}

                {/* Input Controls */}
                <div className="ai-input-area">
                    <button
                        className={`mic-button ${isListening ? 'active' : ''}`}
                        onClick={toggleListening}
                        title="Toggle Voice Input"
                    >
                        {isListening ? '⏹️' : '🎙️'}
                    </button>
                    <input
                        type="text"
                        placeholder="Type your query..."
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            // If user starts typing after a response, reset to orb? 
                            // User asked: "after one input/output it continues to take the input after the first output"
                            // Use Enter or Mic to submit.
                        }}
                        onKeyPress={handleKeyPress}
                        className="ai-text-input"
                        disabled={isListening || isProcessing}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
