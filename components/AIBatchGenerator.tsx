import axios from "axios";
import React, { useCallback, useMemo, useState } from "react";
import { generateBlogPost, generateIdeasTrends, generateOptimizedTitle } from "../services/geminiService";
import Spinner from "./Spinner";

const DEFAULT_TONE = "Professional";
const DEFAULT_LENGTH = "Medium (~400-500 words)";
const DEFAULT_AUDIENCE = "General Audience";
const DEFAULT_TAGS =
  "AI,crypto,trading,Portfolio,Technology,Blockchain,Cryptocurrency,Crypto,bots,Bitcoin,btc";

const extractIdeas = (rawText: string): string[] => {
  return Array.from(rawText.matchAll(/\d+\.\s+(.*)/g))
    .map((match) => match[1]?.trim())
    .filter(Boolean) as string[];
};

type Draft = {
  id: string;
  topic: string;
  title: string;
  content: string;
  status: "draft" | "publishing" | "published" | "error";
  error?: string;
  slug?: string;
};

const AIBatchGenerator: React.FC = () => {
  const BASE_URL_API = process.env.BASE_URL_API;

  const [tone, setTone] = useState(DEFAULT_TONE);
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [audience, setAudience] = useState(DEFAULT_AUDIENCE);

  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectedIdeas = useMemo(() => ideas.filter((i) => selected[i]), [ideas, selected]);

  const append = useCallback((msg: string) => setLog((prev) => [...prev, msg]), []);

  const loadIdeas = useCallback(async () => {
    setIsLoadingIdeas(true);
    setError(null);
    setLog([]);

    try {
      append("Fetching trending ideas...");
      const raw = await generateIdeasTrends();
      const list = extractIdeas(raw);
      setIdeas(list);
      const initial: Record<string, boolean> = {};
      list.slice(0, 5).forEach((t) => (initial[t] = true));
      setSelected(initial);
      append(`Loaded ${list.length} ideas.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load ideas");
      append("Failed to load ideas.");
    } finally {
      setIsLoadingIdeas(false);
    }
  }, [append]);

  const generateBatch = useCallback(async () => {
    if (!selectedIdeas.length) {
      setError("Select at least 1 idea.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setDrafts([]);
    setLog([]);

    try {
      const out: Draft[] = [];
      for (const idea of selectedIdeas) {
        append(`Optimizing title: ${idea}`);
        const opt = await generateOptimizedTitle(idea);
        const finalTitle = opt && !opt.toLowerCase().includes("error") ? opt : idea;

        append(`Generating draft: ${finalTitle}`);
        const article = await generateBlogPost(finalTitle, tone, length, audience);

        out.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          topic: idea,
          title: finalTitle,
          content: article,
          status: "draft",
        });
        setDrafts([...out]);
      }

      append("Batch draft generation complete.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Batch generation failed.");
      append("Batch generation aborted.");
    } finally {
      setIsGenerating(false);
    }
  }, [append, audience, length, selectedIdeas, tone]);

  const publishDraft = useCallback(
    async (draftId: string) => {
      if (!BASE_URL_API) {
        setError("BASE_URL_API is not configured.");
        return;
      }

      setDrafts((prev) =>
        prev.map((d) => (d.id === draftId ? { ...d, status: "publishing", error: undefined } : d))
      );

      const draft = drafts.find((d) => d.id === draftId);
      if (!draft) return;

      try {
        const resp = await axios.post(`${BASE_URL_API}api/blog`, {
          title: draft.title,
          content: draft.content,
          blog: draft.title,
          tag: DEFAULT_TAGS,
          imageUrl: "", // batch: no image for speed/cost
        });

        const createdSlug = resp.data.blog.slug as string;
        setDrafts((prev) =>
          prev.map((d) => (d.id === draftId ? { ...d, status: "published", slug: createdSlug } : d))
        );
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Publish failed";
        setDrafts((prev) => prev.map((d) => (d.id === draftId ? { ...d, status: "error", error: msg } : d)));
      }
    },
    [BASE_URL_API, drafts]
  );

  return (
    <div className="max-w-4xl mx-auto bg-brand-secondary p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-3">AI Batch Generator</h1>
      <p className="text-brand-text-secondary mb-6">
        Generate multiple drafts from trending ideas. You can publish each draft after review.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <label className="block">
          <span className="text-sm font-medium text-brand-text-secondary">Tone</span>
          <input value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-brand-text-secondary">Length</span>
          <input value={length} onChange={(e) => setLength(e.target.value)} className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-brand-text-secondary">Audience</span>
          <input value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={loadIdeas}
          disabled={isLoadingIdeas || isGenerating}
          className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 disabled:opacity-60"
        >
          {isLoadingIdeas ? "Loading ideas..." : "Load trending ideas"}
        </button>
        <button
          onClick={generateBatch}
          disabled={isGenerating || isLoadingIdeas || !ideas.length}
          className="bg-brand-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-accent-hover disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : `Generate drafts (${selectedIdeas.length})`}
        </button>
      </div>

      {(isLoadingIdeas || isGenerating) ? (
        <div className="flex items-center gap-3 text-brand-text-secondary mt-4">
          <Spinner />
          <span>Working…</span>
        </div>
      ) : null}

      {error ? (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-3 mt-4">{error}</div>
      ) : null}

      {ideas.length ? (
        <div className="mt-5 bg-slate-900/60 border border-slate-700 rounded-lg p-4">
          <div className="text-white font-semibold mb-2">Select ideas</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ideas.map((idea) => (
              <label key={idea} className="flex items-start gap-3 text-brand-text-secondary">
                <input
                  type="checkbox"
                  checked={Boolean(selected[idea])}
                  onChange={(e) => setSelected((prev) => ({ ...prev, [idea]: e.target.checked }))}
                  className="mt-1"
                />
                <span>{idea}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {log.length ? (
        <div className="mt-5 bg-slate-900/60 border border-slate-700 rounded-lg p-4 text-sm text-brand-text-secondary">
          <div className="font-semibold text-white mb-2">Log</div>
          <ul className="list-disc pl-5 space-y-1">
            {log.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {drafts.length ? (
        <div className="mt-6 space-y-3">
          <div className="text-white font-semibold">Drafts</div>
          {drafts.map((d) => (
            <div key={d.id} className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="text-white font-semibold">{d.title}</div>
                  <div className="text-xs text-brand-text-secondary mt-1">topic: {d.topic}</div>
                </div>
                <div className="flex items-center gap-2">
                  {d.status === "published" && d.slug ? (
                    <a className="text-brand-accent underline" href={`https://cryptobriefs.net/blog/${d.slug}`} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : null}
                  <button
                    onClick={() => publishDraft(d.id)}
                    disabled={d.status === "publishing" || d.status === "published"}
                    className="bg-brand-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-accent-hover disabled:opacity-60"
                  >
                    {d.status === "publishing" ? "Publishing..." : d.status === "published" ? "Published" : "Publish"}
                  </button>
                </div>
              </div>

              {d.error ? (
                <div className="mt-2 text-sm text-red-200">{d.error}</div>
              ) : null}

              <details className="mt-3">
                <summary className="cursor-pointer text-brand-text-secondary">Preview content</summary>
                <pre className="whitespace-pre-wrap text-sm text-brand-text-secondary mt-2">{d.content}</pre>
              </details>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AIBatchGenerator;
