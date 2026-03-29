// Progressbarup.jsx

import { motion } from 'framer-motion';

const Circularup = ({ percentage, isLoading = false, size = 120 }) => {
  const radius = 54;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="circularGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2d3748"
          strokeWidth="8"
        />
        
        {/* Cercle de progression animé */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#circularGradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      
      {/* Contenu central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={percentage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-white">
            {percentage}%
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isLoading ? 'Uploading...' : 'Complete'}
          </div>
        </motion.div>
        
        {/* Animation de chargement */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
          </motion.div>
        )}
      </div>
      
      {/* Effet de pulsation pendant le chargement */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-500/30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default Circularup;