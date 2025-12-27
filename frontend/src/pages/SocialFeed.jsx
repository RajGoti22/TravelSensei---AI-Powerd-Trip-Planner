import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import {
  SocialHeroSection,
  SharePostCard,
  PostCard,
  CreatePostDialog,
} from '../components/social';
import apiService from '../services/api';

const SocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    location: '',
    photos: [],
    privacy: 'public',
    tags: []
  });

  // Load posts from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      if (!isMounted) return;
      try {
        const res = await apiService.makeRequest('/posts', { method: 'GET' });
        if (isMounted && res && res.success && Array.isArray(res.data)) {
          setPosts(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[SocialFeed] Error loading posts:', err);
        }
      }
    };
    
    // Load posts immediately on mount
    fetchPosts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLike = async (postId) => {
    console.log('[SocialFeed] Like clicked for post ID:', postId);
    
    // Find the current post
    const post = posts.find(p => p.id === postId);
    if (!post) {
      console.error('[SocialFeed] Post not found for ID:', postId);
      return;
    }
    
    const newLikeState = !post.isLiked;
    console.log('[SocialFeed] Toggling like state from', post.isLiked, 'to', newLikeState);
    
    // Update UI immediately
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? {
              ...p,
              isLiked: newLikeState,
              likes: newLikeState ? p.likes + 1 : p.likes - 1
            }
          : p
      )
    );
    
    // Save like to backend
    console.log('[SocialFeed] Sending like request to backend with ID:', postId);
    
    try {
      const response = await apiService.makeRequest(`/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ liked: newLikeState }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('[SocialFeed] Like response:', response);
      
      // If successful, confirm with backend response
      if (response && response.success && response.data) {
        console.log('[SocialFeed] Backend confirmed, updating with likes count:', response.data.likes);
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId
              ? {
                  ...p,
                  likes: response.data.likes !== undefined ? response.data.likes : p.likes
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('[SocialFeed] Error saving like:', err);
      // Revert UI on error
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                isLiked: !newLikeState,
                likes: !newLikeState ? p.likes + 1 : p.likes - 1
              }
            : p
        )
      );
    }
  };

  const handleComment = async (postId) => {
    console.log('[SocialFeed] Comment clicked for post ID:', postId);
    alert('Comments feature coming soon!');
  };

  const handleShare = async (postId) => {
    console.log('[SocialFeed] Share clicked for post ID:', postId);
    // Check if browser supports share API
    if (navigator.share) {
      try {
        const post = posts.find(p => p.id === postId);
        if (post) {
          await navigator.share({
            title: 'Travel Experience',
            text: post.content,
            url: window.location.href
          });
          console.log('[SocialFeed] Shared successfully');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[SocialFeed] Share error:', err);
        }
      }
    } else {
      // Fallback for browsers that don't support share API
      try {
        const post = posts.find(p => p.id === postId);
        if (post) {
          const shareUrl = window.location.href;
          const text = `Check out this travel experience: "${post.content}"`;
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
          window.open(url, '_blank');
        }
      } catch (err) {
        console.error('[SocialFeed] Share fallback error:', err);
      }
    }
  };

  const handleNewPost = async () => {
    const hasContent = newPost.content && newPost.content.trim().length > 0;
    const hasPhoto = Array.isArray(newPost.photos) && newPost.photos.length > 0;
    if (!hasContent && !hasPhoto) {
      setOpenNewPost(false);
      setNewPost({ content: '', location: '', photos: [], privacy: 'public', tags: [] });
      return;
    }
    // Extract hashtags from content and remove them from the text
    const tagMatches = newPost.content.match(/#(\w+)/g) || [];
    const tags = tagMatches.map(tag => tag.replace('#', ''));
    // Remove hashtags from content for display
    const contentWithoutTags = newPost.content.replace(/#(\w+)/g, '').replace(/\s+/g, ' ').trim();
    const post = {
      author: user?.name || 'Current User',
      avatar: user?.avatar || 'https://i.pravatar.cc/150?img=8',
      content: contentWithoutTags,
      location: newPost.location,
      timestamp: new Date().toISOString(),
      photos: newPost.photos,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      tags,
      userId: user?.id || '',
    };
    try {
      // Save post to backend
      console.log('[SocialFeed] Creating post:', post);
      const res = await apiService.makeRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(post),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[SocialFeed] Post creation response:', res);
      if (res && res.success && res.data) {
        setPosts([res.data, ...posts]);
      } else {
        console.error('[SocialFeed] Post creation failed:', res);
        setPosts([post, ...posts]); // fallback
      }
    } catch (err) {
      console.error('[SocialFeed] Post creation error:', err);
      setPosts([post, ...posts]); // fallback
    }
    setOpenNewPost(false);
    setNewPost({
      content: '',
      location: '',
      photos: [],
      privacy: 'public',
      tags: []
    });
  };

  const handlePostChange = (updatedPost) => {
    setNewPost(updatedPost);
  };

  return (
    <>
      {/* Hero Section */}
      <SocialHeroSection />

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Share Post Card */}
        <SharePostCard onOpenNewPost={() => setOpenNewPost(true)} user={user} />

        {/* Posts - Masonry Layout */}
        <Masonry
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          spacing={2}
          sx={{ my: 2 }}
        >
          {posts && Array.isArray(posts) && posts.filter(p => p).map((post, index) => (
            <Box key={post.id || index} sx={{ breakInside: 'avoid' }}>
              <PostCard 
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            </Box>
          ))}
        </Masonry>

        {/* Create Post Dialog */}
        <CreatePostDialog
          open={openNewPost}
          onClose={() => setOpenNewPost(false)}
          newPost={newPost}
          onPostChange={handlePostChange}
          onSubmit={handleNewPost}
        />

      </Container>
    </>
  );
};

export default SocialFeed;