import { motion } from 'framer-motion';

interface CompleteTaskButtonProps {
  onComplete: () => void;
  disabled: boolean;
  isLastTask: boolean;
}

export const CompleteTaskButton = ({
  onComplete,
  disabled,
  isLastTask,
}: CompleteTaskButtonProps) => {
  return (
    <motion.button
      onClick={onComplete}
      disabled={disabled}
      className={`px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700 transform hover:scale-105'
      } transition-all duration-300`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      aria-label={isLastTask ? 'Complete final task' : 'Complete next task'}
    >
      {disabled
        ? 'All Tasks Completed!'
        : isLastTask
        ? 'Complete Final Task! 🎉'
        : 'Complete Task! ✨'}
    </motion.button>
  );
};
