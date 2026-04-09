import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../AuthContext.jsx";
import { ContentCard, PageHero, PageMain, formInputClass } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-gray-700";

export default function LoginPage() {
    useDocumentTitle("Log in · Moonhem");
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const u = await login(email.trim(), password);
            setUser(u);
            navigate(redirectTo.startsWith("/") ? redirectTo : "/", { replace: true });
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                eyebrow="Moonhem"
                title="Welcome back."
                subtitle="Log in to message agents and manage your account."
                imageUrl="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80"
            />

            <PageMain className="flex justify-center pt-0">
                <ContentCard className="w-full max-w-md">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">Log in</h2>
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <label className={labelClass}>
                            Email
                            <input
                                className={formInputClass}
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>
                        <label className={labelClass}>
                            Password
                            <div className="relative">
                                <input
                                    className={`${formInputClass} pr-16`}
                                    type={showPw ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-yellow-600 hover:text-yellow-700"
                                    onClick={() => setShowPw((s) => !s)}
                                    aria-pressed={showPw}
                                >
                                    {showPw ? "Hide" : "Show"}
                                </button>
                            </div>
                        </label>
                        {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
                        <button
                            className="rounded-2xl bg-yellow-500 px-8 py-3.5 font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in…" : "Log in"}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        No account?{" "}
                        <Link to="/register" className="font-semibold text-yellow-600 hover:text-yellow-700">
                            Create one
                        </Link>
                    </p>
                </ContentCard>
            </PageMain>
        </div>
    );
}
