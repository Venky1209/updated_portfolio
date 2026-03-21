import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoon, FaSun, FaSkull } from "react-icons/fa";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-3 rounded-full transition-all duration-300 ${
        theme === "narrator"
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
          : "bg-tyler-pink text-black hover:bg-red-500 shadow-lg shadow-red-500/50"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ rotate: 0 }}
      animate={{ 
        rotate: theme === "tyler" ? 360 : 0,
        boxShadow: theme === "tyler" ? "0 0 20px rgba(255, 20, 147, 0.8)" : "none"
      }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {theme === "narrator" ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <FaMoon size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="skull"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="text-black"
          >
            <FaSkull size={20} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {theme === "tyler" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: "radial-gradient(circle, rgba(255, 20, 147, 0.3) 0%, transparent 70%)",
          }}
        />
      )}
    </motion.button>
  );
};

export default ThemeToggleButton;
