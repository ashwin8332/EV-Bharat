export interface Feature {
    id: string;
    icon: string;
    title: string;
    description: string;
    category: 'ai' | 'battery' | 'routing' | 'performance';
}

export const features: Feature[] = [
    {
        id: 'battery-health',
        icon: '🔋',
        title: 'AI Battery Health Monitoring',
        description: 'Real-time ML-powered battery degradation analysis and predictive maintenance alerts',
        category: 'ai'
    },
    {
        id: 'smart-routing',
        icon: '🗺️',
        title: 'Intelligent Route Optimization',
        description: 'Traffic-aware energy-efficient routing optimized for Indian road conditions',
        category: 'routing'
    },
    {
        id: 'energy-prediction',
        icon: '⚡',
        title: 'Energy Consumption Prediction',
        description: 'ML models predict range based on driving patterns, terrain, and weather',
        category: 'ai'
    },
    {
        id: 'fast-charging',
        icon: '⚡',
        title: '800V Ultra-Fast Charging',
        description: '10-80% charge in 18 minutes with advanced thermal management',
        category: 'battery'
    },
    {
        id: 'quad-motor',
        icon: '🏎️',
        title: 'Quad Motor Torque Vectoring',
        description: 'Independent motor control for each wheel delivering unmatched handling',
        category: 'performance'
    },
    {
        id: 'range',
        icon: '🎯',
        title: '850 KM Range',
        description: 'Solid-state battery technology with graphene enhancement',
        category: 'battery'
    },
    {
        id: 'charging-network',
        icon: '📍',
        title: 'Smart Charging Network',
        description: 'AI-powered charging station recommendations based on availability and pricing',
        category: 'routing'
    },
    {
        id: 'performance',
        icon: '🚀',
        title: '0-100 in 2.1s',
        description: 'Hypercar-level acceleration with instant torque delivery',
        category: 'performance'
    }
];
