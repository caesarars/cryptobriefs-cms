import axios from "axios";
import React, { useCallback, useState } from "react";
import { generateBlogPost, generateImage, generateOptimizedTitle } from "../services/geminiService";
import Spinner from "./Spinner";
import SuccessModal from "./SuccessPopUp";

const DEFAULT_TONE = "Professional";
const DEFAULT_LENGTH = "Medium (~400-500 words)";
const DEFAULT_AUDIENCE = "General Audience";
const DEFAULT_TAGS =
  "AI,crypto,trading,Portfolio,Technology,Blockchain,Cryptocurrency,Crypto,bots,Bitcoin,btc";

const AIDraftGenerator: React.FC = () => {
  const BASE_URL_API = process.env.BASE_URL_API;

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState(DEFAULT_TONE);
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [audience, setAudience] = useState(DEFAULT_AUDIENCE);

  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [heroImagePreview, setHeroImagePreview] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");

  const [slug, setSlug] = useState("");
  const [showModal, setShowModal] = useState(false);

  const append = useCallback((msg: string) => setStatus((prev) => [...prev, msg]), []);

  const uploadImage = useCallback(
    async (imageBase64: string) => {
      if (!BASE_URL_API) throw new Error("BASE_URL_API is not configured.");
      const uploadUrl = `${BASE_URL_API}api/upload`;
      const response = await axios.post(uploadUrl, { base64: imageBase64 });
      return response.data.url as string;
    },
    [BASE_URL_API]
  );

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setIsWorking(true);
    setError(null);
    setStatus([]);
    setTitle("");
    setContent("");
    setHeroImagePreview("");
    setHeroImageUrl("");
    setShowModal(false);
    setSlug("");

    try {
      append("Optimizing title...");
      const opt = await generateOptimizedTitle(topic);
      const finalTitle = opt && !opt.toLowerCase().includes("error") ? opt : topic;
      setTitle(finalTitle);

      append("Writing article draft...");
      const article = await generateBlogPost(finalTitle, tone, length, audience);
      setContent(article);

      append("Generating hero image...");
      const imageResponse = await generateImage(finalTitle, tone);

      if (typeof imageResponse !== "string" && imageResponse?.base64) {
        setHeroImagePreview(imageResponse.previewImage);
        const uploaded = await uploadImage(imageResponse.base64);
        setHeroImageUrl(uploaded);
      }

      append("Draft ready.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Generation failed.");
      append("Generation aborted.");
    } finally {
      setIsWorking(false);
    }
  }, [append, audience, length, tone, topic, uploadImage]);

  const handlePublish = useCallback(async () => {
    if (!BASE_URL_API) {
      setError("BASE_URL_API is not configured.");
      return;
    }
    if (!title || !content) {
      setError("Generate draft first.");
      return;
    }

    setIsWorking(true);
    setError(null);

    try {
      append("Publishing blog post...");
      const blogResponse = await axios.post(`${BASE_URL_API}api/blog`, {
        title,
        content,
        blog: title,
        tag: DEFAULT_TAGS,
        imageUrl: heroImageUrl,
      });

      const createdSlug = blogResponse.data.blog.slug as string;
      setSlug(createdSlug);
      append("Published successfully.");
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Publish failed.");
      append("Publish aborted.");
    } finally {
      setIsWorking(false);
    }
  }, [BASE_URL_API, append, content, heroImageUrl, title]);

  return (
    <div className="max-w-3xl mx-auto bg-brand-secondary p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-3">AI Draft Generator</h1>
      <p className="text-brand-text-secondary mb-6">
        Generate a draft (title + content + image), review it, then publish.
      </p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-brand-text-secondary">Topic</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Why ETH restaking is changing DeFi risk"
            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-brand-text-secondary">Tone</span>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-brand-text-secondary">Length</span>
            <input
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-brand-text-secondary">Audience</span>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={isWorking}
            className="bg-brand-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-accent-hover disabled:opacity-60"
          >
            {isWorking ? "Working..." : "Generate draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={isWorking}
            className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 disabled:opacity-60"
          >
            Publish
          </button>
        </div>

        {isWorking ? (
          <div className="flex items-center gap-3 text-brand-text-secondary">
            <Spinner />
            <span>Processing…</span>
          </div>
        ) : null}

        {status.length ? (
          <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 text-sm text-brand-text-secondary">
            <div className="font-semibold text-white mb-2">Status</div>
            <ul className="list-disc pl-5 space-y-1">
              {status.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-3">
            {error}
          </div>
        ) : null}

        {title || content ? (
          <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
            <div className="text-white font-semibold mb-2">Preview</div>
            {heroImagePreview ? (
              <img src={heroImagePreview} alt="hero" className="w-full rounded-lg mb-3" />
            ) : null}
            {title ? <div className="text-xl font-bold text-white mb-2">{title}</div> : null}
            {content ? (
              <pre className="whitespace-pre-wrap text-sm text-brand-text-secondary">{content}</pre>
            ) : null}
          </div>
        ) : null}
      </div>

      {showModal ? (
        <SuccessModal
          slug={slug}
          onClose={() => setShowModal(false)}
        />
      ) : null}
    </div>
  );
};

export default AIDraftGenerator;
