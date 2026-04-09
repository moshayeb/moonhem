import { useEffect, useMemo, useState } from "react";
import { fetchUsers } from "../api.js";
import { normalizeRealtorsFromUsers } from "../agentsNormalize.js";
import { ContentCard, PageMain } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

export default function AgentsPage() {
    useDocumentTitle("Agents · Moonhem");
    const [agents, setAgents] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        let ignore = false;
        async function load() {
            setStatus("loading");
            setError("");
            try {
                const raw = await fetchUsers();
                if (ignore) return;
                setAgents(normalizeRealtorsFromUsers(raw));
                setStatus("idle");
            } catch (e) {
                if (!ignore) {
                    setStatus("error");
                    setError(e?.message || "Failed to load agents");
                    setAgents([]);
                }
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, []);

    const filteredAgents = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return agents;
        return agents.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                (a.agency || "").toLowerCase().includes(q) ||
                (a.city || "").toLowerCase().includes(q)
        );
    }, [agents, filter]);

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="relative flex min-h-[320px] w-full items-end overflow-hidden md:min-h-[380px]">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-black/50" aria-hidden />
                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-6 pb-14 pt-24 text-white md:pb-16 md:pt-28">
                    <div className="min-w-0 flex-1">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/75">
                            Moonhem · Agents
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Meet the Moonhem brokers.</h1>
                        <p className="mt-4 max-w-xl text-lg text-white/85">
                            We match you with the best local experts for selling or buying.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/20 bg-white/10 px-8 py-5 text-center backdrop-blur-md">
                        <div className="text-3xl font-bold tabular-nums text-yellow-400">{filteredAgents.length}</div>
                        <div className="text-sm text-white/80">Available agents</div>
                    </div>
                </div>
            </section>

            <PageMain>
                <ContentCard>
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Agents</h2>
                        <input
                            className="w-full max-w-xs rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/25"
                            placeholder="Filter by name or city"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            aria-label="Filter agents"
                        />
                    </div>

                    {status === "error" && <div className="mb-4 font-semibold text-red-600">{error}</div>}
                    {status === "loading" && <div className="text-gray-500">Loading agents…</div>}

                    <div className="flex flex-col gap-4">
                        {filteredAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 sm:flex-row sm:items-center"
                            >
                                <img
                                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white"
                                    src={agent.avatar}
                                    alt=""
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="text-lg font-semibold text-gray-900">{agent.name}</div>
                                    <div className="text-sm text-gray-600">{agent.agency || "Moonhem Real Estate"}</div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        <span>{agent.city || "Sweden"}</span>
                                        <span className="mx-2 text-gray-300">·</span>
                                        <span>{agent.sales ? `${agent.sales} sales` : "Realtor"}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 sm:items-end">
                                    <a
                                        className="inline-flex justify-center rounded-2xl border-2 border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:border-gray-900"
                                        href={`tel:${agent.phone || ""}`}
                                    >
                                        {agent.phone || "Phone not listed"}
                                    </a>
                                    <a
                                        className="inline-flex justify-center rounded-2xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-600"
                                        href={`mailto:${agent.email || ""}`}
                                    >
                                        Email
                                    </a>
                                </div>
                            </div>
                        ))}
                        {status === "idle" && filteredAgents.length === 0 && (
                            <div className="text-gray-500">No agents found.</div>
                        )}
                    </div>
                </ContentCard>
            </PageMain>
        </div>
    );
}
