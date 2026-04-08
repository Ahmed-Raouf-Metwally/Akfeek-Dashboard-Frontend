import Cookies from 'js-cookie';

/**
 * Cookie Storage Adapter for Zustand Persist Middleware
 * Uses js-cookie library for reliable cookie management
 */

export const cookieStorageAdapter = {
    /**
     * Get item from cookie
     * @param {string} name - Cookie name
     * @returns {any} Parsed JSON value or null
     */
    getItem: (name) => {
        const value = Cookies.get(name);
        return value ? JSON.parse(value) : null;
    },

    /**
     * Set item to cookie
     * @param {string} name - Cookie name
     * @param {any} value - Value to store (will be JSON stringified)
     */
    setItem: (name, value) => {
        Cookies.set(name, JSON.stringify(value), {
            expires: 7, // 7 days
            sameSite: 'strict',
            secure: window.location.protocol === 'https:', // Secure only in HTTPS
        });
    },

    /**
     * Remove item from cookie
     * @param {string} name - Cookie name
     */
    removeItem: (name) => {
        Cookies.remove(name);
    },
};
