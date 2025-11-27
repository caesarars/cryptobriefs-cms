import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Post } from '../types';
import { IconEdit, IconTrash } from './Icon';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface PostDetailProps {
  posts: Post[];
  onDelete: (id: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ posts, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const post = posts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Post not found</h2>
        <Link to="/" className="mt-4 inline-block text-brand-accent hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    onDelete(post.id);
  };

  const createMarkup = () => {
    if (!post || typeof window === 'undefined') return { __html: '' };
    const dirty = marked.parse(post.content) as string;
    const clean = DOMPurify.sanitize(dirty);
    return { __html: clean };
  };

  return (
    <article className="max-w-4xl mx-auto bg-brand-secondary rounded-2xl shadow-2xl overflow-hidden">
      <img className="w-full h-64 md:h-96 object-cover" src={post.imageUrl} alt={post.title} />
      <div className="p-6 sm:p-10">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{post.title}</h1>
                <p className="mt-4 text-md text-brand-text-secondary">
                    By {post.author} on {post.date}
                </p>
            </div>
            <div className="flex space-x-3 flex-shrink-0 ml-4">
                <Link to={`/edit/${post.id}`} className="p-2 rounded-full bg-gray-600 hover:bg-brand-accent transition-colors">
                    <IconEdit className="h-5 w-5 text-white" />
                </Link>
                <button onClick={handleDelete} className="p-2 rounded-full bg-gray-600 hover:bg-red-500 transition-colors">
                    <IconTrash className="h-5 w-5 text-white" />
                </button>
            </div>
        </div>
        <div 
          className="mt-8 text-lg text-brand-text leading-relaxed prose prose-invert max-w-none prose-p:text-brand-text prose-headings:text-white prose-a:text-brand-accent prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal prose-li:text-brand-text"
          dangerouslySetInnerHTML={createMarkup()}
        />
      </div>
    </article>
  );
};

export default PostDetail;