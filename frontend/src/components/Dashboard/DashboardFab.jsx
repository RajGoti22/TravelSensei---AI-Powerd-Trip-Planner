import React from 'react';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';

const DashboardFab = ({ navigate }) => (
  <Fab
    color="primary"
    aria-label="create itinerary"
    sx={{
      position: 'fixed',
      bottom: 18,
      right: 18,
      display: { xs: 'block', md: 'none' },
      boxShadow: '0 12px 30px rgba(10,58,100,0.12)'
    }}
    onClick={() => navigate('/itinerary/create')}
  >
    <Add />
  </Fab>
);

export default DashboardFab;
