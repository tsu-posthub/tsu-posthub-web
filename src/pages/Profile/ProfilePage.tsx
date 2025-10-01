import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Profile.css";
import Loader from "../../components/Loader.tsx";

type ProfileType = {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
};

export default function ProfilePage() {
    const { sdk, accessToken, logout } = useAuth();
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!accessToken) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await sdk.profile.getProfile();
                setProfile(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };

        (async () => {
            await fetchProfile();
        })();
    }, [sdk, accessToken, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!profile) return (
        <main className="profile-page">
            <Loader />
        </main>
    );

    return (
        <main className="profile-page">
            <section className="profile-card">
                <div className="profile-avatar">
                    {profile.username.charAt(0).toUpperCase()}
                </div>
                <h1 className="profile-username">{profile.username}</h1>
                <p className="profile-email">{profile.email}</p>

                <div className="profile-info">
                    {profile.first_name && (
                        <p><span>Имя:</span> {profile.first_name}</p>
                    )}
                    {profile.last_name && (
                        <p><span>Фамилия:</span> {profile.last_name}</p>
                    )}
                </div>

                <button onClick={handleLogout} className="logout-button">
                    Выйти
                </button>
            </section>
        </main>
    );
}
