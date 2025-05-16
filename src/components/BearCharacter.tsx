import { motion } from 'framer-motion';
import Image from 'next/image';

interface BearCharacterProps {
  x: number;
  y: number;
  isMoving: boolean;
}

export const BearCharacter = ({ x, y, isMoving }: BearCharacterProps) => {
  return (
    <motion.div
      className="absolute z-10"
      style={{
        x: x - 30, // Center the bear on the path
        y: y - 60, // Position above the path
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
        src="/bear.jpg"
        alt="Cute bear wizard character"
        width={80}
        height={80}
        className={`transition-transform duration-300 ${isMoving ? 'scale-x-[-1]' : ''}`}
      />
    </motion.div>
  );
};
