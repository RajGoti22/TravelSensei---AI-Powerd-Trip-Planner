import React, { useState } from 'react';
import { Box, Container,Typography } from '@mui/material';
import { TravelExplore } from '@mui/icons-material';
import Header from './Header';

const Layout = ({ children }) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', width: '100%', overflowX: 'hidden' }}>
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          bgcolor: '#000',
          color: '#fff',
          py: { xs: 1.5, sm: 2 },
          mt: 'auto',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Container maxWidth="lg" >
          <Typography variant="body2" align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
            © 2025 TravelSensei. All rights reserved. | AI-powered travel planning made simple.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;