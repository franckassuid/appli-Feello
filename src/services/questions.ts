import { collection, getDocs, addDoc, query, onSnapshot, writeBatch, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { type Question, questions as initialQuestions } from '../data/questions';

const COLLECTION_NAME = 'questions';

export const subscribeToQuestions = (callback: (questions: Question[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(q, (snapshot) => {
        const questions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as unknown as Question[]; // safe cast if schema matches
        callback(questions);
    }, (error) => {
        console.error("Firestore subscription error:", error);
    });
};

export const migrateQuestionsToFirebase = async () => {
    try {
        const collectionRef = collection(db, COLLECTION_NAME);
        const snapshot = await withTimeout(getDocs(collectionRef), 10000, "Checking collection");

        const existingTexts = new Set(
            snapshot.docs.map(doc => (doc.data().text || '').trim())
        );

        const batch = writeBatch(db);
        let addedCount = 0;

        initialQuestions.forEach((q) => {
            const normalizedText = q.text.trim();
            if (!existingTexts.has(normalizedText)) {
                // Remove the numeric ID as Firestore generates string IDs
                const { id, ...data } = q;
                const docRef = doc(collectionRef);
                batch.set(docRef, {
                    ...data,
                    createdAt: serverTimestamp()
                });
                addedCount++;
            }
        });

        if (addedCount > 0) {
            await batch.commit();
            console.log(`Migration successful! Added ${addedCount} questions.`);
            alert(`Migration réussie ! ${addedCount} questions ont été ajoutées à la base de données.`);
        } else {
            console.log('All local questions already exist in remote.');
            alert('Toutes les questions locales sont déjà présentes dans la base de données.');
        }
    } catch (error: any) {
        console.error('Migration failed:', error);
        alert(`Erreur lors de la migration : ${error.message || error}. Vérifiez la console.`);
        throw error;
    }
};

// Helper to force timeout if Firestore hangs (e.g. missing connection/auth)
const withTimeout = <T>(promise: Promise<T>, ms: number = 10000, context: string): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${context} timed out after ${ms}ms`)), ms))
    ]);
};

export const addQuestionToFirebase = async (question: Omit<Question, 'id'>) => {
    try {
        await withTimeout(
            addDoc(collection(db, COLLECTION_NAME), {
                ...question,
                createdAt: serverTimestamp()
            }),
            10000,
            "Adding question"
        );
    } catch (error) {
        console.error('Error adding question:', error);
        throw error;
    }
};

export const deleteQuestionFromFirebase = async (id: string) => {
    try {
        await withTimeout(deleteDoc(doc(db, COLLECTION_NAME, id)), 10000, "Deleting question");
    } catch (error) {
        console.error('Error deleting question:', error);
        throw error;
    }
};

export const updateQuestionInFirebase = async (id: string, updates: Partial<Question>) => {
    try {
        await withTimeout(updateDoc(doc(db, COLLECTION_NAME, id), updates), 10000, "Updating question");
    } catch (error) {
        console.error('Error updating question:', error);
        throw error;
    }
};

export const migrateDatesForExistingQuestions = async () => {
    try {
        const collectionRef = collection(db, COLLECTION_NAME);
        const snapshot = await getDocs(collectionRef);
        const batch = writeBatch(db);
        let count = 0;

        snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            // Update only if missing createdAt
            if (!data.createdAt) {
                batch.update(doc(db, COLLECTION_NAME, docSnap.id), {
                    createdAt: serverTimestamp()
                });
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`Updated ${count} questions with dates.`);
        }
        return count;
    } catch (error) {
        console.error('Error migrating dates:', error);
        throw error;
    }
};
