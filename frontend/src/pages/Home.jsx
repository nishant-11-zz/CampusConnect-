import React, { useState, useRef, useEffect } from 'react';

const Home = () => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const [userText, setUserText] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());

    // Helper: Make links blue and clickable
    const formatTextWithLinks = (text) => {
        if (!text) return "";
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                const cleanUrl = part.replace(/\)$/, '');
                return (
                    <a 
                        key={index} 
                        href={cleanUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#00e5ff', textDecoration: 'underline', fontWeight: 'bold' }}
                    >
                        [Open Link]
                    </a>
                );
            }
            return part;
        });
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            
            // ERROR HANDLER: If mic fails, stop listening so UI doesn't freeze
            recognition.onerror = (event) => {
                console.error("Speech Error:", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert("Microphone access blocked. Please type your query.");
                }
            };

            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserText(transcript);
                handleVoiceQuery(transcript);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Browser doesn't support Speech API. Please type.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            // Stop previous audio
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
            
            setAiResponse(''); 
            setUserText('');
            
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error("Mic start error:", err);
                setIsListening(false);
            }
        }
    };

    const handleVoiceQuery = async (query) => {
        if (!query) return;
        
        audioRef.current.pause();
        setIsSpeaking(false);
        setIsProcessing(true);
        setAiResponse(''); // Clear previous answer immediately

        try {
            const response = await fetch('/api/ai/query/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qry: query })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Backend Error");

            setAiResponse(data.answer);

            if (data.audioUrl) {
                audioRef.current.src = `http://localhost:5000${data.audioUrl}`;
                
                audioRef.current.onloadeddata = () => {
                    setIsProcessing(false); 
                    // Attempt to play audio (might be blocked by browser if no user interaction)
                    const playPromise = audioRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => console.log("Autoplay prevented:", e));
                    }
                };

                audioRef.current.onplay = () => {
                    setIsProcessing(false); 
                    setIsSpeaking(true);
                };

                audioRef.current.onended = () => {
                    setIsSpeaking(false);
                };
            } else {
                setIsProcessing(false);
            }

        } catch (error) {
            console.error("AI Error:", error);
            setIsProcessing(false);
            setIsSpeaking(false);
            setAiResponse("I couldn't reach the server. Please check your backend connection.");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleVoiceQuery(userText);
        }
    };

    // --- QUICK SUGGESTION CHIPS ---
    const handleChipClick = (query) => {
        setUserText(query);
        handleVoiceQuery(query);
    };

    const suggestions = [
        { icon: '📅', text: 'Upcoming Events' },
        { icon: '🍔', text: 'Mess Menu' },
        { icon: '📍', text: 'Where is CSE?' },
        { icon: '🚌', text: 'Bus Schedule' }
    ];

    // --- Status Text Logic ---
    let statusText = "How can I help you?";
    if (isListening) statusText = "Listening...";
    else if (isProcessing) statusText = "Thinking...";
    else if (isSpeaking) statusText = "Speaking...";
    else if (aiResponse) statusText = ""; 

    return (
        <div className="ai-home-container">
            <div className="ai-content">
                
                {statusText && <h1 className="ai-greeting">{statusText}</h1>}

                {/* Visualizer */}
                <div className={`fluid-orb-container ${isListening || isSpeaking ? 'active' : ''}`}>
                    <div className="fluid-blob blob-1"></div>
                    <div className="fluid-blob blob-2"></div>
                    <div className="fluid-blob blob-3"></div>
                    <div className="orb-center-text">Hi</div>
                </div>

                {/* AI Response Area */}
                {aiResponse && (
                    <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        background: 'rgba(20, 27, 45, 0.85)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        maxWidth: '650px',
                        width: '90%',
                        textAlign: 'left',
                        border: '1px solid var(--accent-color)',
                        animation: 'fadeIn 0.5s',
                        color: '#e0e0e0',
                        lineHeight: '1.6',
                        fontSize: '1rem',
                        whiteSpace: 'pre-wrap', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}>
                        {formatTextWithLinks(aiResponse)}
                    </div>
                )}

                {/* --- QUICK SUGGESTION CHIPS (Visible when idle) --- */}
                {!isProcessing && !isListening && (
                    <div style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        justifyContent: 'center', 
                        flexWrap: 'wrap',
                        marginTop: '20px',
                        maxWidth: '600px',
                        zIndex: 20
                    }}>
                        {suggestions.map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleChipClick(chip.text)}
                                style={{
                                    background: 'rgba(0, 229, 255, 0.1)',
                                    border: '1px solid rgba(0, 229, 255, 0.3)',
                                    borderRadius: '20px',
                                    padding: '8px 16px',
                                    color: '#00e5ff',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(5px)',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(0, 229, 255, 0.2)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(0, 229, 255, 0.1)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                {chip.icon} {chip.text}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="ai-input-area" style={{marginTop: '30px'}}>
                    <button
                        className={`mic-button ${isListening ? 'active' : ''}`}
                        onClick={toggleListening}
                        title={isListening ? "Stop Listening" : "Start Listening"}
                    >
                        {isListening ? '⏹️' : '🎙️'}
                    </button>
                    
                    <input
                        type="text"
                        placeholder="Type your query..."
                        value={userText}
                        onChange={(e) => setUserText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="ai-text-input"
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;