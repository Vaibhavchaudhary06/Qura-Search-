"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Search, Video, ShoppingBag, X, Play, Mic, MapPin, ChevronDown, ChevronUp, Calendar, User, Eye } from "lucide-react";

// ─── QUICK APPS DATA ──────────────────────────────────────────────────────────
const QUICK_APPS = [
  { id: "meet", name: "Qura Meet", icon: "/icons/meet.svg", href: "https://qura-meetcom.vercel.app/" },
  { id: "calendar", name: "Qura Calendar", icon: "/icons/calendar.png", href: "https://qura-calendar-ten.vercel.app/" },
  { id: "eraa", name: "EraA", icon: "/icons/eraa.png", href: "https://v0-qura-eraa.vercel.app/" },
  { id: "laxora", name: "Laxora", icon: "/icons/laxora.png", href: "#" },
  { id: "design", name: "Design Studio", icon: "/icons/design.png", href: "https://qura-design-studio.vercel.app/" },
];

// ─── APPS DROPDOWN ────────────────────────────────────────────────────────────
function QuickAccessGrid() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="apps-button"
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "7px 12px", borderRadius: "8px",
          border: "none", background: "none", cursor: "pointer",
          color: "#444", fontSize: "13.5px", fontWeight: 500,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#f0f0f0")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="2.5" cy="2.5" r="1.5" /><circle cx="8" cy="2.5" r="1.5" /><circle cx="13.5" cy="2.5" r="1.5" />
          <circle cx="2.5" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13.5" cy="8" r="1.5" />
          <circle cx="2.5" cy="13.5" r="1.5" /><circle cx="8" cy="13.5" r="1.5" /><circle cx="13.5" cy="13.5" r="1.5" />
        </svg>
        Apps
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: "288px", background: "#fff",
          border: "1px solid #e8e8e8", borderRadius: "16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          padding: "16px", zIndex: 100,
        }}>
          <p style={{ fontSize: "11px", color: "#999", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "12px", textTransform: "uppercase" }}>
            Qura Ecosystem
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
            {QUICK_APPS.map(app => (
              <a key={app.id} href={app.href} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                  padding: "10px 4px", borderRadius: "12px", textDecoration: "none", transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src={app.icon} alt={app.name} style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                </div>
                <span style={{ fontSize: "10px", color: "#555", fontWeight: 500, textAlign: "center", lineHeight: 1.3 }}>{app.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QUICK LINKS COMPONENT (Icon Row) ────────────────────────────────────────
function QuickLinksRow({ links }: { links: any[] }) {
  const handleLinkClick = (url: string) => {
    window.open(url, "_blank");
  };

  if (!links || links.length === 0) {
    return (
      <div className="quick-links-row" style={{
        display: "flex",
        justifyContent: "center",
        gap: "clamp(12px, 3vw, 20px)",
        marginTop: "clamp(24px, 5vw, 32px)",
        flexWrap: "wrap",
        padding: "0 clamp(12px, 4vw, 16px)",
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="shimmer" style={{ width: "48px", height: "70px", borderRadius: "16px" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="quick-links-row" style={{
      display: "flex",
      justifyContent: "center",
      gap: "clamp(12px, 3vw, 20px)",
      marginTop: "clamp(24px, 5vw, 32px)",
      flexWrap: "wrap",
      padding: "0 clamp(12px, 4vw, 16px)",
    }}>
      {links.map((link, index) => (
        <button
          key={index}
          onClick={() => handleLinkClick(link.url)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "12px",
            transition: "all 0.2s ease",
            textDecoration: "none",
            color: "inherit",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.background = "#f5f5f5";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#f0f2f5",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
          }}>
            <img
              src={link.icon}
              alt={link.name}
              style={{
                width: "28px",
                height: "28px",
                objectFit: "contain",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/32x32?text=🌐";
              }}
            />
          </div>
          <span style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#4D5156",
            fontFamily: "'Segoe UI', Arial, sans-serif",
          }}>
            {link.name}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const tabToApiType: Record<string, string> = {
  "All": "all", "Images": "images", "Videos": "videos", "Shopping": "shopping",
  "Forums": "forums", "Flight": "flight", "Travel": "travel", "Maps": "maps", "Tools": "tools", "News": "news",
};

const MAIN_TABS = ["All", "Images", "Videos", "News", "Shopping", "EraA"];
const MORE_ITEMS = ["Flight", "Travel", "Maps", "Forums", "Tools"];

const getSafeImageUrl = (url?: string | null, fallback = "https://placehold.co/400x300?text=No+Image") =>
  (!url || url === "" || url === "undefined" || url === "null") ? fallback : url;

const getYouTubeThumbnail = (url: string) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
};

// ─── PEOPLE ALSO ASK COMPONENT ───────────────────────────────────────────────
function PeopleAlsoAsk({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/related-questions?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  if (loading) {
    return (
      <div style={{ marginTop: "32px", borderTop: "1px solid #e8e8e8", paddingTop: "20px" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A0DAB", marginBottom: "12px" }}>🔍 People also ask</p>
        {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: "40px", marginBottom: "8px", borderRadius: "8px" }} />)}
      </div>
    );
  }

  if (!questions.length) return null;

  return (
    <div style={{ marginTop: "32px", borderTop: "1px solid #e8e8e8", paddingTop: "20px" }}>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A0DAB", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>🔍</span> People also ask
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {questions.map((q, idx) => (
          <div key={idx} style={{ border: "1px solid #e8e8e8", borderRadius: "12px", overflow: "hidden" }}>
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "12px 16px",
                background: "#fff",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#202124",
              }}
            >
              <span>{q}</span>
              <ChevronDown size={16} style={{ transform: openIndex === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>
            {openIndex === idx && (
              <div style={{ padding: "12px 16px", background: "#f8f9fa", borderTop: "1px solid #e8e8e8", fontSize: "13px", color: "#4D5156" }}>
                <button
                  onClick={() => onSearch(q)}
                  style={{ background: "none", border: "none", color: "#1A0DAB", cursor: "pointer", fontWeight: 500 }}
                >
                  🔍 Search for "{q}"
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOCATION NEWS COMPONENT ─────────────────────────────────────────────────
function LocationNews({ lat, lon }: { lat?: number; lon?: number }) {
  const [news, setNews] = useState<any[]>([]);
  const [location, setLocation] = useState("India");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/location-news`;
    if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setLocation(data.location);
        setNews(data.news || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return null;
  if (!news.length) return null;

  return (
    <div style={{ marginTop: "24px", borderTop: "1px solid #e0e0e0", paddingTop: "16px" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#70757A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
        <MapPin size={12} /> Latest from {location}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {news.slice(0, 3).map((item, idx) => (
          <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "12px", color: "#1A0DAB", textDecoration: "none", display: "block", lineHeight: 1.4 }}>
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── POPULAR SEARCHES COMPONENT ──────────────────────────────────────────────
function PopularSearches({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    if (!query) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/popular-searches?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => setSearches(data.searches || []))
      .catch(() => setSearches([]));
  }, [query]);

  if (!searches.length) return null;

  return (
    <div style={{ marginTop: "16px", borderTop: "1px solid #e0e0e0", paddingTop: "16px" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#70757A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px" }}>
        📊 70% people also search
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {searches.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSearch(s)}
            style={{
              padding: "6px 12px",
              background: "#EDEDED",
              border: "none",
              borderRadius: "20px",
              fontSize: "11px",
              color: "#202124",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#ddd")}
            onMouseLeave={e => (e.currentTarget.style.background = "#EDEDED")}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── IMPROVED IMAGE GRID COMPONENT ───────────────────────────────────────────
function ImageGrid({ images, onImageClick }: { images: any[]; onImageClick: (url: string) => void }) {
  const [visibleCount, setVisibleCount] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 20, images.length));
      setLoadingMore(false);
    }, 500);
  };

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  return (
    <div>
      <div className="image-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
        gap: "clamp(12px, 3vw, 16px)",
      }}>
        {visibleImages.map((img, idx) => {
          const imgUrl = getSafeImageUrl(img.thumbnail || img.link || img.url);
          return (
            <div
              key={idx}
              onClick={() => onImageClick(imgUrl)}
              style={{
                cursor: "pointer",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e8e8e8",
                transition: "all 0.2s ease",
                background: "#fafafa",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ aspectRatio: "1", position: "relative", overflow: "hidden" }}>
                <img
                  src={imgUrl}
                  alt={img.title || "Image"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Image+Not+Found";
                  }}
                />
              </div>
              <div style={{ padding: "8px 10px" }}>
                <p style={{
                  fontSize: "12px",
                  color: "#4D5156",
                  margin: 0,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}>
                  {img.title?.slice(0, 80) || "Untitled"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="load-more-btn"
            style={{
              padding: "10px 24px",
              background: "#1A0DAB",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'Segoe UI', Arial, sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0d0981")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1A0DAB")}
          >
            {loadingMore ? "Loading..." : `Load More Images (${images.length - visibleCount} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── IMPROVED VIDEOS GRID COMPONENT ──────────────────────────────────────────
function VideoGrid({ videos, onVideoClick }: { videos: any[]; onVideoClick?: (url: string) => void }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 12, videos.length));
      setLoadingMore(false);
    }, 300);
  };

  const visibleVideos = videos.slice(0, visibleCount);
  const hasMore = visibleCount < videos.length;

  if (!videos || videos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ fontSize: "16px", color: "#70757A" }}>No videos found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="video-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
        gap: "clamp(16px, 4vw, 20px)",
      }}>
        {visibleVideos.map((video: any, i: number) => {
          const youtubeId = getYouTubeThumbnail(video.link);
          const thumbUrl = youtubeId || video.thumbnail;
          return (
            <a
              key={i}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none" }}
              onClick={() => onVideoClick?.(video.link)}
            >
              <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #eee", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "relative", aspectRatio: "16/9", background: "#0f0f0f" }}>
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={video.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/400x225?text=Video+Preview"; }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a" }}>
                      <Video size={40} color="#666" />
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "0"}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Play size={20} fill="#000" style={{ marginLeft: "3px" }} />
                    </div>
                  </div>
                  {video.duration && (
                    <span style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: "11px", padding: "2px 6px", borderRadius: "4px" }}>
                      {video.duration}
                    </span>
                  )}
                </div>
                <div style={{ padding: "12px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1B1B1B", margin: "0 0 4px", lineHeight: 1.4, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                    {video.title?.slice(0, 80)}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#70757A", margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                    {video.channel || "YouTube"} • {video.views ? `${video.views} views` : ""}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="load-more-btn"
            style={{
              padding: "10px 28px",
              background: "#1A0DAB",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'Segoe UI', Arial, sans-serif",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0d0981")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1A0DAB")}
          >
            {loadingMore ? (
              <>⏳ Loading...</>
            ) : (
              <>🎬 Load More Videos ({videos.length - visibleCount} remaining)</>
            )}
          </button>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#70757A" }}>
        Showing {visibleVideos.length} of {videos.length} videos
      </div>
    </div>
  );
}

// ─── MODERN RESULT CARD COMPONENT ────────────────────────────────────────────
function ModernResultCard({ result, index, isFeatured = false }: { result: any; index: number; isFeatured?: boolean }) {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const youtubeThumb = getYouTubeThumbnail(result.link);
  const thumbnailUrl = youtubeThumb || result.thumbnail || result.image;
  const hasImage = thumbnailUrl && !imageError && !result.link?.includes("youtube");

  const isSovereign = result.is_sovereign === true || result.source === "Qura Vault";

  const getDomainInfo = (url: string) => {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      const domain = hostname.split('.')[0];
      return { hostname, domain };
    } catch {
      return { hostname: "qura.com", domain: "qura" };
    }
  };

  const domainInfo = result.link ? getDomainInfo(result.link) : { hostname: "qura.com", domain: "qura" };
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domainInfo.hostname}&sz=32`;

  const getFallbackIcon = (domain: string) => {
    const firstLetter = domain.charAt(0).toUpperCase();
    return firstLetter;
  };

  return (
    <div
      className="result-card"
      style={{
        padding: "16px 0",
        marginBottom: "8px",
        borderBottom: "1px solid #f0f0f0",
        background: isSovereign ? "#F0F9FF" : "#FFFFFF",
        borderRadius: isSovereign ? "12px" : "0",
        paddingLeft: isSovereign ? "12px" : "0",
        paddingRight: isSovereign ? "12px" : "0",
        transition: "all 0.15s ease",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (isSovereign) {
          e.currentTarget.style.background = "#E6F3FF";
        } else {
          e.currentTarget.style.background = "#FAFAFA";
        }
      }}
      onMouseLeave={e => {
        if (isSovereign) {
          e.currentTarget.style.background = "#F0F9FF";
        } else {
          e.currentTarget.style.background = "#FFFFFF";
        }
      }}
    >
      {isSovereign && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "linear-gradient(135deg, #1A0DAB, #2E1AB5)",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "'Segoe UI', Arial, sans-serif",
          boxShadow: "0 2px 6px rgba(26,13,171,0.2)",
        }}>
          <span style={{ fontSize: "11px" }}>🏛️</span>
          Qura Vault
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap" }}>
        {hasImage && (
          <div className="thumbnail" style={{ flexShrink: 0 }}>
            <div style={{
              width: "92px",
              height: "92px",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#f5f5f5",
            }}>
              <img
                src={thumbnailUrl}
                alt={result.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
            </div>
          </div>
        )}

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              background: "#f0f2f5",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              {!faviconError ? (
                <img
                  src={faviconUrl}
                  alt=""
                  style={{ width: "16px", height: "16px", objectFit: "contain" }}
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <span style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#1A0DAB",
                  textTransform: "uppercase",
                }}>
                  {getFallbackIcon(domainInfo.domain)}
                </span>
              )}
            </div>

            <span style={{
              fontSize: "12px",
              color: isSovereign ? "#1A0DAB" : "#70757A",
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: isSovereign ? 600 : 500,
            }}>
              {domainInfo.hostname}
            </span>

            {(domainInfo.hostname === "wikipedia.org" ||
              domainInfo.hostname === "github.com" ||
              domainInfo.hostname === "instagram.com" ||
              domainInfo.hostname === "f6s.com" ||
              domainInfo.hostname === "digitalindia.gov.in") && (
                <span style={{
                  fontSize: "10px",
                  color: "#1A73E8",
                  background: "#E8F0FE",
                  padding: "2px 6px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#1A73E8">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Verified
                </span>
              )}

            {result.date && (
              <span style={{ fontSize: "11px", color: "#70757A", display: "flex", alignItems: "center", gap: "3px" }}>
                <Calendar size={10} /> {result.date}
              </span>
            )}

            {result.source && !isSovereign && (
              <span style={{
                fontSize: "11px",
                background: "#EDEDED",
                padding: "2px 8px",
                borderRadius: "12px",
                color: "#202124",
                fontFamily: "'Segoe UI', Arial, sans-serif",
              }}>
                {result.source}
              </span>
            )}
          </div>

          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="result-title"
            style={{
              fontSize: "clamp(16px, 4vw, 18px)",
              fontWeight: 500,
              color: "#1A0DAB",
              lineHeight: 1.4,
              marginBottom: "6px",
              display: "block",
              textDecoration: "none",
              fontFamily: "'Segoe UI', Arial, sans-serif",
              transition: "color 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#0d0981"; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#1A0DAB"; e.currentTarget.style.textDecoration = "none"; }}
          >
            {result.title || "Untitled"}
          </a>

          <p style={{
            fontSize: "13.5px",
            color: "#4D5156",
            lineHeight: 1.58,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontFamily: "'Segoe UI', Arial, sans-serif",
          }}>
            {result.snippet || result.description || "No description available"}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
            {result.views && (
              <span style={{ fontSize: "11px", color: "#70757A", display: "flex", alignItems: "center", gap: "3px" }}>
                <Eye size={11} /> {result.views} views
              </span>
            )}
            {result.channel && (
              <span style={{ fontSize: "11px", color: "#70757A", display: "flex", alignItems: "center", gap: "3px" }}>
                <User size={11} /> {result.channel}
              </span>
            )}
            {result.price && (
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#059669" }}>
                ₹{result.price}
              </span>
            )}
            {result.rating && (
              <span style={{ fontSize: "11px", color: "#f59e0b" }}>
                {"★".repeat(Math.floor(result.rating))}{"☆".repeat(5 - Math.floor(result.rating))} {result.rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SHOPPING CARD COMPONENT ─────────────────────────────────────────────────
function ShoppingCard({ product }: { product: any }) {
  const [imageError, setImageError] = useState(false);
  const productImage = getSafeImageUrl(product.image || product.thumbnail);
  const hasValidImage = !imageError && productImage !== "https://placehold.co/400x300?text=No+Image";
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(emptyStars)}
        <span style={{ marginLeft: "4px", fontSize: "10px", color: "#70757A" }}>
          ({rating})
        </span>
      </span>
    );
  };

  return (
    <div
      className="shopping-card"
      style={{
        border: "1px solid #eee",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.2s",
        cursor: "pointer",
        background: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onClick={() => window.open(product.link, "_blank")}
    >
      <div style={{ aspectRatio: "1", background: "#f5f5f5", overflow: "hidden", position: "relative" }}>
        {hasValidImage ? (
          <img
            src={productImage}
            alt={product.title || "Product"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f5f5f5, #e8e8e8)"
          }}>
            <ShoppingBag size={48} color="#bbb" />
            <span style={{ fontSize: "10px", color: "#999", marginTop: "8px" }}>No image</span>
          </div>
        )}
      </div>
      <div style={{ padding: "12px", flex: 1 }}>
        <p style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#1B1B1B",
          margin: "0 0 6px",
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}>
          {product.title?.slice(0, 60) || "Product"}
        </p>
        <p style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#059669",
          margin: "6px 0",
        }}>
          {product.price || "Check price"}
        </p>
        {product.rating && (
          <div style={{
            fontSize: "11px",
            color: "#f59e0b",
            margin: "4px 0 0",
            display: "flex",
            alignItems: "center",
          }}>
            {renderStars(parseFloat(product.rating))}
          </div>
        )}
        {product.snippet && (
          <p style={{
            fontSize: "10px",
            color: "#70757A",
            margin: "8px 0 0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {product.snippet.slice(0, 60)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── VOICE SEARCH COMPONENT ───────────────────────────────────────────────────
function VoiceSearchButton({ onResult }: { onResult: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };
      recognitionInstance.onerror = () => setIsListening(false);
      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  }, [onResult]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    } else {
      alert("Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.");
    }
  };

  return (
    <button
      onClick={startListening}
      style={{
        background: isListening ? "#ef4444" : "none",
        border: "none",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "50%",
        color: isListening ? "#fff" : "#555",
        display: "flex",
        alignItems: "center",
        transition: "all 0.15s",
        position: "relative",
      }}
      onMouseEnter={e => { if (!isListening) (e.currentTarget.style.background = "#f0f0f0"); }}
      onMouseLeave={e => { if (!isListening) (e.currentTarget.style.background = "none"); }}
      title={isListening ? "Listening..." : "Voice search"}
    >
      <Mic size={17} />
      {isListening && (
        <span style={{
          position: "absolute",
          top: -2,
          right: -2,
          width: "10px",
          height: "10px",
          background: "#ef4444",
          borderRadius: "50%",
          animation: "pulse 1.5s infinite"
        }} />
      )}
    </button>
  );
}

// ─── AI ANSWER CARD ──────────────────────────────────────────────────────────
function AiAnswerCard({ insight, sources, query }: { insight: string; sources?: any[]; query: string }) {
  const [expanded, setExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const SHORT_LIMIT = 220;
  const isLong = insight.length > SHORT_LIMIT;
  const displayText = !isLong || expanded ? insight : insight.slice(0, SHORT_LIMIT) + "…";

  return (
    <div className="ai-card" style={{
      background: "linear-gradient(135deg, #e3dad1 0%, #d6ccc2 100%)",
      borderRadius: "16px",
      padding: "clamp(16px, 4vw, 24px) clamp(16px, 5vw, 26px)",
      marginBottom: "28px",
      border: "1px solid rgba(0,0,0,0.05)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      position: "relative",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      transition: "all 0.2s ease",
    }}>
      <div className="header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "#fff", borderRadius: "24px",
          padding: "6px 14px 6px 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          {!logoError ? (
            <img
              src="/eraa-logo.png"
              alt="EraA"
              style={{
                width: "22px",
                height: "22px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <span style={{ fontSize: "18px", lineHeight: 1 }}>✨</span>
          )}
          <span style={{
            fontSize: "13px", fontWeight: 700,
            color: "#323130",
            fontFamily: "'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif",
            letterSpacing: "0.01em",
          }}>EraA AI</span>
        </div>
        <span style={{
          fontSize: "12px", color: "#4a4a4a",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          background: "rgba(255,255,255,0.7)",
          padding: "4px 12px",
          borderRadius: "20px",
        }}>
          Answer generated for: <em style={{ color: "#1A0DAB", fontStyle: "normal", fontWeight: 600 }}>{query}</em>
        </span>
      </div>

      <p style={{
        fontSize: "15px",
        fontWeight: 400,
        color: "#2c2c2c",
        lineHeight: 1.72,
        margin: "0 0 16px",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}>
        {displayText}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(37, 99, 235, 0.1)",
            border: "none",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12.5px",
            color: "#2563EB",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            marginBottom: sources && sources.length > 0 ? "20px" : "0",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(37, 99, 235, 0.2)";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(37, 99, 235, 0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {expanded ? (
            <>Show less <ChevronUp size={14} /></>
          ) : (
            <>Read more <ChevronDown size={14} /></>
          )}
        </button>
      )}

      {sources && sources.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "16px", marginTop: "4px" }}>
          <p style={{
            fontSize: "11px", color: "#5a5a5a",
            fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "12px",
            fontFamily: "'Segoe UI', Arial, sans-serif",
          }}>
            📚 Sources
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {sources.map((s: any, i: number) => (
              <a key={i} href={s.link} target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: "12.5px",
                  color: "#2563EB",
                  background: "#fff",
                  border: "1px solid #ddd",
                  padding: "6px 14px",
                  borderRadius: "24px",
                  transition: "all 0.2s ease",
                  fontWeight: 500,
                  textDecoration: "none",
                  fontFamily: "'Segoe UI', Arial, sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#f0f4ff";
                  e.currentTarget.style.borderColor = "#2563EB";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#ddd";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>🔗</span> {s.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN SEARCH RESULTS COMPONENT ────────────────────────────────────────────
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState("Detecting your location...");
  const [locationPermission, setLocationPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [searchInput, setSearchInput] = useState(query || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showMoreInsights, setShowMoreInsights] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickLinks, setQuickLinks] = useState<any[]>([]);
  const [quickLinksLoading, setQuickLinksLoading] = useState(true);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const searchRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // ─── FETCH QUICK LINKS ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/quick-links`)
      .then(res => res.json())
      .then(data => {
        setQuickLinks(data);
        setQuickLinksLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch quick links:', err);
        setQuickLinksLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setShowSuggestions(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // Auto-suggest logic
  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchInput.length > 2) {
        try {
          const res = await fetch(`${API_BASE}/suggest?q=${encodeURIComponent(searchInput)}`);
          if (res.ok) { const d = await res.json(); setSuggestions(Array.isArray(d) ? d : []); setShowSuggestions(true); }
          else { setSuggestions([]); setShowSuggestions(false); }
        } catch { setSuggestions([]); setShowSuggestions(false); }
      } else { setSuggestions([]); setShowSuggestions(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleVoiceResult = (text: string) => {
    setSearchInput(text);
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  const handleRelatedSearch = (searchQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Location detection
  useEffect(() => {
    let watchId: number | null = null, retryCount = 0;
    const maxRetries = 3;
    const viaIP = () => fetch("https://ipapi.co/json/").then(r => r.json()).then(d => setLocation(d.city && d.region ? `${d.city}, ${d.region}, ${d.country_name}` : "India")).catch(() => setLocation("India"));
    const go = () => {
      if (!("geolocation" in navigator)) { viaIP(); return; }
      navigator.geolocation.getCurrentPosition(async pos => {
        setLocationPermission("granted");
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`);
          const d = await r.json();
          const city = d.address?.city || d.address?.town || d.address?.village || "Unknown";
          const state = d.address?.state || ""; const country = d.address?.country || "India";
          setLocation(state ? `${city}, ${state}, ${country}` : `${city}, ${country}`);
        } catch { setLocation(`${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`); }
        if (watchId === null) watchId = navigator.geolocation.watchPosition(async npos => {
          if (Math.abs(npos.coords.latitude - pos.coords.latitude) > 0.001 || Math.abs(npos.coords.longitude - pos.coords.longitude) > 0.001) {
            setLatitude(npos.coords.latitude);
            setLongitude(npos.coords.longitude);
          }
        }, err => { if (err.code === 1) { setLocationPermission("denied"); viaIP(); } }, { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
      }, () => {
        setLocationPermission("denied");
        if (retryCount < maxRetries) { retryCount++; setTimeout(go, 1000); } else viaIP();
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    };
    go();
    return () => { if (watchId !== null && "geolocation" in navigator) navigator.geolocation.clearWatch(watchId); };
  }, []);

  const fetchResults = async (tabName: string, page: number = 1) => {
    if (!query) return;
    setLoading(true);
    try {
      const apiType = tabName === "EraA" ? "all" : tabToApiType[tabName] || "all";
      const res = await fetch(`${API_BASE}/search?q=${query}&type=${apiType}&page=${page}`);
      const result = await res.json();
      setData({ ...result, search_type: apiType });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleTabClick = (t: string) => {
    setActiveTab(t);
    setCurrentPage(1);
    if (t === "EraA") {
      window.open("https://era-a.vercel.app/", "_blank");
    } else {
      fetchResults(t, 1);
    }
  };

  const handleMoreItemClick = (item: string) => {
    setActiveTab(item);
    setCurrentPage(1);
    setMoreDropdownOpen(false);
    fetchResults(item, 1);
  };

  useEffect(() => {
    if (query && activeTab !== "EraA") {
      fetchResults(activeTab, currentPage);
    }
  }, [query, activeTab]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestionClick = (s: string) => {
    setSearchInput(s);
    setShowSuggestions(false);
    setSuggestions([]);
    router.push(`/search?q=${encodeURIComponent(s)}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResults(activeTab, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentSearchType = data?.search_type || "all";
  const itemsPerPage = currentSearchType === "images" ? 30 : currentSearchType === "videos" ? 20 : 10;
  const totalResults = data?.results?.length || 0;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const extendedInsights = [
    { title: "Security Features", description: "Qura Browser includes advanced security measures including encrypted browsing, malware protection, and real-time threat detection." },
    { title: "Privacy Controls", description: "Built-in ad blocker, tracker prevention, and private browsing mode with no data collection." },
    { title: "AI Integration", description: "EraA AI assistant provides contextual answers, smart suggestions, and personalized recommendations." },
    { title: "Rewards System", description: "Earn Q-Coins by using Qura Browser and redeem them for exclusive rewards and features." },
  ];

  const relatedTopics = [
    "Qura Browser download", "EraA AI features", "Qura privacy settings",
    "Qura vs Chrome", "Qura rewards program", "Qura mobile app",
    "Qura browser review", "Qura update 2026"
  ];

  const getPaginatedResults = () => {
    if (!data?.results) return [];
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.results.slice(start, end);
  };

  const paginatedResults = getPaginatedResults();

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      for (let i = 1; i <= maxVisible - 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }

    return pageNumbers.map((page, idx) => {
      if (page === '...') {
        return <span key={idx} style={{ color: "#4D5156", padding: "0 4px" }}>...</span>;
      }
      const pageNum = page as number;
      return (
        <button
          key={idx}
          onClick={() => handlePageChange(pageNum)}
          className="page-number"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: pageNum === currentPage ? "none" : "1px solid #e0e0e0",
            background: pageNum === currentPage ? "#1A0DAB" : "transparent",
            color: pageNum === currentPage ? "#fff" : "#4D5156",
            fontSize: "14px",
            fontWeight: pageNum === currentPage ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "'Segoe UI', Arial, sans-serif",
          }}
        >
          {pageNum}
        </button>
      );
    });
  };

  const isHomePage = !query;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFFFF",
      color: "#202124",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      fontSize: "15px",
    }}>
      <style>{`
        *{box-sizing:border-box}
        body{margin:0}
        a{text-decoration:none}
        
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}

        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes pulse{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(2)}}
        
        .shimmer{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:6px}
        .sug-item:hover{background:#f5f5f5}
        .fl:hover{color:#1A0DAB!important}
        .tab-active-indicator{border-bottom:2.5px solid #1A0DAB!important;color:#1A0DAB!important;font-weight:600!important}
        .tab-btn:hover{background:#f5f5f5!important}
        .ai-readmore-btn:hover{background:#e8e8f0!important}
        
        /* Responsive Styles */
        @media (max-width: 1024px) {
          main > div:not(.home-grid) {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .quick-links-row {
            gap: 12px !important;
          }
          .quick-links-row button {
            padding: 4px 8px !important;
          }
          .quick-links-row div {
            width: 40px !important;
            height: 40px !important;
          }
          .quick-links-row img {
            width: 22px !important;
            height: 22px !important;
          }
          .quick-links-row span {
            font-size: 9px !important;
          }
        }
        
        @media (max-width: 768px) {
          header > div > div:first-child {
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          header .search-container {
            order: 3 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .tabs-container {
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .tabs-container button {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          .result-card {
            flex-direction: column !important;
          }
          .result-card .thumbnail {
            width: 100% !important;
            height: auto !important;
          }
          .image-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 12px !important;
          }
          .video-grid {
            grid-template-columns: 1fr !important;
          }
          .shopping-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 12px !important;
          }
          .sidebar {
            position: static !important;
            margin-top: 32px !important;
          }
          main {
            padding: 16px !important;
          }
          .result-count {
            font-size: 11px !important;
          }
          .result-title {
            font-size: 16px !important;
          }
          .pagination {
            gap: 4px !important;
          }
          .pagination button, .page-number {
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
          }
          .pagination .prev-next {
            padding: 6px 12px !important;
            font-size: 12px !important;
          }
          footer > div > div:last-child {
            flex-wrap: wrap !important;
            gap: 12px !important;
            justify-content: center !important;
          }
          .ai-card {
            padding: 16px !important;
          }
          .ai-card .header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .people-also-ask button {
            padding: 10px 12px !important;
            font-size: 13px !important;
          }
        }
        
        @media (max-width: 480px) {
          .logo span {
            font-size: 18px !important;
          }
          .logo img {
            width: 28px !important;
            height: 28px !important;
          }
          .search-bar {
            height: 42px !important;
            padding: 0 4px 0 12px !important;
          }
          .search-bar input {
            font-size: 14px !important;
          }
          .search-bar button {
            padding: 6px 12px !important;
          }
          .apps-button {
            padding: 4px 8px !important;
            font-size: 12px !important;
          }
          .q-coins {
            padding: 4px 8px !important;
            font-size: 11px !important;
          }
          .tabs-container button {
            padding: 6px 10px !important;
            font-size: 11px !important;
          }
          .image-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
            gap: 8px !important;
          }
          .load-more-btn {
            padding: 8px 16px !important;
            font-size: 12px !important;
          }
          .welcome h2 {
            font-size: 22px !important;
          }
          .welcome p {
            font-size: 13px !important;
          }
          .sidebar-card {
            padding: 14px !important;
          }
        }
        
        @media (hover: none) and (pointer: coarse) {
          button, a {
            min-height: 44px !important;
          }
          .tab-btn, .more-btn {
            min-height: 40px !important;
          }
          .result-card {
            cursor: default !important;
          }
        }
      `}</style>

      {/* Image Preview Modal */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, cursor: "pointer", backdropFilter: "blur(6px)" }}>
          <button onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={20} />
          </button>
          <img src={getSafeImageUrl(previewImage)} alt="Preview" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "12px" }} />
        </div>
      )}

      {/* HEADER */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ebebeb",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "10px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div onClick={() => router.push("/")} className="logo" style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", flexShrink: 0 }}>
              <img src="/qura-logo.png" alt="Qura" style={{ height: "32px", width: "32px", borderRadius: "8px" }} />
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.03em", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Qura</span>
            </div>

            <div ref={searchRef} className="search-container" style={{ flex: 1, maxWidth: "680px", position: "relative" }}>
              <div className="search-bar" style={{ display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #d8d8d8", borderRadius: "28px", padding: "0 6px 0 20px", height: "46px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s" }}>
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchInput.length > 2 && setShowSuggestions(true)}
                  placeholder="Search Qura or type a URL..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: "15.5px", fontWeight: 400, color: "#202124", background: "transparent", fontFamily: "'Segoe UI', Arial, sans-serif" }}
                />
                <div style={{ width: "1px", height: "22px", background: "#e0e0e0", margin: "0 8px", flexShrink: 0 }} />
                <VoiceSearchButton onResult={handleVoiceResult} />
                <button
                  onClick={handleSearch}
                  style={{ background: "#0078d4", border: "none", borderRadius: "22px", padding: "9px 18px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#006bbf")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#0078d4")}
                ><Search size={16} /></button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", border: "1px solid #e0e0e0", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => handleSuggestionClick(s)} className="sug-item"
                      style={{ padding: "11px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", borderBottom: i < suggestions.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                      <Search size={13} color="#999" />
                      <span style={{ fontSize: "14px", color: "#333", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              <QuickAccessGrid />
              <div className="q-coins" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "20px", background: "#1a1a1a", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}>
                <span style={{ fontSize: "14px" }}>💰</span> Q-Coins: 0
              </div>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#1a1a1a,#444)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "transform 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                V
              </div>
            </div>
          </div>

          {!isHomePage && (
            <div className="tabs-container" style={{ display: "flex", gap: "2px", paddingTop: "6px", overflowX: "auto", scrollbarWidth: "none", position: "relative" }}>
              {MAIN_TABS.map(tab => (
                <button key={tab} onClick={() => handleTabClick(tab)}
                  className={`tab-btn${activeTab === tab ? " tab-active-indicator" : ""}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "9px 14px", borderRadius: "8px 8px 0 0",
                    border: "none", background: "none", cursor: "pointer",
                    fontSize: "13.5px", fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? "#1A0DAB" : "#4D5156",
                    whiteSpace: "nowrap",
                    borderBottom: activeTab === tab ? "2.5px solid #1A0DAB" : "2.5px solid transparent",
                    transition: "all 0.15s",
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                  }}>
                  {tab}
                </button>
              ))}
              <div ref={moreDropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="tab-btn more-btn"
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "9px 14px", borderRadius: "8px 8px 0 0",
                    border: "none", background: "none", cursor: "pointer",
                    fontSize: "13.5px", fontWeight: 400,
                    color: "#4D5156", whiteSpace: "nowrap",
                    borderBottom: "2.5px solid transparent",
                    transition: "all 0.15s", fontFamily: "'Segoe UI', Arial, sans-serif",
                  }}
                >
                  More <ChevronDown size={14} />
                </button>
                {moreDropdownOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 2px)", left: 0,
                    background: "#fff", border: "1px solid #e0e0e0",
                    borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 100, minWidth: "140px", overflow: "hidden",
                  }}>
                    {MORE_ITEMS.map(item => (
                      <div
                        key={item}
                        onClick={() => handleMoreItemClick(item)}
                        style={{
                          padding: "10px 16px", cursor: "pointer",
                          fontSize: "13.5px", color: "#4D5156",
                          fontFamily: "'Segoe UI', Arial, sans-serif",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main style={{
        flex: 1,
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "clamp(16px, 4vw, 28px) clamp(12px, 3vw, 20px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {isHomePage && !quickLinksLoading && <QuickLinksRow links={quickLinks} />}
        {isHomePage && quickLinksLoading && (
          <div className="quick-links-row" style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "32px", flexWrap: "wrap", padding: "0 16px" }}>
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shimmer" style={{ width: "48px", height: "70px", borderRadius: "16px" }} />)}
          </div>
        )}

        {!isHomePage && (
          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 340px)", gap: "clamp(24px, 5vw, 48px)", alignItems: "start" }}>
            {/* LEFT COLUMN */}
            <div>
              {!loading && activeTab === "All" && data?.eraa_insight && (
                <div style={{ marginBottom: "32px" }}>
                  <AiAnswerCard insight={data.eraa_insight} sources={data?.sources} query={query || ""} />
                </div>
              )}

              {!loading && data?.results && activeTab !== "EraA" && (
                <p className="result-count" style={{ fontSize: "13px", color: "#70757A", marginBottom: "20px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                  About {totalResults.toLocaleString()} results
                  {currentSearchType === "images" && ` (${Math.min(itemsPerPage, totalResults)} per page)`}
                  {currentSearchType === "videos" && ` (${Math.min(itemsPerPage, totalResults)} per page)`}
                  {currentSearchType !== "images" && currentSearchType !== "videos" && ` (Page ${currentPage} of ${totalPages || 1})`}
                </p>
              )}

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ display: "flex", gap: "16px" }}>
                      <div className="shimmer" style={{ width: "100px", height: "100px", borderRadius: "12px" }} />
                      <div style={{ flex: 1 }}>
                        <div className="shimmer" style={{ height: "12px", width: "40%", marginBottom: "8px" }} />
                        <div className="shimmer" style={{ height: "20px", width: "70%", marginBottom: "8px" }} />
                        <div className="shimmer" style={{ height: "14px", width: "90%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {activeTab !== "EraA" && ["all", "forums", "flight", "travel", "maps", "tools"].includes(currentSearchType) && data?.results && (
                    <div>
                      {paginatedResults.map((res: any, i: number) => (
                        <ModernResultCard key={i} result={res} index={i} isFeatured={i === 0 && currentPage === 1} />
                      ))}
                    </div>
                  )}

                  {activeTab !== "EraA" && currentSearchType === "images" && data?.results && (
                    <ImageGrid images={data.results} onImageClick={setPreviewImage} />
                  )}

                  {activeTab !== "EraA" && currentSearchType === "videos" && data?.results && (
                    <VideoGrid videos={data.results} onVideoClick={(url) => window.open(url, "_blank")} />
                  )}

                  {activeTab !== "EraA" && currentSearchType === "news" && data?.results && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {paginatedResults.map((news: any, i: number) => (
                        <ModernResultCard key={i} result={news} index={i} isFeatured={i === 0 && currentPage === 1} />
                      ))}
                    </div>
                  )}

                  {activeTab !== "EraA" && currentSearchType === "shopping" && data?.results && paginatedResults.length > 0 && (
                    <div className="shopping-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))", gap: "clamp(12px, 3vw, 20px)" }}>
                      {paginatedResults.map((product: any, i: number) => (
                        <ShoppingCard key={i} product={product} />
                      ))}
                    </div>
                  )}

                  {activeTab !== "EraA" && paginatedResults.length === 0 && !loading && (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                      <ShoppingBag size={64} color="#ccc" style={{ marginBottom: "16px" }} />
                      <h3 style={{ fontSize: "18px", color: "#4D5156", marginBottom: "8px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>No results found</h3>
                      <p style={{ fontSize: "14px", color: "#70757A", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Try adjusting your search or check back later</p>
                    </div>
                  )}

                  {activeTab === "EraA" && (
                    <div style={{ textAlign: "center", padding: "80px 20px" }}>
                      <div style={{ fontSize: "48px", marginBottom: "20px" }}>✨</div>
                      <h2 style={{ fontSize: "24px", color: "#1A0DAB", marginBottom: "12px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Opening EraA AI...</h2>
                      <p style={{ fontSize: "15px", color: "#4D5156", fontFamily: "'Segoe UI', Arial, sans-serif" }}>You are being redirected to the EraA AI assistant.</p>
                      <button onClick={() => window.open("https://era-a.vercel.app/", "_blank")} style={{ marginTop: "24px", padding: "10px 24px", background: "#1A0DAB", color: "#fff", border: "none", borderRadius: "30px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Go to EraA →</button>
                    </div>
                  )}
                </>
              )}

              {!loading && totalResults > 0 && totalPages > 1 && activeTab !== "EraA" && currentSearchType !== "images" && currentSearchType !== "videos" && (
                <div className="pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(4px, 2vw, 8px)", marginTop: "clamp(32px, 8vw, 48px)", flexWrap: "wrap" }}>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="prev-next" style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #e0e0e0", background: "transparent", color: currentPage === 1 ? "#ccc" : "#1A0DAB", fontSize: "14px", fontWeight: 500, cursor: currentPage === 1 ? "not-allowed" : "pointer", transition: "all 0.15s", fontFamily: "'Segoe UI', Arial, sans-serif" }}>← Previous</button>
                  {renderPageNumbers()}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="prev-next" style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #e0e0e0", background: "transparent", color: currentPage === totalPages ? "#ccc" : "#1A0DAB", fontSize: "14px", fontWeight: 500, cursor: currentPage === totalPages ? "not-allowed" : "pointer", transition: "all 0.15s", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Next →</button>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="sidebar" style={{ position: "sticky", top: "100px" }}>
              <div className="sidebar-card" style={{ background: "#F8F9FA", border: "1px solid #e8e8e8", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <img src="/eraa-logo.png" alt="EraA" style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "6px" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; const parent = (e.target as HTMLImageElement).parentElement; if (parent) { const span = document.createElement("span"); span.textContent = "✨"; span.style.fontSize = "18px"; span.style.lineHeight = "1"; parent.insertBefore(span, e.target as HTMLImageElement); } }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5f6368", fontFamily: "'Segoe UI', Arial, sans-serif" }}>EraA Insights</span>
                </div>

                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[100, 85, 70].map((w, i) => <div key={i} className="shimmer" style={{ height: "14px", width: `${w}%` }} />)}
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: "14px", color: "#323130", lineHeight: 1.7, margin: "0 0 18px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{data?.eraa_insight || "No insights available"}</p>

                    {data?.sources?.length > 0 && (
                      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "14px", marginBottom: "14px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#70757A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Sources</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {data.sources.slice(0, showMoreInsights ? data.sources.length : 2).map((s: any, i: number) => (
                            <a key={i} href={s.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e8e8e8", background: "#fff", fontSize: "13px", color: "#1A0DAB", transition: "all 0.15s", fontWeight: 500, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "14px", marginBottom: "14px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 600, color: "#70757A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>More about this topic</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(showMoreInsights ? extendedInsights : extendedInsights.slice(0, 2)).map((insight, idx) => (
                          <div key={idx} style={{ padding: "12px 14px", background: "#fff", borderLeft: "3px solid #1A0DAB", borderRadius: "8px", cursor: "pointer", border: "1px solid #e8e8e8", borderLeftWidth: "3px", transition: "all 0.15s" }} onClick={() => router.push(`/search?q=${encodeURIComponent(insight.title)}`)} onMouseEnter={e => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.transform = "translateX(3px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateX(0)"; }}>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#1B1B1B", margin: "0 0 3px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{insight.title}</p>
                            <p style={{ fontSize: "11.5px", color: "#4D5156", margin: 0, lineHeight: 1.4, fontFamily: "'Segoe UI', Arial, sans-serif" }}>{insight.description}</p>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setShowMoreInsights(!showMoreInsights)} className="ai-readmore-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", marginTop: "12px", padding: "8px 12px", background: "#EDEDED", border: "none", borderRadius: "20px", fontSize: "12.5px", color: "#323130", fontWeight: 500, cursor: "pointer", transition: "background 0.15s", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                        {showMoreInsights ? <>Show less <ChevronUp size={14} /></> : <>Show more <ChevronDown size={14} /></>}
                      </button>
                    </div>

                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "14px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 600, color: "#70757A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Related searches</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {(showMoreInsights ? relatedTopics : relatedTopics.slice(0, 5)).map(tag => (
                          <button key={tag} onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)} style={{ padding: "6px 14px", borderRadius: "20px", background: "#EDEDED", border: "none", fontSize: "12px", color: "#202124", cursor: "pointer", transition: "all 0.15s", fontWeight: 400, fontFamily: "'Segoe UI', Arial, sans-serif" }} onMouseEnter={e => (e.currentTarget.style.background = "#ddd")} onMouseLeave={e => (e.currentTarget.style.background = "#EDEDED")}>{tag}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* NEW COMPONENTS IN SIDEBAR */}
              {!isHomePage && <PeopleAlsoAsk query={query || ""} onSearch={handleRelatedSearch} />}
              {!isHomePage && <PopularSearches query={query || ""} onSearch={handleRelatedSearch} />}
              <LocationNews lat={latitude} lon={longitude} />
            </div>
          </div>
        )}

        {isHomePage && (
          <div className="welcome" style={{ textAlign: "center", marginTop: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 6vw, 28px)", fontWeight: 600, color: "#1A0DAB", marginBottom: "12px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>Welcome to Qura</h2>
            <p style={{ fontSize: "clamp(13px, 4vw, 16px)", color: "#4D5156", fontFamily: "'Segoe UI', Arial, sans-serif" }}>India's own intelligent search engine — Fast, Private & Secure</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #ebebeb", background: "#f9f9f9", padding: "24px 20px", marginTop: "auto" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#70757A", marginBottom: "16px", fontFamily: "'Segoe UI', Arial, sans-serif", flexWrap: "wrap" }}>
            <MapPin size={13} color="#70757A" />
            <span>{location}</span>
            {locationPermission === "granted" && <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600 }}>● Live</span>}
            {locationPermission === "denied" && <span style={{ fontSize: "10px", color: "#ef4444", fontWeight: 600 }}>● IP based</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(16px, 4vw, 28px)", marginBottom: "16px", justifyContent: "center" }}>
            {["About Qura", "Help", "Privacy", "Terms", "Advertise", "Business"].map(item => (
              <a key={item} href="#" className="fl" style={{ fontSize: "13.5px", color: "#4D5156", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{item}</a>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#70757A", margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              © 2026 Qura Technologies — India's own search engine. Fast, private &amp; intelligent.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── MAIN EXPORT WITH SUSPENSE (FIX FOR VERCEL) ──────────────────────────────
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#FFFFFF",
        fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="shimmer" style={{ width: "60px", height: "60px", borderRadius: "50%", margin: "0 auto 20px" }} />
          <p style={{ color: "#4D5156" }}>Loading Qura Search...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}