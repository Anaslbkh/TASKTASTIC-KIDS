import { motion } from 'framer-motion';
import Image from 'next/image';

interface BearCharacterProps {
  x: number;
  y: number;
  isMoving: boolean;
  allTasksComplete?: boolean;
}

export const BearCharacter = ({ x, y, isMoving, allTasksComplete }: BearCharacterProps) => {
  return (
    <motion.div
      className="relative z-10"
      style={{
        x: x - 20, // Center the bear on the path
        y: y - 20, // Position above the path
      }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 1,
        repeat: isMoving ? 0 : Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    >
      <Image
        src={allTasksComplete ? "/happy_teddy_bear_hungry.png" : "/full_bear.png"}
        alt="Cute bear character"
        width={150}
        height={150}
        className={`transition-transform duration-300 ${isMoving ? 'scale-x-[-1]' : ''}`}
      />
    </motion.div>
  );
};
