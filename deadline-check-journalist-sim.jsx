import { useState, useEffect, useRef, useCallback } from "react";

/*
  DEADLINE CHECK — Journalist Simulation
  "You're on deadline. Can you spot the bad science?"
  
  Design: Editorial broadsheet × wire-service urgency
  Light theme, newsroom CMS aesthetic, deadline tickers,
  source cards that look like database results, byline mockups.
  
  Goal: Attract journalists to take the CMC predatory journals survey.
*/

// ─── SCENARIO DATA ───────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: "intro",
    phase: 0,
    story: {
      beat: "HEALTH POLICY",
      headline: "New Study Links Workplace Stress to Heart Disease Risk",
      editor: "Your editor wants 800 words by 6 PM. You need a strong academic source to anchor the piece."
    },
    narrative: "You're writing a story on workplace health for a national outlet. A quick database search turns up two studies with relevant findings. Both seem to address your angle. You need to pick one to cite — and you're on deadline.",
    timer: "4:47 PM — Deadline in 73 minutes",
    sources: [
      {
        id: "legit",
        type: "legitimate",
        title: "Occupational Stress and Cardiovascular Outcomes: A 10-Year Longitudinal Study",
        journal: "Journal of Occupational Health Psychology",
        authors: "Chen, R., Williams, A.K., & Patel, S.",
        year: "2025",
        details: { publisher: "American Psychological Association", indexed: "PsycINFO, Scopus, Web of Science", peerReview: "Double-blind, 6-month review cycle", impact: "IF 5.8", citations: "Cited 23 times since publication" },
        next: "good_1"
      },
      {
        id: "pred",
        type: "predatory",
        title: "Workplace Stress Causes 73% Increase in Heart Attack Risk: A Comprehensive Analysis",
        journal: "Global Journal of Health and Wellness Research",
        authors: "Smith, J.",
        year: "2025",
        details: { publisher: "SciPress International Ltd.", indexed: "Google Scholar", peerReview: "\"Rapid review\" — 2 weeks", impact: "Not rated", citations: "No citations found" },
        next: "bad_1"
      }
    ]
  },
  {
    id: "good_1",
    phase: 1,
    story: {
      beat: "HEALTH POLICY",
      headline: "Your Article is Published",
      editor: "Story looks solid. The sourcing is clean."
    },
    narrative: "Your piece runs the next morning. The study you cited is from an APA journal with rigorous peer review. The findings are measured — they show a correlation, not a dramatic causal claim.\n\nA reader who's a cardiologist emails: \"Thank you for citing a credible source. So much health reporting gets this wrong.\"\n\nYour editor is impressed. She assigns you a new story — education policy this time.",
    timer: "PUBLISHED — 8:02 AM next day",
    feedback: { type: "good", label: "CLEAN SOURCING", detail: "Your article cites a credible, peer-reviewed study. The findings will hold up." },
    sources: [
      {
        id: "legit",
        type: "legitimate",
        title: "Effects of Class Size Reduction on Student Achievement: A Meta-Analysis",
        journal: "American Educational Research Journal",
        authors: "Nakamura, T., Johnson, L.B., & Rivera, C.",
        year: "2024",
        details: { publisher: "SAGE / AERA", indexed: "ERIC, Scopus, Web of Science", peerReview: "Double-blind, 4–8 month cycle", impact: "IF 6.2", citations: "Cited 41 times" },
        next: "good_2"
      },
      {
        id: "pred",
        type: "predatory",
        title: "Smaller Classes Improve Test Scores by 40%: A Revolutionary Finding",
        journal: "International Journal of Educational Advancement and Innovation",
        authors: "Anderson, P.",
        year: "2025",
        details: { publisher: "Academic Journals Inc.", indexed: "Google Scholar only", peerReview: "\"Fast-track\" — 10 days", impact: "Not rated", citations: "1 self-citation" },
        next: "bad_2_from_good"
      }
    ]
  },
  {
    id: "bad_1",
    phase: 1,
    story: {
      beat: "HEALTH POLICY",
      headline: "\"73% Increase in Heart Attack Risk\" — Your Story Goes Viral",
      editor: "Great traffic numbers. But there's a problem."
    },
    narrative: "Your article goes viral — the \"73% increase\" is a perfect clickable stat. It gets shared 14,000 times. Cable news picks it up.\n\nThen a public health researcher tweets a thread: the journal you cited isn't indexed in any major database. The single author has no verifiable affiliation. The \"73%\" figure appears nowhere in the actual data.\n\nYour editor gets a call from the standards desk.",
    timer: "11:34 AM — 26 hours after publication",
    feedback: { type: "bad", label: "SOURCE FLAGGED", detail: "The journal is identified as predatory. The study was never properly peer-reviewed. Your outlet is now associated with the error." },
    sources: [
      {
        id: "legit",
        type: "legitimate",
        title: "Effects of Class Size Reduction on Student Achievement: A Meta-Analysis",
        journal: "American Educational Research Journal",
        authors: "Nakamura, T., Johnson, L.B., & Rivera, C.",
        year: "2024",
        details: { publisher: "SAGE / AERA", indexed: "ERIC, Scopus, Web of Science", peerReview: "Double-blind, 4–8 month cycle", impact: "IF 6.2", citations: "Cited 41 times" },
        next: "good_2_recovery"
      },
      {
        id: "pred",
        type: "predatory",
        title: "Smaller Classes Improve Test Scores by 40%: A Revolutionary Finding",
        journal: "International Journal of Educational Advancement and Innovation",
        authors: "Anderson, P.",
        year: "2025",
        details: { publisher: "Academic Journals Inc.", indexed: "Google Scholar only", peerReview: "\"Fast-track\" — 10 days", impact: "Not rated", citations: "1 self-citation" },
        next: "bad_2"
      }
    ]
  },
  {
    id: "good_2",
    phase: 2,
    story: {
      beat: "EDUCATION",
      headline: "Another Solid Story Filed",
      editor: "You're becoming the go-to for research-backed reporting."
    },
    narrative: "Your education piece cites a well-established meta-analysis from AERA. The findings are nuanced — class size effects vary by grade level and context. Your reporting reflects that complexity.\n\nA school board member references your article in a policy meeting. An education nonprofit shares it in their newsletter.\n\nYour editor mentions a promotion to the investigations team. One final story first — a politically sensitive piece on policing research.",
    timer: "PUBLISHED — Well received",
    feedback: { type: "good", label: "CREDIBILITY BUILDING", detail: "Two well-sourced stories in a row. Your reputation for careful research reporting is growing." },
    sources: [
      {
        id: "legit",
        type: "legitimate",
        title: "Community Policing and Crime Reduction: A Systematic Review of Randomized Controlled Trials",
        journal: "Criminology & Public Policy",
        authors: "Owens, E., Martinez, D., & Kim, J.",
        year: "2024",
        details: { publisher: "Wiley / ASC", indexed: "Scopus, Web of Science, Criminal Justice Abstracts", peerReview: "Double-blind", impact: "IF 4.9", citations: "Cited 37 times" },
        next: "good_ending"
      },
      {
        id: "pred",
        type: "predatory",
        title: "Community Policing Eliminates Crime by 60% in All Contexts",
        journal: "World Journal of Criminal Justice and Social Policy",
        authors: "Lee, H.",
        year: "2025",
        details: { publisher: "Global Research Publishing", indexed: "Not indexed", peerReview: "\"Expedited\" — 5 days", impact: "N/A", citations: "No citations" },
        next: "bad_from_good_ending"
      }
    ]
  },
  {
    id: "good_2_recovery",
    phase: 2,
    story: {
      beat: "EDUCATION",
      headline: "Learning from the First Mistake",
      editor: "The correction ran. Now prove you can source carefully."
    },
    narrative: "Your editor gave you a second chance. This time you checked the journal's indexing before citing. The AERA study is rock solid.\n\nYour education piece is measured and well-received. A professor shares it as an example of good science journalism.\n\nYou're not out of the woods yet — but you're rebuilding trust. One more assignment.",
    timer: "PUBLISHED — Reputation recovering",
    feedback: { type: "recovery", label: "COURSE CORRECTING", detail: "After the correction, you sourced carefully. Keep this up." },
    sources: [
      {
        id: "legit",
        type: "legitimate",
        title: "Community Policing and Crime Reduction: A Systematic Review of Randomized Controlled Trials",
        journal: "Criminology & Public Policy",
        authors: "Owens, E., Martinez, D., & Kim, J.",
        year: "2024",
        details: { publisher: "Wiley / ASC", indexed: "Scopus, Web of Science, Criminal Justice Abstracts", peerReview: "Double-blind", impact: "IF 4.9", citations: "Cited 37 times" },
        next: "recovery_ending"
      },
      {
        id: "pred",
        type: "predatory",
        title: "Community Policing Eliminates Crime by 60% in All Contexts",
        journal: "World Journal of Criminal Justice and Social Policy",
        authors: "Lee, H.",
        year: "2025",
        details: { publisher: "Global Research Publishing", indexed: "Not indexed", peerReview: "\"Expedited\" — 5 days", impact: "N/A", citations: "No citations" },
        next: "bad_ending_from_recovery"
      }
    ]
  },
  {
    id: "bad_2_from_good",
    phase: 2,
    story: {
      beat: "EDUCATION",
      headline: "\"40% Improvement\" Claim Draws Scrutiny",
      editor: "First miss in an otherwise strong record."
    },
    narrative: "The \"40% improvement\" stat was too clean. An education researcher points out the journal has no editorial board listing, and the publisher charges $500 per article with no real review process.\n\nYour editor runs a correction. Your previous credibility buys you some goodwill — but colleagues notice.\n\nOne more story. Make it count.",
    timer: "CORRECTION ISSUED — 48 hours after publication",
    feedback: { type: "bad", label: "FIRST MISS", detail: "A predatory source slipped through. Your track record absorbs the hit — barely." },
    sources: [
      {
        id: "legit",
        type: "legitimate",
        title: "Community Policing and Crime Reduction: A Systematic Review of Randomized Controlled Trials",
        journal: "Criminology & Public Policy",
        authors: "Owens, E., Martinez, D., & Kim, J.",
        year: "2024",
        details: { publisher: "Wiley / ASC", indexed: "Scopus, Web of Science, Criminal Justice Abstracts", peerReview: "Double-blind", impact: "IF 4.9", citations: "Cited 37 times" },
        next: "mixed_ending"
      }
    ]
  },
  {
    id: "bad_2",
    phase: 2,
    story: {
      beat: "EDUCATION",
      headline: "Second Correction in Two Weeks",
      editor: "We need to talk."
    },
    narrative: "The education story follows the same pattern — a dramatic stat from a journal with no real peer review. Another correction.\n\nTwo corrections in two weeks. Your editor pulls you from the investigations shortlist. A media watchdog blog writes about your outlet's \"sourcing problem\" — citing both your stories.\n\nYou get one more assignment. A policing story. No more room for error.",
    timer: "CORRECTION #2 — Credibility in freefall",
    feedback: { type: "bad", label: "PATTERN FORMING", detail: "Two predatory sources in two stories. Editors and readers are losing trust." },
    sources: [
      {
        id: "legit",
        type: "legitimate",
        title: "Community Policing and Crime Reduction: A Systematic Review of Randomized Controlled Trials",
        journal: "Criminology & Public Policy",
        authors: "Owens, E., Martinez, D., & Kim, J.",
        year: "2024",
        details: { publisher: "Wiley / ASC", indexed: "Scopus, Web of Science, Criminal Justice Abstracts", peerReview: "Double-blind", impact: "IF 4.9", citations: "Cited 37 times" },
        next: "late_recovery_ending"
      },
      {
        id: "pred",
        type: "predatory",
        title: "Community Policing Eliminates Crime by 60% in All Contexts",
        journal: "World Journal of Criminal Justice and Social Policy",
        authors: "Lee, H.",
        year: "2025",
        details: { publisher: "Global Research Publishing", indexed: "Not indexed", peerReview: "\"Expedited\" — 5 days", impact: "N/A", citations: "No citations" },
        next: "bad_ending"
      }
    ]
  },

  // ── ENDINGS ──────────────────────────────────────────────────────
  {
    id: "good_ending", phase: 3,
    ending: { type: "excellent", label: "GOLD STANDARD", color: "#1a7a42",
      headline: "Promoted to Investigations",
      summary: "Three stories, three credible sources. Your editor trusts your judgment. A school board cited your work. A cardiologist thanked you. You're known for reporting that holds up.",
      stats: { stories: 3, corrections: 0, credibility: "Excellent", readerTrust: "High" }
    }
  },
  {
    id: "bad_from_good_ending", phase: 3,
    ending: { type: "mixed", label: "STUMBLE AT THE FINISH", color: "#b8860b",
      headline: "Correction on Story #3",
      summary: "Two strong stories, then a predatory source on the final piece. Your track record absorbs the hit, but the promotion is delayed. A reminder that deadline pressure can override good instincts.",
      stats: { stories: 3, corrections: 1, credibility: "Recovering", readerTrust: "Moderate" }
    }
  },
  {
    id: "mixed_ending", phase: 3,
    ending: { type: "mixed", label: "LESSON LEARNED", color: "#b8860b",
      headline: "Back on Track — Barely",
      summary: "One clean story, one correction, one recovery. You learned to check journal indexing the hard way. Your editor keeps you on staff but watches more closely now.",
      stats: { stories: 3, corrections: 1, credibility: "Intact", readerTrust: "Rebuilding" }
    }
  },
  {
    id: "recovery_ending", phase: 3,
    ending: { type: "recovery", label: "REDEEMED", color: "#2a6496",
      headline: "Trust Rebuilt",
      summary: "You made a mistake, owned it, and sourced carefully from then on. Your editor noticed the turnaround. The correction still stings — but you now check every journal before citing.",
      stats: { stories: 3, corrections: 1, credibility: "Rebuilding", readerTrust: "Growing" }
    }
  },
  {
    id: "bad_ending_from_recovery", phase: 3,
    ending: { type: "bad", label: "CREDIBILITY LOST", color: "#b5302a",
      headline: "Reassigned Off the Beat",
      summary: "Two corrections. The same pattern: dramatic claims from unverified journals. Your editor moves you off research-based reporting. Readers flagged both errors before your fact-checker did.",
      stats: { stories: 3, corrections: 2, credibility: "Damaged", readerTrust: "Low" }
    }
  },
  {
    id: "late_recovery_ending", phase: 3,
    ending: { type: "recovery", label: "LAST CHANCE TAKEN", color: "#2a6496",
      headline: "Stayed on Staff",
      summary: "Two early corrections nearly ended your run. But your final story was airtight — credible source, nuanced findings, solid reporting. Your editor gives you a probationary path forward.",
      stats: { stories: 3, corrections: 2, credibility: "Fragile", readerTrust: "Uncertain" }
    }
  },
  {
    id: "bad_ending", phase: 3,
    ending: { type: "terrible", label: "CAREER DAMAGE", color: "#8b1a1a",
      headline: "Let Go from the Newsroom",
      summary: "Three corrections. A media ethics blog profiled your outlet's sourcing failures. Your editor cited a \"pattern of insufficient verification.\" The studies you cited were never peer-reviewed — and readers paid the price with bad information on health, education, and policing.",
      stats: { stories: 3, corrections: 3, credibility: "Destroyed", readerTrust: "Gone" }
    }
  }
];

