import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const { exp } = jwtDecode(token);
        return exp < Date.now() / 1000;
    } catch {
        return true;
    }
};