// Authentication service with optional offline fallback
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    avatar?: string;
    preferences?: {
        notifications: {
            email: boolean;
            battery: boolean;
            maintenance: boolean;
        };
        units: {
            distance: 'km' | 'miles';
            temperature: 'celsius' | 'fahrenheit';
        };
        language: string;
    };
    vehicle?: {
        make: string;
        model: string;
        year: number;
        batteryCapacity: number;
        range: number;
        chargingTypes: string[];
    };
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

export interface AuthResult {
    success: boolean;
    message: string;
    user?: User;
}

class AuthService {
    private storageKey = 'evbharat_auth';
    private userKey = 'evbharat_user';
    private apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
    private enableOfflineAuth = import.meta.env.VITE_ENABLE_OFFLINE_AUTH === 'true';
    private debugMode = import.meta.env.DEV;

    constructor() {
        if (!this.debugMode) return;

        if (this.apiBase) {
            console.log('Auth Service: backend base URL =', this.apiBase);
        } else {
            console.log('Auth Service: using same-origin /api (Vite proxy in dev)');
        }

        if (this.enableOfflineAuth) {
            console.warn('Auth Service: offline mock auth is ENABLED (VITE_ENABLE_OFFLINE_AUTH=true)');
        }
    }

    private getAuthEndpoints(path: string): string[] {
        if (this.apiBase) {
            return [`${this.apiBase}${path}`];
        }

        return [
            path,
            `http://127.0.0.1:3001${path}`,
            `http://localhost:3001${path}`,
            `http://host.docker.internal:3001${path}`
        ];
    }

