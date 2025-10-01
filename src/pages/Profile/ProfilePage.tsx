import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

    const handleLogout = async () => {
        logout();
        navigate("/login");
    };

    if (!profile) return <p>Загрузка профиля...</p>;

    return (
        <main className="profile-page" style={{ padding: "2rem" }}>
            <h1>Профиль</h1>
            <p><strong>Никнейм:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            {profile.first_name && <p><strong>Имя:</strong> {profile.first_name}</p>}
            {profile.last_name && <p><strong>Фамилия:</strong> {profile.last_name}</p>}

            <button
                onClick={handleLogout}
                style={{
                    marginTop: "1.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#646cff",
                    color: "#fff",
                    fontWeight: 500,
                    cursor: "pointer"
                }}
            >
                Выйти
            </button>
        </main>
    );
}
