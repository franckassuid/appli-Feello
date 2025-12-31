export type ThemeColor = 'orange' | 'dark-green' | 'olive' | 'pink' | 'purple';

export interface Question {
    id: number;
    theme: ThemeColor;
    category: string; // The letter/text on top left (A, R, etc)
    tagline: string; // The small text on top
    text: string; // The main question
}

export const themes: Record<ThemeColor, string> = {
    'orange': '#E68C3C',
    'dark-green': '#20473C',
    'olive': '#7F802F',
    'pink': '#E7237F',
    'purple': '#736FAD'
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
        theme: 'purple',
        category: 'R',
        tagline: 'réflexion & expérience',
        text: "Quelle est la dernière fois où tu as fait quelque chose pour la première fois ?"
    },
    // Adding more varied questions based on typical game content (invented for now)
    {
        id: 3,
        theme: 'pink',
        category: 'E',
        tagline: 'émotion & ressenti',
        text: "Quel est le compliment qui t'a le plus touché(e) récemment ?"
    },
    {
        id: 4,
        theme: 'olive',
        category: 'V',
        tagline: 'vision & projection',
        text: "Si tu pouvais changer une décision de ton passé, laquelle serait-ce ?"
    },
    {
        id: 5,
        theme: 'dark-green',
        category: 'C',
        tagline: 'connexion & relation',
        text: "Quelle est la qualité que tu admires le plus chez les autres ?"
    }
];
