export interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
}

export const team: TeamMember[] = [
    {
        id: 'ceo',
        name: 'Karthik Janardhan',
        role: 'CEO & Founder',
        image: '/images/ceo.jpg',
    },
    {
        id: 'cto',
        name: 'Anushka Kotal',
        role: 'CTO',
        image: '/images/cto.jpg',
    },
    {
        id: 'design',
        name: 'Stash Lopes',
        role: 'Head of Design',
        image: '/images/design.jpg',
    },
    {
        id: 'engineering',
        name: 'Ashwin Vincent Koonissery',
        role: 'Chief Engineer',
        image: '/images/engineering.jpg',
    }
];
