import { Link, useLocation } from "wouter";
import { Flame, Library, LayoutDashboard } from "lucide-react";

export function MobileBottomNav() {
  const [loc] = useLocation();
  const items = [
    { href: "/", label: "Feed", icon: Flame, match: loc === "/" || loc === "/feed" },
    { href: "/library", label: "Library", icon: Library, match: loc.startsWith("/library") },
    { href: "/studio", label: "Studio", icon: LayoutDashboard, match: loc.startsWith("/studio") },
  ];
  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      {items.map(({ href, label, icon: Icon, match }) => (
        <Link
          key={href}
          href={href}
          className={`mobile-bottom-nav-item${match ? " is-active" : ""}`}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
