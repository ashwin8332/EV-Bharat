export interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    image: string;
}

export const testimonials: Testimonial[] = [
    {
        id: '1',
        name: 'Vikram Singh',
        role: 'Tech Entrepreneur',
        company: 'Mumbai',
        content: 'The AI-powered battery management is a game-changer. I drive 200km daily and the range prediction is incredibly accurate.',
        rating: 5,
        image: '/images/testimonials/1.jpg'
    },
    {
        id: '2',
        name: 'Ananya Desai',
        role: 'Business Executive',
        company: 'Bangalore',
        content: 'Smart routing saves me 30 minutes daily on my commute. The traffic-aware navigation is brilliant for Indian roads.',
        rating: 5,
        image: '/images/testimonials/2.jpg'
    },
    {
        id: '3',
        name: 'Rahul Kapoor',
        role: 'Automotive Journalist',
        company: 'Delhi',
        content: 'This is not just an EV, it\'s a technological masterpiece. The performance rivals any hypercar I\'ve driven.',
        rating: 5,
        image: '/images/testimonials/3.jpg'
    }
];
