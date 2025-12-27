import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  useMediaQuery,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { getAuth } from 'firebase/auth';


const CreatePostDialog = ({ open, onClose, onSubmit, newPost, onPostChange }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = useRef();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleContentChange = (e) => {
    onPostChange({ ...newPost, content: e.target.value });
  };

    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Show preview immediately with blob URL
        const previewUrl = URL.createObjectURL(file);
        onPostChange({ ...newPost, photos: [previewUrl] });
      
        // Upload to backend
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
        
          // Get fresh Firebase ID token
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) {
            throw new Error('Not authenticated');
          }
          const idToken = await user.getIdToken();
          
          const response = await fetch('http://localhost:5000/api/upload/image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`
            },
            body: formData
          });
        
          const data = await response.json();
          console.log('[CreatePostDialog] Upload response:', data);
          if (data.success && data.url) {
            // Replace preview with actual uploaded URL
            const fullUrl = data.url.startsWith('http') ? data.url : `http://localhost:5000${data.url}`;
            console.log('[CreatePostDialog] Setting image URL:', fullUrl);
            onPostChange({ ...newPost, photos: [fullUrl] });
          } else {
            console.error('[CreatePostDialog] Upload failed:', data);
            alert('Image upload failed. Please try again.');
            onPostChange({ ...newPost, photos: [] });
          }
        } catch (error) {
          console.error('[CreatePostDialog] Image upload error:', error);
          alert('Image upload failed. Please check your connection.');
          onPostChange({ ...newPost, photos: [] });
        } finally {
          setUploading(false);
        }
      }
    };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    onPostChange({ ...newPost, photos: [] });
  };

  const handleSubmit = () => {
      if (!newPost.content.trim() && (!newPost.photos || newPost.photos.length === 0)) return;
      if (uploading) return; // Don't submit while uploading
    onSubmit();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: "linear-gradient(135deg, #fff 60%, #f3f3f3 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          px: isMobile ? 1 : 3,
          py: isMobile ? 1 : 2,
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#111' }}>
              Create New Post
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, mb:1, color: '#444' }}>
              Share your travel moments with the community
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: '#222' }} />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, overflow: 'visible' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Stack spacing={2.5}>
            <TextField
              value={newPost.content}
              onChange={handleContentChange}
              label="Write something..."
              multiline
              minRows={isMobile ? 2 : 3}
              fullWidth
              variant="outlined"
              sx={{
                background: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  color: '#111',
                  '& fieldset': {
                    borderColor: '#222',
                  },
                  '&:hover fieldset': {
                    borderColor: '#444',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#444',
                },
              }}
            />
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: dragActive ? '2px solid #111' : '2px dashed #888',
                borderRadius: 2,
                p: 0,
                textAlign: 'center',
                background: dragActive ? 'rgba(0,0,0,0.04)' : 'transparent',
                transition: '0.3s',
                cursor: 'pointer',
                position: 'relative',
                height: 210,
                minHeight: 180,
                maxHeight: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                mt: 0.5,
                overflow: 'hidden',
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                accept="image/*"
                type="file"
                id="upload-image"
                style={{ display: "none" }}
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              {newPost.photos && newPost.photos.length > 0 ? (
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img
                      src={newPost.photos[0]}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 'inherit',
                        background: '#f5f5f5',
                        display: 'block',
                      }}
                    />
                  </Box>
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      zIndex: 2,
                      '&:hover': { background: 'rgba(0,0,0,0.75)' },
                      boxShadow: 1,
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <Stack alignItems="center" spacing={1} width="100%">
                  <AddPhotoAlternateIcon sx={{ fontSize: 38, color: dragActive ? '#111' : '#888' }} />
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    Drag & drop or click to upload image
                  </Typography>
                </Stack>
              )}
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit}
              sx={{
                py: 1.3,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: isMobile ? '1rem' : '1.08rem',
                textTransform: "none",
                background: '#111',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': {
                  background: '#222',
                },
                '&:disabled': {
                  background: '#bbb',
                  color: '#fff',
                },
              }}
                disabled={uploading || (!newPost.content.trim() && (!newPost.photos || newPost.photos.length === 0))}
            >
                {uploading ? 'Uploading...' : 'Post'}
            </Button>
          </Stack>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
