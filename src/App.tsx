import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import FeedPage from "./pages/Feed/FeedPage";
import PostPage from "./pages/Post/PostPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import Layout from "./components/Layout.tsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<FeedPage />} />
                        <Route path="/posts/:id" element={<PostPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                    
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
