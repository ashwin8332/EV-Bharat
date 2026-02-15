export interface Specification {
    category: string;
    specs: {
        label: string;
        value: string;
    }[];
}

export const specifications: Specification[] = [
    {
        category: 'Performance',
        specs: [
            { label: '0-100 km/h', value: '2.1 seconds' },
            { label: 'Top Speed', value: '350 km/h' },
            { label: 'Power Output', value: '1,400 kW (1,877 HP)' },
            { label: 'Torque', value: '2,300 Nm' },
            { label: 'Drive Type', value: 'Quad Motor AWD' }
        ]
    },
    {
        category: 'Battery & Range',
        specs: [
            { label: 'Battery Capacity', value: '120 kWh' },
            { label: 'Battery Type', value: 'Solid-State Graphene' },
            { label: 'Range (WLTP)', value: '850 km' },
            { label: 'Charging', value: '800V Architecture' },
            { label: '10-80% Charge Time', value: '18 minutes' }
        ]
    },
    {
        category: 'Dimensions & Weight',
        specs: [
            { label: 'Length', value: '4,650 mm' },
            { label: 'Width', value: '2,050 mm' },
            { label: 'Height', value: '1,150 mm' },
            { label: 'Wheelbase', value: '2,750 mm' },
            { label: 'Dry Weight', value: '1,150 kg' }
        ]
    },
    {
        category: 'AI & Technology',
        specs: [
            { label: 'AI Processor', value: 'NVIDIA Drive Orin' },
            { label: 'Sensors', value: '12 Cameras, 8 Radars, 4 LiDAR' },
            { label: 'Connectivity', value: '5G, V2X' },
            { label: 'OTA Updates', value: 'Full Stack' },
            { label: 'Autonomous Level', value: 'Level 3' }
        ]
    }
];
