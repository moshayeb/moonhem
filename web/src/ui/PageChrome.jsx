/** Shared marketing layout: full-width hero + constrained content (Grok-style). */

export const formInputClass =
    "w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/25";

export function PageHero({ eyebrow, title, subtitle, imageUrl, minHeightClass = "min-h-[300px] md:min-h-[360px]" }) {
    return (
        <section className={`relative flex ${minHeightClass} w-full items-end overflow-hidden`}>
            <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" decoding="async" />
            <div className="absolute inset-0 bg-black/50" aria-hidden />
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 pt-24 text-white md:pb-16 md:pt-28">
                {eyebrow ? (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/75">{eyebrow}</p>
                ) : null}
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
                {subtitle ? <p className="mt-4 max-w-2xl text-lg text-white/85">{subtitle}</p> : null}
            </div>
        </section>
    );
}

export function PageMain({ children, className = "" }) {
    return <div className={`mx-auto max-w-7xl px-6 py-12 md:py-16 ${className}`}>{children}</div>;
}

export function ContentCard({ children, className = "", as, ...rest }) {
    const Tag = as ?? "div";
    return (
        <Tag
            className={`rounded-3xl border border-gray-100 bg-white p-8 shadow-sm ${className}`}
            {...rest}
        >
            {children}
        </Tag>
    );
}

export function CardHeading({ children }) {
    return <h2 className="mb-6 text-xl font-semibold text-gray-900">{children}</h2>;
}
