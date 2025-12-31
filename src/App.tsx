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
            initial={{ opacity: 0, y: -500 }} // Fall in from top? Or just appear?
            animate={{ opacity: 1, y: 0 }}
            // Exit: Wait for 0.8s (box drop time) then fade out
            exit={{ opacity: 0, transition: { delay: 0.6, duration: 0.2 } }}
            transition={{ duration: 0.8, ease: "easeOut" }}
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
            // On Exit (Return to Home): STAY VISIBLE (opacity 1) so the box falls ON TOP of it
            exit={{ opacity: 1, transition: { duration: 1 } }}
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
