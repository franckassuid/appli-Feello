export type ThemeColor = 'orange' | 'black' | 'olive' | 'pink' | 'blue';

export interface Question {
    id: number;
    theme: ThemeColor;
    category: string; // The letter/text on top left (A, R, etc)
    tagline: string; // The small text on top
    text: string; // The main question
}

export const themes: Record<ThemeColor, string> = {
    'orange': '#E68C3C', // aspiration & préférence
    'black': '#20473C',  // existence & philosophie (Dark Green)
    'olive': '#7F802F',  // identité & introspection
    'pink': '#E7237F',   // relation & interaction
    'blue': '#736FAD'    // réflexion & expérience (Purple/Blue)
    // 'cream': '#F1EFEA' // (Not used for cards deck background)
};

export const questions: Question[] = [
    {
        id: 1,
        theme: 'orange',
        category: 'A',
        tagline: 'aspiration & préférence',
        text: "Quelle est la dernière fois où tu as fait quelque chose pour la première fois ?"
    },
    {
        id: 2,
        theme: 'blue',
        category: 'R',
        tagline: 'réflexion & expérience',
        text: "Quelle est la leçon la plus importante que tu aies apprise cette année ?"
    },
    {
        id: 3,
        theme: 'pink',
        category: 'R',
        tagline: 'relation & interaction',
        text: "Quel est le compliment qui t'a le plus touché(e) récemment ?"
    },
    {
        id: 4,
        theme: 'olive',
        category: 'I',
        tagline: 'identité & introspection',
        text: "Si tu pouvais changer une décision de ton passé, laquelle serait-ce ?"
    },
    {
        id: 5,
        theme: 'black',
        category: 'E',
        tagline: 'existence & philosophie',
        text: "Qu'est-ce qui donne le plus de sens à ta vie aujourd'hui ?"
    }
];
