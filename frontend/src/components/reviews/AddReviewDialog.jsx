import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Rating,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';

const AddReviewDialog = ({ open, onClose, onSubmit, type = 'hotel', initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
    location: '',
    visitDate: '',
    tags: [],
  });

  // Update form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        rating: initialData.rating || 5,
        location: initialData.location || '',
        visitDate: initialData.visitDate || '',
        tags: initialData.tags || [],
      });
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        title: '',
        content: '',
        rating: 5,
        location: '',
        visitDate: '',
        tags: [],
      });
    }
  }, [initialData, isEdit, open]);

  const handleSubmit = () => {
    onSubmit({ ...formData, type });
    onClose();
    if (!isEdit) {
      setFormData({
        title: '',
        content: '',
        rating: 5,
        location: '',
        visitDate: '',
        tags: [],
      });
    }
  };

  const handleTagAdd = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, event.target.value.trim()]
      }));
      event.target.value = '';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        fontSize: '1.25rem', 
        fontWeight: 600,
        color: '#1F2937',
        borderBottom: '1px solid #E5E7EB'
      }}>
        {isEdit ? 'Edit Review' : 'Write a Review'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Review Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Where did you visit?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Rating
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, rating: newValue }));
                }}
                size="large"
                sx={{ '& .MuiRating-iconFilled': { color: '#FFC107' } }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Visit Date"
              type="date"
              value={formData.visitDate}
              onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your Review"
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your experience, what you liked, tips for other travelers..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tags (press Enter to add)"
              placeholder="e.g., family-friendly, romantic, budget, luxury"
              onKeyPress={handleTagAdd}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                }
              }}
            />
            <Box sx={{ mt: 1 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => {
                    setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.filter((_, i) => i !== index)
                    }));
                  }}
                  sx={{ 
                    mr: 0.5, 
                    mb: 0.5,
                    bgcolor: '#f5f5f5',
                    color: '#212121',
                    fontSize: '0.875rem',
                    border: '1px solid #e0e0e0',
                    '& .MuiChip-deleteIcon': {
                      color: '#616161',
                      '&:hover': {
                        color: '#000',
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid #E5E7EB',
        gap: 1
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#e0e0e0',
            color: '#6B7280',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#9CA3AF',
              bgcolor: '#F9FAFB',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.content || !formData.rating}
          sx={{
            bgcolor: '#000',
            color: 'white',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              bgcolor: '#212121',
            },
            '&.Mui-disabled': {
              bgcolor: '#D1D5DB',
              color: '#9CA3AF',
            }
          }}
        >
          {isEdit ? 'Update Review' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddReviewDialog;
