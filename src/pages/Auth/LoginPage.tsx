import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as React from "react";
import { PostHubSDK } from "ts-posthub-sdk/src";
import "./Auth.css";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const sdk = new PostHubSDK();
            
            const res = await sdk.auth.login({ email, password });
            
            login(res.access, res.refresh);
            navigate("/");
        } catch (err) {
            alert("Ошибка входа: " + (err as Error).message);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-form-container">
                <h1 className="auth-title">Вход</h1>
                <form onSubmit={handleSubmit} className="auth-form">
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

                    <button type="submit" className="auth-button">Войти</button>
                </form>

                <p className="auth-footer">
                    Нет аккаунта? <a href="/register">Зарегистрироваться</a>
                </p>
            </section>
        </main>
    );
}
