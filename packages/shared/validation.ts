export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
