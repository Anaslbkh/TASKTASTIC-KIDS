import { motion } from 'framer-motion';
import Image from 'next/image';

interface TaskFlagProps {
  x: number;
  y: number;
  isCompleted: boolean;
  taskNumber: number;
}

export const TaskFlag = ({ x, y, isCompleted }: TaskFlagProps) => {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <Image
          src={isCompleted ? '/glowing-flag.png' : '/flag.png'}
          alt={isCompleted ? 'Completed task flag' : 'Pending task flag'}
          width={40}
          height={60}
          className={`transition-all duration-300 ${isCompleted ? 'drop-shadow-glow' : ''}`}
        />
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-lg font-bold text-yellow-300">
          {isCompleted ? '✓' : ''}
        </span>
      </div>
    </motion.div>
  );
};
