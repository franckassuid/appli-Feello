import { collection, getDocs, addDoc, query, onSnapshot, writeBatch, doc } from 'firebase/firestore';
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
    });
};

export const migrateQuestionsToFirebase = async () => {
    try {
        const collectionRef = collection(db, COLLECTION_NAME);
        const snapshot = await getDocs(collectionRef);

        if (!snapshot.empty) {
            console.log('Collection not empty, migration skipped to avoid duplicates.');
            return;
        }

        const batch = writeBatch(db);
        initialQuestions.forEach((q) => {
            // Remove the numeric ID as Firestore generates string IDs
            // or we can keep it as a field if needed.
            const { id, ...data } = q;
            const docRef = doc(collectionRef);
            batch.set(docRef, data);
        });

        await batch.commit();
        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

export const addQuestionToFirebase = async (question: Omit<Question, 'id'>) => {
    try {
        await addDoc(collection(db, COLLECTION_NAME), question);
    } catch (error) {
        console.error('Error adding question:', error);
        throw error;
    }
};