const SOURCE_RED_FLAGS = [
  "Journal not indexed in Scopus, Web of Science, or PubMed",
  "\"Rapid\" or \"fast-track\" peer review (days, not months)",
  "Single author with no institutional affiliation listed",
  "Overly dramatic claims (\"eliminates,\" \"73% increase,\" absolute language)",
  "No impact factor or citation history",
  "Publisher name is generic (\"Global Research Publishing\")",
  "Article processing fee with no transparency about review process",
  "Journal scope is impossibly broad"
];

// ─── COMPONENTS ──────────────────────────────────────────────────────

function TickerBar({ text }) {
  return (
    <div style={{
      background: "var(--ink)", color: "var(--paper)", padding: "8px 0",
      fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "1.5px",
      overflow: "hidden", whiteSpace: "nowrap", marginBottom: "32px"
    }}>
      <div style={{ display: "inline-block", animation: "ticker 20s linear infinite", paddingLeft: "100%" }}>
        {text}&emsp;&emsp;◆&emsp;&emsp;{text}&emsp;&emsp;◆&emsp;&emsp;{text}
      </div>
    </div>
  );
}

function DeadlineBadge({ text }) {
  const isUrgent = text.includes("Deadline") || text.includes("CORRECTION");
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      padding: "8px 16px", borderRadius: "4px", marginBottom: "24px",
      background: isUrgent ? "var(--alert-bg)" : "var(--muted-bg)",
      border: `1px solid ${isUrgent ? "var(--alert-border)" : "var(--rule)"}`,
      fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 600,
      letterSpacing: "1px", color: isUrgent ? "var(--alert)" : "var(--dim)"
    }}>
      {isUrgent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--alert)", animation: "pulse 1.5s infinite" }} />}
      {text}
    </div>
  );
}

