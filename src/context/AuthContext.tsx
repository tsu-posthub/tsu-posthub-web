import { createContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { PostHubSDK } from "ts-posthub-sdk/src";

interface AuthContextType {
    sdk: PostHubSDK;
    accessToken: string | null;
    username: string | null;
    login: (access: string, refresh: string) => void;
    logout: () => void;
    refreshAccess: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem("access")
    );
    const [refreshToken, setRefreshToken] = useState<string | null>(
        localStorage.getItem("refresh")
    );
    const [username, setUsername] = useState<string | null>(
        localStorage.getItem("username")
    );
    const [refreshTimer, setRefreshTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    
    const sdk = useMemo(() => new PostHubSDK(), []);

    useEffect(() => {
        sdk.setToken(accessToken || "");
    }, [accessToken, sdk]);
    
    useEffect(() => {
        if (accessToken) localStorage.setItem("access", accessToken);
        else localStorage.removeItem("access");

        if (refreshToken) localStorage.setItem("refresh", refreshToken);
        else localStorage.removeItem("refresh");

        if (username) localStorage.setItem("username", username);
        else localStorage.removeItem("username");
    }, [accessToken, refreshToken, username]);

    useEffect(() => {
        if (!accessToken || !refreshToken) return;

        try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            if (payload.exp) {
                const expMs = payload.exp * 1000;
                const now = Date.now();
                const refreshDelay = expMs - now - 60 * 1000;

                if (refreshDelay > 0) {
                    if (refreshTimer) clearTimeout(refreshTimer);
                    const timer = setTimeout(refreshAccess, refreshDelay);
                    setRefreshTimer(timer);
                } else {
                    (async () => {
                        await refreshAccess();
                    })();
                }
            }
        } catch (err) {
            console.error("Failed to decode token", err);
        }

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
            console.log("Updating the access token...");
            const data = await sdk.auth.refresh({ refresh: refreshToken });
            console.log("Access token successfully updated");
            
            sdk.setToken(data.access);
            localStorage.setItem("access", data.access);
        } catch (err) {
            console.error("Failed to refresh token", err);
            await logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{ sdk, accessToken, username, login, logout, refreshAccess }}
        >
            {children}
        </AuthContext.Provider>
    );
}