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
    'black': '#20473C',  // existence & philosophie
    'olive': '#7F802F',  // identité & introspection
    'pink': '#E7237F',   // relation & interaction
    'blue': '#736FAD'    // réflexion & expérience
};

export const questions: Question[] = [
    {
        id: 1,
        theme: 'pink',
        category: 'R',
        tagline: 'relation & interaction',
        text: "Sur quels sujets n’as-tu pas aimé que l'on te mente étant petit·e ?"
    },
    {
        id: 2,
        theme: 'black',
        category: 'E',
        tagline: 'existence & philosophie',
        text: "Si tu pouvais avoir une discussion avec n’importe qui (vivant·e ou décédé·e), qui ce serait ?"
    },
    {
        id: 3,
        theme: 'pink',
        category: 'R',
        tagline: 'relation & interaction',
        text: "Si tu pouvais passer plus de temps avec une personne au quotidien, qui ce serait et pourquoi ?"
    },
    {
        id: 4,
        theme: 'olive',
        category: 'I',
        tagline: 'identité & introspection',
        text: "Sur quoi les gens se trompent-ils toujours à ton propos ?"
    },
    {
        id: 5,
        theme: 'black',
        category: 'E',
        tagline: 'existence & philosophie',
        text: "Si tu devais mourir demain, comment aimerais-tu que l’on se souvienne de toi ?"
    },
    {
        id: 6,
        theme: 'blue',
        category: 'R',
        tagline: 'réflexion & expérience',
        text: "Donne-moi une phrase / réflexion qu’on t’a dite et qui te suit encore aujourd’hui."
    },
    {
        id: 7,
        theme: 'pink',
        category: 'R',
        tagline: 'relation & interaction',
        text: "Quelle est la plus belle leçon qu’un·e ami·e t’ait donnée ?"
    },
    {
        id: 8,
        theme: 'black',
        category: 'E',
        tagline: 'existence & philosophie',
        text: "Y a-t-il un moment où tu as pris un coup de vieux ?"
    },
    {
        id: 9,
        theme: 'orange',
        category: 'A',
        tagline: 'aspiration & préférence',
        text: "Si tu devais faire un film sur ta vie, quel acteur·rice jouerait ton rôle ?"
    },
    {
        id: 10,
        theme: 'olive',
        category: 'I',
        tagline: 'identité & introspection',
        text: "Quelle est ta plus grande peur ?"
    },
    {
        id: 11,
        theme: 'olive',
        category: 'I',
        tagline: 'identité & introspection',
        text: "Dis-moi une chose que tu maîtrises parfaitement et une autre que tu ne sais absolument pas faire."
    },
    {
        id: 12,
        theme: 'blue',
        category: 'R',
        tagline: 'réflexion & expérience',
        text: "As-tu des superstitions ?"
    },
    {
        id: 13,
        theme: 'orange',
        category: 'A',
        tagline: 'aspiration & préférence',
        text: "Si tu pouvais être dans le corps de quelqu’un pendant une journée, ce serait qui ?"
    }
];
