
import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostListProps {
  posts: Post[];
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => (
  <div className="bg-brand-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-brand-accent/30 transition-shadow duration-300 flex flex-col">
    <img className="w-full h-56 object-cover" src={post.imageUrl} alt={post.title} />
    <div className="p-6 flex flex-col flex-grow">
      <h2 className="text-2xl font-bold mb-2 text-white">{post.title}</h2>
      <p className="text-brand-text-secondary text-sm mb-4">By {post.author} on {post.date}</p>
      <p className="text-brand-text flex-grow mb-6">{post.content.substring(0, 120)}...</p>
      <Link 
        to={`/post/${post.id}`} 
        className="mt-auto self-start bg-brand-accent text-white font-semibold py-2 px-5 rounded-lg hover:bg-brand-accent-hover transition-colors duration-300"
      >
        Read More
      </Link>
    </div>
  </div>
);

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="space-y-12">
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">The Crypto Ledger</h1>
            <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">Your daily source for insightful analysis and news from the world of cryptocurrency.</p>
        </div>
        {posts.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-brand-text-secondary text-xl">No posts found. Why not create one?</p>
            </div>
        )}
    </div>
  );
};

export default PostList;
