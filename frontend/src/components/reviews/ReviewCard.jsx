import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Rating,
  Avatar,
  Divider,
  Chip,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Hotel,
  Flight,
  Tour,
  ThumbUp,
  Share,
  Report,
  MoreVert,
  Star,
  LocationOn,
  CalendarToday,
  Edit,
  Delete,
} from '@mui/icons-material';

const ReviewCard = ({ review, onLike, onReport, onEdit, onDelete, currentUserId, onShare }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [liked, setLiked] = useState(review.isLiked || false);
  const [likes, setLikes] = useState(review.likes || 0);
  
  // Ensure all review fields have default values
  const safeReview = {
    userName: review.userName || 'Anonymous',
    userAvatar: review.userAvatar || '',
    rating: review.rating || 5,
    date: review.date || new Date().toISOString(),
    title: review.title || '',
    location: review.location || 'Not specified',
    visitDate: review.visitDate || 'N/A',
    content: review.content || '',
    tags: review.tags || [],
    helpful: review.helpful || 0,
    ...review
  };
  
  console.log('[ReviewCard] Review data:', {
    id: safeReview.id,
    title: safeReview.title,
    content: safeReview.content,
    userName: safeReview.userName,
    location: safeReview.location,
    visitDate: safeReview.visitDate,
    rating: safeReview.rating,
    date: safeReview.date,
  });

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike(safeReview.id, !liked);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(safeReview.id);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hotel': return <Hotel sx={{ fontSize: 20, color: '#000' }} />;
      case 'flight': return <Flight sx={{ fontSize: 20, color: '#000' }} />;
      case 'activity': return <Tour sx={{ fontSize: 20, color: '#000' }} />;
      default: return <Hotel sx={{ fontSize: 20, color: '#000' }} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'hotel': return '#000';
      case 'flight': return '#424242';
      case 'activity': return '#212121';
      default: return '#000';
    }
  };

  return (
    <Card 
      sx={{ 
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': { 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          borderColor: '#bdbdbd',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              src={safeReview.userAvatar}
              sx={{ 
                width: { xs: 40, sm: 44 }, 
                height: { xs: 40, sm: 44 }, 
                mr: 1.5,
                bgcolor: '#000',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {safeReview.userName.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.3, flexWrap: 'wrap', gap: 0.8 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#212121',
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                  }}
                >
                  {safeReview.userName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Rating 
                  value={safeReview.rating} 
                  readOnly 
                  size="small" 
                  sx={{ 
                    '& .MuiRating-iconFilled': {
                      color: '#FFC107',
                    },
                    '& .MuiRating-icon': {
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }
                  }} 
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                  {(() => {
                    const d = new Date(safeReview.date);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton 
            onClick={handleMenuClick}
            size="small"
            sx={{
              color: '#616161',
              p: 0.5,
              '&:hover': {
                bgcolor: '#f5f5f5',
              }
            }}
          >
            <MoreVert sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1.5, 
            fontWeight: 600,
            color: '#212121',
            fontSize: { xs: '0.95rem', sm: '1rem' },
            lineHeight: 1.3,
          }}
        >
          {safeReview.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ fontSize: 14, mr: 0.5, color: '#757575' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
              {safeReview.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: '#757575' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
              Visited {safeReview.visitDate}
            </Typography>
          </Box>
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2, 
            lineHeight: 1.5,
            color: '#616161',
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
          }}
        >
          {safeReview.content}
        </Typography>

        {/* Tags - Compact */}
        {safeReview.tags && safeReview.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap' }}>
            {safeReview.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  bgcolor: '#f5f5f5',
                  color: '#424242',
                  fontSize: '0.7rem',
                  height: 22,
                  border: '1px solid #e0e0e0',
                  '& .MuiChip-label': { px: 1 },
                  '&:hover': {
                    bgcolor: '#eeeeee',
                  }
                }}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<ThumbUp sx={{ fontSize: 16 }} />}
              onClick={handleLike}
              variant={liked ? 'contained' : 'outlined'}
              size="small"
              sx={liked ? {
                bgcolor: '#000',
                color: 'white',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600,
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#212121',
                }
              } : {
                borderColor: '#e0e0e0',
                color: '#616161',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600,
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: '#000',
                  color: 'white',
                }
              }}
            >
              {likes}
            </Button>
            <Button
              startIcon={<Share sx={{ fontSize: 16 }} />}
              variant="outlined"
              size="small"
              onClick={handleShare}
              sx={{
                borderColor: '#e0e0e0',
                color: '#616161',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600,
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: '#000',
                  color: 'white',
                }
              }}
            >
              Share
            </Button>
          </Box>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#757575',
            }}
          >
            <Star sx={{ fontSize: 14, color: '#10B981' }} />
            {safeReview.helpful} people found this helpful
          </Typography>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(100, 181, 246, 0.1)',
            borderRadius: 2,
          }
        }}
      >
        {currentUserId === safeReview.user_id ? (
          [
            <MenuItem key="edit" onClick={() => { onEdit(safeReview); handleMenuClose(); }}>
              <Edit sx={{ mr: 1, fontSize: 20 }} />
              Edit Review
            </MenuItem>,
            <MenuItem key="delete" onClick={() => { onDelete(safeReview); handleMenuClose(); }} sx={{ color: 'error.main' }}>
              <Delete sx={{ mr: 1, fontSize: 20 }} />
              Delete Review
            </MenuItem>
          ]
        ) : (
          <MenuItem onClick={() => { onReport(safeReview); handleMenuClose(); }}>
            <Report sx={{ mr: 1, fontSize: 20 }} />
            Report Review
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default ReviewCard;
