import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const SYSTEM_PROMPT = `You are an intelligent assistant for a physics learning app. 

Your task is to interpret the user's natural language question and decide:

1. Whether the question is related to PROJECTILE MOTION specifically
2. If yes, provide the interactive animation module and parameters
3. If no, provide a helpful text response without any animation

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

### JSON format for NON-PROJECTILE MOTION questions:

{
  "module": null,
  "inputs": {},
  "explanation": "<helpful text response>"
}

### Examples:

User: "Show projectile motion with velocity 20 m/s and angle 45 degrees."
Response: {"module": "ProjectileMotion", "inputs": {"velocity": 20, "angle": 45, "gravity": 9.8, "timeStep": 0.1}, "explanation": "A ball launched at 45 degrees follows a parabolic trajectory under gravity."}

User: "What is Newton's first law?"
Response: {"module": null, "inputs": {}, "explanation": "Newton's first law states that an object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force. This is also known as the law of inertia."}

User: "How does electricity work?"
Response: {"module": null, "inputs": {}, "explanation": "Electricity is the flow of electric charge through a conductor. It involves the movement of electrons from areas of high potential to areas of low potential, creating an electric current."}

### IMPORTANT: Only return ProjectileMotion module for questions specifically about projectile motion, ballistics, throwing objects, or parabolic trajectories. For all other physics questions, return module: null with a helpful explanation.`;

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
      } else {
        data = { 
          module: null, 
          inputs: {}, 
          explanation: "I can help you with physics questions! For projectile motion animations, try asking: 'Show me projectile motion with velocity 15 m/s and angle 60°'. For other physics topics, just ask your question and I'll provide a helpful explanation." 
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
