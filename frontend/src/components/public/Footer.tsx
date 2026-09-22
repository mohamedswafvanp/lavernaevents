import { Link } from "react-router-dom";
import { AtSign, Globe, Share2, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/laverna-logo.png";

const EXPLORE_LINKS = [
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/gallery", label: "Gallery" },
];

const SUPPORT_LINKS = [
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/register", label: "Get started" },
  { to: "/login", label: "Login" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={logo} alt="LavernaEvents" className="h-9 w-auto object-contain" />
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              Celebrate beautifully. Connect meaningfully. Everything you need to plan,
              host, and share unforgettable events, in one place.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-[var(--brand-pink)] hover:text-white"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Website"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-[var(--brand-pink)] hover:text-white"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Share"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-[var(--brand-pink)] hover:text-white"
              >
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--brand-navy)]">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-500 hover:text-[var(--brand-pink)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--brand-navy)]">Support</h3>
            <ul className="mt-4 space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-500 hover:text-[var(--brand-pink)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--brand-navy)]">Get in touch</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[var(--brand-pink)]" />
                hello@lavernaevents.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[var(--brand-pink)]" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--brand-pink)]" />
                Kochi, Kerala, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {year} LavernaEvents. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
