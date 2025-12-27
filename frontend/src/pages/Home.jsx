import React from 'react';
import { Box } from '@mui/material';
import Hero from '../components/Home/Hero';
import Features from '../components/Home/Features';
import PopularTours from '../components/Home/PopularTours';
import Testimonials from '../components/Home/Testimonials';
import CallToAction from '../components/Home/CallToAction';

const Home = () => {
  React.useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ 
      width: '100%', 
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <Hero />
      <Features />
      {/* <PopularTours /> */}
      <Testimonials />
      <CallToAction />
    </Box>
  );
};

export default Home;