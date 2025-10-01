import { createContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { PostHubSDK } from "ts-posthub-sdk/src";

interface AuthContextType {
    sdk: PostHubSDK;
    accessToken: string | null;
    username: string | null;
    setUsername?: (username: string | null) => void;
    login: (access: string, refresh: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccess: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("access"));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refresh"));
    const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
    const [refreshTimer, setRefreshTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    
    const sdk = useMemo(() => new PostHubSDK(accessToken || undefined), []);
    
    useEffect(() => {
        if (accessToken) sdk.setToken(accessToken);
    }, [accessToken, sdk]);
    
    useEffect(() => {
        accessToken ? localStorage.setItem("access", accessToken) : localStorage.removeItem("access");
        refreshToken ? localStorage.setItem("refresh", refreshToken) : localStorage.removeItem("refresh");
        username ? localStorage.setItem("username", username) : localStorage.removeItem("username");
    }, [accessToken, refreshToken, username]);

    useEffect(() => {
        if (!accessToken || !refreshToken) return;

        const scheduleRefresh = async () => {
            try {
                const payload = JSON.parse(atob(accessToken.split(".")[1]));
                const expMs = payload.exp * 1000;
                const now = Date.now();
                const refreshDelay = expMs - now - 60 * 1000;

                if (refreshDelay > 0) {
                    if (refreshTimer) clearTimeout(refreshTimer);
                    const timer = setTimeout(async () => {
                        await refreshAccess();
                    }, refreshDelay);
                    setRefreshTimer(timer);
                } else {
                    await refreshAccess();
                }
            } catch (err) {
                console.error("Failed to decode token", err);
            }
        };
        
        (async () => {
            await scheduleRefresh();
        })();

        return () => {
            if (refreshTimer) clearTimeout(refreshTimer);
        };
    }, [accessToken, refreshToken]);
    
    const login = async (access: string, refresh: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        sdk.setToken(access);

        try {
            const profile = await sdk.profile.getProfile();
            setUsername(profile.username);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };
    
    const logout = async () => {
        if (refreshToken) {
            try {
                await sdk.auth.logout({ refresh: refreshToken });
            } catch (err) {
                console.warn("Logout failed", err);
            }
        }
        setAccessToken(null);
        setRefreshToken(null);
        setUsername(null);
        sdk.setToken("");
    };

    const refreshAccess = async () => {
        if (!refreshToken) return;
        try {
            console.log("Refreshing access token...");
            const data = await sdk.auth.refresh({ refresh: refreshToken });
            
            setAccessToken(data.access);
            sdk.setToken(data.access);
            localStorage.setItem("access", data.access);
            console.log("Access token updated successfully");
        } catch (err) {
            console.error("Failed to refresh token", err);
            await logout();
        }
    };

    return (
        <AuthContext.Provider value={{ sdk, accessToken, username, setUsername, login, logout, refreshAccess }}>
            {children}
        </AuthContext.Provider>
    );
}