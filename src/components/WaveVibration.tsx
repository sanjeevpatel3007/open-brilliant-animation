"use client";
import { useState, useEffect } from "react";
import { animated, useSpring } from "react-spring";

interface WaveVibrationProps {
  frequency: number;
  amplitude: number;
  wavelength: number;
  damping: number;
  timeStep: number;
  waveType: "transverse" | "longitudinal";
}

export default function WaveVibration({
  frequency: initialFrequency,
  amplitude: initialAmplitude,
  wavelength: initialWavelength,
  damping: initialDamping,
  timeStep: initialTimeStep,
  waveType: initialWaveType
}: WaveVibrationProps) {
  const [t, setT] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wavePoints, setWavePoints] = useState<Array<{ x: number, y: number, phase: number }>>([]);

  // Local state for user inputs
  const [frequency, setFrequency] = useState(initialFrequency);
  const [amplitude, setAmplitude] = useState(initialAmplitude);
  const [wavelength, setWavelength] = useState(initialWavelength);
  const [damping, setDamping] = useState(initialDamping);
  const [timeStep, setTimeStep] = useState(initialTimeStep);
  const [waveType, setWaveType] = useState<"transverse" | "longitudinal">(initialWaveType);

  // Calculate wave properties
  const angularFrequency = 2 * Math.PI * frequency;
  const waveNumber = 2 * Math.PI / wavelength;
  const waveSpeed = frequency * wavelength;

  // Generate wave points along the string
  const generateWavePoints = () => {
    const points = [];
    const numPoints = 50;
    const stringLength = 500;
    
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * stringLength;
      const phase = (x / stringLength) * 2 * Math.PI * (stringLength / wavelength);
      points.push({ x, y: 0, phase });
    }
    return points;
  };

  useEffect(() => {
    setWavePoints(generateWavePoints());
  }, [wavelength]);

  // Calculate wave displacement at a point
  const getWaveDisplacement = (x: number, time: number) => {
    const phase = waveNumber * x - angularFrequency * time;
    const dampingFactor = Math.exp(-damping * time);
    
    if (waveType === "transverse") {
      return amplitude * Math.sin(phase) * dampingFactor;
    } else {
      // For longitudinal waves, we'll show compression/rarefaction as color intensity
      return amplitude * Math.sin(phase) * dampingFactor;
    }
  };

  const startAnimation = () => {
    if (!isAnimating) {
      setT(0);
      setIsAnimating(true);
    }
  };

  const resetAnimation = () => {
    setT(0);
    setIsAnimating(false);
  };

  const resetToDefaults = () => {
    setFrequency(initialFrequency);
    setAmplitude(initialAmplitude);
    setWavelength(initialWavelength);
    setDamping(initialDamping);
    setTimeStep(initialTimeStep);
    setWaveType(initialWaveType);
    setT(0);
    setIsAnimating(false);
  };

  // Reset animation when parameters change
  useEffect(() => {
    if (isAnimating) {
      setIsAnimating(false);
      setT(0);
    }
  }, [frequency, amplitude, wavelength, damping, timeStep, waveType]);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setT((prev) => prev + timeStep);
    }, timeStep * 1000);

    return () => clearInterval(interval);
  }, [isAnimating, timeStep]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Wave & Vibration Animation</h3>
       
        <div
          className="relative border-2 border-gray-300 bg-gradient-to-b from-blue-50 to-white mx-auto rounded-lg shadow-lg overflow-hidden"
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "300px"
          }}
        >
          {/* Fixed endpoints */}
          <div 
            className="absolute w-4 h-4 bg-gray-800 rounded-full border-2 border-white shadow-lg"
            style={{
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10
            }}
          />
          <div 
            className="absolute w-4 h-4 bg-gray-800 rounded-full border-2 border-white shadow-lg"
            style={{
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10
            }}
          />

          {/* Wave visualization */}
          {waveType === "transverse" ? (
            // Transverse wave - vertical displacement
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ zIndex: 5 }}
            >
              {/* String at rest */}
              <line
                x1="40"
                y1="150"
                x2="560"
                y2="150"
                stroke="#666"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.3"
              />
              
              {/* Animated wave */}
              <animated.path
                d={wavePoints.map((point, index) => {
                  const displacement = getWaveDisplacement(point.x, t);
                  const x = 40 + point.x;
                  const y = 150 + displacement * 30; // Scale for visualization
                  
                  if (index === 0) return `M ${x} ${y}`;
                  return `L ${x} ${y}`;
                }).join(' ')}
                stroke="#4A90E2"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Wave particles */}
              {wavePoints.map((point, index) => {
                if (index % 5 !== 0) return null; // Show every 5th particle
                const displacement = getWaveDisplacement(point.x, t);
                const x = 40 + point.x;
                const y = 150 + displacement * 30;
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#FF6B6B"
                    opacity="0.8"
                  />
                );
              })}
            </svg>
          ) : (
            // Longitudinal wave - compression/rarefaction
            <div className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
              {wavePoints.map((point, index) => {
                const displacement = getWaveDisplacement(point.x, t);
                const compression = Math.abs(displacement);
                const intensity = Math.min(1, compression / amplitude);
                
                return (
                  <div
                    key={index}
                    className="absolute w-2 h-8 rounded-full"
                    style={{
                      left: `${40 + point.x}px`,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: `rgba(74, 144, 226, ${0.3 + intensity * 0.7})`,
                      border: `1px solid rgba(74, 144, 226, ${0.5 + intensity * 0.5})`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Wave direction indicator */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <div className="w-0 h-0 border-l-2 border-l-blue-500 border-t-1 border-t-transparent border-b-1 border-b-transparent"></div>
              <span>Wave Direction</span>
            </div>
          </div>

          {/* Wave type indicator */}
          <div className="absolute top-4 right-4 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
            {waveType === "transverse" ? "Transverse Wave" : "Longitudinal Wave"}
          </div>
        </div>

        {/* Animation Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:bg-blue-600"
          >
            {isAnimating ? "Waving..." : "Start Wave"}
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
              Frequency (Hz)
            </label>
            <input
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              min="0.1"
              max="5"
              step="0.1"
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
              Wavelength (m)
            </label>
            <input
              type="number"
              value={wavelength}
              onChange={(e) => setWavelength(Number(e.target.value))}
              min="0.5"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damping (1/s)
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wave Type
            </label>
            <select
              value={waveType}
              onChange={(e) => setWaveType(e.target.value as "transverse" | "longitudinal")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="transverse">Transverse</option>
              <option value="longitudinal">Longitudinal</option>
            </select>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Quick Presets:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setFrequency(1);
                setAmplitude(1);
                setWavelength(2);
                setDamping(0);
                setTimeStep(0.05);
                setWaveType("transverse");
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Simple Wave
            </button>
            <button
              onClick={() => {
                setFrequency(2);
                setAmplitude(0.8);
                setWavelength(1.5);
                setDamping(0.1);
                setTimeStep(0.05);
                setWaveType("transverse");
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              High Frequency
            </button>
            <button
              onClick={() => {
                setFrequency(0.5);
                setAmplitude(1.2);
                setWavelength(4);
                setDamping(0.05);
                setTimeStep(0.05);
                setWaveType("transverse");
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Long Wavelength
            </button>
            <button
              onClick={() => {
                setFrequency(1.5);
                setAmplitude(1);
                setWavelength(2);
                setDamping(0.2);
                setTimeStep(0.05);
                setWaveType("transverse");
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Damped Wave
            </button>
            <button
              onClick={() => {
                setFrequency(1);
                setAmplitude(1);
                setWavelength(2);
                setDamping(0);
                setTimeStep(0.05);
                setWaveType("longitudinal");
              }}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Sound Wave
            </button>
          </div>
        </div>
      </div>

      {/* Physics info */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <div>Time: {t.toFixed(2)}s</div>
        <div>Angular Frequency: {angularFrequency.toFixed(2)} rad/s</div>
        <div>Wave Number: {waveNumber.toFixed(2)} rad/m</div>
        <div>Wave Speed: {waveSpeed.toFixed(2)} m/s</div>
        <div>Period: {(1/frequency).toFixed(2)}s</div>
        <div className="text-xs">
          {waveType === "transverse" 
            ? "Transverse: particles move perpendicular to wave direction" 
            : "Longitudinal: particles move parallel to wave direction"}
        </div>
      </div>
    </div>
  );
}
