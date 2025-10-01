import { createContext, useState, useEffect, type ReactNode } from "react";
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
    const [sdk, setSdk] = useState(() => new PostHubSDK(accessToken || undefined));

    useEffect(() => {
        const newSdk = new PostHubSDK(accessToken || undefined);
        setSdk(newSdk);
    }, [accessToken]);
    
    useEffect(() => {
        if (accessToken) localStorage.setItem("access", accessToken);
        else localStorage.removeItem("access");

        if (refreshToken) localStorage.setItem("refresh", refreshToken);
        else localStorage.removeItem("refresh");

        if (username) localStorage.setItem("username", username);
        else localStorage.removeItem("username");
    }, [accessToken, refreshToken, username, sdk]);

    useEffect(() => {
        if (!refreshToken) return;
        const interval = setInterval(async () => {
            await refreshAccess();
        }, 1000 * 60 * 4);
        return () => clearInterval(interval);
    }, [refreshToken]);
    
    const login = async (access: string, refresh: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);

        try {
            const newSdk = new PostHubSDK(access);
            setSdk(newSdk);
            
            const profile = await newSdk.profile.getProfile();
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
    };
    
    const refreshAccess = async () => {
        if (!refreshToken) return;
        try {
            const data = await sdk.auth.refresh({ refresh: refreshToken });
            setAccessToken(data.access);
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
