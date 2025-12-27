import React from 'react';
import {
  Menu,
  MenuItem,
} from '@mui/material';

const ReviewFilters = ({ anchorEl, open, onClose, onFilterChange }) => {
  const handleFilterSelect = (rating) => {
    onFilterChange(rating);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 181, 246, 0.1)',
          borderRadius: 2,
        }
      }}
    >
      <MenuItem onClick={() => handleFilterSelect(0)}>
        All Ratings
      </MenuItem>
      <MenuItem onClick={() => handleFilterSelect(5)}>
        5 Stars Only
      </MenuItem>
      <MenuItem onClick={() => handleFilterSelect(4)}>
        4+ Stars
      </MenuItem>
      <MenuItem onClick={() => handleFilterSelect(3)}>
        3+ Stars
      </MenuItem>
    </Menu>
  );
};

export default ReviewFilters;
