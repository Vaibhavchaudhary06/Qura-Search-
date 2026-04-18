"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
interface QuickApp {
  id: string;
  name: string;
  icon: string;
  href: string;
  color: string;
}

interface TrendingItem {
  query: string;
  category: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const QUICK_APPS: QuickApp[] = [
  { id: "maps", name: "Qura Meet", icon: "/icons/meet.svg", href: "https://qura-meetcom.vercel.app/", color: "#0d6efd" },
  { id: "news", name: "Qura Calendar", icon: "/icons/calendar.png", href: "https://qura-calendar-ten.vercel.app/", color: "#dc3545" },
  { id: "shopping", name: "EraA", icon: "/icons/eraa.png", href: "https://v0-qura-eraa.vercel.app/", color: "#fd7e14" },
  { id: "images", name: "Laxora", icon: "/icons/laxora.png", href: "#", color: "#6f42c1" },
  { id: "videos", name: "Qura Design Studio", icon: "/icons/design.png", href: "https://qura-design-studio.vercel.app/", color: "#d63384" },
];

const TRENDING: TrendingItem[] = [
  { query: "IPL 2026 live score", category: "Sports" },
  { query: "Budget 2026 highlights", category: "Finance" },
  { query: "New smartphone launches", category: "Tech" },
  { query: "India vs Australia series", category: "Sports" },
  { query: "AI tools for students", category: "Tech" },
  { query: "Top startup funding news", category: "Business" },
];

// ─── Components ───────────────────────────────────────────────────────────────
function Avatar() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        border: "2px solid rgba(79,70,229,0.3)",
        flexShrink: 0,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
      title="Profile"
    >
      V
    </div>
  );
}

function QuickAccessGrid() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 8px",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "#6b7280",
          fontSize: 13,
          fontWeight: 500,
          transition: "background 0.15s, transform 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="5" r="2.5" />
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="19" cy="5" r="2.5" />
          <circle cx="5" cy="12" r="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="19" cy="12" r="2.5" />
          <circle cx="5" cy="19" r="2.5" />
          <circle cx="12" cy="19" r="2.5" />
          <circle cx="19" cy="19" r="2.5" />
        </svg>
        <span className="apps-text">Apps</span>
      </button>

      {visible && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            padding: "18px 14px",
            width: "min(300px, 85vw)",
            zIndex: 100,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "#9ca3af",
              fontWeight: 600,
              letterSpacing: "0.08em",
              margin: "0 6px 14px",
              textTransform: "uppercase",
            }}
          >
            Qura Ecosystem
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
            }}
          >
            {QUICK_APPS.map((app) => (
              <a
                key={app.id}
                href={app.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 6px",
                  borderRadius: 14,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(79,70,229,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={app.icon}
                    alt={app.name}
                    style={{
                      width: 22,
                      height: 22,
                      objectFit: "contain",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#374151",
                    fontWeight: 500,
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {app.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 640,
        margin: "0 auto",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          border: focused ? "2px solid #4f46e5" : "1.5px solid #e5e7eb",
          borderRadius: 50,
          padding: "8px 12px 8px 18px",
          boxShadow: focused
            ? "0 4px 24px rgba(79,70,229,0.15)"
            : "0 2px 12px rgba(0,0,0,0.06)",
          transition: "all 0.2s",
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
          <circle cx="11" cy="11" r="7" />
          <line x1="17" y1="17" x2="22" y2="22" />
        </svg>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search with Qura..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "clamp(14px, 4vw, 16px)",
            background: "transparent",
            color: "#111827",
            minWidth: 0,
          }}
        />

        <button
          type="submit"
          style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            border: "none",
            borderRadius: 50,
            padding: "7px 16px",
            color: "#fff",
            fontSize: "clamp(12px, 3.5vw, 14px)",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "transform 0.15s, opacity 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.opacity = "0.95";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.opacity = "1";
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
}

function TrendingSection() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", marginTop: 40, padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        <span style={{ fontSize: "clamp(12px, 3.5vw, 13px)", fontWeight: 600, color: "#374151" }}>
          Trending in India
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {TRENDING.map((item, i) => (
          <div
            key={i}
            onClick={() => handleSearch(item.query)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
              transition: "background 0.15s, transform 0.15s",
              flexWrap: "wrap",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#d1d5db", fontWeight: 600 }}>
                {i + 1}
              </span>
              <span style={{ fontSize: "clamp(13px, 3.5vw, 14px)", color: "#111827" }}>
                {item.query}
              </span>
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 20,
                background: "#eef2ff",
                color: "#4f46e5",
                whiteSpace: "nowrap",
              }}
            >
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function QuraHomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Navbar ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "#ffffff",
          borderBottom: "1px solid #f3f4f6",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src="/qura-logo.png" style={{ height: "clamp(24px, 6vw, 28px)" }} alt="Qura Logo" />
          <span
            style={{
              fontSize: "clamp(18px, 5vw, 20px)",
              fontWeight: 700,
              color: "#000000",
            }}
          >
            Qura
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: 8,
            color: "#6b7280",
          }}
          className="mobile-menu-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMobileMenuOpen ? (
              <line x1="18" y1="6" x2="6" y2="18" />
            ) : (
              <line x1="3" y1="12" x2="21" y2="12" />
            )}
            {!isMobileMenuOpen && (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Nav actions - Desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-actions">
          <QuickAccessGrid />
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: 8,
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            Sign In
          </button>
          <Avatar />
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #f3f4f6",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
          className="mobile-menu"
        >
          <QuickAccessGrid />
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: 8,
              color: "#6b7280",
              fontSize: 14,
              fontWeight: 500,
              textAlign: "left",
              width: "100%",
            }}
          >
            Sign In
          </button>
          <Avatar />
        </div>
      )}

      {/* ── Hero ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "clamp(40px, 10vw, 72px) 16px clamp(30px, 8vw, 48px)",
        }}
      >
        {/* Logo hero */}
        <div style={{ textAlign: "center", marginBottom: "clamp(24px, 6vw, 36px)", padding: "0 16px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 2, marginBottom: 6 }}>
            <span
              style={{
                fontSize: "clamp(32px, 8vw, 64px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#000000",
                lineHeight: 1,
              }}
            >
              Qura Search
            </span>
          </div>
          <p style={{ fontSize: "clamp(12px, 3.5vw, 14px)", color: "#9ca3af", fontWeight: 400, margin: 0 }}>
            India's own search engine — fast, private &amp; intelligent
          </p>
        </div>

        {/* Search bar */}
        <SearchBar />

        {/* Trending */}
        <TrendingSection />
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid #f3f4f6",
          background: "#ffffff",
          padding: "clamp(16px, 4vw, 20px) clamp(16px, 5vw, 32px)",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Footer links */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(12px, 4vw, 24px)",
              justifyContent: "center",
              rowGap: 8,
            }}
          >
            {[
              { label: "About Qura", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Qura Store", href: "#" },
              { label: "Advertising", href: "#" },
              { label: "Help", href: "#" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "clamp(11px, 3vw, 13px)",
                  color: "#6b7280",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p
            style={{
              fontSize: "clamp(10px, 3vw, 12px)",
              color: "#000000",
              margin: 0,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            © 2026 Qura Technologies. All rights reserved. &nbsp;·&nbsp; Qura Store
          </p>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .nav-actions {
            display: none !important;
          }
          .mobile-menu {
            display: flex !important;
          }
        }
        @media (min-width: 641px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
          .nav-actions {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}