import { useState, useEffect } from 'react';
import { IntroBox } from './components/IntroBox';
import { GameDeck } from './components/GameDeck';
import { AdminPanel } from './components/AdminPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { questions as initialQuestions, type Question } from './data/questions';
import { subscribeToQuestions, addQuestionToFirebase, updateQuestionInFirebase, deleteQuestionFromFirebase } from './services/questions';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import './App.css';

type View = 'intro' | 'game' | 'admin';

function App() {
  const [view, setView] = useState<View>('intro');
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setView('admin');
    }

    // Reset scroll on view change
    window.scrollTo(0, 0);


    // Subscribe to Firestore updates
    const unsubscribe = subscribeToQuestions((fetchedQuestions) => {
      // If we have questions from DB, use them.
      // If DB is empty, use local fallback.
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        setQuestions(initialQuestions);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fail-safe timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Firestore timeout - forcing app load with local data");
        if (questions.length === 0) setQuestions(initialQuestions);
        setLoading(false);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [loading, questions]);

  const handleAddQuestion = async (q: Omit<Question, 'id'>) => {
    try {
      await addQuestionToFirebase(q);
    } catch (e) {
      console.error("Error adding question", e);
      alert("Erreur lors de l'ajout (vérifiez la console et votre connexion internet/règles Firebase)");
      throw e;
    }
  };

  const handleUpdateQuestion = async (id: string, updates: Partial<Question>) => {
    try {
      await updateQuestionInFirebase(id, updates);
    } catch (error) {
      alert("Erreur lors de la modification de la question.");
      throw error;
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionFromFirebase(id);
    } catch (error) {
      alert("Erreur lors de la suppression de la question.");
      throw error;
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', color: 'white' }}>
                <div className="spinner"></div>
                <div style={{ marginTop: '20px', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>Chargement</div>
                <style>{`
                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 5px solid rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        border-top-color: white;
                        animation: spin 1s ease-in-out infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                 `}</style>
              </div>
            ) : questions.length > 0 ? (
              <GameDeck
                questions={questions}
                onHome={() => setView('intro')}
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
      <PwaInstallPrompt />
    </div>
  );
}

export default App;
