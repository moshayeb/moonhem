/* eslint-disable react-refresh/only-export-components -- useAuth is paired with AuthProvider */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredAuth, fetchCurrentUser } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let ignore = false;
        fetchCurrentUser().then((u) => {
            if (!ignore && u) setUser(u);
        });
        return () => {
            ignore = true;
        };
    }, []);

    const logout = useCallback(() => {
        clearStoredAuth();
        setUser(null);
    }, []);

    const value = useMemo(() => ({ user, setUser, logout }), [user, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