    /**
     * Get current authentication state
     */
    public getAuthState(): AuthState {
        const token = localStorage.getItem(this.storageKey);
        const userStr = localStorage.getItem(this.userKey);
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                return {
                    isAuthenticated: true,
                    user,
                    token
                };
            } catch (e) {
                return {
                    isAuthenticated: false,
                    user: null,
                    token: null
                };
            }
        }

        return {
            isAuthenticated: false,
            user: null,
            token: null
        };
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return this.getAuthState().isAuthenticated;
    }

    /**
     * Get current user
     */
    public getCurrentUser(): User | null {
        return this.getAuthState().user;
    }

    /**
     * Login user
     */
    public async login(email: string, password: string): Promise<AuthResult> {
        return this.requestAuth('/api/auth/login', { email, password });
    }

    /**
     * Register new user (for signup)
     */
    public async signup(name: string, email: string, password: string): Promise<AuthResult> {
        return this.requestAuth('/api/auth/signup', { name, email, password });
    }

    /**
     * Logout user
     */
    public logout(): void {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Get default user credentials (for display in login form)
     */
    public getDefaultCredentials(): { email: string; password: string; name: string } | null {
        return null;
    }

    private persistAuth(token: string, user: User) {
        localStorage.setItem(this.storageKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    private async requestAuth(path: string, payload: Record<string, string>): Promise<AuthResult> {
        const endpoints = this.getAuthEndpoints(path);
        let hadNetworkError = false;

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && data?.token && data?.user) {
                    this.persistAuth(data.token, data.user);
                    return {
                        success: true,
                        message: data?.message ?? 'Success',
                        user: data?.user
                    };
                }

                // Retry on gateway/proxy upstream failure, otherwise trust backend response.
                if ([502, 503, 504].includes(response.status)) {
                    hadNetworkError = true;
                    if (this.debugMode) {
                        console.warn(`Auth Service: upstream unavailable via ${endpoint} (${response.status})`);
                    }
                    continue;
                }

                if (!response.ok) {
                    return {
                        success: false,
                        message: data?.message ?? 'Authentication failed. Please try again.'
                    };
                }

                return {
                    success: false,
                    message: 'Authentication response is invalid. Please try again.'
                };
            } catch (error) {
                hadNetworkError = true;
                if (this.debugMode) {
                    console.warn(`Auth Service: network error via ${endpoint}`, error);
                }
            }
        }

        if (hadNetworkError) {
            if (!this.enableOfflineAuth) {
                return {
                    success: false,
                    message: 'Cannot reach authentication server. Please check backend and try again.'
                };
            }
        }

        // Optional fallback: mock authentication (offline demo mode)
        if (path.includes('login')) {
            // Mock login - accept any credentials
            const mockUser: User = {
                id: 'mock_user_' + Date.now(),
                email: payload.email,
                name: payload.email.split('@')[0] || 'User',
                role: 'user',
                preferences: {
                    notifications: {
                        email: true,
                        battery: true,
                        maintenance: true
                    },
                    units: {
                        distance: 'km',
                        temperature: 'celsius'
                    },
                    language: 'en'
                },
                vehicle: {
                    make: 'Tesla',
                    model: 'Model 3',
                    year: 2024,
                    batteryCapacity: 75,
                    range: 350,
                    chargingTypes: ['AC Type 2', 'DC CCS2']
                }
            };
            const mockToken = 'mock_token_' + Date.now();
            this.persistAuth(mockToken, mockUser);
            
            return {
                success: true,
                message: 'Login successful (offline mode)',
                user: mockUser
            };
        } else if (path.includes('signup')) {
            // Mock signup
            const mockUser: User = {
                id: 'mock_user_' + Date.now(),
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                role: 'user',
                preferences: {
                    notifications: {
                        email: true,
                        battery: true,
                        maintenance: true
                    },
                    units: {
                        distance: 'km',
                        temperature: 'celsius'
                    },
                    language: 'en'
                }
            };
            const mockToken = 'mock_token_' + Date.now();
            this.persistAuth(mockToken, mockUser);
            
            return {
                success: true,
                message: 'Account created successfully (offline mode)',
                user: mockUser
            };
        }

        return {
            success: false,
            message: 'Authentication failed. Please try again.'
        };
    }

    /**
     * Authenticated API request helper
     */
    private async authFetch(path: string, method: 'GET' | 'PUT' | 'POST' = 'GET', body?: Record<string, unknown>): Promise<{ ok: boolean; data: any }> {
        const { token } = this.getAuthState();
        if (!token) return { ok: false, data: { message: 'Not authenticated.' } };

        const opts: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(`${this.apiBase}${path}`, opts);
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, data };
    }

    /**
     * Fetch full profile from backend
     */
    public async fetchProfile(): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            const { ok, data } = await this.authFetch('/api/profile');
            if (!ok) return { success: false, message: data?.message ?? 'Failed to load profile.' };
            return { success: true, data: data.data };
        } catch {
            return { success: false, message: 'Network error.' };
        }
    }

    /**
     * Update user profile information
     */
    public async updateProfile(profileData: Record<string, unknown>): Promise<AuthResult> {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'User not authenticated' };
        }

        try {
            const { ok, data } = await this.authFetch('/api/profile/personal', 'PUT', profileData);

            if (!ok) {
                return { success: false, message: data?.message ?? 'Failed to update profile.' };
            }

            // Sync local storage with updated user & (optional) new token
            if (data?.user) {
                const token = data.token ?? this.getAuthState().token!;
                this.persistAuth(token, data.user);
            }

            return { success: true, message: data?.message ?? 'Profile updated successfully', user: data?.user };
        } catch {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Update user password
     */
    public async updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
        if (!this.isAuthenticated()) {
            return { success: false, message: 'User not authenticated' };
        }

        try {
            const { ok, data } = await this.authFetch('/api/profile/password', 'PUT', { currentPassword, newPassword });

            if (!ok) {
                return { success: false, message: data?.message ?? 'Failed to update password.' };
            }

            return { success: true, message: data?.message ?? 'Password updated successfully' };
        } catch {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Update preferences
     */
    public async updatePreferences(prefs: Record<string, unknown>): Promise<AuthResult> {
        if (!this.isAuthenticated()) return { success: false, message: 'Not authenticated' };

        try {
            const { ok, data } = await this.authFetch('/api/profile/preferences', 'PUT', prefs);
            if (!ok) return { success: false, message: data?.message ?? 'Failed to save preferences.' };
            return { success: true, message: data?.message ?? 'Preferences saved.' };
        } catch {
            return { success: false, message: 'Network error.' };
        }
    }

    /**
     * Update vehicle info
     */
    public async updateVehicle(vehicle: Record<string, unknown>): Promise<AuthResult> {
        if (!this.isAuthenticated()) return { success: false, message: 'Not authenticated' };

        try {
            const { ok, data } = await this.authFetch('/api/profile/vehicle', 'PUT', vehicle);
            if (!ok) return { success: false, message: data?.message ?? 'Failed to save vehicle.' };
            return { success: true, message: data?.message ?? 'Vehicle info saved.' };
        } catch {
            return { success: false, message: 'Network error.' };
        }
    }
}

export const authService = new AuthService();
