import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const fightClubQuotes = [
  {
    text: "You are not your job, you're not how much money you have in the bank. You are not the car you drive. You're not the contents of your wallet.",
    author: "Tyler Durden"
  },
  {
    text: "The things you own end up owning you.",
    author: "Tyler Durden"
  },
  {
    text: "It's only after we've lost everything that we're free to do anything.",
    author: "Tyler Durden"
  },
  {
    text: "You have to know, not fear, know that someday you're gonna die.",
    author: "Tyler Durden"
  },
  {
    text: "We're a generation of men raised by women. I'm wondering if another woman is really the answer we need.",
    author: "Tyler Durden"
  },
  {
    text: "You met me at a very strange time in my life.",
    author: "The Narrator"
  },
  {
    text: "His name was Robert Paulson.",
    author: "The Members"
  },
  {
    text: "I am Jack's raging bile duct.",
    author: "The Narrator"
  },
  {
    text: "You're looking at him. You're looking at who he could become.",
    author: "Tyler Durden"
  },
  {
    text: "We are all singing, all dancing crap of the world.",
    author: "Tyler Durden"
  }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("narrator");
  const [clickCount, setClickCount] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [tylerActivated, setTylerActivated] = useState(false);

  const toggleTheme = () => {
    if (theme === "narrator") {
      activateTylerMode();
    } else {
      setTheme("narrator");
      setTylerActivated(false);
    }
  };

  const activateTylerMode = () => {
    setTheme("tyler");
    setTylerActivated(true);
    showRandomQuote();
    
    // Add some dramatic effects
    document.body.style.animation = 'intense-glitch 0.5s ease-in-out';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  };

  const showRandomQuote = () => {
    const randomQuote = fightClubQuotes[Math.floor(Math.random() * fightClubQuotes.length)];
    setCurrentQuote(randomQuote);
    setShowQuote(true);
    
    // Auto-hide quote after 4 seconds
    setTimeout(() => {
      setShowQuote(false);
    }, 4000);
  };

  const handleEasterEgg = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      
      // Different thresholds for different easter eggs
      if (newCount === 3 && theme === "narrator") {
        // First warning
        showQuoteWithText({
          text: "You're getting closer to something you shouldn't be getting closer to...",
          author: "Tyler Durden"
        });
      } else if (newCount === 5 && theme === "narrator") {
        // Second warning
        showQuoteWithText({
          text: "You met me at a very strange time in my life.",
          author: "The Narrator"
        });
      } else if (newCount >= 7 && theme === "narrator") {
        // Activate Tyler mode
        activateTylerMode();
        return 0;
      } else if (newCount >= 10 && theme === "tyler") {
        // Show special quote in Tyler mode
        showQuoteWithText({
          text: "You created me, Venkatkaushal. You're looking at who you could become.",
          author: "Tyler Durden"
        });
        return 0;
      }
      
      return newCount;
    });
  };

  const showQuoteWithText = (quote) => {
    setCurrentQuote(quote);
    setShowQuote(true);
    setTimeout(() => {
      setShowQuote(false);
    }, 3000);
  };

  const closeQuote = () => {
    setShowQuote(false);
  };

  // Auto-reset click count after 15 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 15000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  useEffect(() => {
    document.body.className = theme;
    
    // Add special class for Tyler mode effects
    if (theme === "tyler") {
      document.body.classList.add("tyler-activated");
    } else {
      document.body.classList.remove("tyler-activated");
    }
  }, [theme]);

  // Random quote generator for Tyler mode
  useEffect(() => {
    let interval;
    if (theme === "tyler" && tylerActivated) {
      interval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every 30 seconds
          showRandomQuote();
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [theme, tylerActivated]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      handleEasterEgg, 
      clickCount,
      showQuote,
      currentQuote,
      closeQuote,
      showRandomQuote,
      tylerActivated
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
