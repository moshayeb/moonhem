export default function Guides({ onOpenArticle }) {
    const cards = [
        {
            title: "Buy a home: 5 steps",
            text: "Checklist for viewing, bidding, and contracts.",
            category: "Guide",
            slug: "buy",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60",
        },
        {
            title: "Sell faster",
            text: "Boost your listing with stronger photos and copy.",
            category: "Selling",
            slug: "sell",
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60",
        },
        {
            title: "Financing",
            text: "What interest, amortization, and down payment mean.",
            category: "Finance",
            slug: "finance",
            image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=60",
        },
    ];

    return (
        <div className="grid gap-8 md:grid-cols-3">
            {cards.map((a) => (
                <button
                    key={a.title}
                    type="button"
                    className="group overflow-hidden rounded-3xl border border-gray-100 bg-white text-left transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
                    onClick={() => onOpenArticle && onOpenArticle(a.slug)}
                >
                    <div
                        className="h-56 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
                        style={{ backgroundImage: `url(${a.image})` }}
                    />
                    <div className="p-7">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{a.category}</p>
                        <h3 className="mt-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-yellow-600">
                            {a.title}
                        </h3>
                        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{a.text}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}
