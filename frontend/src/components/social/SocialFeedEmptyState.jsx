import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InsertCommentOutlinedIcon from '@mui/icons-material/InsertCommentOutlined';

const SocialFeedEmptyState = ({ onCreatePost }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="40vh"
    py={6}
    sx={{ opacity: 0.85 }}
  >
    <InsertCommentOutlinedIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
    <Typography variant="h5" fontWeight={600} gutterBottom>
      No posts yet
    </Typography>
    <Typography variant="body1" color="text.secondary" align="center" mb={3}>
      Be the first to share your travel experience with the TravelSensei community!
    </Typography>
    <Button variant="contained" color="primary" onClick={onCreatePost}>
      Create Your First Post
    </Button>
  </Box>
);

export default SocialFeedEmptyState;
