import { motion } from 'framer-motion';
import { TaskFlag } from './TaskFlag';
import { BearCharacter } from './BearCharacter';

interface TaskMapProps {
  tasks: { id: number; label: string }[];
  completedTasks: number;
  pathPoints: { x: number; y: number }[];
}

export const TaskMap = ({ tasks, completedTasks, pathPoints }: TaskMapProps) => {
  // Ensure pathPoints is always a valid array
  const safePathPoints = Array.isArray(pathPoints) && pathPoints.length > 0 ? pathPoints : defaultPathPoints;

  // Generate SVG path data from points
  const generatePath = () => {
    if (safePathPoints.length < 2) return '';
    
    let path = `M ${safePathPoints[0].x} ${safePathPoints[0].y}`;
    
    for (let i = 1; i < safePathPoints.length; i++) {
      const point = safePathPoints[i];
      // Use quadratic bezier curves for smooth paths
      const prevPoint = safePathPoints[i - 1];
      const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.5;
      path += ` Q ${cp1x} ${prevPoint.y}, ${point.x} ${point.y}`;
    }
    
    return path;
  };

  // Calculate bear's position along the path
  const getBearPosition = (): { x: number; y: number } => {
    // Defensive: if safePathPoints is missing or too short, return a default
    if (!Array.isArray(safePathPoints) || safePathPoints.length === 0) {
      return { x: 0, y: 0 };
    }
    // Defensive: if tasks is missing or empty, return the start of the path
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return safePathPoints[0];
    }
    if (completedTasks === 0) return safePathPoints[0];
    if (completedTasks >= tasks.length) return safePathPoints[safePathPoints.length - 1];
    
    // Calculate progress between the current and next task
    const progress = completedTasks / tasks.length;
    const pathIndex = Math.floor(progress * (safePathPoints.length - 1));
    const nextPathIndex = Math.min(pathIndex + 1, safePathPoints.length - 1);
    const segmentProgress = (progress * (safePathPoints.length - 1)) % 1;
    
    return {
      x: safePathPoints[pathIndex].x + (safePathPoints[nextPathIndex].x - safePathPoints[pathIndex].x) * segmentProgress,
      y: safePathPoints[pathIndex].y + (safePathPoints[nextPathIndex].y - safePathPoints[pathIndex].y) * segmentProgress,
    };
  };

  const bearPosition = getBearPosition();

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-100 rounded-2xl p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-100 rounded-full opacity-20"></div>
      </div>
      
      {/* Path */}
      <svg className="w-full h-full absolute inset-0">
        <motion.path
          d={generatePath()}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Task Flags */}
      {Array.isArray(tasks) && tasks.length > 0 && tasks.map((task, index) => {
        const pointIndex = Math.floor((index / tasks.length) * (safePathPoints.length - 1));
        const point = safePathPoints[pointIndex] || safePathPoints[0];
        return (
          <TaskFlag
            key={task.id}
            x={point.x}
            y={point.y}
            isCompleted={index < completedTasks}
            taskNumber={index + 1}
          />
        );
      })}

      {/* Bear Character */}
      <BearCharacter
        x={bearPosition.x}
        y={bearPosition.y}
        isMoving={false}
      />
    </div>
  );
};

// Default path points if none provided
export const defaultPathPoints = [
  { x: 50, y: 400 },
  { x: 150, y: 350 },
  { x: 250, y: 400 },
  { x: 350, y: 300 },
  { x: 450, y: 350 },
  { x: 550, y: 250 },
  { x: 650, y: 300 },
  { x: 750, y: 200 },
];
