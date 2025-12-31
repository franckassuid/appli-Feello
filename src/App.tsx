import { useState, useEffect } from 'react';
import { IntroBox } from './components/IntroBox';
import { GameDeck } from './components/GameDeck';
import { AdminPanel } from './components/AdminPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { questions as initialQuestions, type Question } from './data/questions';
import './App.css';

type View = 'intro' | 'game' | 'admin';

function App() {
  const [view, setView] = useState<View>('intro');
  const [introKey, setIntroKey] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(() => {
    // Load from local storage or use initial
    const saved = localStorage.getItem('feello-questions');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation or merging could happen here
        // For now, if we have saved questions, use them.
        // Option: Merge initial with saved if needed? 
        // Let's assume saved replaces/extends. If user adds Qs, they want them.
        // Simplest: If saved exists, use it. But what if we updated initial code?
        // Let's rely on saved.
        return parsed.length > 0 ? parsed : initialQuestions;
      }
    } catch (e) {
      console.error("Failed to parse questions", e);
    }
    return initialQuestions;
  });

  useEffect(() => {
    // Basic routing check
    if (window.location.pathname === '/admin') {
      setView('admin');
    }
  }, []);

  const handleAddQuestion = (q: Omit<Question, 'id'>) => {
    const newQ = { ...q, id: Date.now() };
    const newQuestions = [...questions, newQ];
    setQuestions(newQuestions);
    localStorage.setItem('feello-questions', JSON.stringify(newQuestions));
  };

  const handleBackToIntro = () => {
    setIntroKey(prev => prev + 1); // Increment to force remount
    setView('intro');
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div
            key={`intro-${introKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="intro-wrapper"
          >
            <IntroBox onOpen={() => setView('game')} />
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="game-wrapper"
          >
            <GameDeck
              onHome={handleBackToIntro}
              questions={questions}
            />
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 50 }}
          >
            <AdminPanel
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onBack={() => setView('intro')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
