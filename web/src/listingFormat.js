/** Shared listing normalization and display helpers for list + detail views. */

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=800&q=80",
];

export function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return h | 0;
}

/** Pick display agent for a listing (matches MainPage / Agents normalization). */
export function resolveListingAgent(listing, realtors) {
    if (!realtors?.length) {
        return {
            id: null,
            name: "Moonhem",
            avatar: "/logo_icon.PNG",
            agency: "Moonhem Real Estate",
            phone: "",
            email: "",
        };
    }
    const rid = listing?.realtor_id;
    const match = realtors.find((a) => a.id === rid || String(a.id) === String(rid));
    if (match) return match;
    return realtors[Math.abs(hash(String(listing?.id ?? 0))) % realtors.length];
}

/** Rotating display badges when the API does not send status (UI parity with marketing mocks). */
const DEFAULT_STATUS_VARIANTS = [
    { badge: "New Listing", badgeClass: "bg-blue-600" },
    { badge: "Open House Sun 14:00", badgeClass: "bg-emerald-600" },
    { badge: "Bidding Started", badgeClass: "bg-orange-500" },
];

export function listingCardStatus(listing, index = 0) {
    const raw = listing?.status_badge ?? listing?.listing_status;
    if (raw) {
        return {
            badge: String(raw),
            badgeClass: listing.status_badge_class || "bg-slate-700",
        };
    }
    const i = Math.abs(hash(String(listing?.id ?? index) + String(index))) % DEFAULT_STATUS_VARIANTS.length;
    return DEFAULT_STATUS_VARIANTS[i];
}

function cryptoFallbackId(x) {
    return `tmp_${Math.abs(hash(JSON.stringify(x)))}`;
}

export function numberOrZero(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

export function toNumber(v) {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

export function formatSEK(n) {
    return new Intl.NumberFormat("sv-SE").format(Number(n || 0)) + " kr";
}

export function labelType(t) {
    if (!t) return "Home";
    const s = String(t).toLowerCase();
    if (s.includes("house") || s.includes("villa")) return "House";
    if (s.includes("apartment") || s.includes("lägenhet")) return "Apartment";
    if (s.includes("town")) return "Townhouse";
    if (s.includes("plot") || s.includes("tomt")) return "Plot";
    return "Home";
}

export function listingImageAlt(address, city, typeLabel) {
    const parts = [typeLabel, address, city].filter(Boolean);
    return parts.length ? parts.join(" · ") : "Property";
}

/** Main image plus alternates for detail gallery when the API returns a single cover. */
export function listingGalleryUrls(listing) {
    const main = listing?.image_url || "/placeholder.jpg";
    const rest = FALLBACK_IMAGES.filter((u) => u !== main);
    const urls = [main, ...rest.slice(0, 4)];
    return [...new Set(urls)];
}

export function normalizeListing(x, idx = 0) {
    const fallbackImage = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
    return {
        id: x.id ?? x.listing_id ?? cryptoFallbackId(x),
        realtor_id: x.realtor_id ?? x.realtor ?? null,
        title: x.title ?? null,
        address: x.address ?? x.street ?? x.location ?? x.title ?? "Unknown address",
        city: x.city ?? x.municipality ?? x.area ?? x.region ?? x.address_city ?? "",
        price: numberOrZero(x.price ?? x.list_price ?? x.asking_price),
        rooms: numberOrZero(
            x.rooms ?? x.room_count ?? x.number_of_rooms ?? x.rum ?? x.room ?? x.roomcount ?? x.room_count
        ),
        living_area: numberOrZero(x.living_area ?? x.boarea ?? x.area_living ?? x.area),
        bathrooms: numberOrZero(
            x.bathrooms ?? x.bathroom_count ?? x.baths ?? x.bad ?? x.number_of_bathrooms
        ),
        lot_size: numberOrZero(x.lot_size ?? x.plot_area ?? x.area_plot),
        year_built: x.year_built ?? x.built_year ?? null,
        description: x.description ?? x.summary ?? "No description added yet.",
        property_type: x.property_type ?? x.property_type_name ?? x.type ?? "home",
        image_url: x.image_url ?? x.cover_image_url ?? x.image ?? x.main_image_url ?? fallbackImage,
        status_badge: x.status_badge ?? x.statusBadge ?? null,
        status_badge_class: x.status_badge_class ?? x.statusColor ?? null,
    };
}
