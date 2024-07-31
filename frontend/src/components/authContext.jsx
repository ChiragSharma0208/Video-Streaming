
import React, { createContext, useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null); // You can store user info here

    const login = (userData) => {
        setIsLoggedIn(true);
        setUserData(userData);
        // You might want to save tokens or other data to localStorage or sessionStorage
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserData(null);
        // Clear localStorage or sessionStorage
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider }