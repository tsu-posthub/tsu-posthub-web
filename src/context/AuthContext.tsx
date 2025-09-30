import { createContext, useState, useEffect, type ReactNode } from "react";
import { PostHubSDK } from "ts-posthub-sdk/src";

interface AuthContextType {
    sdk: PostHubSDK;
    accessToken: string | null;
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
    const [sdk] = useState(() => new PostHubSDK(accessToken || undefined));
    
    useEffect(() => {
        if (accessToken) {
            sdk.setToken(accessToken);
            localStorage.setItem("access", accessToken);
        } else {
            localStorage.removeItem("access");
        }

        if (refreshToken) {
            localStorage.setItem("refresh", refreshToken);
        } else {
            localStorage.removeItem("refresh");
        }
    }, [accessToken, refreshToken, sdk]);
    
    const login = (access: string, refresh: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);
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
            value={{ sdk, accessToken, login, logout, refreshAccess }}
        >
            {children}
        </AuthContext.Provider>
    );
}
