// Mock Authentication Service
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
    private apiBase = import.meta.env.VITE_API_BASE_URL ?? '';

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
        try {
            const response = await fetch(`${this.apiBase}${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return {
                    success: false,
                    message: data?.message ?? 'Request failed. Please try again.'
                };
            }

            if (data?.token && data?.user) {
                this.persistAuth(data.token, data.user);
            }

            return {
                success: true,
                message: data?.message ?? 'Success',
                user: data?.user
            };
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    /**
     * Update user profile information
     */
    public async updateProfile(profileData: Partial<User>): Promise<AuthResult> {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: 'User not authenticated'
            };
        }

        try {
            // In a real app, this would be an API call
            // For demo purposes, we'll simulate the update
            const updatedUser: User = {
                ...currentUser,
                ...profileData
            };

            this.persistAuth(this.getAuthState().token!, updatedUser);
            
            return {
                success: true,
                message: 'Profile updated successfully',
                user: updatedUser
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update profile. Please try again.'
            };
        }
    }

    /**
     * Update user password
     */
    public async updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
        if (!this.isAuthenticated()) {
            return {
                success: false,
                message: 'User not authenticated'
            };
        }

        try {
            // In a real app, this would verify the current password and update it
            // For demo purposes, we'll just simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                message: 'Password updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update password. Please try again.'
            };
        }
    }
}

export const authService = new AuthService();
