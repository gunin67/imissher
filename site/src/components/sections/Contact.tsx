import { useState, type FormEvent } from "react";
import { ArrowUpRight, Mail, Send } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { SITE } from "@/data/site";
import Reveal from "@/components/motion/Reveal";
import SectionHead from "./SectionHead";

export default function Contact() {
  const { t, ui } = useApp();
  const c = t.contact;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // Same behaviour as the original site: open the visitor's mail client with the message prefilled.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`New message from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <section id="contact" className="relative py-28 md:py-44" aria-labelledby="contact-title">
      <div className="container-wide">
        <SectionHead id="contact-title" index="07" eyebrow={c.eyebrow} title={c.title} />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal className="flex flex-col gap-8">
            <a href={`mailto:${SITE.email}`} data-cursor="↗" className="group flex items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-elevated transition duration-500 hover:-translate-y-1">
              <span className="flex min-w-0 items-center gap-4"><Mail className="h-5 w-5 shrink-0" aria-hidden /><span className="truncate font-mono text-sm sm:text-base">{SITE.email}</span></span>
              <ArrowUpRight className="h-5 w-5 shrink-0 transition duration-500 group-hover:rotate-45" aria-hidden />
            </a>
            <p className="max-w-md leading-relaxed text-muted-foreground">{c.info}</p>
          </Reveal>
          <Reveal delay={0.1} y={50}>
            <form onSubmit={submit} className="overflow-hidden rounded-2xl border bg-terminal shadow-elevated backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b px-4 py-3" aria-hidden>
                <span className="h-3 w-3 rounded-full bg-muted-foreground/40" /><span className="h-3 w-3 rounded-full bg-muted-foreground/25" /><span className="h-3 w-3 rounded-full bg-muted-foreground/15" />
                <span className="mx-auto font-mono text-xs text-terminal-muted">compose.sh</span><span className="w-12" />
              </div>
              <div className="space-y-6 p-5 sm:p-8">
                <div><label htmlFor="c-name" className="label-mono mb-2 block">{c.name}</label><input id="c-name" autoComplete="name" required value={form.name} onChange={set("name")} placeholder={c.placeholderName} className="field" /></div>
                <div><label htmlFor="c-email" className="label-mono mb-2 block">{c.email}</label><input id="c-email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder={c.placeholderEmail} className="field" /></div>
                <div><label htmlFor="c-message" className="label-mono mb-2 block">{c.message}</label><textarea id="c-message" rows={6} required value={form.message} onChange={set("message")} placeholder={c.placeholderMessage} className="field resize-none" /></div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="max-w-xs text-xs text-muted-foreground" role="status">{sent ? "→ mailto" : ui.mailtoHint}</p>
                  <button type="submit" className="btn-primary" aria-label={t.accessibility.contactSubmit}>{c.send}<Send className="h-4 w-4" aria-hidden /></button>
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
