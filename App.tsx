
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Post } from './types';
import { INITIAL_POSTS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you'd fetch this from an API
    setPosts(INITIAL_POSTS);
  }, []);

  const handleCreatePost = (post: Omit<Post, 'id' | 'date'>) => {
    const newPost: Post = {
      ...post,
      id: new Date().getTime().toString(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      // Use the generated image, or a placeholder if none was generated
      imageUrl: post.imageUrl || `https://picsum.photos/seed/${new Date().getTime()}/1200/600`
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
    navigate(`/post/${newPost.id}`);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
    navigate(`/post/${updatedPost.id}`);
  };

  const handleDeletePost = (id: string) => {
    if(window.confirm('Are you sure you want to delete this post?')) {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<PostForm onSave={handleCreatePost} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;