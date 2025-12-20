import React, { useState, useRef, useEffect } from 'react';

const Home = () => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [text, setText] = useState('');

    // Refs for speech and audio
    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setText(transcript);
                handleVoiceQuery(transcript);
            };

            recognitionRef.current = recognition;
        }

        // Cleanup audio on unmount
        const audio = audioRef.current;
        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Browser doesn't support Speech API");

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            audioRef.current.pause();
            setIsSpeaking(false);
            recognitionRef.current.start();
        }
    };

    const handleVoiceQuery = async (query) => {
        if (!query) return;
        setIsProcessing(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/query/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qry: query })
            });

            // Check if backend returned JSON error instead of Audio
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.answer || "Backend Error");
            }

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);

            audioRef.current.src = audioUrl;
            await audioRef.current.play();

            audioRef.current.onplay = () => {
                setIsProcessing(false);
                setIsSpeaking(true);
            };

            audioRef.current.onended = () => {
                setIsSpeaking(false);
            };

        } catch (error) {
            console.error("AI Error:", error);
            setIsProcessing(false);
            setIsSpeaking(false);

            // FALLBACK: Browser TTS
            // Speak the error (or a friendly message) so the user knows what happened
            const msg = error.message.includes("Backend")
                ? "I'm having trouble connecting to my backend."
                : "I couldn't process that request clearly.";

            const utterance = new SpeechSynthesisUtterance(msg);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleVoiceQuery(text);
        }
    };

    // Text feedback based on state
    let greeting = "How can I help you?";
    if (isListening) greeting = "Listening...";
    else if (isProcessing) greeting = "Thinking...";
    else if (isSpeaking) greeting = "Speaking...";

    return (
        <div className="ai-home-container">
            <div className="ai-content">
                <h1 className="ai-greeting">{greeting}</h1>

                {/* CSS-Only Fluid Visualizer */}
                <div className={`fluid-orb-container ${isListening || isSpeaking ? 'active' : ''}`}>
                    <div className="fluid-blob blob-1"></div>
                    <div className="fluid-blob blob-2"></div>
                    <div className="fluid-blob blob-3"></div>
                    <div className="orb-center-text">Hi</div>
                </div>

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
                        onChange={(e) => setText(e.target.value)}
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
