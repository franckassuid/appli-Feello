import { useState } from 'react';
import { IntroBox } from './components/IntroBox';
import { GameDeck } from './components/GameDeck';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {!gameStarted ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 1.5, pointerEvents: 'none' }}
            transition={{ duration: 0.8 }}
            className="intro-wrapper"
          >
            <IntroBox onOpen={() => setGameStarted(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="game-wrapper"
          >
            <GameDeck onHome={() => setGameStarted(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App
