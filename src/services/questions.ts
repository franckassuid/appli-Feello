import { collection, getDocs, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { type Question } from '../data/questions';

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

