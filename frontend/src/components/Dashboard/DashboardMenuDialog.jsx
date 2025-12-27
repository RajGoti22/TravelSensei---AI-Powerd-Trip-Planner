import React from 'react';
import { Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Visibility, Edit, Share, Download, Delete } from '@mui/icons-material';

const DashboardMenuDialog = ({
  anchorEl,
  open,
  handleMenuClose,
  selectedItinerary,
  navigate,
  handleShareItinerary,
  handleExportItinerary,
  setDeleteDialogOpen,
  deleteDialogOpen,
  handleDeleteItinerary
}) => (
  <>
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(14,30,37,0.12)',
          mt: 1,
        },
      }}
    >
      <MenuItem onClick={() => navigate(`/itinerary/${selectedItinerary?.id}`)}>
        <Visibility sx={{ mr: 1 }} />
        View Details
      </MenuItem>
      <MenuItem onClick={() => navigate('/itinerary/create', { state: { editingItinerary: selectedItinerary } })}>
        <Edit sx={{ mr: 1 }} />
        Edit
      </MenuItem>
      <MenuItem onClick={handleShareItinerary}>
        <Share sx={{ mr: 1 }} />
        Share
      </MenuItem>
      {/* <MenuItem onClick={() => handleExportItinerary('json')}>
        <Download sx={{ mr: 1 }} />
        Export JSON
      </MenuItem>
      <MenuItem onClick={() => handleExportItinerary('ics')}>
        <Download sx={{ mr: 1 }} />
        Export Calendar
      </MenuItem> */}
      <MenuItem 
        onClick={() => setDeleteDialogOpen(true)}
        sx={{ color: 'error.main' }}
      >
        <Delete sx={{ mr: 1 }} />
        Delete
      </MenuItem>
    </Menu>
    <Dialog
      open={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
    >
      <DialogTitle>Delete Itinerary</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{selectedItinerary?.title}"? 
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteItinerary}
          color="error"
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </>
);

export default DashboardMenuDialog;
