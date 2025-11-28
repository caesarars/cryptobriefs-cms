import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { generateBlogPost, generateIdeasTrends, generateImage, generateOptimizedTitle } from '../services/geminiService';
import { IconSparkles } from './Icon';
import Spinner from './Spinner';
import SuccessModal from './SuccessPopUp';

const DEFAULT_TONE = 'Professional';
const DEFAULT_LENGTH = 'Medium (~400-500 words)';
const DEFAULT_AUDIENCE = 'General Audience';
const DEFAULT_TAGS = 'AI,crypto,trading,Portfolio,Technology,Blockchain,Cryptocurrency,Crypto,bots,Bitcoin,btc';

const extractIdeas = (rawText: string): string[] => {
  return Array.from(rawText.matchAll(/\d+\.\s+(.*)/g)).map(match => match[1]?.trim()).filter(Boolean) as string[];
};

const OneClickPost: React.FC = () => {
  const BASE_URL_API = process.env.BASE_URL_API;

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState<string[]>([]);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [heroImagePreview, setHeroImagePreview] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [slug, setSlug] = useState('');

  const appendStatus = useCallback((message: string) => {
    setStatusUpdates(prev => [...prev, message]);
  }, []);

  const uploadImage = useCallback(async (imageBase64: string) => {
    if (!BASE_URL_API) {
      throw new Error('BASE_URL_API is not configured.');
    }
    const uploadUrl = `${BASE_URL_API}api/upload`;
    const response = await axios.post(uploadUrl, { base64: imageBase64 });
    return response.data.url as string;
  }, [BASE_URL_API]);

  const handleOneClickPublish = useCallback(async () => {
    if (!BASE_URL_API) {
      setError('BASE_URL_API is not configured. Please set it before publishing.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusUpdates([]);
    setGeneratedContent('');
    setGeneratedTitle('');
    setHeroImagePreview('');
    setShowModal(false);
    setSlug('');

    try {
      appendStatus('Scanning viral crypto narratives...');
      const ideaText = await generateIdeasTrends();
      const ideas = extractIdeas(ideaText);
      const ideaTitle = ideas[0];

      if (!ideaTitle) {
        throw new Error('Could not extract a trending idea from the AI response.');
      }

      appendStatus('Optimizing headline with Gemini...');
      const optimizedFromGemini = await generateOptimizedTitle(ideaTitle);
      const optimizedTitle = optimizedFromGemini && !optimizedFromGemini.toLowerCase().includes('error')
        ? optimizedFromGemini
        : ideaTitle;
      setGeneratedTitle(optimizedTitle);
      appendStatus(`Selected topic: ${optimizedTitle}`);

      appendStatus('Writing article draft with Gemini...');
      const article = await generateBlogPost(optimizedTitle, DEFAULT_TONE, DEFAULT_LENGTH, DEFAULT_AUDIENCE);
      setGeneratedContent(article);

      appendStatus('Generating hero image...');
      const imageResponse = await generateImage(ideaTitle, DEFAULT_TONE);

      let uploadedImageUrl = '';
      if (typeof imageResponse !== 'string' && imageResponse?.base64) {
        setHeroImagePreview(imageResponse.previewImage);
        uploadedImageUrl = await uploadImage(imageResponse.base64);
      }

      appendStatus('Publishing blog post to CMS...');
      console.log('url post : ', `${BASE_URL_API}api/blog` )
      const blogResponse = await axios.post(`${BASE_URL_API}api/blog`, {
        title: optimizedTitle,
        content: article,
        blog: optimizedTitle,
        tag: DEFAULT_TAGS,
        imageUrl: uploadedImageUrl
      });
      console.log('blog response = ' , blogResponse)
      

      const createdSlug = blogResponse.data.blog.slug as string;
      setSlug(createdSlug);
      appendStatus('Blog post published successfully.');
      setShowModal(true);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to create blog post.';
      setError(message);
      appendStatus('Generation aborted due to an error.');
    } finally {
      setIsGenerating(false);
    }
  }, [BASE_URL_API, appendStatus, uploadImage]);

  return (
    <div className="max-w-3xl mx-auto bg-brand-secondary p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-3">One-Click AI Blog</h1>
      <p className="text-brand-text-secondary mb-6">
        Generate a full post from the hottest crypto narratives—topic, draft, and header image—with a single click.
      </p>

      <button
        type="button"
        onClick={handleOneClickPublish}
        disabled={isGenerating}
        className="w-full flex items-center justify-center bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-accent-hover transition-colors disabled:bg-slate-600"
      >
        {isGenerating ? (
          <>
            <Spinner />
            <span className="ml-2">Publishing...</span>
          </>
        ) : (
          <>
            <IconSparkles className="h-5 w-5 mr-2" />
            Generate & Publish
          </>
        )}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {statusUpdates.length > 0 && (
        <div className="mt-6 bg-brand-primary border border-slate-700 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
          {statusUpdates.map((status, index) => (
            <p key={`${status}-${index}`} className="text-sm text-brand-text-secondary">
              {status}
            </p>
          ))}
        </div>
      )}

      {generatedTitle && (
        <div className="mt-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Generated Title</h2>
            <p className="text-brand-text-secondary mt-1">{generatedTitle}</p>
          </div>
          {heroImagePreview && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Header Image Preview</h3>
              <img src={heroImagePreview} alt="Generated header" className="w-full rounded-lg" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Draft Preview</h3>
            <textarea
              readOnly
              value={generatedContent}
              className="w-full bg-brand-primary border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-brand-accent min-h-[240px]"
            />
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        postUrl={slug ? `https://www.cryptobriefs.net/blog/${slug}` : ''}
      />
    </div>
  );
};

export default OneClickPost;
