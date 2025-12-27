import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { TrendingUp, Explore as ExploreIcon, CalendarToday, CurrencyRupee } from '@mui/icons-material';

const DashboardStats = ({ itineraries }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(3, 1fr)',
        sm: 'repeat(3, 1fr)',
        md: 'repeat(3, 1fr)',
      },
      gap: { xs: 0.5, sm: 0.75, md: 0.9 },
      py: { xs: 0, md: 0 },
      px: { xs: 0, md: 0 },
      mb: 2,
      alignItems: 'stretch',
      justifyContent: 'center',
      mx: 'auto',
      maxWidth: { xs: '320px', sm: '360px', md: '420px' },
      minHeight: { xs: '70px', sm: '80px', md: '80px' },
    }}
  >
    {[
      {
        icon: <TrendingUp sx={{ fontSize: { xs: 11, sm: 14, md: 16 } }} />,
        value: itineraries.length,
        label: 'Total Itineraries',
        bg: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        iconBg: 'rgba(102, 126, 234, 0.15)'
      },
      // {
      //   icon: <ExploreIcon sx={{ fontSize: { xs: 11, sm: 14, md: 16 } }} />,
      //   value: itineraries.filter(i => i.status === 'active').length,
      //   label: 'Active Trips',
      //   bg: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
      //   iconBg: 'rgba(240, 147, 251, 0.15)'
      // },
      {
        icon: <CalendarToday sx={{ fontSize: { xs: 11, sm: 14, md: 16 } }} />,
        value: itineraries.reduce((sum, i) => sum + (i.duration || 0), 0),
        label: 'Total Days',
        bg: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        iconBg: 'rgba(79, 172, 254, 0.15)'
      },
      {
        icon: <CurrencyRupee sx={{ fontSize: { xs: 11, sm: 14, md: 16 } }} />,
        value: itineraries.reduce((sum, i) => sum + (i.totalBudget || 0), 0).toLocaleString('en-IN'),
        label: 'Total Budget',
        bg: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
        iconBg: 'rgba(67, 233, 123, 0.15)'
      }
    ].map((s, idx) => (
      <Paper
        key={idx}
        elevation={0}
        sx={{
          p: { xs: 0.5, sm: 0.7, md: 0.85 },
          textAlign: 'center',
          borderRadius: { xs: '5px', sm: '6px', md: '7px' },
          background: s.bg,
          color: 'white',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: '65px', sm: '60px', md: '68px' },
          width: '100%',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0)',
            transition: 'all 0.2s ease',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:before': {
              background: 'rgba(255,255,255,0.1)',
            }
          },
        }}
      >
        <Box 
          sx={{ 
            mb: { xs: 0.25, sm: 0.3, md: 0.35 },
            p: { xs: 0.3, sm: 0.35, md: 0.4 },
            borderRadius: '50%',
            bgcolor: s.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {s.icon}
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800, 
            mb: { xs: 0.08, sm: 0.1 }, 
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.92rem' },
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            lineHeight: 1
          }}
        >
          {s.value}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            opacity: 0.95, 
            fontSize: { xs: '0.48rem', sm: '0.52rem', md: '0.55rem' }, 
            lineHeight: 1,
            fontWeight: 500,
            letterSpacing: { xs: '0px', sm: '0.1px' },
            textTransform: 'uppercase',
            px: { xs: 0.2, sm: 0 }
          }}
        >
          {s.label}
        </Typography>
      </Paper>
    ))}
  </Box>
);

export default DashboardStats;
