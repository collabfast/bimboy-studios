import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/dmca", label: "DMCA" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-black/40">
      <div className="page-shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">BimBoy Studios</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/55">
            Complete baseline scaffold for the platform, ready for phased
            product and content implementation.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-white/62">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
