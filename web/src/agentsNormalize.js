/** Shared realtor normalization for Agents page and listing cards (matches `/users` API). */

export const AGENT_AVATARS = [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
];

export function normalizeAgent(u, idx = 0) {
    const name = [u.first_name, u.surname].filter(Boolean).join(" ").trim() || "Moonhem Agent";
    return {
        id: u.id ?? idx,
        name,
        email: u.mail ?? u.email ?? "",
        phone: u.phone_number ?? "",
        agency: u.company_name ?? u.agency ?? "",
        city: u.city ?? "",
        sales: u.sales ?? null,
        role_id: u.role_id ?? null,
        role: u.role ?? u.role_name ?? "",
        avatar: AGENT_AVATARS[idx % AGENT_AVATARS.length],
    };
}

export function normalizeRealtorsFromUsers(rawUsers) {
    const raw = Array.isArray(rawUsers) ? rawUsers : [];
    const normalized = raw
        .map((u, idx) => normalizeAgent(u, idx))
        .filter((u) => u.role_id === 2 || u.role === "Realtor" || u.role === "Broker");
    return normalized.length ? normalized : raw.map((u, idx) => normalizeAgent(u, idx));
}
