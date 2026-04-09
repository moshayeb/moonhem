/** Dev: same-origin `/api` → Vite proxy → FastAPI (no CORS). Prod: set VITE_API_URL or defaults to localhost. */
const API =
    import.meta.env.VITE_API_URL ??
    (import.meta.env.DEV ? "/api" : "http://127.0.0.1:8000");

const AUTH_KEY = "moonhem_basic";

function basicAuthHeader() {
    const token = sessionStorage.getItem(AUTH_KEY);
    return token ? { Authorization: `Basic ${token}` } : {};
}

/** Call on logout so message endpoints stop sending credentials. */
export function clearStoredAuth() {
    sessionStorage.removeItem(AUTH_KEY);
}

export async function fetchListing(id) {
    const res = await fetch(`${API}/listings/${encodeURIComponent(String(id))}`);
    if (res.status === 404) return null;
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || "Request failed"}`);
    }
    return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`${API}/users`);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || "Request failed"}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data?.users ?? [];
}

export async function fetchListings(params = {}) {
    const qs = new URLSearchParams();

    for (const [k, v] of Object.entries(params)) {
        if (v === "" || v === null || v === undefined || v === "all") continue;
        qs.set(k, v);
    }

    const res = await fetch(`${API}/listings?${qs.toString()}`);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || "Request failed"}`);
    }
    return res.json();
}

export async function registerAccount(payload) {
    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        let msg = text;
        try {
            const j = JSON.parse(text);
            if (typeof j.detail === "string") msg = j.detail;
            else if (Array.isArray(j.detail)) msg = j.detail.map((x) => x.msg || x).join(" ");
        } catch {
            /* keep text */
        }
        throw new Error(msg || "Registration failed");
    }
    return res.json();
}

export async function login(email, password) {
    const token = btoa(`${email}:${password}`);
    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${token}`,
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Invalid credentials");
    }
    const data = await res.json();
    sessionStorage.setItem(AUTH_KEY, token);
    return data.user;
}

/** Restore user in the UI after refresh when session storage still holds Basic auth. */
export async function fetchCurrentUser() {
    const headers = { ...basicAuthHeader() };
    if (!headers.Authorization) return null;
    const res = await fetch(`${API}/me`, { headers });
    if (res.status === 401) {
        clearStoredAuth();
        return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
}

/** Sender is determined by the same Basic credentials used at login. */
export async function sendMessage({ receiver_id, listing_id, content }) {
    const res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...basicAuthHeader(),
        },
        body: JSON.stringify({ receiver_id, listing_id, content }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to send message");
    }
    return res.json();
}
