import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const SYSTEM_PROMPT = `You are an intelligent assistant for a physics learning app. 

Your task is to interpret the user's natural language question and decide:

1. Whether the question is related to PROJECTILE MOTION specifically
2. Whether the question is related to SPRING OSCILLATIONS specifically  
3. If yes to either, provide the interactive animation module and parameters
4. If no, provide a helpful text response without any animation

### CRITICAL REQUIREMENTS:

- You MUST respond with ONLY valid JSON, no other text whatsoever.
- Do not include any markdown formatting, code blocks, or explanations outside the JSON.
- The response must start with { and end with }

### JSON format for PROJECTILE MOTION questions:

{
  "module": "ProjectileMotion",
  "inputs": { "velocity": <number>, "angle": <number>, "gravity": <number>, "timeStep": <number> },
  "explanation": "<text>"
}

### JSON format for SPRING OSCILLATION questions:

{
  "module": "SpringOscillation",
  "inputs": { "mass": <number>, "springConstant": <number>, "amplitude": <number>, "damping": <number>, "timeStep": <number> },
  "explanation": "<text>"
}

### JSON format for NON-ANIMATION questions:

{
  "module": null,
  "inputs": {},
  "explanation": "<helpful text response>"
}

### Examples:

User: "Show projectile motion with velocity 20 m/s and angle 45 degrees."
Response: {"module": "ProjectileMotion", "inputs": {"velocity": 20, "angle": 45, "gravity": 9.8, "timeStep": 0.1}, "explanation": "A ball launched at 45 degrees follows a parabolic trajectory under gravity."}

User: "Show me a spring oscillation with mass 2kg and spring constant 10 N/m."
Response: {"module": "SpringOscillation", "inputs": {"mass": 2, "springConstant": 10, "amplitude": 1, "damping": 0, "timeStep": 0.05}, "explanation": "A mass-spring system oscillates back and forth following Hooke's law. The motion is periodic and follows simple harmonic motion."}

User: "What is Hooke's law?"
Response: {"module": "SpringOscillation", "inputs": {"mass": 1, "springConstant": 10, "amplitude": 1, "damping": 0, "timeStep": 0.05}, "explanation": "Hooke's law states that the force exerted by a spring is proportional to its displacement from equilibrium: F = -kx, where k is the spring constant."}

User: "What is Newton's first law?"
Response: {"module": null, "inputs": {}, "explanation": "Newton's first law states that an object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force. This is also known as the law of inertia."}

User: "How does electricity work?"
Response: {"module": null, "inputs": {}, "explanation": "Electricity is the flow of electric charge through a conductor. It involves the movement of electrons from areas of high potential to areas of low potential, creating an electric current."}

### IMPORTANT: 
- Return ProjectileMotion module for questions about projectile motion, ballistics, throwing objects, or parabolic trajectories.
- Return SpringOscillation module for questions about springs, oscillations, harmonic motion, Hooke's law, mass-spring systems, or vibrations.
- For all other physics questions, return module: null with a helpful explanation.`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const result = await model.generateContent(
      `${SYSTEM_PROMPT}\n\nUser: ${prompt}`
    );

    const response = await result.response;
    const text = response.text();

    console.log("AI Response:", text); // Debug log

    let data;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (err) {
      console.error("JSON Parse Error:", err);
      console.error("Raw response:", text);
      
      // Fallback: try to create a reasonable response
      const lowerPrompt = prompt.toLowerCase();
      const isProjectileMotion = lowerPrompt.includes("projectile") || 
                                lowerPrompt.includes("ballistic") ||
                                lowerPrompt.includes("trajectory") ||
                                lowerPrompt.includes("throwing") ||
                                lowerPrompt.includes("launch") ||
                                lowerPrompt.includes("parabolic") ||
                                (lowerPrompt.includes("motion") && (lowerPrompt.includes("ball") || lowerPrompt.includes("object")));
      
      const isSpringOscillation = lowerPrompt.includes("spring") ||
                                 lowerPrompt.includes("oscillation") ||
                                 lowerPrompt.includes("harmonic") ||
                                 lowerPrompt.includes("hooke") ||
                                 lowerPrompt.includes("vibration") ||
                                 lowerPrompt.includes("mass-spring") ||
                                 lowerPrompt.includes("damping");
      
      if (isProjectileMotion) {
        data = {
          module: "ProjectileMotion",
          inputs: {
            velocity: 50,
            angle: 45,
            gravity: 9.8,
            timeStep: 0.1
          },
          explanation: "Here's a projectile motion animation with default parameters. The ball follows a parabolic trajectory under gravity."
        };
      } else if (isSpringOscillation) {
        data = {
          module: "SpringOscillation",
          inputs: {
            mass: 1,
            springConstant: 10,
            amplitude: 1,
            damping: 0,
            timeStep: 0.05
          },
          explanation: "Here's a spring oscillation animation with default parameters. The mass-spring system demonstrates simple harmonic motion following Hooke's law."
        };
      } else {
        data = { 
          module: null, 
          inputs: {}, 
          explanation: "I can help you with physics questions! For projectile motion animations, try asking: 'Show me projectile motion with velocity 15 m/s and angle 60°'. For spring oscillations, try: 'Show me a spring with mass 2kg and spring constant 10 N/m'. For other physics topics, just ask your question and I'll provide a helpful explanation." 
        };
      }
    }

    return new Response(JSON.stringify(data), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ 
        module: null, 
        inputs: {}, 
        explanation: "Error processing request." 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
