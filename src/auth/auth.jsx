import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tokenFromStorage = localStorage.getItem('token');
        const roleFromStorage = localStorage.getItem('role');
        const userFromStorage = JSON.parse(localStorage.getItem('user') || 'null');

        if (tokenFromStorage && userFromStorage) {
            setToken(tokenFromStorage);
            setUser({ ...userFromStorage, role: roleFromStorage });
            setRole(roleFromStorage);
        }
        setLoading(false);
    }, []);

    function login(data) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser({ ...data.user, role: data.role });
        setRole(data.role);
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setRole(null);
    }

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ token, user, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
