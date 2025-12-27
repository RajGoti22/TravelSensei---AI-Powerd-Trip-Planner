import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
  LocationOn,
} from '@mui/icons-material';

const PostCard = ({ post, onLike, onComment, onShare }) => {
  return (
    <Card 
      elevation={0}
      sx={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        breakInside: 'avoid',
        marginBottom: { xs: 2, sm: 2, md: 2.5 },
        display: 'inline-block',
        width: '100%',
        '&:hover': { 
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
          borderColor: '#000',
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Post Photos - Pinterest Style with Varied Heights */}
        {post.photos && post.photos.length > 0 && !post.photos[0].includes('blob:') && (
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src={post.photos[0]}
              alt="Post"
              style={{
                width: '100%',
                height: (() => {
                  const heights = {
                    mobile: [150, 180, 200, 160, 220, 170, 190, 210],
                    desktop: [200, 250, 300, 220, 280, 240, 260, 320]
                  };
                  const isMobile = window.innerWidth < 600;
                  const heightArray = isMobile ? heights.mobile : heights.desktop;
                  return heightArray[post.id % heightArray.length] + 'px';
                })(),
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        )}
        
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          {/* Post Header - Compact */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 1.2 } }}>
            <Avatar 
              src={post.avatar} 
              sx={{ 
                mr: 1.2,
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                bgcolor: '#000',
                fontSize: '0.9rem',
                fontWeight: 600,
              }} 
            >
              {post.author?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 700,
                  color: '#212121',
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  lineHeight: 1.2,
                  mb: 0.2,
                }}
              >
                {post.author}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#757575',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    fontWeight: 500,
                  }}
                >
                  {(() => {
                    const d = new Date(post.timestamp);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()}
                </Typography>
                {post.location && (
                  <>
                    <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.7rem' }}>•</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <LocationOn sx={{ fontSize: { xs: 11, sm: 12 }, color: '#757575' }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#757575',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          fontWeight: 500,
                        }}
                      >
                        {post.location}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            <IconButton 
              size="small"
              sx={{
                color: '#757575',
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#000',
                }
              }}
            >
              <MoreVert sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </IconButton>
          </Box>

          {/* Post Content - Varied Length for Pinterest Style */}
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1,
              color: '#424242',
              lineHeight: 1.5,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              display: '-webkit-box',
              WebkitLineClamp: post.id % 4 === 0 ? 4 : post.id % 3 === 0 ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.content}
          </Typography>

          {/* Post Tags - Inline */}
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ mb: 1.2 }}>
              {post.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    mr: 0.6, 
                    mb: 0.6,
                    bgcolor: '#fafafa',
                    color: '#424242',
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 22 },
                    border: '1px solid #e0e0e0',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#000',
                      color: '#fff',
                      borderColor: '#000',
                    }
                  }}
                />
              ))}
            </Box>
          )}

          <Divider sx={{ my: 1, borderColor: '#f0f0f0' }} />

          {/* Engagement Stats & Actions Combined */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{
                color: '#757575',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 600,
              }}
            >
              {post.likes} likes • {post.comments} comments
            </Typography>

            <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
              <IconButton
                onClick={() => onLike(post.id || post._id)}
                size="small"
                sx={{ 
                  color: post.isLiked ? '#E91E63' : '#757575',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  '&:hover': { 
                    bgcolor: post.isLiked ? 'rgba(233, 30, 99, 0.08)' : '#f5f5f5',
                    color: post.isLiked ? '#E91E63' : '#000',
                  }
                }}
              >
                {post.isLiked ? <Favorite sx={{ fontSize: { xs: 16, sm: 18 } }} /> : <FavoriteBorder sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              </IconButton>
              <IconButton
                onClick={() => onComment(post.id || post._id)}
                size="small"
                sx={{ 
                  color: '#757575',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  '&:hover': {
                    bgcolor: '#000',
                    color: '#fff',
                  }
                }}
              >
                <Comment sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </IconButton>
              <IconButton
                onClick={() => onShare(post.id || post._id)}
                size="small"
                sx={{ 
                  color: '#757575',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  '&:hover': {
                    bgcolor: '#000',
                    color: '#fff',
                  }
                }}
              >
                <Share sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCard;
