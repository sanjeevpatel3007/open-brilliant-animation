"use client";
import { useState, useEffect, useRef } from "react";
import ProjectileMotion from "./ProjectileMotion";
import SpringOscillation from "./SpringOscillation";
import PendulumMotion from "./PendulumMotion";
import WaveVibration from "./WaveVibration";

interface Message {
    role: "user" | "ai";
    content: string;
}

interface ModuleData {
    module: string | null;
    inputs: {
        velocity?: number;
        angle?: number;
        gravity?: number;
        timeStep?: number;
        mass?: number;
        springConstant?: number;
        amplitude?: number;
        damping?: number;
        length?: number;
        initialAngle?: number;
        frequency?: number;
        wavelength?: number;
        waveType?: "transverse" | "longitudinal";
    };
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [moduleData, setModuleData] = useState<ModuleData | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showAnimations, setShowAnimations] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const animationEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-scroll animation section when module data changes
    //   useEffect(() => {
    //     if (moduleData) {
    //       animationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    //     }
    //   }, [moduleData]);

    // Dummy questions for quick access
    const dummyQuestions = [
        "What is Newton's first law?",
        "Explain projectile motion",
        "Show me projectile motion with velocity 15 m/s and angle 60°",
        "What is simple harmonic motion?",
        "Show me a spring oscillation with mass 2kg",
        "Explain pendulum motion",
        "Show me a pendulum with length 2m",
        "What are waves in physics?",
        "Show me a wave with frequency 2Hz",
        "Explain the difference between transverse and longitudinal waves"
    ];

    // Available animations info
    const availableAnimations = [
        {
            name: "Projectile Motion",
            description: "Visualize the path of a projectile under gravity",
            example: "Show me projectile motion with velocity 20 m/s and angle 45°"
        },
        {
            name: "Spring Oscillation",
            description: "Watch a mass oscillating on a spring",
            example: "Show me a spring oscillation with mass 1.5kg and spring constant 12 N/m"
        },
        {
            name: "Pendulum Motion",
            description: "Observe the swinging motion of a pendulum",
            example: "Show me a pendulum with length 1.5m and initial angle 30°"
        },
        {
            name: "Wave Vibration",
            description: "See transverse and longitudinal wave patterns",
            example: "Show me a transverse wave with frequency 3Hz and amplitude 2"
        }
    ];

    async function handleSend() {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: input }),
            });

            const data = await res.json();

            // Add AI response to messages
            setMessages(prev => [...prev, { role: "ai", content: data.explanation }]);

            // Set module data for animation
            if (data.module === "ProjectileMotion") {
                setModuleData({
                    module: data.module,
                    inputs: {
                        velocity: data.inputs?.velocity || 50,
                        angle: data.inputs?.angle || 45,
                        gravity: data.inputs?.gravity || 9.8,
                        timeStep: data.inputs?.timeStep || 0.1
                    }
                });
            } else if (data.module === "SpringOscillation") {
                setModuleData({
                    module: data.module,
                    inputs: {
                        mass: data.inputs?.mass || 1,
                        springConstant: data.inputs?.springConstant || 10,
                        amplitude: data.inputs?.amplitude || 1,
                        damping: data.inputs?.damping || 0,
                        timeStep: data.inputs?.timeStep || 0.05
                    }
                });
            } else if (data.module === "PendulumMotion") {
                setModuleData({
                    module: data.module,
                    inputs: {
                        length: data.inputs?.length || 1,
                        mass: data.inputs?.mass || 1,
                        initialAngle: data.inputs?.initialAngle || 30,
                        gravity: data.inputs?.gravity || 9.8,
                        damping: data.inputs?.damping || 0,
                        timeStep: data.inputs?.timeStep || 0.05
                    }
                });
            } else if (data.module === "WaveVibration") {
                setModuleData({
                    module: data.module,
                    inputs: {
                        frequency: data.inputs?.frequency || 1,
                        amplitude: data.inputs?.amplitude || 1,
                        wavelength: data.inputs?.wavelength || 2,
                        damping: data.inputs?.damping || 0,
                        timeStep: data.inputs?.timeStep || 0.05,
                        waveType: data.inputs?.waveType || "transverse"
                    }
                });
            } else {
                setModuleData(null);
            }

            setInput("");
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, {
                role: "ai",
                content: "Sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDummyQuestion = (question: string) => {
        setInput(question);
    };

    const hasAnimation = moduleData?.module === "ProjectileMotion" || moduleData?.module === "SpringOscillation" || moduleData?.module === "PendulumMotion" || moduleData?.module === "WaveVibration";

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-black text-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">Physics Learning Assistant</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Dummy Questions Button */}
                            <div className="relative group">
                                <button
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                    title="Quick Questions"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="hidden sm:inline">Questions</span>
                                </button>

                                {/* Dropdown for dummy questions */}
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-4">
                                        <h3 className="text-black font-semibold mb-3">Quick Questions</h3>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {dummyQuestions.map((question, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleDummyQuestion(question)}
                                                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    {question}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Available Animations Button */}
                            <button
                                onClick={() => setShowAnimations(!showAnimations)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                title="Available Animations"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                                </svg>
                                <span className="hidden sm:inline">Animations</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Available Animations Modal */}
            {showAnimations && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-black">Available Animations</h2>
                                <button
                                    onClick={() => setShowAnimations(false)}
                                    className="text-gray-500 hover:text-black transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {availableAnimations.map((animation, index) => (
                                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-black mb-2">{animation.name}</h3>
                                        <p className="text-gray-600 mb-3">{animation.description}</p>
                                        <div className="bg-gray-100 p-3 rounded">
                                                                                         <p className="text-sm text-gray-700">
                                                 <strong>Example:</strong> &ldquo;{animation.example}&rdquo;
                                             </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4">
                <div className={`${hasAnimation ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'max-w-7xl mx-auto'}`}>
                    {/* Chat Section */}
                    <div className={`${hasAnimation ? 'lg:col-span-1' : ''}`}>
                        {/* Chat Messages */}
                        <div className="bg-white border border-gray-300 rounded-lg shadow-sm mb-4 sticky top-20">
                            <div className="p-4 border-b border-gray-300 bg-gray-50">
                                <h2 className="text-lg font-semibold text-black">Chat</h2>
                            </div>
                            <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">



                                        <div className="bg-black text-white py-6 px-6">
                                            {/* Main Heading */}
                                            <h2 className="text-4xl font-bold text-center mb-4">Welcome to Physics Animations!</h2>
                                            <p className="text-center text-lg mb-12">
                                                Explore physics concepts interactively. Ask questions or request animations of motion, forces, waves, and more.
                                            </p>

                                            {/* 2x2 Grid for Features */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                                <div className="bg-gray-900 rounded-lg p-3 shadow hover:shadow-lg transition">
                                                    <h3 className="text-xl font-semibold mb-2">Projectile Motion</h3>
                                                    <p className="text-sm mb-2">Visualize the path of a projectile under gravity.</p>
                                 
                                                </div>

                                                <div className="bg-gray-900 rounded-lg p-3 shadow hover:shadow-lg transition">
                                                    <h3 className="text-xl font-semibold mb-2">Spring Oscillation</h3>
                                                    <p className="text-sm mb-2">Watch a mass oscillating on a spring.</p>
                                 
                                                </div>

                                                <div className="bg-gray-900 rounded-lg p-3 shadow hover:shadow-lg transition">
                                                    <h3 className="text-xl font-semibold mb-2">Pendulum Motion</h3>
                                                    <p className="text-sm mb-2">Observe the swinging motion of a pendulum.</p>
                                  
                                                    {/* </p>  */}
                                                </div>

                                                <div className="bg-gray-900 rounded-lg p-3 shadow hover:shadow-lg transition">
                                                    <h3 className="text-xl font-semibold mb-2">Wave Vibration</h3>
                                                    <p className="text-sm mb-2">See transverse and longitudinal wave patterns.</p>
                                   
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                ) : (
                                    messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[100%] px-4 py-3 rounded-lg ${message.role === "user"
                                                    ? "bg-black text-white"
                                                    : "bg-gray-100 text-black border border-gray-300"
                                                    }`}
                                            >
                                                <div className="text-xs font-medium mb-1 opacity-70">
                                                    {message.role === "user" ? "You" : "AI Assistant"}
                                                </div>
                                                <div className="text-sm leading-relaxed">{message.content}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-black border border-gray-300 px-4 py-3 rounded-lg">
                                            <div className="text-xs font-medium mb-1 opacity-70">AI Assistant</div>
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-black"></div>
                                                <span className="text-sm">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                            <div className="p-4">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about physics..."
                                        className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        className="px-6 py-3 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                <span>Send</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Press Enter to send • Shift+Enter for new line
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Animation Section */}
                    {hasAnimation && (
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm sticky top-20">
                                <div className="p-4 border-b border-gray-300 bg-gray-50">
                                    <h2 className="text-lg font-semibold text-black">Interactive Animation</h2>
                                </div>
                                <div className="p-4 h-[calc(100vh-200px)] overflow-y-auto">
                                    {moduleData.module === "ProjectileMotion" && (
                                        <ProjectileMotion
                                            velocity={moduleData.inputs.velocity!}
                                            angle={moduleData.inputs.angle!}
                                            gravity={moduleData.inputs.gravity!}
                                            timeStep={moduleData.inputs.timeStep!}
                                        />
                                    )}
                                    {moduleData.module === "SpringOscillation" && (
                                        <SpringOscillation
                                            mass={moduleData.inputs.mass!}
                                            springConstant={moduleData.inputs.springConstant!}
                                            amplitude={moduleData.inputs.amplitude!}
                                            damping={moduleData.inputs.damping!}
                                            timeStep={moduleData.inputs.timeStep!}
                                        />
                                    )}
                                    {moduleData.module === "PendulumMotion" && (
                                        <PendulumMotion
                                            length={moduleData.inputs.length!}
                                            mass={moduleData.inputs.mass!}
                                            initialAngle={moduleData.inputs.initialAngle!}
                                            gravity={moduleData.inputs.gravity!}
                                            damping={moduleData.inputs.damping!}
                                            timeStep={moduleData.inputs.timeStep!}
                                        />
                                    )}
                                    {moduleData.module === "WaveVibration" && (
                                        <WaveVibration
                                            frequency={moduleData.inputs.frequency!}
                                            amplitude={moduleData.inputs.amplitude!}
                                            wavelength={moduleData.inputs.wavelength!}
                                            damping={moduleData.inputs.damping!}
                                            timeStep={moduleData.inputs.timeStep!}
                                            waveType={moduleData.inputs.waveType!}
                                        />
                                    )}
                                    <div ref={animationEndRef} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}