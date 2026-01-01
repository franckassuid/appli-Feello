import { useState, useEffect } from 'react';
import { IntroBox } from './components/IntroBox';
import { GameDeck } from './components/GameDeck';
import { AdminPanel } from './components/AdminPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { questions as initialQuestions, type Question } from './data/questions';
import { subscribeToQuestions, addQuestionToFirebase, updateQuestionInFirebase, deleteQuestionFromFirebase } from './services/questions';
import './App.css';

type View = 'intro' | 'game' | 'admin';

function App() {
  const [view, setView] = useState<View>('intro');
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic routing check
    if (window.location.pathname === '/admin') {
      setView('admin');
    }

    // Subscribe to Firestore updates
    const unsubscribe = subscribeToQuestions((fetchedQuestions) => {
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        // Fallback to local questions if DB is empty
        // This allows seeing content before migration
        setQuestions(initialQuestions);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddQuestion = async (q: Omit<Question, 'id'>) => {
    try {
      await addQuestionToFirebase(q);
      // No need to manually update state, subscription will handle it
    } catch (e) {
      console.error("Error adding question", e);
      alert("Erreur lors de l'ajout (vérifiez la console)");
    }
  };

  const handleUpdateQuestion = async (id: string, updates: Partial<Question>) => {
    try {
      await updateQuestionInFirebase(id, updates);
    } catch (error) {
      alert("Erreur lors de la modification de la question.");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionFromFirebase(id);
    } catch (error) {
      alert("Erreur lors de la suppression de la question.");
    }
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div
            key="intro"
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
            {loading ? (
              <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                Chargement...
              </div>
            ) : questions.length > 0 ? (
              <GameDeck
                questions={questions}
              />
            ) : (
              <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                <p>Aucune question trouvée.</p>
                <p>Allez sur <a href="/admin" style={{ color: '#E7237F' }}>/admin</a> pour en ajouter.</p>
              </div>
            )}
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
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onBack={() => setView('intro')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
