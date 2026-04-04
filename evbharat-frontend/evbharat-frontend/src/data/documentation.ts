export type DocumentationCategory =
    | 'general'
    | 'frontend'
    | 'backend'
    | 'ai-ml'
    | 'hardware'
    | 'security';

export type DocumentationResourceType = 'pdf' | 'link';

export interface DocumentationEntry {
    id: string;
    title: string;
    summary: string;
    category: DocumentationCategory;
    type: 'Guide' | 'Setup' | 'Reference' | 'API' | 'Safety';
    status: 'published' | 'draft';
    resourceType: DocumentationResourceType;
    tags: string[];
    link?: string;
    linkLabel?: string;
}

export const documentationCategoryLabels: Record<DocumentationCategory, string> = {
    general: 'General',
    frontend: 'Frontend',
    backend: 'Backend',
    'ai-ml': 'AI / ML',
    hardware: 'Hardware',
    security: 'Security'
};

export const documentationResourceLabels: Record<DocumentationResourceType, string> = {
    pdf: 'PDF Manual',
    link: 'External Link'
};

export const documentationEntries: DocumentationEntry[] = [
    {
        id: 'ev-owner-manual',
        title: 'EV Bharat Owner Manual',
        summary: 'Official EV Bharat proposal manual available as an in-page PDF.',
        category: 'hardware',
        type: 'Guide',
        status: 'published',
        resourceType: 'pdf',
        tags: ['manual', 'vehicle', 'owner-guide'],
        link: '/images/doc/evbharat-proposal.pdf',
        linkLabel: 'Read Manual'
    },
    {
        id: 'Government Proposal Manual',
        title: 'EV Bharat Government Proposal Manual',
        summary: 'Official EV Bharat government proposal manual available as an in-page PDF.',
        category: 'general',
        type: 'Guide',
        status: 'published',
        resourceType: 'pdf',
        tags: ['manual', 'vehicle', 'owner-guide'],
        link: '/images/doc/government-proposal.pdf',
        linkLabel: 'Read Manual'
    },
    {
        id: 'User Manual',
        title: 'EV Bharat User Manual',
        summary: 'Official EV Bharat user manual available as an in-page PDF.',
        category: 'general',
        type: 'Guide',
        status: 'published',
        resourceType: 'pdf',
        tags: ['manual', 'vehicle', 'owner-guide'],
        link: '/images/doc/c.pdf',
        linkLabel: 'Read Manual'
    },
    {
        id: 'Summary of hardware documentation',
        title: 'Summary of Hardware Documentation',
        summary: 'Overview of all hardware-related documentation for EV Bharat.',
        category: 'hardware',
        type: 'Guide',
        status: 'published',
        resourceType: 'pdf',
        tags: ['manual', 'vehicle', 'owner-guide'],
        link: '/images/doc/hardware-summary.pdf',
        linkLabel: 'Read Manual'
    },
    {
        id: 'Summary of Software Documentation',
        title: 'Summary of Software Documentation',
        summary: 'Overview of all software-related documentation for EV Bharat.',
        category: 'frontend',
        type: 'Guide',
        status: 'published',
        resourceType: 'pdf',
        tags: ['manual', 'vehicle', 'owner-guide'],
        link: '/images/doc/evbharat-software.pdf',
        linkLabel: 'Read Manual'
    },
    {
        id: 'ev-service-manual',
        title: 'EV Bharat Service Record',
        summary: 'Service and vehicle record reference available as an in-page PDF.',
        category: 'hardware',
        type: 'Reference',
        status: 'published',
        resourceType: 'pdf',
        tags: ['service', 'maintenance', 'workshop'],
        link: '/images/doc/car_recored.pdf',
        linkLabel: 'Read Service Record'
    },
    {
        id: 'project-readme',
        title: 'Project Overview',
        summary: 'High-level overview of EV Bharat vision, core modules, and feature map.',
        category: 'general',
        type: 'Guide',
        status: 'published',
        resourceType: 'link',
        tags: ['overview', 'architecture', 'getting-started'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/README.md',
        linkLabel: 'Open Overview'
    },
    {
        id: 'quickstart',
        title: 'Quick Start',
        summary: 'Launch EV Bharat fast with essential setup and startup commands.',
        category: 'general',
        type: 'Setup',
        status: 'published',
        resourceType: 'link',
        tags: ['setup', 'commands', 'onboarding'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/QUICKSTART.md',
        linkLabel: 'Open Quick Start'
    },
    {
        id: 'dev-container',
        title: 'Dev Container Setup',
        summary: 'Development environment bootstrap for containerized workflows.',
        category: 'general',
        type: 'Setup',
        status: 'published',
        resourceType: 'link',
        tags: ['container', 'devcontainer', 'environment'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/DEV_CONTAINER_SETUP.md',
        linkLabel: 'Open Setup'
    },
    {
        id: 'frontend-readme',
        title: 'Frontend Guide',
        summary: 'Vite + TypeScript frontend structure, run scripts, and app flow.',
        category: 'frontend',
        type: 'Guide',
        status: 'published',
        resourceType: 'link',
        tags: ['vite', 'ui', 'frontend'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/evbharat-frontend/evbharat-frontend/README.md',
        linkLabel: 'Open Frontend Guide'
    },
    {
        id: 'backend-readme',
        title: 'Backend Service Guide',
        summary: 'Backend integrations, bridge services, and API-related setup details.',
        category: 'backend',
        type: 'Reference',
        status: 'published',
        resourceType: 'link',
        tags: ['backend', 'services', 'integrations'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/evbharat-frontend/evbharat-frontend/backend/README.md',
        linkLabel: 'Open Backend Guide'
    },
    {
        id: 'rag-readme',
        title: 'RAG Assistant Docs',
        summary: 'Configuration and usage notes for the EV Bharat RAG chatbot module.',
        category: 'ai-ml',
        type: 'API',
        status: 'published',
        resourceType: 'link',
        tags: ['rag', 'chatbot', 'ai'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/evbharat-frontend/evbharat-frontend/backend/EVBharat%20Bot/README_RAG.md',
        linkLabel: 'Open RAG Docs'
    },
    {
        id: 'security-policy',
        title: 'Security Policy',
        summary: 'Security expectations, reporting process, and safe usage recommendations.',
        category: 'security',
        type: 'Safety',
        status: 'published',
        resourceType: 'link',
        tags: ['security', 'policy', 'reporting'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/SECURITY.md',
        linkLabel: 'Open Security Policy'
    },
    {
        id: 'bluetooth-hardware',
        title: 'Bluetooth Hardware Notes',
        summary: 'ESP32 Bluetooth guidance, troubleshooting, and wiring references.',
        category: 'hardware',
        type: 'Reference',
        status: 'published',
        resourceType: 'link',
        tags: ['esp32', 'bluetooth', 'hardware'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/hardware/README_BLUETOOTH.md',
        linkLabel: 'Open Hardware Notes'
    },
    {
        id: 'serial-hardware',
        title: 'Serial Connection Guide',
        summary: 'Serial communication setup for bridge services and embedded modules.',
        category: 'hardware',
        type: 'Setup',
        status: 'published',
        resourceType: 'link',
        tags: ['serial', 'bridge', 'hardware'],
        link: 'https://github.com/karthikj30/EV-Bharat/blob/main/hardware/SERIAL_CONNECTION.md',
        linkLabel: 'Open Serial Guide'
    }
];

