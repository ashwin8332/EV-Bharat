// Local storage utilities with type safety
export class Storage {
    private prefix: string;

    constructor(prefix: string = 'evbharat_') {
        this.prefix = prefix;
    }

    public set<T>(key: string, value: T): void {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    public get<T>(key: string, defaultValue?: T): T | null {
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (item === null) return defaultValue ?? null;
            return JSON.parse(item) as T;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue ?? null;
        }
    }

    public remove(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }

    public clear(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    public has(key: string): boolean {
        return localStorage.getItem(this.prefix + key) !== null;
    }
}

export const storage = new Storage();
