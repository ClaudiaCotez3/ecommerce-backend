export class ValidationService {
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    if (email.length > 150) {
      return { isValid: false, error: 'Email must be less than 150 characters' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 100) {
      return { isValid: false, error: 'Password must be less than 100 characters' };
    }

    // Opcional: Validar que tenga al menos una mayúscula, minúscula y número
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { 
        isValid: false, 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }

    return { isValid: true };
  }

  static validateName(name: string, fieldName: string): { isValid: boolean; error?: string } {
    if (!name) {
      return { isValid: false, error: `${fieldName} is required` };
    }

    if (name.length < 2) {
      return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
    }

    if (name.length > 100) {
      return { isValid: false, error: `${fieldName} must be less than 100 characters` };
    }

    // Solo letras, espacios, guiones y apostrofes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(name)) {
      return { 
        isValid: false, 
        error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
      };
    }

    return { isValid: true };
  }
}
