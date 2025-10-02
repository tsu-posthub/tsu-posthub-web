import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as React from "react";

export default function EditPostPage() {
    const { postId } = useParams<{ postId: string }>();
    const { sdk } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<{ id: number; url: string }[]>([]);
    const [deleteImages, setDeleteImages] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (!postId) return;
            try {
                const post = await sdk.posts.getPost(Number(postId));
                setTitle(post.title);
                setText(post.text);

                const formattedImages = (post.images || []).map((img: any) => ({
                    id: img.id,
                    url: img.image,
                }));
                setExistingImages(formattedImages);
            } catch (err) {
                console.error(err);
                alert("Ошибка при загрузке поста");
                navigate("/posts");
            }
        })();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !text) return alert("Заполните все поля");

        const payload: {
            title?: string;
            text?: string;
            images?: File[];
            delete_images?: number[];
        } = {
            title,
            text,
            images: images.length > 0 ? images : undefined,
            delete_images: deleteImages.length > 0 ? deleteImages : undefined,
        };

        try {
            setLoading(true);
            await sdk.posts.updatePost(Number(postId), payload);
            navigate("/posts");
        } catch (err) {
            console.error(err);
            alert("Ошибка при обновлении поста");
        } finally {
            setLoading(false);
        }
    };

    const toggleDeleteImage = (id: number) => {
        setDeleteImages((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    return (
        <main className="post-form-page">
            <h1>Редактировать пост</h1>
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

                <div className="existing-images">
                    <h3>Существующие фото:</h3>
                    <ul>
                        {existingImages.map((img) => (
                            <li key={img.id} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                <img
                                    src={`https://api.tsu-posthub.orexi4.ru/${img.url}`}
                                    alt=""
                                    style={{ maxWidth: "200px", marginRight: "10px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleDeleteImage(img.id)}
                                    style={{
                                        backgroundColor: deleteImages.includes(img.id) ? "#e74c3c" : "#ccc",
                                        color: "#fff",
                                        border: "none",
                                        padding: "4px 8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {deleteImages.includes(img.id) ? "Отменить" : "Удалить"}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Сохранение..." : "Сохранить"}
                </button>
            </form>
        </main>
    );
}
