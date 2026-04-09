import { useState } from "react";
import { CardHeading, ContentCard, PageHero, PageMain, formInputClass } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

const inputClass = formInputClass;
const textareaClass = `${formInputClass} min-h-[140px] resize-y`;

export default function ContactPage() {
    useDocumentTitle("Contact · Moonhem");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const err = {};
        const n = name.trim();
        const em = email.trim();
        const sub = subject.trim();
        const msg = message.trim();
        if (!n) err.name = "Please enter your name.";
        if (!em) err.email = "Please enter your email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) err.email = "Enter a valid email address.";
        if (!sub) err.subject = "Add a short subject so we can route your message.";
        if (!msg) err.message = "Tell us a bit about what you need.";
        else if (msg.length < 8) err.message = "A few more words help us help you.";
        setFieldErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(false);
        if (!validate()) return;
        setSubmitting(true);
        const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`);
        window.location.href = `mailto:hello@moonhem.com?subject=${encodeURIComponent(subject.trim())}&body=${body}`;
        setSubmitted(true);
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                eyebrow="Moonhem · Contact"
                title="Get in touch."
                subtitle="We help with listings, viewings, and valuations. Send a message or book a consultation."
                imageUrl="https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80"
            />

            <PageMain>
                <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                    <ContentCard>
                        <CardHeading>Send a message</CardHeading>
                        {submitted ? (
                            <p className="mb-4 text-gray-600" role="status">
                                Opening your email app… If nothing happens, write to{" "}
                                <a href="mailto:hello@moonhem.com" className="font-medium text-yellow-600 underline">
                                    hello@moonhem.com
                                </a>
                                .
                            </p>
                        ) : null}
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                                Name
                                <input
                                    className={inputClass}
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    autoComplete="name"
                                    aria-invalid={Boolean(fieldErrors.name)}
                                    aria-describedby={fieldErrors.name ? "err-name" : undefined}
                                />
                                {fieldErrors.name ? (
                                    <span id="err-name" className="text-sm font-normal text-red-600">
                                        {fieldErrors.name}
                                    </span>
                                ) : null}
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                                Email
                                <input
                                    className={inputClass}
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@email.com"
                                    autoComplete="email"
                                    aria-invalid={Boolean(fieldErrors.email)}
                                    aria-describedby={fieldErrors.email ? "err-email" : undefined}
                                />
                                {fieldErrors.email ? (
                                    <span id="err-email" className="text-sm font-normal text-red-600">
                                        {fieldErrors.email}
                                    </span>
                                ) : null}
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                                Subject
                                <input
                                    className={inputClass}
                                    name="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Schedule a viewing"
                                    aria-invalid={Boolean(fieldErrors.subject)}
                                    aria-describedby={fieldErrors.subject ? "err-subject" : undefined}
                                />
                                {fieldErrors.subject ? (
                                    <span id="err-subject" className="text-sm font-normal text-red-600">
                                        {fieldErrors.subject}
                                    </span>
                                ) : null}
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                                Message
                                <textarea
                                    className={textareaClass}
                                    name="message"
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell us what you need help with..."
                                    aria-invalid={Boolean(fieldErrors.message)}
                                    aria-describedby={fieldErrors.message ? "err-message" : undefined}
                                />
                                {fieldErrors.message ? (
                                    <span id="err-message" className="text-sm font-normal text-red-600">
                                        {fieldErrors.message}
                                    </span>
                                ) : null}
                            </label>
                            <button
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow-500 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-60 sm:w-auto"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? "Opening…" : "Send"}
                            </button>
                        </form>
                    </ContentCard>

                    <ContentCard>
                        <CardHeading>Contact details</CardHeading>
                        <div className="space-y-6 text-gray-600">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</div>
                                <div className="mt-1 text-base">+46 70 123 45 67</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</div>
                                <div className="mt-1 text-base">hello@moonhem.com</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Office</div>
                                <div className="mt-1 text-base">Sveavägen 9</div>
                                <div className="text-base">111 57 Stockholm</div>
                            </div>
                        </div>
                        <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-gray-700">
                            <div className="font-semibold text-gray-900">Book a meeting</div>
                            <p className="mt-1">We book digital or on-site within 24 hours.</p>
                        </div>
                    </ContentCard>
                </div>
            </PageMain>
        </div>
    );
}
