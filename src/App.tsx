import { useState } from 'react';
import { IntroBox } from './components/IntroBox';
import { GameDeck } from './components/GameDeck';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="app-container">
      <AnimatePresence>
        {!gameStarted ? (
          <motion.div
            key="intro"
            // Exit: Wait for 1.5s while the box falls, then fade out
            exit={{ opacity: 0, transition: { delay: 0.8, duration: 0.5 } }}
            className="intro-wrapper"
          >
            <IntroBox onOpen={() => setGameStarted(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            // Enter instantly (behind the box)
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
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
