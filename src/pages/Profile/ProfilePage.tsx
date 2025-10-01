import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Profile.css";
import Loader from "../../components/Loader.tsx";
import * as React from "react";

type ProfileType = {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
};

export default function ProfilePage() {
    const { sdk, accessToken, logout, setUsername } = useAuth();
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!accessToken) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await sdk.profile.getProfile();
                setProfile(data);
                setFormData({
                    username: data.username,
                    first_name: data.first_name || "",
                    last_name: data.last_name || ""
                });
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        (async () => {
            await fetchProfile();
        })();
    }, [sdk]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!profile) return;
        try {
            setLoading(true);
            await sdk.profile.updateProfile({
                username: formData.username,
                email: profile.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
            });
            setProfile({ ...profile, ...formData });
            setIsEditing(false);

            if (setUsername) setUsername(formData.username);
        } catch (err) {
            alert("Ошибка обновления профиля: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !profile) return (
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

                {isEditing ? (
                    <div className="edit-form">
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Имя пользователя"
                            className="auth-input"
                        />
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Имя"
                            className="auth-input"
                        />
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Фамилия"
                            className="auth-input"
                        />
                        <button className="save-button" onClick={handleSave}>
                            Сохранить
                        </button>
                        <button className="cancel-button" onClick={() => setIsEditing(false)}>
                            Отменить
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="profile-username" title={profile.username}>
                            {profile.username}
                        </h1>
                        <p className="profile-email">{profile.email}</p>

                        <div className="profile-info">
                            {profile.first_name && (
                                <p title={profile.first_name}>
                                    <span>Имя:</span> {profile.first_name}
                                </p>
                            )}
                            {profile.last_name && (
                                <p title={profile.last_name}>
                                    <span>Фамилия:</span> {profile.last_name}
                                </p>
                            )}
                        </div>

                        <button className="edit-button" onClick={() => setIsEditing(true)}>
                            Редактировать профиль
                        </button>
                        <button onClick={handleLogout} className="logout-button">
                            Выйти
                        </button>
                    </>
                )}
            </section>
        </main>
    );
}
