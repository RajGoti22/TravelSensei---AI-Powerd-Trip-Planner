import React from 'react';
import {
  Paper,
  Avatar,
  Button,
  Typography,
} from '@mui/material';
import {
  Add,
  Star,
} from '@mui/icons-material';

const EmptyReviewsState = ({ onWriteReview }) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 6, 
        textAlign: 'center',
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Avatar
        sx={{
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 3,
          bgcolor: '#F3F4F6',
          color: '#6B7280',
        }}
      >
        <Star sx={{ fontSize: 32 }} />
      </Avatar>
      <Typography 
        variant="h6" 
        color="text.primary"
        sx={{ 
          mb: 2,
          fontWeight: 600,
          color: '#1F2937',
        }}
      >
        No reviews found
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: 4, 
          lineHeight: 1.6,
          color: '#6B7280',
        }}
      >
        Be the first to share your travel experience and help fellow travelers!
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onWriteReview}
        size="medium"
        sx={{
          bgcolor: '#000',
          color: 'white',
          borderRadius: 2,
          px: 4,
          py: 1.5,
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.95rem',
          '&:hover': {
            bgcolor: '#212121',
          },
        }}
      >
        Write First Review
      </Button>
    </Paper>
  );
};

export default EmptyReviewsState;
