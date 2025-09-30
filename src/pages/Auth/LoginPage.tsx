import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as React from "react";

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mx-auto mt-10">
            <h1 className="text-xl font-bold">Вход</h1>
            <input
                type="email"
                placeholder="Email"
                className="border p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Пароль"
                className="border p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="bg-blue-500 text-white p-2 rounded">Войти</button>
        </form>
    );
}
