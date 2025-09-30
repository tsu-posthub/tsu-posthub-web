import { useParams } from "react-router-dom";

export default function PostPage() {
    const { id } = useParams();

    return (
        <div className="max-w-2xl mx-auto mt-6">
            <h1 className="text-2xl font-bold mb-4">Пост {id}</h1>
        </div>
    );
}
