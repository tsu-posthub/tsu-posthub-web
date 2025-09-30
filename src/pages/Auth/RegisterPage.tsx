import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as React from "react";
import { PostHubSDK } from "ts-posthub-sdk/src";
import "./Auth.css";

export default function RegisterPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        }

        try {
            const sdk = new PostHubSDK();
            
            await sdk.auth.register({ username, email, password });
            
            const res = await sdk.auth.login({ email, password });
            
            login(res.access, res.refresh);

            navigate("/");
        } catch (err) {
            alert("Ошибка регистрации: " + (err as Error).message);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-form-container">
                <h1 className="auth-title">Регистрация</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Имя пользователя</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Введите имя"
                            className="auth-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Введите ваш email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Пароль</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Введите пароль"
                                className="auth-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="show-password-btn"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? "Скрыть" : "Показать"}
                            </button>
                        </div>
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="confirmPassword">Повторите пароль</label>
                        <div className="password-wrapper">
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Повторите пароль"
                                className="auth-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="show-password-btn"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? "Скрыть" : "Показать"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-button">
                        Зарегистрироваться
                    </button>
                </form>

                <p className="auth-footer">
                    Уже есть аккаунт? <a href="/login">Войти</a>
                </p>
            </section>
        </main>
    );
}
