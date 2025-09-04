"use client";
import { useState, useEffect } from "react";
import { animated, useSpring } from "react-spring";

interface SpringOscillationProps {
  mass: number;
  springConstant: number;
  amplitude: number;
  damping: number;
  timeStep: number;
}

export default function SpringOscillation({
  mass: initialMass,
  springConstant: initialSpringConstant,
  amplitude: initialAmplitude,
  damping: initialDamping,
  timeStep: initialTimeStep
}: SpringOscillationProps) {
  const [t, setT] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number, y: number }>>([]);

  // Local state for user inputs
  const [mass, setMass] = useState(initialMass);
  const [springConstant, setSpringConstant] = useState(initialSpringConstant);
  const [amplitude, setAmplitude] = useState(initialAmplitude);
  const [damping, setDamping] = useState(initialDamping);
  const [timeStep, setTimeStep] = useState(initialTimeStep);

  // Calculate natural frequency and period
  const naturalFrequency = Math.sqrt(springConstant / mass);
  const period = 2 * Math.PI / naturalFrequency;
  const dampingRatio = damping / (2 * Math.sqrt(springConstant * mass));

  // Calculate position based on time (damped harmonic oscillator)
  const getPosition = (time: number) => {
    if (dampingRatio < 1) {
      // Underdamped case
      const dampedFreq = naturalFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
      return amplitude * Math.exp(-dampingRatio * naturalFrequency * time) * 
             Math.cos(dampedFreq * time);
    } else if (dampingRatio === 1) {
      // Critically damped case
      return amplitude * (1 + naturalFrequency * time) * Math.exp(-naturalFrequency * time);
    } else {
      // Overdamped case
      const alpha1 = -naturalFrequency * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
      const alpha2 = -naturalFrequency * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1));
      const c1 = amplitude / 2;
      const c2 = amplitude / 2;
      return c1 * Math.exp(alpha1 * time) + c2 * Math.exp(alpha2 * time);
    }
  };

  const x = getPosition(t);
  const equilibriumX = 300; // Center position
  const currentX = equilibriumX + x * 50; // Scale for visualization

  const { x: animatedX } = useSpring({
    to: { x: currentX },
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
      setTrail(prev => [...prev, { x: currentX, y: 200 }].slice(-100)); // Keep last 100 points
    }
  }, [isAnimating, t, currentX]);

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
    setMass(initialMass);
    setSpringConstant(initialSpringConstant);
    setAmplitude(initialAmplitude);
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
  }, [mass, springConstant, amplitude, damping, timeStep]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Spring and Oscillation Animation</h3>
       
        <div
          className="relative border-2 border-gray-300 bg-gradient-to-b from-blue-50 to-white mx-auto"
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "300px"
          }}
        >
          {/* Wall/Support */}
          <div className="absolute left-4 top-20 bottom-20 w-2 bg-gray-600"></div>
          
          {/* Spring */}
          <animated.div
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{
              left: "20px",
              width: animatedX.to(x => `${Math.max(50, x - 20)}px`),
              height: "4px",
              background: "linear-gradient(90deg, #8B4513, #D2691E)",
              zIndex: 5,
            }}
          >
            {/* Spring coils */}
            <div className="absolute inset-0 bg-repeat-x" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,2 Q5,0 10,2 T20,2' stroke='%238B4513' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: '20px 4px'
            }}></div>
          </animated.div>

          {/* Mass block */}
          <animated.div
            style={{
              position: "absolute",
              left: animatedX.to(x => `${x - 25}px`),
              top: "50%",
              transform: "translateY(-50%)",
              width: "50px",
              height: "50px",
              background: "linear-gradient(45deg, #4A90E2, #357ABD)",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "12px"
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
                width: "2px",
                height: "2px",
                borderRadius: "50%",
                background: "rgba(74, 144, 226, 0.3)",
                left: `${point.x}px`,
                top: `${point.y}px`,
                zIndex: 3,
              }}
            />
          ))}

          {/* Equilibrium line */}
          <div 
            className="absolute border-t-2 border-dashed border-gray-400"
            style={{
              left: "0",
              right: "0",
              top: "50%",
              transform: "translateY(-50%)"
            }}
          ></div>
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
            Equilibrium
          </div>

          {/* Force vectors */}
          {!isAnimating && Math.abs(x) > 0.1 && (
            <animated.div
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{
                left: animatedX.to(x => `${x + 30}px`),
                width: "40px",
                height: "2px",
                background: x > 0 ? "#ff4444" : "#44ff44",
                zIndex: 8,
              }}
            >
              <div className="absolute -right-2 -top-1 w-0 h-0 border-l-4 border-l-current border-t-2 border-t-transparent border-b-2 border-b-transparent" 
                   style={{ color: x > 0 ? "#ff4444" : "#44ff44" }}></div>
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
            {isAnimating ? "Oscillating..." : "Start Oscillation"}
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
              Spring Constant (N/m)
            </label>
            <input
              type="number"
              value={springConstant}
              onChange={(e) => setSpringConstant(Number(e.target.value))}
              min="1"
              max="100"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amplitude (m)
            </label>
            <input
              type="number"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              min="0.1"
              max="2"
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
              max="5"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2">
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
                setMass(1);
                setSpringConstant(10);
                setAmplitude(1);
                setDamping(0);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Simple Harmonic
            </button>
            <button
              onClick={() => {
                setMass(2);
                setSpringConstant(20);
                setAmplitude(0.8);
                setDamping(0.5);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Light Damping
            </button>
            <button
              onClick={() => {
                setMass(1);
                setSpringConstant(10);
                setAmplitude(1);
                setDamping(2);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Heavy Damping
            </button>
            <button
              onClick={() => {
                setMass(1);
                setSpringConstant(10);
                setAmplitude(1);
                setDamping(6.32);
                setTimeStep(0.05);
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Critical Damping
            </button>
          </div>
        </div>
      </div>

      {/* Physics info */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <div>Time: {t.toFixed(2)}s</div>
        <div>Position: {x.toFixed(3)}m</div>
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
