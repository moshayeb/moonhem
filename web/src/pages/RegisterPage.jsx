import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, registerAccount } from "../api";
import { useAuth } from "../AuthContext.jsx";
import { ContentCard, PageHero, PageMain, formInputClass } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-gray-700";

export default function RegisterPage() {
    useDocumentTitle("Register · Moonhem");
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [mail, setMail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await registerAccount({
                first_name: firstName.trim(),
                surname: surname.trim(),
                mail: mail.trim(),
                password,
                phone_number: phone.trim() || undefined,
                birthdate: birthdate || undefined,
            });
            const u = await login(mail.trim(), password);
            setUser(u);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || "Could not create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                eyebrow="Moonhem"
                title="Join Moonhem."
                subtitle="Create a buyer account to save homes and message listing agents."
                imageUrl="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80"
            />

            <PageMain className="flex justify-center pt-0">
                <ContentCard className="w-full max-w-lg">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">Register</h2>
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className={labelClass}>
                                First name
                                <input
                                    className={formInputClass}
                                    autoComplete="given-name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </label>
                            <label className={labelClass}>
                                Last name
                                <input
                                    className={formInputClass}
                                    autoComplete="family-name"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    required
                                />
                            </label>
                        </div>
                        <label className={labelClass}>
                            Email
                            <input
                                className={formInputClass}
                                type="email"
                                autoComplete="email"
                                value={mail}
                                onChange={(e) => setMail(e.target.value)}
                                required
                            />
                        </label>
                        <label className={labelClass}>
                            Phone (optional)
                            <input
                                className={formInputClass}
                                type="tel"
                                autoComplete="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </label>
                        <label className={labelClass}>
                            Birth date (optional)
                            <input
                                className={formInputClass}
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                            />
                        </label>
                        <label className={labelClass}>
                            Password
                            <div className="relative">
                                <input
                                    className={`${formInputClass} pr-16`}
                                    type={showPw ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
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
                            <span className="text-xs font-normal text-gray-500">At least 8 characters.</span>
                        </label>
                        <label className={labelClass}>
                            Confirm password
                            <input
                                className={formInputClass}
                                type={showPw ? "text" : "password"}
                                autoComplete="new-password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                        </label>
                        {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
                        <button
                            className="rounded-2xl bg-yellow-500 px-8 py-3.5 font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Creating account…" : "Create account"}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-yellow-600 hover:text-yellow-700">
                            Log in
                        </Link>
                    </p>
                </ContentCard>
            </PageMain>
        </div>
    );
}
