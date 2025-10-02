import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import {
    ArrowDown,
    ArrowUp,
    Calendar,
    Edit2,
    Heart,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import CustomSelect from "../../components/CustomSelect";
import "./Posts.css";

type PostType = {
    id: number;
    title: string;
    content?: string;
    likes: number;
    created_at: string;
    image?: string;
};

export default function PostsPage() {
    const { sdk, accessToken } = useAuth();
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [animationKey, setAnimationKey] = useState(0);
    const [sortType, setSortType] = useState("Дате");
    const [sortDirection, setSortDirection] = useState("По убыванию");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [totalPosts, setTotalPosts] = useState(0);

    const navigate = useNavigate();

    const fetchPosts = async (page = 1) => {
        try {
            setLoading(true);
            const data = await sdk.posts.listPosts({
                page,
                page_size: pageSize,
            });
            const currentUsername = localStorage.getItem("username");

            const mappedPosts: PostType[] = data.results
                .filter((p: any) => p.author_username === currentUsername)
                .map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    content: p.preview_text,
                    likes: p.likes_count,
                    created_at: p.created_at,
                    image: p.thumbnail
                        ? `https://api.tsu-posthub.orexi4.ru/${p.thumbnail}`
                        : undefined,
                }));

            setPosts(mappedPosts);
            setTotalPosts(data.count);
            setCurrentPage(page);
        } catch (err) {
            console.error("Ошибка загрузки постов", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!accessToken) {
            navigate("/login");
            return;
        }
        (async () => {
            await fetchPosts();
        })();
    }, [sdk]);

    useEffect(() => {
        setAnimationKey((prev) => prev + 1);
    }, [search, sortType, sortDirection]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Удалить пост?")) return;
        try {
            await sdk.posts.deletePost(id);
            setPosts(posts.filter((p) => p.id !== id));
            setTotalPosts((prev) => prev - 1);
        } catch (err) {
            alert("Ошибка удаления поста");
        }
    };

    const filteredPosts = posts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    const sortPosts = (list: PostType[]) => {
        return [...list].sort((a, b) => {
            let comp = 0;
            if (sortType === "Дате") {
                comp =
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime();
            } else if (sortType === "Лайкам") {
                comp = a.likes - b.likes;
            }
            return sortDirection === "По возрастанию" ? comp : -comp;
        });
    };

    const displayPosts = search
        ? sortPosts(filteredPosts)
        : sortPosts(posts);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const formatLikes = (num: number) => {
        if (num >= 1_000_000_000_000)
            return (
                (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") +
                "t"
            );
        if (num >= 1_000_000_000)
            return (
                (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b"
            );
        if (num >= 1_000_000)
            return (
                (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m"
            );
        if (num >= 1_000)
            return (
                (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
            );
        return num.toString();
    };

    const totalPages = Math.ceil(totalPosts / pageSize);

    return (
        <main className="myposts-page">
            <div className="myposts-content">
                <div className="myposts-header">
                    <h1>Мои посты</h1>
                    <button
                        className="create-btn"
                        onClick={() => navigate("/create")}
                    >
                        <Plus size={16} />
                        Создать
                    </button>
                </div>

                <div className="myposts-filters">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Поиск постов"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="clear-btn"
                                onClick={() => setSearch("")}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    <div className="sort-options">
                        <span className="sort-label">Сортировать по</span>
                        <CustomSelect
                            options={[
                                { label: "Дате", icon: <Calendar size={16} /> },
                                { label: "Лайкам", icon: <Heart size={16} /> },
                            ]}
                            defaultValue={sortType}
                            onChange={setSortType}
                            className="sort-type-select"
                        />
                        <CustomSelect
                            options={[
                                {
                                    label: "По возрастанию",
                                    icon: <ArrowUp size={16} />,
                                },
                                {
                                    label: "По убыванию",
                                    icon: <ArrowDown size={16} />,
                                },
                            ]}
                            defaultValue={sortDirection}
                            onChange={setSortDirection}
                            className="sort-direction-select"
                        />
                    </div>
                </div>

                {loading ? (
                    <p>Загрузка...</p>
                ) : displayPosts.length === 0 ? (
                    <p className="empty-text">Постов пока нет</p>
                ) : (
                    <>
                        <ul className="post-list">
                            {displayPosts.map((post, index) => (
                                <li
                                    key={`${post.id}-${animationKey}`}
                                    className="post-card"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    <div className="post-left">
                                        {post.image ? (
                                            <div className="post-image">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                />
                                            </div>
                                        ) : (
                                            <div className="placeholder-img">
                                                No Image
                                            </div>
                                        )}
                                        <div className="post-content">
                                            <h2>{post.title}</h2>
                                            <p className="post-subtext">
                                                {post.content ||
                                                    formatDate(post.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="post-actions">
                                        <span className="likes">
                                            <Heart
                                                size={16}
                                                fill="#e74c3c"
                                                color="#e74c3c"
                                            />
                                            {formatLikes(post.likes)}
                                        </span>
                                        <div className="action-buttons">
                                            <Link
                                                to={`/edit/${post.id}`}
                                                className="edit-btn"
                                            >
                                                Редактировать
                                            </Link>
                                            <button
                                                className="edit-icon-btn"
                                                title="Редактировать"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(post.id)
                                                }
                                                className="delete-btn"
                                                title="Удалить"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {totalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={
                                            currentPage === i + 1
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() => fetchPosts(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
