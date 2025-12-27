import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import {
  PhotoCamera,
  LocationOn,
} from '@mui/icons-material';

const SharePostCard = ({ onOpenNewPost, user }) => {
  return (
    <Card
      sx={{
        mb: { xs: 2, sm: 2.5 },
        maxWidth: 600,
        mx: 'auto',
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
          borderColor: '#000',
        },
      }}
      onClick={onOpenNewPost}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <Avatar
            src={user?.avatar}
            sx={{ 
              width: { xs: 38, sm: 42 }, 
              height: { xs: 38, sm: 42 }, 
              border: '2px solid #e0e0e0',
              bgcolor: '#000',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box
            sx={{
              flex: 1,
              py: { xs: 0.8, sm: 1 },
              px: { xs: 1.5, sm: 2 },
              borderRadius: '20px',
              border: '1px solid #e0e0e0',
              color: '#616161',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              fontWeight: 500,
              textAlign: 'left',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#000', bgcolor: '#fafafa' },
            }}
          >
            Share your travel experience...
          </Box>
        </Box>
        <Divider sx={{ my: { xs: 1.2, sm: 1.5 }, borderColor: '#e0e0e0' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1 }}>
          <Button
            startIcon={<PhotoCamera sx={{ fontSize: { xs: 18, sm: 20 }, color: 'inherit' }} />}
            sx={{
              color: '#424242',
              textTransform: 'none',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              fontWeight: 600,
              py: { xs: 0.6, sm: 0.8 },
              px: { xs: 1.5, sm: 2 },
              borderRadius: 1.5,
              minWidth: { xs: 85, sm: 100 },
              '&:hover': {
                backgroundColor: '#000',
                color: '#fff',
              },
            }}
            onClick={e => { e.stopPropagation(); onOpenNewPost(); }}
          >
            Photo
          </Button>
          <Button
            startIcon={<LocationOn sx={{ fontSize: { xs: 18, sm: 20 }, color: 'inherit' }} />}
            sx={{
              color: '#424242',
              textTransform: 'none',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              fontWeight: 600,
              py: { xs: 0.6, sm: 0.8 },
              px: { xs: 1.5, sm: 2 },
              borderRadius: 1.5,
              minWidth: { xs: 85, sm: 100 },
              '&:hover': {
                backgroundColor: '#000',
                color: '#fff',
              },
            }}
            onClick={e => { e.stopPropagation(); onOpenNewPost(); }}
          >
            Location
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SharePostCard;
