import Image from "next/image";
import { demoEpisode } from "@/utils/contentpulse/demo-data";

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <Image
            className="brand-logo"
            src="/HoiChoi%20Logo.png"
            alt="Hoichoi"
            width={34}
            height={34}
            priority
          />
          <div>
            <strong>ContentPulse</strong>
            <span>AI content operations</span>
          </div>
        </div>
        <div className="workspace-label">Workspace</div>
        <nav className="primary-nav" aria-label="Primary navigation">
          {[
            ["Overview", "⌂", true],
            ["Content library", "▤", false],
            ["Scenes", "◫", false],
            ["Promotion", "↗", false],
            ["Compliance", "✓", false],
            ["AI agent", "✦", false],
          ].map(([label, icon, active]) => (
            <a
              className={active ? "nav-item active" : "nav-item"}
              href="#"
              key={String(label)}>
              <span aria-hidden="true">{icon}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="status-dot" />
          <div>
            <strong>Pipeline ready</strong>
            <span>Gemini + Supabase connected</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Content library</span>
            <b>/</b>
            <strong>{demoEpisode.episode.title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="processing-pill">
              <i /> Analysis complete
            </span>
            <button className="profile-button" aria-label="Open profile">
              AM
            </button>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Episode intelligence</p>
              <h1>
                {demoEpisode.episode.title}{" "}
                <span>· {demoEpisode.episode.seasonEpisode}</span>
              </h1>
              <p className="muted">
                {demoEpisode.episode.analyzedAt} ·{" "}
                {demoEpisode.episode.language} · {demoEpisode.episode.duration}
              </p>
            </div>
            <a className="button button-dark" href="#agent">
              <span>✦</span> Ask ContentPulse
            </a>
          </div>
          <div className="stat-grid">
            {demoEpisode.stats.map(({ value, label, note, icon }, index) => (
              <div className="stat-card" key={label}>
                <span className={`stat-icon icon-${index}`}>{icon}</span>
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                  <small>{note}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="dashboard-grid">
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">AI executive summary</p>
                  <h2>{demoEpisode.summary.title}</h2>
                </div>
                <span className="confidence">
                  {demoEpisode.summary.confidence}
                </span>
              </div>
              <p className="summary-copy">{demoEpisode.summary.body}</p>
              <div className="tag-row">
                {demoEpisode.summary.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="summary-footer">
                <span>Suggested title</span>
                <strong>“{demoEpisode.summary.suggestedTitle}”</strong>
                <span className="divider" />
                <span>Viewer hook</span>
                <strong>{demoEpisode.summary.viewerHook}</strong>
              </div>
            </section>
            <section className="panel agent-panel" id="agent">
              <div className="agent-orbit">✦</div>
              <p className="eyebrow">Your AI analyst</p>
              <h2>Ask about this episode</h2>
              <p className="muted">
                Find scenes, explain a moment, or turn an insight into an
                operational action.
              </p>
              <div className="quick-actions">
                <button>
                  Find best promo moment <span>→</span>
                </button>
                <button>
                  Generate metadata <span>→</span>
                </button>
              </div>
              <a className="text-link" href="#">
                Open AI agent <span>↗</span>
              </a>
            </section>
          </div>

          <div className="content-grid">
            <section className="panel moments-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Timestamp intelligence</p>
                  <h2>Key scenes</h2>
                </div>
                <a className="text-link" href="#">
                  View all <span>↗</span>
                </a>
              </div>
              <div className="timeline">
                {demoEpisode.scenes.map((scene, index) => (
                  <article className="scene-row" key={scene.time}>
                    <span
                      className={
                        index === 3 ? "timeline-dot selected" : "timeline-dot"
                      }
                    />
                    <time>{scene.time}</time>
                    <div>
                      <strong>{scene.title}</strong>
                      <p>{scene.detail}</p>
                    </div>
                    <button aria-label={`Open scene at ${scene.time}`}>
                      ↗
                    </button>
                  </article>
                ))}
              </div>
            </section>
            <section className="panel flags-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Human review queue</p>
                  <h2>Content flags</h2>
                </div>
                <span className="count-badge">
                  {demoEpisode.reviewFlags.length} open
                </span>
              </div>
              <div className="flag-list">
                {demoEpisode.reviewFlags.map((flag) => (
                  <article className="flag-row" key={flag.time}>
                    <div className={`severity ${flag.tone}`} />
                    <div>
                      <div className="flag-meta">
                        <time>{flag.time}</time>
                        <span>{flag.category}</span>
                      </div>
                      <strong>{flag.severity} review</strong>
                      <p>{flag.detail}</p>
                    </div>
                    <button aria-label={`Review scene at ${flag.time}`}>
                      ···
                    </button>
                  </article>
                ))}
              </div>
              <div className="review-note">
                <span>ⓘ</span> AI findings are recommendations for human review.
              </div>
            </section>
          </div>
          <section className="promo-strip">
            <div>
              <span className="promo-label">Promotion intelligence</span>
              <h2>One moment is ready to become a hook.</h2>
              <p>
                {demoEpisode.promotion.range} · {demoEpisode.promotion.type} ·{" "}
                {demoEpisode.promotion.description}
              </p>
            </div>
            <a className="button button-red" href="#">
              Open recommendation <span>↗</span>
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}