function StoryContext({ story }) {
  return (
    <div style={{
      borderLeft: "3px solid var(--ink)", paddingLeft: "20px",
      marginBottom: "28px"
    }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "3px", color: "var(--dim)", marginBottom: "6px", fontWeight: 700 }}>{story.beat}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: "22px", fontWeight: 700, lineHeight: 1.2, color: "var(--ink)", marginBottom: "8px" }}>{story.headline}</div>
      <div style={{ fontSize: "14px", color: "var(--dim)", fontStyle: "italic", lineHeight: 1.5 }}>{story.editor}</div>
    </div>
  );
}

function SourceCard({ source, onSelect, index, visible }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isPred = source.type === "predatory";

  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--paper)", border: `1.5px solid ${hovered ? "var(--ink)" : "var(--rule)"}`,
        borderRadius: "8px", padding: "24px", marginBottom: "12px",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `all 0.4s cubic-bezier(0.23,1,0.32,1) ${index * 0.12}s, border-color 0.2s`,
        cursor: "default"
      }}
    >
      {/* Journal name */}
      <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "1.5px", color: "var(--dim)", marginBottom: "8px", fontWeight: 600 }}>
        {source.journal.toUpperCase()} · {source.year}
      </div>

      {/* Title */}
      <div style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: 600, lineHeight: 1.35, color: "var(--ink)", marginBottom: "8px" }}>
        {source.title}
      </div>

      {/* Authors */}
      <div style={{ fontSize: "13px", color: "var(--dim)", marginBottom: "16px" }}>{source.authors}</div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent)",
          letterSpacing: "0.5px", fontWeight: 600, marginBottom: expanded ? "14px" : "16px"
        }}
      >
        {expanded ? "▾ Hide details" : "▸ Check journal details"}
      </button>

      {expanded && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px",
          padding: "16px", background: "var(--surface)", borderRadius: "6px",
          marginBottom: "16px", animation: "fadeUp 0.25s ease"
        }}>
          {Object.entries(source.details).map(([key, val]) => (
            <div key={key}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "1.5px", color: "var(--dim)", marginBottom: "3px", textTransform: "uppercase" }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div style={{
                fontSize: "13px", fontWeight: 500, lineHeight: 1.4,
                color: (val.includes("Not") || val.includes("N/A") || val.includes("Google Scholar only") || val.includes("No citations") || val.includes("self-citation") || val.includes("Rapid") || val.includes("Fast") || val.includes("Expedited")) ? "var(--alert)" : "var(--ink)"
              }}>
                {val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cite button */}
      <button
        onClick={() => onSelect(source)}
        style={{
          width: "100%", padding: "12px", borderRadius: "6px", cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px",
          background: hovered ? "var(--ink)" : "transparent",
          color: hovered ? "var(--paper)" : "var(--ink)",
          border: `1.5px solid var(--ink)`,
          transition: "all 0.2s"
        }}
      >
        CITE THIS SOURCE
      </button>
    </div>
  );
}

