import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  FilterList,
  Star,
  ThumbUp,
  Edit,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ReviewCard from '../components/reviews/ReviewCard';
import AddReviewDialog from '../components/reviews/AddReviewDialog';
import HeroSection from '../components/reviews/HeroSection';
import EmptyReviewsState from '../components/reviews/EmptyReviewsState';
import ReviewFilters from '../components/reviews/ReviewFilters';
import ReviewTabs from '../components/reviews/ReviewTabs';

const CommunityReviews = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(0);
  const { user } = useAuth();

  // Fetch reviews from backend
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await import('../services/api');
        const api = res.default;
        const data = await api.makeRequest('/reviews');
        if (data && data.reviews) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (e) {
        setReviews([]);
      }
    }
    fetchReviews();
  }, []);

  const tabs = [
    { label: 'All Reviews', value: 'all' },
    { label: 'My Reviews', value: 'my-reviews' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filterReviews = () => {
    let filtered = reviews;
    
    // Filter by tab
    const tabValue = tabs[activeTab].value;
    if (tabValue === 'my-reviews') {
      filtered = filtered.filter(review => review.user_id === user?.id);
    } else if (tabValue !== 'all') {
      filtered = filtered.filter(review => review.type === tabValue);
    }
    
    // Filter by rating
    if (ratingFilter > 0) {
      filtered = filtered.filter(review => review.rating >= ratingFilter);
    }
    
    return filtered;
  };

  const handleAddReview = async (reviewData) => {
    try {
      const res = await import('../services/api');
      const api = res.default;
      // Map 'content' to 'comment' for backend compatibility
      const dataToSend = { ...reviewData };
      if (dataToSend.content && !dataToSend.comment) {
        dataToSend.comment = dataToSend.content;
        delete dataToSend.content;
      }
      const created = await api.createReview(dataToSend);
      if (created && created.review) {
        setReviews(prev => [created.review, ...prev]);
      }
    } catch (e) {
      // Optionally show error
    }
  };

  const handleLikeReview = async (reviewId, liked) => {
    console.log('[CommunityReviews] Liking review:', reviewId, 'with liked:', liked);
    
    // Update UI immediately
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, isLiked: liked, likes: liked ? review.likes + 1 : review.likes - 1 }
        : review
    ));
    
    // Save to backend
    try {
      const res = await import('../services/api');
      const api = res.default;
      const result = await api.makeRequest(`/reviews/${reviewId}/like`, {
        method: 'POST',
        body: JSON.stringify({ liked }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (result && result.success && result.data) {
        console.log('[CommunityReviews] Like successful');
        setReviews(prev => prev.map(review =>
          review.id === reviewId
            ? { ...review, likes: result.data.likes !== undefined ? result.data.likes : review.likes }
            : review
        ));
      }
    } catch (err) {
      console.error('[CommunityReviews] Error liking review:', err);
      // Revert on error
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, isLiked: !liked, likes: !liked ? review.likes + 1 : review.likes - 1 }
          : review
      ));
    }
  };

  const handleShareReview = (reviewId) => {
    console.log('[CommunityReviews] Sharing review:', reviewId);
    // Check if browser supports share API
    if (navigator.share) {
      try {
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
          navigator.share({
            title: review.title || 'Travel Review',
            text: review.content,
            url: window.location.href
          });
          console.log('[CommunityReviews] Shared successfully');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[CommunityReviews] Share error:', err);
        }
      }
    } else {
      // Fallback for browsers that don't support share API
      try {
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
          const shareUrl = window.location.href;
          const text = `Check out this review: "${review.title || review.content}"`;
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
          window.open(url, '_blank');
        }
      } catch (err) {
        console.error('[CommunityReviews] Share fallback error:', err);
      }
    }
  };

  const handleEditReview = (review) => {
    setCurrentReview(review);
    setEditReviewOpen(true);
  };

  const handleUpdateReview = async (reviewData) => {
    try {
      const res = await import('../services/api');
      const api = res.default;
      // Map 'content' to 'comment' for backend compatibility
      const dataToSend = { ...reviewData };
      if (dataToSend.content && !dataToSend.comment) {
        dataToSend.comment = dataToSend.content;
        delete dataToSend.content;
      }
      // Call API to update review in backend
      const updated = await api.updateReview(currentReview.id, dataToSend);
      // Update review in local state
      if (updated && updated.review) {
        setReviews(prev => prev.map(r => 
          r.id === currentReview.id 
            ? { ...r, ...updated.review, content: updated.review.comment || updated.review.content }
            : r
        ));
      } else {
        setReviews(prev => prev.map(r => 
          r.id === currentReview.id 
            ? { ...r, ...reviewData, content: dataToSend.comment }
            : r
        ));
      }
      setEditReviewOpen(false);
      setCurrentReview(null);
    } catch (e) {
      console.error('Error updating review:', e);
      // Optionally show error
    }
  };

  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (reviewToDelete) {
      try {
        // Remove from local state
        setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
      } catch (e) {
        // Optionally show error
      }
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const handleReportReview = (review) => {
    console.log('Report review:', review);
    // Open report dialog
  };

  const filteredReviews = filterReviews();

  const stats = [
    {
      value: reviews.length,
      label: 'Total Reviews',
      color: '#000',
      icon: <Star />,
    },
    {
      value: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      label: 'Average Rating',
      color: '#212121',
      icon: <Star />,
    },
    {
      value: reviews.reduce((sum, r) => sum + r.likes, 0),
      label: 'Total Likes',
      color: '#424242',
      icon: <ThumbUp />,
    },
    {
      value: reviews.filter(r => r.user_id === user?.id).length,
      label: 'Your Reviews',
      color: '#000',
      icon: <Edit />,
    },
  ];

  const getTabCount = (tabValue) => {
    if (tabValue === 'my-reviews') {
      return reviews.filter(r => r.user_id === user?.id).length;
    } else if (tabValue === 'all') {
      return reviews.length;
    } else {
      return reviews.filter(r => r.type === tabValue).length;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Hero Section */}
      <HeroSection 
        stats={stats} 
        onWriteReview={() => setAddReviewOpen(true)} 
      />

      {/* Main Content - Compact */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, mt: { xs: 2, sm: 3 }, position: 'relative', zIndex: 3 }}>
        {/* Header Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 2.5, sm: 3 },
          flexWrap: 'nowrap',
          gap: { xs: 0.8, sm: 2 },
          overflow: 'visible',
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: { xs: '0.3px', sm: '0.5px' },
              color: '#212121',
              fontSize: { xs: '1.1rem', sm: '1.75rem', md: '2rem' },
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Browse Reviews
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexShrink: 0, ml: 'auto' }}>
            <IconButton
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              size="small"
              sx={{ 
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 1.5,
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                '&:hover': {
                  background: '#000',
                  borderColor: '#000',
                  '& svg': { color: 'white' }
                }
              }}
            >
              <FilterList sx={{ fontSize: { xs: 18, sm: 20 }, color: '#000', transition: 'color 0.2s ease' }} />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              onClick={() => setAddReviewOpen(true)}
              sx={{
                background: '#000',
                borderRadius: 1.5,
                px: { xs: 1.5, sm: 2.5 },
                py: { xs: 0.6, sm: 0.75 },
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                textTransform: 'none',
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: '#212121',
                }
              }}
            >
            Write Review
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <ReviewTabs 
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={handleTabChange}
          getTabCount={getTabCount}
        />

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onLike={handleLikeReview}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                onReport={handleReportReview}
                onShare={handleShareReview}
                currentUserId={user?.id}
              />
            ))}
          </Box>
        ) : (
          <EmptyReviewsState onWriteReview={() => setAddReviewOpen(true)} />
        )}

        {/* Filter Menu */}
        <ReviewFilters
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
          onFilterChange={(rating) => setRatingFilter(rating)}
        />

        {/* Add Review Dialog */}
        <AddReviewDialog
          open={addReviewOpen}
          onClose={() => setAddReviewOpen(false)}
          onSubmit={handleAddReview}
          type={tabs[activeTab].value !== 'all' && tabs[activeTab].value !== 'my-reviews' ? tabs[activeTab].value : 'hotel'}
        />

        {/* Edit Review Dialog */}
        <AddReviewDialog
          open={editReviewOpen}
          onClose={() => {
            setEditReviewOpen(false);
            setCurrentReview(null);
          }}
          onSubmit={handleUpdateReview}
          type={tabs[activeTab].value !== 'all' && tabs[activeTab].value !== 'my-reviews' ? tabs[activeTab].value : 'hotel'}
          initialData={currentReview}
          isEdit={true}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDelete}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <DialogContent sx={{ pt: 4, pb: 3, px: 3, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Warning sx={{ fontSize: 32, color: '#DC2626' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#212121',
                mb: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Delete Review?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to delete this review? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              gap: 1.5,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              onClick={cancelDelete}
              fullWidth
              variant="outlined"
              sx={{
                borderColor: '#E5E7EB',
                color: '#6B7280',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.2,
                fontSize: '0.9rem',
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#DC2626',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.2,
                fontSize: '0.9rem',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#B91C1C',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                },
              }}
            >
              Delete Review
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CommunityReviews;


