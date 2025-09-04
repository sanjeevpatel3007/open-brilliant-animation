"use client";
import { useState, useEffect } from "react";
import { animated, useSpring } from "react-spring";

interface ProjectileMotionProps {
  velocity: number;
  angle: number;
  gravity: number;
  timeStep: number;
}

export default function ProjectileMotion({
  velocity: initialVelocity,
  angle: initialAngle,
  gravity: initialGravity,
  timeStep: initialTimeStep
}: ProjectileMotionProps) {
  const [t, setT] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number, y: number }>>([]);

  // Local state for user inputs
  const [velocity, setVelocity] = useState(initialVelocity);
  const [angle, setAngle] = useState(initialAngle);
  const [gravity, setGravity] = useState(initialGravity);
  const [timeStep, setTimeStep] = useState(initialTimeStep);

  const radians = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(radians);
  const vy = velocity * Math.sin(radians);

  // Calculate position based on time
  const x = vx * t;
  const y = vy * t - 0.5 * gravity * t * t;

  const { x: animatedX, y: animatedY } = useSpring({
    to: { x, y },
    config: { duration: timeStep * 1000 },
    reset: false,
  });

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setT((prev) => {
        const newTime = prev + timeStep;
        // Stop animation when ball hits ground (y <= 0)
        if (newTime * vy - 0.5 * gravity * newTime * newTime <= 0) {
          setIsAnimating(false);
          return prev;
        }
        return newTime;
      });
    }, timeStep * 1000);

    return () => clearInterval(interval);
  }, [isAnimating, timeStep, vy, gravity]);

  // Update trail during animation
  useEffect(() => {
    if (isAnimating && t > 0) {
      setTrail(prev => [...prev, { x, y }].slice(-20)); // Keep last 20 points
    }
  }, [isAnimating, t, x, y]);

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
    setVelocity(initialVelocity);
    setAngle(initialAngle);
    setGravity(initialGravity);
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
  }, [velocity, angle, gravity, timeStep]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Projectile Motion Animation</h3>
       
      <div
        className="relative border-2 border-gray-300 bg-gradient-to-t from-blue-100 to-white mx-auto"
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "400px"
        }}
      >
        {/* Ground line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>

        {/* Trail dots during animation */}
        {isAnimating && trail.map((point, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: "rgba(255, 107, 107, 0.3)",
              left: `${point.x}px`,
              top: `${400 - 20 - point.y}px`,
              zIndex: 5,
            }}
          />
        ))}

        {/* Projectile ball */}
        <animated.div
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
            transform: animatedX.to((xVal) =>
              `translateX(${xVal}px) translateY(${400 - 20 - animatedY.get()}px)`
            ),
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            zIndex: 10,
          }}
        />

        {/* Trajectory path (dotted line) */}
        {!isAnimating && (
          <svg
            className="absolute inset-0 w-full h-full"
          >
            <path
              d={`M 0 ${400 - 20} Q ${((vx * vy * 2) / gravity) / 2} ${400 - 20 - ((vy * vy) / (2 * gravity))} ${(vx * vy * 2) / gravity} ${400 - 20}`}
              stroke="#666"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />
          </svg>
        )}

        {/* Velocity vectors */}
        {!isAnimating && (
          <>
            <div
              className="absolute"
              style={{
                left: "10px",
                top: "10px",
                width: `${vx * 2}px`,
                height: "2px",
                background: "red",
                transform: "translateY(10px)",
              }}
            />
            <div
              className="absolute"
              style={{
                left: "10px",
                top: "10px",
                width: "2px",
                height: `${vy * 2}px`,
                background: "blue",
                transform: "translateX(10px)",
              }}
            />
            <div className="absolute left-12 top-2 text-xs">
              <div className="text-red-500">Vx: {vx.toFixed(1)} m/s</div>
              <div className="text-blue-500">Vy: {vy.toFixed(1)} m/s</div>
            </div>
          </>
        )}
      </div>

        {/* Animation Controls */}
        <div className="flex gap-2">
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:bg-blue-600"
          >
            {isAnimating ? "Animating..." : "Start Animation"}
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
              Velocity (m/s)
            </label>
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              min="1"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Angle (degrees)
            </label>
            <input
              type="number"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              min="0"
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
              Time Step (s)
            </label>
            <input
              type="number"
              value={timeStep}
              onChange={(e) => setTimeStep(Number(e.target.value))}
              min="0.01"
              max="1"
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
                setVelocity(50);
                setAngle(45);
                setGravity(9.8);
                setTimeStep(0.1);
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Optimal (45°)
            </button>
            <button
              onClick={() => {
                setVelocity(50);
                setAngle(30);
                setGravity(9.8);
                setTimeStep(0.1);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Low Angle (30°)
            </button>
            <button
              onClick={() => {
                setVelocity(50);
                setAngle(60);
                setGravity(9.8);
                setTimeStep(0.1);
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              High Angle (60°)
            </button>
            <button
              onClick={() => {
                setVelocity(50);
                setAngle(45);
                setGravity(3.7);
                setTimeStep(0.1);
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Moon Gravity
            </button>
          </div>
        </div>


      </div>

      {/* Physics info */}
      <div className="mt-4 text-sm text-gray-600">
        <div>Time: {t.toFixed(2)}s</div>
        <div>Position: ({x.toFixed(1)}, {y.toFixed(1)}) m</div>
        <div>Max Height: {((vy * vy) / (2 * gravity)).toFixed(1)} m</div>
        <div>Range: {((vx * vy * 2) / gravity).toFixed(1)} m</div>
      </div>
    </div>
  );
}
