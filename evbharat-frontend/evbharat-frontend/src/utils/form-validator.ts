export interface ValidationRule {
    required?: boolean;
    email?: boolean;
    phone?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export class FormValidator {
    private rules: Map<string, ValidationRule> = new Map();

    public addRule(fieldName: string, rule: ValidationRule) {
        this.rules.set(fieldName, rule);
    }

    public validate(formData: FormData): ValidationResult {
        const errors: string[] = [];

        this.rules.forEach((rule, fieldName) => {
            const value = formData.get(fieldName) as string || '';
            const fieldErrors = this.validateField(fieldName, value, rule);
            errors.push(...fieldErrors);
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private validateField(fieldName: string, value: string, rule: ValidationRule): string[] {
        const errors: string[] = [];

        if (rule.required && !value.trim()) {
            errors.push(`${this.formatFieldName(fieldName)} is required`);
            return errors; // Skip other validations if required fails
        }

        if (value && rule.email && !this.isValidEmail(value)) {
            errors.push(`${this.formatFieldName(fieldName)} must be a valid email address`);
        }

        if (value && rule.phone && !this.isValidPhone(value)) {
            errors.push(`${this.formatFieldName(fieldName)} must be a valid phone number`);
        }

        if (value && rule.minLength && value.length < rule.minLength) {
            errors.push(`${this.formatFieldName(fieldName)} must be at least ${rule.minLength} characters`);
        }

        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${this.formatFieldName(fieldName)} must not exceed ${rule.maxLength} characters`);
        }

        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${this.formatFieldName(fieldName)} format is invalid`);
        }

        if (value && rule.custom && !rule.custom(value)) {
            errors.push(`${this.formatFieldName(fieldName)} is invalid`);
        }

        return errors;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidPhone(phone: string): boolean {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    private formatFieldName(fieldName: string): string {
        return fieldName
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Helper function for inline validation
export function showFieldError(fieldElement: HTMLElement, message: string) {
    const errorEl = fieldElement.parentElement?.querySelector('.field-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
    fieldElement.classList.add('border-red-500');
}

export function clearFieldError(fieldElement: HTMLElement) {
    const errorEl = fieldElement.parentElement?.querySelector('.field-error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }
    fieldElement.classList.remove('border-red-500');
}
