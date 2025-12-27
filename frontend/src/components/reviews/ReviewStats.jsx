import React from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
} from '@mui/material';

const ReviewStats = ({ stats }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        gap: { xs: 1, sm: 2, md: 3 },
        justifyContent: 'center',
        flexWrap: 'nowrap',
        mb: { xs: 1.5, sm: 2 },
        overflow: { xs: 'auto', sm: 'visible' },
        maxWidth: '100%',
        px: { xs: 1, sm: 0 },
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        }
      }}
    >
      {stats.map((stat, index) => (
        <Paper 
          key={index}
          elevation={0}
          sx={{ 
            p: { xs: 1, sm: 1.5, md: 2 },
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: { xs: 1.5, sm: 2 },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.2s ease',
            height: { xs: 68, sm: 80, md: 90 },
            width: { xs: 68, sm: 80, md: 90 },
            minWidth: { xs: 68, sm: 80, md: 90 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            '&:hover': { 
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: '#000',
              mx: 'auto', 
              mb: { xs: 0.3, sm: 0.5, md: 0.7 },
              width: { xs: 22, sm: 26, md: 28 },
              height: { xs: 22, sm: 26, md: 28 },
            }}
          >
            {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 11, sm: 13, md: 14 } } })}
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: '#212121',
              mb: { xs: 0.4, sm: 0.5, md: 0.6 },
              fontSize: { xs: '0.75rem', sm: '0.95rem', md: '1.05rem' },
              lineHeight: 1,
            }}
          >
            {stat.value}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '0.55rem', sm: '0.65rem', md: '0.7rem' },
              lineHeight: 1.2,
              whiteSpace: { xs: 'nowrap', sm: 'normal' }
            }}
          >
            {stat.label}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ReviewStats;
