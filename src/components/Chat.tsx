"use client";
import { useState } from "react";
import ProjectileMotion from "./ProjectileMotion";
import SpringOscillation from "./SpringOscillation";
import PendulumMotion from "./PendulumMotion";

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
  };
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const hasAnimation = moduleData?.module === "ProjectileMotion" || moduleData?.module === "SpringOscillation" || moduleData?.module === "PendulumMotion";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center mb-2">Physics Learning Assistant</h1>
          <p className="text-gray-600 text-center">
            Ask me about physics! For projectile motion, I'll show you an interactive animation.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto p-4 ${hasAnimation ? 'flex gap-6' : ''}`}>
        {/* Chat Section */}
        <div className={`${hasAnimation ? 'w-1/4' : 'max-w-4xl mx-auto'}`}>
          {/* Chat Messages */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Chat</h2>
            </div>
            <div className={`overflow-y-auto p-4 space-y-4 ${hasAnimation ? 'h-96' : 'h-96'}`}>
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>Try asking: "What is Newton's first law?" or "Show me projectile motion with velocity 15 m/s and angle 60°" or "Show me a spring oscillation with mass 2kg" or "Show me a pendulum with length 2m"</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </div>
                      <div className="text-sm">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="text-sm font-medium mb-1">AI Assistant</div>
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about physics..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "..." : "Send"}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Press Enter to send
              </div>
            </div>
          </div>
        </div>

        {/* Animation Section */}
        {hasAnimation && (
          <div className="w-3/4">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Interactive Animation</h2>
              </div>
              <div className="p-4">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
