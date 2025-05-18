import { motion } from 'framer-motion';
import { BearCharacter } from './BearCharacter';
import { useEffect, useRef, useState } from 'react';

export interface TaskMapProps {
  tasks: { id: number; label: string }[];
  completedTasks: number;
  pathPoints: { x: number; y: number }[];
  dailyTaskTarget: number; // Add this prop
}

export const defaultPathPoints = [
  { x: 70, y: 420 },
  { x: 200, y: 300 },
  { x: 350, y: 400 },
  { x: 500, y: 500 },
  { x: 650, y: 350 },
  { x: 750, y: 250 },
  { x: 700, y: 200 },
];

export const TaskMap = ({ tasks, completedTasks, pathPoints, dailyTaskTarget }: TaskMapProps) => {
  const totalFruits = dailyTaskTarget;
  const allTasksComplete = completedTasks >= totalFruits && totalFruits > 0;
  const fruitIcons = [
    '🍎', '🍌', '🍓', '🍊', '🍇', '🍉', '🍍', '🥝', '🍑', '🍒', '🥭', '🍐', '🍈', '🍏', '🍋'
  ];
  const fruits = Array.from({ length: completedTasks }, (_, i) => fruitIcons[i % fruitIcons.length]);
  const emptySlots = Array.from({ length: Math.max(0, totalFruits - completedTasks) });

  // Show message for a few seconds after a task is completed
  const [showMessage, setShowMessage] = useState(false);
  const prevCompleted = useRef(completedTasks);
  useEffect(() => {
    // Only show message if a new task was just completed (not on mount)
    if (
      completedTasks > 0 &&
      completedTasks > prevCompleted.current &&
      completedTasks <= totalFruits &&
      !allTasksComplete
    ) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      prevCompleted.current = completedTasks;
      return () => clearTimeout(timer);
    }
    // Always show message if all tasks are complete
    if (allTasksComplete) {
      setShowMessage(true);
      prevCompleted.current = completedTasks;
    }
    // Hide message if user removes a completed task
    if (completedTasks < prevCompleted.current) {
      setShowMessage(false);
      prevCompleted.current = completedTasks;
    }
  }, [completedTasks, allTasksComplete, totalFruits]);

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-2xl p-4 bg-gradient-to-b from-green-200 via-green-100 to-green-300 flex flex-col items-center justify-center">
      {/* Decorative background: improved trees, flowers, butterflies, sun, and cloud */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sun */}
        <g>
          <circle cx="90" cy="70" r="40" fill="#ffe066" />
          {/* Sun rays */}
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="88" y="10" width="4" height="25" fill="#ffe066" transform={`rotate(${i * 30} 90 70)`} />
          ))}
        </g>
        {/* Cloud */}
        <g>
          <ellipse cx="200" cy="70" rx="50" ry="25" fill="#e0e7ef" />
          <ellipse cx="240" cy="70" rx="30" ry="20" fill="#e0e7ef" />
          <ellipse cx="170" cy="80" rx="25" ry="15" fill="#e0e7ef" />
        </g>
        {/* Trees - cartoon style */}
        <g>
          {/* Left tree */}
          <rect x="80" y="340" width="20" height="80" rx="8" fill="#8d5524" />
          <ellipse cx="90" cy="340" rx="40" ry="50" fill="#4caf50" />
          <ellipse cx="70" cy="360" rx="25" ry="30" fill="#81c784" />
          {/* Right tree */}
          <rect x="700" y="350" width="18" height="70" rx="7" fill="#8d5524" />
          <ellipse cx="710" cy="350" rx="35" ry="45" fill="#43a047" />
          <ellipse cx="730" cy="370" rx="20" ry="25" fill="#a5d6a7" />
        </g>
        {/* Flowers - cartoon style */}
        <g>
          {/* Pink flower */}
          <circle cx="180" cy="470" r="10" fill="#ffb6c1" />
          {[...Array(6)].map((_, i) => (
            <ellipse key={i} cx={180 + 10 * Math.cos((i * Math.PI) / 3)} cy={470 + 10 * Math.sin((i * Math.PI) / 3)} rx="6" ry="3" fill="#ff69b4" />
          ))}
          <circle cx="180" cy="470" r="4" fill="#fff" />
          {/* Yellow flower */}
          <circle cx="600" cy="480" r="8" fill="#ffe066" />
          {[...Array(6)].map((_, i) => (
            <ellipse key={i} cx={600 + 8 * Math.cos((i * Math.PI) / 3)} cy={480 + 8 * Math.sin((i * Math.PI) / 3)} rx="4" ry="2" fill="#ffd700" />
          ))}
          <circle cx="600" cy="480" r="3" fill="#fff" />
          {/* Red flower */}
          <circle cx="400" cy="490" r="7" fill="#e57373" />
          {[...Array(6)].map((_, i) => (
            <ellipse key={i} cx={400 + 7 * Math.cos((i * Math.PI) / 3)} cy={490 + 7 * Math.sin((i * Math.PI) / 3)} rx="3" ry="1.5" fill="#d32f2f" />
          ))}
          <circle cx="400" cy="490" r="2.5" fill="#fff" />
        </g>
        {/* Butterflies - cartoon style */}
        <g>
          {/* Butterfly 1 */}
          <ellipse cx="320" cy="120" rx="12" ry="6" fill="#ffb347" />
          <ellipse cx="332" cy="120" rx="12" ry="6" fill="#ffb347" />
          <rect x="325" y="117" width="4" height="12" rx="2" fill="#6d4c41" />
          <circle cx="327" cy="120" r="3" fill="#6d4c41" />
          {/* Butterfly 2 */}
          <ellipse cx="600" cy="100" rx="10" ry="5" fill="#b39ddb" />
          <ellipse cx="610" cy="100" rx="10" ry="5" fill="#b39ddb" />
          <rect x="604" y="97" width="4" height="10" rx="2" fill="#6d4c41" />
          <circle cx="606" cy="100" r="2.5" fill="#6d4c41" />
        </g>
      </svg>
      {/* Title */}
      <h2 className="text-3xl font-extrabold text-purple-700 mb-2 drop-shadow-lg">Feed the Bear</h2>
      {/* Bear and fruits */}
      <div className="relative flex flex-col justify-center w-full h-full">
        {/* Bear in the center - always visible */}
        <div className="relative z-10 flex flex-col items-center">
          <BearCharacter x={0} y={0} isMoving={false} allTasksComplete/>
        </div>
        {/* Bear's message - only show after a task is completed, or when all tasks are done */}
        {showMessage && (
          <div className="absolute left-1/2 z-20 bg-white/80 dark:bg-black/70 rounded-xl px-6 py-3 shadow-lg border-2 border-purple-300 text-lg font-semibold text-purple-800 dark:text-purple-100 text-center max-w-xs animate-fade-in" style={{ transform: 'translate(-50%, -100%)' }}>
            {allTasksComplete
              ? "Thanks for feeding me, I'm full for today! Don't forget about me tomorrow."
              : "Thanks for helping me eat!"}
          </div>
        )}
        {/* Fruits around the bear for each completed task, and empty slots for remaining */}
        <div className="absolute left-1/2 top-1/2 z-0" style={{ transform: 'translate(-50%, -50%)' }}>
          {/* Completed fruits */}
          {fruits.map((fruit, i) => {
            const angle = (2 * Math.PI * i) / Math.max(totalFruits, 1);
            const radius = 90;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <span
                key={i}
                className="absolute text-7xl drop-shadow-lg"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
                }}
              >
                {fruit}
              </span>
            );
          })}
          {/* Empty slots */}
          {emptySlots.map((_, i) => {
            const angle = (2 * Math.PI * (i + completedTasks)) / Math.max(totalFruits, 1);
            const radius = 90;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <span
                key={`empty-${i}`}
                className="absolute text-7xl"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
                }}
                aria-label="Empty fruit slot"
              >
                {'🍏'}
              </span>
            );
          })}
        </div>
      </div>
      {/* Show how many tasks are left to complete */}
      <div className="mt-6 text-lg text-purple-700 font-bold">
        {`Tasks completed: ${completedTasks} / ${totalFruits}`}
      </div>
    </div>
  );
};
