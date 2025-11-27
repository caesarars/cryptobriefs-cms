import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateBlogPost, generateIdeasTrends, generateImage, generateOptimizedTitle } from '../services/geminiService';
import { Post } from '../types';
import { IconCopy, IconPhoto, IconSparkles } from './Icon';
import Spinner from './Spinner';
import SuccessModal from './SuccessPopUp';

interface PostFormProps {
  posts?: Post[];
  onSave: (post: Omit<Post, 'id' | 'date'> | Post) => void;
}

const PostForm: React.FC<PostFormProps> = ({ posts, onSave }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium (~400-500 words)');
  const [targetAudience, setTargetAudience] = useState('General Audience');
  const [copyButtonText, setCopyButtonText] = useState('Copy as Plain Text');
  const [listOfIdeas, setListOfIdeas] = useState([])
  const [selectedIdea, setSelectedIdea] = useState('');
  const [slug, setSlug] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizingTitle, setIsOptimizingTitle] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGenerateIdeas , setIsGenerateIdeas] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [imageUrlFirebase, setImageUrlFirebase] = useState('')

  const BASE_URL_API = process.env.BASE_URL_API;


  useEffect(() => {
    if (id && posts) {
      const postToEdit = posts.find(p => p.id === id);
      if (postToEdit) {
        setIsEditMode(true);
        setTitle(postToEdit.title);
        setAuthor(postToEdit.author);
        setContent(postToEdit.content);
        setImageUrl(postToEdit.imageUrl);
      }
    }
  }, [id, posts]);

  const handleGenerateContent = useCallback(async () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a topic to generate content.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      
      const generatedContent = await generateBlogPost(title, tone, length, targetAudience);
      setContent(generatedContent);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, tone, length, targetAudience]);

  const handleGenerateIdaes = useCallback(async () => {
    setIsGenerateIdeas(true);
    try {
      const responseText = await generateIdeasTrends();
      console.log(responseText);
      const ideas = [...responseText.matchAll(/\d+\.\s+(.*)/g)].map(m => m[1]);
      setListOfIdeas(ideas);
    } catch (error) {
      setError('Failed to generate content. Please try again.');
      console.error(error);
    } finally {
      setIsGenerateIdeas(false);
    }
  }, []); 

  const handleOptimizeTitle = useCallback(async () => {
    if (!title.trim()) {
      setError('Please enter a title first to optimize it.');
      return;
    }
    setIsOptimizingTitle(true);
    setError(null);
    try {
      const optimizedTitle = await generateOptimizedTitle(title);
      setTitle(optimizedTitle);
    } catch (err) {
      setError('Failed to optimize title. Please try again.');
      console.error(err);
    } finally {
      setIsOptimizingTitle(false);
    }
  }, [title]);
  
  const handleGenerateImage = useCallback(async () => {
    if (!title.trim()) {
      setError('Please enter a title before generating an image.');
      return;
    }
    setIsGeneratingImage(true);
    setError(null);
    try {
      const generatedImageUrl = await generateImage(title, tone);
      setImageUrl(generatedImageUrl.previewImage);
      uploadImage(generatedImageUrl.base64)
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  }, [title, tone]);
  
  const handleCopyAsPlainText = () => {
    if (!content) return;

    let plainText = content
      .replace(/^#+\s*(.*)/gm, '$1')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/^\s*>\s+/gm, '')
      .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')
      .split('\n').map(line => line.trim()).join('\n').replace(/\n{3,}/g, '\n\n');

    navigator.clipboard.writeText(plainText).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy as Plain Text'), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      setCopyButtonText('Failed to copy');
       setTimeout(() => setCopyButtonText('Copy as Plain Text'), 2000);
    });
  };

  const uploadImage = async (imageBase64: string) => {
    console.log(imageBase64)
    const urlUpload = BASE_URL_API + "api/upload"
    try {
      const body = {
        base64: imageBase64
      }
      const response = await axios.post(urlUpload, body)
      console.log('response : ', response)
      setImageUrlFirebase(response.data.url)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !content) {
        setError('Title, Author, and Content fields are required.');
        return;
    }

      const urlPost = BASE_URL_API + "api/blog"
      const requestPost = {
        title: title,
        content: content,
        blog: title,
        tag: 'AI,crypto,trading,Portfolio,Technology,Blockchain,Cryptocurrency,Crypto,bots,Bitcoin,btc',
        // firebase
        imageUrl: imageUrlFirebase
      }
      const postBlog = await axios.post(urlPost, requestPost)
      console.log(postBlog)
      setSlug(postBlog.data.blog.slug)
      if (postBlog.data.status !== 200) {
        setShowModal(true)
      } else {
        alert('Error')
      }
  };

  const selectClassName = "w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-brand-accent";

  return (
    <div className="max-w-4xl mx-auto bg-brand-secondary p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-6">{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        postUrl={`https://www.cryptobriefs.net/blog/${slug}`} // ← atau bisa ambil dari response
      />
      <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-brand-text-secondary mb-1">
          Generate Ideas
        </label>
        <div className="relative">
          <button 
            type="button" 
            onClick={handleGenerateIdaes}
            disabled={isGenerateIdeas || isGeneratingImage}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-brand-text-secondary hover:text-brand-accent disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Optimize Title"
          >
            {isGenerateIdeas ? <Spinner /> : <IconSparkles className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-2">
          {listOfIdeas.length > 0 ? (
            listOfIdeas.map((idea, index) => (
              <label key={index} className={`flex items-start space-x-2 cursor-pointer ${selectedIdea === idea ? 'bg-brand-primary p-2 rounded-md' : ''}`}>
                <input 
                  type="radio"
                  name="idea"
                  className="mt-1 text-brand-accent focus:ring-brand-accent"
                  value={idea}
                  checked={selectedIdea === idea}
                  onChange={() => {
                    setSelectedIdea(idea);
                    setTitle(idea);
                  }}
                />
                <span className="text-sm text-white">{idea}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-400">No ideas generated yet.</p>
          )}
        </div>
      </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-brand-text-secondary mb-1">Title</label>
           <div className="relative">
              <input 
                type="text" 
                id="title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full bg-brand-primary border border-slate-700 rounded-md p-3 pr-12 text-white focus:ring-2 focus:ring-brand-accent" 
                required 
              />
              <button 
                type="button" 
                onClick={handleOptimizeTitle}
                disabled={isOptimizingTitle || isGeneratingImage}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-brand-text-secondary hover:text-brand-accent disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                aria-label="Optimize Title"
              >
                {isOptimizingTitle ? <Spinner /> : <IconSparkles className="h-5 w-5" />}
              </button>
          </div>
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-brand-text-secondary mb-1">Author</label>
          <input type="text" id="author" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-brand-primary border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-brand-accent" required />
        </div>
        
        <div className="bg-brand-primary p-4 rounded-lg border border-slate-700 space-y-4">
            <h3 className="text-sm font-medium text-brand-text-secondary">AI Tools</h3>
            <div className="space-y-4">
                <button 
                    type="button" 
                    onClick={handleGenerateImage} 
                    disabled={isGeneratingImage || !title} 
                    className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    {isGeneratingImage ? <Spinner /> : <IconPhoto className="h-5 w-5 mr-2" />}
                    Generate Header Image
                </button>
                
                {isGeneratingImage && (
                    <div className="w-full aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
                        <Spinner />
                    </div>
                )}
                {imageUrl && !isGeneratingImage && (
                     <div className="w-full aspect-video bg-slate-800 rounded-lg overflow-hidden">
                        <img src={imageUrl} alt="Generated post header" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>

        <div className="bg-brand-primary p-4 rounded-lg border border-slate-700 space-y-4">
            <div>
              <label htmlFor="ai-prompt" className="block text-sm font-medium text-brand-text-secondary mb-1">AI Content Generation</label>
              <p className="text-xs text-brand-text-secondary mb-2">Enter a topic or a keyword, and let AI write the first draft for you.</p>
              <div className="flex space-x-2">
                  <input type="text" id="ai-prompt" placeholder="e.g., 'The future of NFTs'" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white focus:ring-2 focus:ring-brand-accent" />
                  <button type="button" onClick={handleGenerateContent} disabled={isGenerating} className="flex items-center justify-center bg-brand-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-accent-hover transition-colors duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed flex-shrink-0">
                      {isGenerating ? <Spinner /> : <IconSparkles className="h-5 w-5 mr-2" />}
                      Generate
                  </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tone" className="block text-xs font-medium text-brand-text-secondary mb-1">Tone</label>
                <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className={selectClassName}>
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Technical</option>
                  <option>Humorous</option>
                </select>
              </div>
              <div>
                <label htmlFor="length" className="block text-xs font-medium text-brand-text-secondary mb-1">Article Length</label>
                <select id="length" value={length} onChange={e => setLength(e.target.value)} className={selectClassName}>
                  <option>Short (~200 words)</option>
                  <option>Medium (~400-500 words)</option>
                  <option>Long (~800+ words)</option>
                </select>
              </div>
              <div>
                <label htmlFor="audience" className="block text-xs font-medium text-brand-text-secondary mb-1">Target Audience</label>
                <select id="audience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className={selectClassName}>
                  <option>General Audience</option>
                  <option>Beginners</option>
                  <option>Investors</option>
                  <option>Developers</option>
                </select>
              </div>
            </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-1">
             <label htmlFor="content" className="block text-sm font-medium text-brand-text-secondary">
                Content
             </label>
             <button
                type="button"
                onClick={handleCopyAsPlainText}
                className="flex items-center text-sm text-brand-text-secondary hover:text-brand-accent transition-colors py-1 px-2 rounded-md -mr-2"
              >
                <IconCopy className="h-4 w-4 mr-1.5" />
                {copyButtonText}
              </button>
           </div>
          <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={15} className="w-full bg-brand-primary border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-brand-accent" required />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isGenerating || isOptimizingTitle || isGeneratingImage} className="bg-brand-accent text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-accent-hover transition-colors disabled:bg-slate-500">
            {isEditMode ? 'Update Post' : 'm'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;