function FeedbackBanner({ feedback }) {
  const colors = {
    good: { bg: "#edf7ed", border: "#b7ddb7", text: "#1a5c2a" },
    bad: { bg: "#fdecea", border: "#f5c6c2", text: "#8b1a1a" },
    recovery: { bg: "#e8f0fe", border: "#b3cde3", text: "#1a4a7a" }
  };
  const c = colors[feedback.type] || colors.recovery;

  return (
    <div style={{
      padding: "18px 22px", borderRadius: "8px", marginBottom: "28px",
      background: c.bg, border: `1px solid ${c.border}`,
      animation: "slideIn 0.4s ease"
    }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "2px", fontWeight: 700, color: c.text, marginBottom: "6px" }}>
        {feedback.label}
      </div>
      <div style={{ fontSize: "14px", color: c.text, lineHeight: 1.55 }}>{feedback.detail}</div>
    </div>
  );
}

function Typewriter({ text, speed = 7, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => { setDisplayed(""); setDone(false); idx.current = 0; }, [text]);
  useEffect(() => {
    if (done) return;
    const iv = setInterval(() => {
      if (idx.current < text.length) { setDisplayed(text.slice(0, ++idx.current)); }
      else { setDone(true); clearInterval(iv); onComplete?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, done, onComplete]);

  const skip = () => { setDisplayed(text); setDone(true); idx.current = text.length; onComplete?.(); };

  return (
    <div onClick={skip} style={{ cursor: done ? "default" : "pointer" }}>
      {displayed.split("\n").map((l, i) => <p key={i} style={{ margin: "0 0 14px", minHeight: l ? "auto" : "14px" }}>{l}</p>)}
      {!done && <span style={{ opacity: 0.35, fontFamily: "var(--mono)", fontSize: "10px", fontStyle: "italic" }}>click to skip</span>}
    </div>
  );
}

function EndingScreen({ ending, history, onRestart }) {
  const colors = {
    excellent: { bg: "#edf7ed", border: "#b7ddb7" },
    recovery: { bg: "#e8f0fe", border: "#b3cde3" },
    mixed: { bg: "#fef7e0", border: "#f0dfa0" },
    bad: { bg: "#fdecea", border: "#f5c6c2" },
    terrible: { bg: "#fdecea", border: "#e8a09a" }
  };
  const c = colors[ending.type] || colors.mixed;

  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      {/* Result card */}
      <div style={{ padding: "36px 28px", borderRadius: "12px", background: c.bg, border: `1.5px solid ${c.border}`, marginBottom: "28px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "3px", color: ending.color, marginBottom: "14px" }}>
          {ending.label}
        </div>
        <div style={{ fontFamily: "var(--display)", fontSize: "24px", fontWeight: 700, color: "var(--ink)", marginBottom: "14px", lineHeight: 1.2 }}>
          {ending.headline}
        </div>
        <div style={{ fontSize: "15px", color: "var(--dim)", lineHeight: 1.65, maxWidth: "440px", margin: "0 auto" }}>
          {ending.summary}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: "var(--rule)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
        {Object.entries(ending.stats).map(([k, v]) => (
          <div key={k} style={{ padding: "16px 10px", background: "var(--paper)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "1.5px", color: "var(--dim)", marginBottom: "4px", textTransform: "uppercase" }}>{k.replace(/([A-Z])/g, ' $1')}</div>
            <div style={{ fontSize: k === "credibility" || k === "readerTrust" ? "14px" : "20px", fontWeight: 700, fontFamily: k === "credibility" || k === "readerTrust" ? "var(--body)" : "var(--mono)", color: (v === "Destroyed" || v === "Gone" || v === "Damaged" || v === "Low") ? "var(--alert)" : "var(--ink)" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Path */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "32px" }}>
        {history.map((h, i) => (
          <span key={i} style={{
            fontFamily: "var(--mono)", fontSize: "10px", padding: "4px 12px", borderRadius: "4px",
            background: h === "predatory" ? "var(--alert-bg)" : "#edf7ed",
            color: h === "predatory" ? "var(--alert)" : "#1a5c2a",
            fontWeight: 600
          }}>
            {h === "predatory" ? "✕" : "✓"} Story {i + 1}
          </span>
        ))}
      </div>

      {/* THE KEY CTA — Survey link */}
      <div style={{
        padding: "32px 28px", borderRadius: "12px",
        background: "var(--ink)", color: "var(--paper)",
        textAlign: "center", marginBottom: "24px"
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "3px", marginBottom: "14px", opacity: 0.6 }}>FROM THE RESEARCHERS</div>
        <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 700, lineHeight: 1.3, marginBottom: "12px" }}>
          This problem is real — and we're studying it.
        </div>
        <div style={{ fontSize: "14px", lineHeight: 1.65, opacity: 0.8, marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
          Researchers at CMC's STATS Lab are studying how people — including journalists — evaluate academic sources. Your perspective would be invaluable.
        </div>
        <a
          href="https://cmcstatslab.qualtrics.com"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-block", padding: "14px 40px", borderRadius: "6px",
            background: "var(--paper)", color: "var(--ink)",
            fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 700,
            letterSpacing: "0.5px", textDecoration: "none",
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >
          TAKE THE 5-MIN SURVEY →
        </a>
      </div>

      {/* Replay / Flags */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={onRestart} style={{
          padding: "12px 28px", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700,
          letterSpacing: "0.5px", background: "var(--ink)", color: "var(--paper)",
          border: "none", borderRadius: "6px", cursor: "pointer"
        }}>PLAY AGAIN</button>
        <button onClick={() => document.getElementById("flag-guide")?.scrollIntoView({ behavior: "smooth" })} style={{
          padding: "12px 20px", fontFamily: "var(--mono)", fontSize: "12px",
          background: "none", color: "var(--dim)", border: "1.5px solid var(--rule)",
          borderRadius: "6px", cursor: "pointer", letterSpacing: "0.5px"
        }}>RED FLAG CHECKLIST</button>
      </div>

      {/* Red Flag Guide */}
      <div id="flag-guide" style={{ marginTop: "48px", paddingTop: "32px", borderTop: "2px solid var(--rule)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "3px", color: "var(--dim)", marginBottom: "8px", fontWeight: 700 }}>SOURCING CHECKLIST</div>
        <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 700, color: "var(--ink)", marginBottom: "20px" }}>Before You Cite: Red Flags to Watch For</div>
        {SOURCE_RED_FLAGS.map((f, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            padding: "12px 0", borderBottom: "1px solid var(--rule)"
          }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--alert)", fontWeight: 700, marginTop: "1px" }}>⚑</span>
            <span style={{ fontSize: "14px", color: "var(--ink)", lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
        <div style={{ marginTop: "20px", fontSize: "13px", color: "var(--dim)", lineHeight: 1.7 }}>
          Resources: <a href="https://thinkchecksubmit.org/" target="_blank" rel="noopener noreferrer">Think. Check. Submit.</a> · <a href="https://beallslist.net/" target="_blank" rel="noopener noreferrer">Beall's List</a> · <a href="https://doaj.org/" target="_blank" rel="noopener noreferrer">DOAJ</a>
        </div>
      </div>
    </div>
  );
}

function ProgressDots({ phase, total = 3 }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "28px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: i <= phase ? "28px" : "8px", height: "8px",
            borderRadius: "4px",
            background: i <= phase ? "var(--ink)" : "var(--rule)",
            transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)"
          }} />
        </div>
      ))}
      <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--dim)", marginLeft: "8px" }}>STORY {Math.min(phase + 1, total)} OF {total}</span>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────

export default function DeadlineCheck() {
  const [screen, setScreen] = useState("title");
  const [currentId, setCurrentId] = useState("intro");
  const [history, setHistory] = useState([]);
  const [sourcesVisible, setSources] = useState(false);
  const [textDone, setTextDone] = useState(false);
  const ref = useRef(null);

  const scenario = SCENARIOS.find(s => s.id === currentId);

  const restart = () => { setScreen("game"); setCurrentId("intro"); setHistory([]); setSources(false); setTextDone(false); };

  const selectSource = (source) => {
    setHistory(prev => [...prev, source.type]);
    setSources(false); setTextDone(false);
    setTimeout(() => { setCurrentId(source.next); ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }, 250);
  };

  const textComplete = useCallback(() => {
    setTextDone(true);
    setTimeout(() => setSources(true), 150);
  }, []);

  return (
    <div style={{
      "--ink": "#1a1a18", "--paper": "#faf9f6", "--surface": "#f0efeb",
      "--rule": "#ddd9d0", "--dim": "#7a766e", "--muted-bg": "#f0efeb",
      "--accent": "#1a4a7a", "--alert": "#b5302a", "--alert-bg": "#fdecea", "--alert-border": "#f5c6c2",
      "--mono": "'IBM Plex Mono', 'JetBrains Mono', monospace",
      "--display": "'Fraunces', 'Playfair Display', Georgia, serif",
      "--body": "'Newsreader', 'Source Serif 4', Georgia, serif",
      fontFamily: "var(--body)", background: "var(--paper)", color: "var(--ink)",
      minHeight: "100vh", lineHeight: 1.65
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.1); border-radius:3px; }
        a { color: var(--accent); }
        a:hover { opacity:0.7; }
        button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
      `}</style>

      <div ref={ref} style={{ maxWidth: "620px", margin: "0 auto", padding: "0 24px", overflowY: "auto", maxHeight: "100vh" }}>

        {/* ── TITLE ── */}
        {screen === "title" && (
          <div style={{ animation: "fadeUp 0.6s ease" }}>
            <div style={{
              background: "var(--ink)", color: "var(--paper)", padding: "8px 0",
              fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "2px",
              textAlign: "center", margin: "0 -24px 48px", fontWeight: 600
            }}>
              STATS LAB AT CMC — INTERACTIVE SIMULATION
            </div>

            <div style={{ minHeight: "75vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "3px", color: "var(--dim)", marginBottom: "20px", fontWeight: 700 }}>
                A SIMULATION FOR JOURNALISTS
              </div>
              <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(36px,7vw,54px)", fontWeight: 800, lineHeight: 1.05, marginBottom: "24px", letterSpacing: "-0.5px" }}>
                You're on Deadline.<br />
                <span style={{ fontStyle: "italic" }}>Can You Spot the<br />Bad Science?</span>
              </h1>
              <p style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--dim)", marginBottom: "16px", maxWidth: "460px" }}>
                You're a reporter at a national outlet. Three stories, three sourcing decisions. Every citation you choose shapes what millions of readers believe.
              </p>
              <p style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--dim)", marginBottom: "40px", letterSpacing: "0.3px" }}>
                3 stories · ~5 min · 7 possible endings
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={restart} style={{
                  padding: "16px 44px", fontSize: "13px", fontWeight: 700, fontFamily: "var(--mono)",
                  letterSpacing: "1px", background: "var(--ink)", color: "var(--paper)",
                  borderRadius: "6px", textTransform: "uppercase"
                }}>START REPORTING</button>
              </div>

              <div style={{ marginTop: "64px", paddingTop: "20px", borderTop: "2px solid var(--rule)" }}>
                <div style={{ fontSize: "13px", color: "var(--dim)", lineHeight: 1.7 }}>
                  Built by the <strong style={{ color: "var(--ink)" }}>STATS Lab at Claremont McKenna College</strong> as part of an ongoing study on how predatory academic journals affect public information.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── GAME ── */}
        {screen === "game" && scenario && !scenario.ending && (
          <div key={scenario.id} style={{ animation: "fadeUp 0.45s ease", paddingTop: "32px", paddingBottom: "48px" }}>
            <ProgressDots phase={scenario.phase} />

            {scenario.feedback && <FeedbackBanner feedback={scenario.feedback} />}

            <DeadlineBadge text={scenario.timer} />

            <StoryContext story={scenario.story} />

            <div style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--dim)", marginBottom: "32px" }}>
              <Typewriter key={scenario.id} text={scenario.narrative} speed={5} onComplete={textComplete} />
            </div>

            {textDone && scenario.sources && (
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "2px", color: "var(--dim)", marginBottom: "14px", fontWeight: 700 }}>
                  SELECT A SOURCE TO CITE
                </div>
                {scenario.sources.map((s, i) => (
                  <SourceCard key={s.id} source={s} onSelect={selectSource} index={i} visible={sourcesVisible} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ENDING ── */}
        {screen === "game" && scenario && scenario.ending && (
          <div style={{ paddingTop: "32px", paddingBottom: "64px" }}>
            <ProgressDots phase={3} />
            <EndingScreen ending={scenario.ending} history={history} onRestart={restart} />
          </div>
        )}
      </div>
    </div>
  );
}
