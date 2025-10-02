import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as React from "react";
import "./CreatePostPage.css";

export default function CreatePostPage() {
    const { sdk } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !text) return alert("Заполните все поля");

        const postData = {
            title,
            text,
            images: images.length ? images : undefined,
        };

        try {
            setLoading(true);
            await sdk.posts.createPost(postData);
            navigate("/posts");
        } catch (err) {
            console.error(err);
            alert("Ошибка при создании поста");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="post-form-page">
            <h1>Создать пост</h1>
            <form onSubmit={handleSubmit} className="post-form">
                <input
                    type="text"
                    placeholder="Заголовок"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Текст поста"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                />
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                        setImages(Array.from(e.target.files || []))
                    }
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Создание..." : "Создать"}
                </button>
            </form>
        </main>
    );
}
