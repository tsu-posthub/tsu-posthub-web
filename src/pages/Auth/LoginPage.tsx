import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as React from "react";
import "./LoginPage.css";

export default function LoginPage() {
    const { sdk, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await sdk.auth.login({ email, password });
            login(res.access, res.refresh);
            navigate("/");
        } catch (err) {
            alert("Ошибка входа: " + (err as Error).message);
        }
    }

    return (
        <main className="login-page">
            <section className="login-form-container">
                <h1 className="login-title">Вход</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Введите ваш email"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Введите пароль"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Войти</button>
                </form>
                <p className="login-footer">
                    Нет аккаунта? <a href="/register">Зарегистрироваться</a>
                </p>
            </section>
        </main>
    );
}
