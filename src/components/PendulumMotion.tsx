"use client";
import { useState, useEffect } from "react";
import { animated, useSpring } from "react-spring";

interface PendulumMotionProps {
  length: number;
  mass: number;
  initialAngle: number;
  gravity: number;
  damping: number;
  timeStep: number;
}

export default function PendulumMotion({
  length: initialLength,
  mass: initialMass,
  initialAngle: initialInitialAngle,
  gravity: initialGravity,
  damping: initialDamping,
  timeStep: initialTimeStep
}: PendulumMotionProps) {
  const [t, setT] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number, y: number }>>([]);

  // Local state for user inputs
  const [length, setLength] = useState(initialLength);
  const [mass, setMass] = useState(initialMass);
  const [initialAngle, setInitialAngle] = useState(initialInitialAngle);
  const [gravity, setGravity] = useState(initialGravity);
  const [damping, setDamping] = useState(initialDamping);
  const [timeStep, setTimeStep] = useState(initialTimeStep);

  // Calculate natural frequency and period
  const naturalFrequency = Math.sqrt(gravity / length);
  const period = 2 * Math.PI / naturalFrequency;
  const dampingRatio = damping / (2 * Math.sqrt(gravity * length));

  // Calculate pendulum angle based on time (damped harmonic oscillator)
  const getAngle = (time: number) => {
    if (dampingRatio < 1) {
      // Underdamped case
      const dampedFreq = naturalFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
      return (initialAngle * Math.PI / 180) * Math.exp(-dampingRatio * naturalFrequency * time) * 
             Math.cos(dampedFreq * time);
    } else if (dampingRatio === 1) {
      // Critically damped case
      return (initialAngle * Math.PI / 180) * (1 + naturalFrequency * time) * Math.exp(-naturalFrequency * time);
    } else {
      // Overdamped case
      const alpha1 = -naturalFrequency * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
      const alpha2 = -naturalFrequency * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1));
      const c1 = (initialAngle * Math.PI / 180) / 2;
      const c2 = (initialAngle * Math.PI / 180) / 2;
      return c1 * Math.exp(alpha1 * time) + c2 * Math.exp(alpha2 * time);
    }
  };

  const currentAngle = getAngle(t);
  const angleDegrees = (currentAngle * 180) / Math.PI;

  // Calculate bob position
  const pivotX = 300;
  const pivotY = 50;
  const bobX = pivotX + length * 50 * Math.sin(currentAngle);
  const bobY = pivotY + length * 50 * Math.cos(currentAngle);

  const { rotate } = useSpring({
    to: { rotate: angleDegrees },
    config: { duration: timeStep * 1000 },
    reset: false,
  });

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setT((prev) => prev + timeStep);
    }, timeStep * 1000);

    return () => clearInterval(interval);
  }, [isAnimating, timeStep]);

  // Update trail during animation
  useEffect(() => {
    if (isAnimating && t > 0) {
      setTrail(prev => [...prev, { x: bobX, y: bobY }].slice(-50)); // Keep last 50 points
    }
  }, [isAnimating, t, bobX, bobY]);

  const startAnimation = () => {
    if (!isAnimating) {
      setT(0);
      setTrail([]);
      setIsAnimating(true);
    }
  };

  const resetAnimation = () => {
    setT(0);
    setTrail([]);
    setIsAnimating(false);
  };

  const resetToDefaults = () => {
    setLength(initialLength);
    setMass(initialMass);
    setInitialAngle(initialInitialAngle);
    setGravity(initialGravity);
    setDamping(initialDamping);
    setTimeStep(initialTimeStep);
    setT(0);
    setTrail([]);
    setIsAnimating(false);
  };

  // Reset animation when parameters change
  useEffect(() => {
    if (isAnimating) {
      setIsAnimating(false);
      setT(0);
      setTrail([]);
    }
  }, [length, mass, initialAngle, gravity, damping, timeStep]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Pendulum Motion Animation</h3>
       
        <div
          className="relative border-2 border-gray-300 bg-gradient-to-b from-blue-50 to-white mx-auto rounded-lg shadow-lg overflow-hidden"
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "400px"
          }}
        >
          {/* Pivot point */}
          <div 
            className="absolute w-6 h-6 bg-gray-800 rounded-full border-3 border-white shadow-lg"
            style={{
              left: `${pivotX - 12}px`,
              top: `${pivotY - 12}px`,
              zIndex: 10
            }}
          />
          
          {/* Pivot support */}
          <div 
            className="absolute bg-gray-700 rounded-t-lg"
            style={{
              left: `${pivotX - 20}px`,
              top: `${pivotY - 8}px`,
              width: "40px",
              height: "8px",
              zIndex: 9
            }}
          />

          {/* Pendulum string */}
          <animated.div
            className="absolute origin-top"
            style={{
              left: `${pivotX - 1}px`,
              top: `${pivotY}px`,
              width: "2px",
              height: `${length * 50}px`,
              background: "linear-gradient(to bottom, #8B4513, #654321)",
              transform: rotate.to(angle => `rotate(${angle}deg)`),
              zIndex: 5,
              borderRadius: "1px",
              boxShadow: "0 0 2px rgba(0,0,0,0.3)"
            }}
          />

          {/* Pendulum bob */}
          <animated.div
            className="absolute rounded-full shadow-xl border-3 border-white"
            style={{
              left: `${pivotX - 18}px`,
              top: `${pivotY + length * 50 - 18}px`,
              width: "36px",
              height: "36px",
              background: `radial-gradient(circle at 30% 30%, #6BB6FF, #4A90E2, #357ABD)`,
              transform: rotate.to(angle => `rotate(${angle}deg) translateX(${length * 50}px) translateY(-${length * 50}px)`),
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "10px"
            }}
          />
          
          {/* Mass label positioned near the bob */}
          <animated.div
            className="absolute text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border"
            style={{
              left: `${pivotX - 15}px`,
              top: `${pivotY + length * 50 + 25}px`,
              transform: rotate.to(angle => `rotate(${angle}deg) translateX(${length * 50}px) translateY(-${length * 50}px)`),
              zIndex: 12,
            }}
          >
            {mass}kg
          </animated.div>

          {/* Trail during animation */}
          {isAnimating && trail.map((point, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: `rgba(74, 144, 226, ${0.6 - (index / trail.length) * 0.4})`,
                left: `${point.x - 2}px`,
                top: `${point.y - 2}px`,
                zIndex: 3,
                boxShadow: "0 0 2px rgba(74, 144, 226, 0.3)"
              }}
            />
          ))}

          {/* Vertical reference line */}
          <div 
            className="absolute border-l-2 border-dashed border-gray-400"
            style={{
              left: `${pivotX}px`,
              top: `${pivotY}px`,
              height: `${length * 50 + 50}px`,
              zIndex: 1
            }}
          />
          <div className="absolute left-2 top-2 text-xs text-gray-500">
            Equilibrium
          </div>

          {/* Angle indicator */}
          {Math.abs(angleDegrees) > 1 && (
            <div className="absolute left-4 top-20 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
              <div className="font-medium">Angle: {angleDegrees.toFixed(1)}°</div>
            </div>
          )}

          {/* Velocity vector - positioned at the bob */}
          {isAnimating && Math.abs(angleDegrees) > 1 && (
            <animated.div
              className="absolute"
              style={{
                left: `${bobX - 10}px`,
                top: `${bobY - 1}px`,
                width: "20px",
                height: "2px",
                background: "#ff4444",
                transform: rotate.to(angle => {
                  // Calculate velocity direction (perpendicular to string)
                  const velocityAngle = angle + 90;
                  return `rotate(${velocityAngle}deg)`;
                }),
                zIndex: 8,
              }}
            >
              <div className="absolute -right-1 -top-1 w-0 h-0 border-l-2 border-l-current border-t-1 border-t-transparent border-b-1 border-b-transparent" 
                   style={{ color: "#ff4444" }}></div>
            </animated.div>
          )}
        </div>

        {/* Animation Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:bg-blue-600"
          >
            {isAnimating ? "Swinging..." : "Start Pendulum"}
          </button>
          <button
            onClick={resetAnimation}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Animation
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length (m)
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              min="0.5"
              max="5"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mass (kg)
            </label>
            <input
              type="number"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              min="0.1"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Angle (degrees)
            </label>
            <input
              type="number"
              value={initialAngle}
              onChange={(e) => setInitialAngle(Number(e.target.value))}
              min="1"
              max="90"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gravity (m/s²)
            </label>
            <input
              type="number"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              min="1"
              max="20"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damping (N·s/m)
            </label>
            <input
              type="number"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              min="0"
              max="2"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Step (s)
            </label>
            <input
              type="number"
              value={timeStep}
              onChange={(e) => setTimeStep(Number(e.target.value))}
              min="0.01"
              max="0.5"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Quick Presets:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setLength(1);
                setMass(1);
                setInitialAngle(30);
                setGravity(9.8);
                setDamping(0);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Simple Pendulum
            </button>
            <button
              onClick={() => {
                setLength(2);
                setMass(2);
                setInitialAngle(45);
                setGravity(9.8);
                setDamping(0.1);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Light Damping
            </button>
            <button
              onClick={() => {
                setLength(1);
                setMass(1);
                setInitialAngle(60);
                setGravity(9.8);
                setDamping(0.5);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Heavy Damping
            </button>
            <button
              onClick={() => {
                setLength(1);
                setMass(1);
                setInitialAngle(30);
                setGravity(3.7);
                setDamping(0);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Moon Gravity
            </button>
            <button
              onClick={() => {
                setLength(0.5);
                setMass(0.5);
                setInitialAngle(20);
                setGravity(9.8);
                setDamping(0);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Fast Pendulum
            </button>
          </div>
        </div>
      </div>

      {/* Physics info */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <div>Time: {t.toFixed(2)}s</div>
        <div>Current Angle: {angleDegrees.toFixed(1)}°</div>
        <div>Natural Frequency: {naturalFrequency.toFixed(2)} rad/s</div>
        <div>Period: {period.toFixed(2)}s</div>
        <div>Damping Ratio: {dampingRatio.toFixed(2)}</div>
        <div className="text-xs">
          {dampingRatio < 1 ? "Underdamped (oscillating)" : 
           dampingRatio === 1 ? "Critically damped" : 
           "Overdamped (no oscillation)"}
        </div>
      </div>
    </div>
  );
}
