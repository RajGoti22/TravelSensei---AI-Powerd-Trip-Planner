import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link, Divider, IconButton, Alert, CircularProgress } from '@mui/material';
import { Google } from '@mui/icons-material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';

const schema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const { login, loginWithGoogle, demoLogin, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Clear errors when component mounts
  React.useEffect(() => {
    clearError();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // clearError is stable from context, no need to include in deps

  const onSubmit = async (data) => {
    try {
      // Fix: Pass email and password as separate parameters, not as an object
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    if (provider === 'google') {
      try {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const idToken = await user.getIdToken();
        
        // Use the proper loginWithGoogle method
        const authResult = await loginWithGoogle(user, idToken);
        
        if (authResult.success) {
          navigate(from, { replace: true });
        }
      } catch (error) {
        // Suppress CORS and popup-related errors from Firebase
        const errorMsg = error.message || '';
        const isCorsError = errorMsg.includes('window.closed') || 
                           errorMsg.includes('Cross-Origin-Opener-Policy');
        if (!isCorsError) {
          console.error('Google login error:', error);
        }
      }
    } else {
      console.log(`Social login with ${provider} not yet implemented`);
    }
    setSocialLoading(null);
  };

  const handleDemoLogin = async () => {
    const result = await demoLogin();
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1000,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 },
          alignItems: 'stretch',
          boxShadow: { xs: 'none', md: 6 },
          borderRadius: 3,
          overflow: 'hidden',
          background: { xs: 'none', md: '#fff' },
        }}
      >
        {/* Left: Form Card */}
        <Paper
          elevation={0}
          sx={{
            flex: { xs: 'unset', md: '0 0 370px' },
            width: { xs: '95vw', sm: 380, md: 370 },
            maxWidth: { xs: 400, md: 370 },
            p: { xs: 4, sm: 5, md: 4 },
            borderRadius: { xs: 3, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: { xs: 540, md: 520 },
            boxShadow: { xs: 6, md: 'none' },
            background: { xs: '#fff', md: 'transparent' },
            mx: 'auto',
            my: { xs: 2, md: 0 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, mt: 0.5, textAlign: 'left' }}>
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, textAlign: 'left' }}>
              Sign in to your TravelSensei account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {error === 'Failed to fetch' ? 'Cannot reach backend. Start the Python server or use Demo Login.' : error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('email')}
                id="email"
                label="Username or Email"
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                autoFocus
                size="small"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />

              <Box sx={{ position: 'relative', mb: 2 }}>
                <TextField
                  {...register('password')}
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="current-password"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <IconButton
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  aria-label={showPassword ? 'hide password' : 'show password'}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={loading}
                sx={{ mt: 1, mb: 2, background: '#000', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { background: '#111' } }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Login'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, mb: 2 }}>
                <Button variant="text" size="small" onClick={handleDemoLogin} sx={{ textTransform: 'none', px: 0 }}>
                  Try demo
                </Button>
                <Link component="button" type="button" onClick={() => navigate('/register')} sx={{ textTransform: 'none', px: 0 }}>
                  Register now
                </Link>
              </Box>

              <Divider sx={{ my: 2 }}> <Typography variant="body2" color="text.secondary">or continue with</Typography> </Divider>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                <IconButton
                  onClick={() => handleSocialLogin('google')}
                  disabled={!!socialLoading}
                  sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', p: 1.2 }}
                  aria-label="google sign in"
                >
                  {socialLoading === 'google' ? <CircularProgress size={18} /> : <Google />}
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Not a member? <Link component="button" type="button" onClick={() => navigate('/register')}>Register now</Link></Typography>
          </Box>
        </Paper>

        {/* Right: Minimal Illustration Panel (reference style) */}
        <Box
          sx={{
            flex: 1,
            minHeight: { xs: 260, md: 520 },
            // display: 'flex',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, sm: 4, md: 0 },
            background: 'linear-gradient(120deg, #f6fbf7 60%, #e0e7ff 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{
            width: '100%',
            maxWidth: 340,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}>
            <img
              src={process.env.PUBLIC_URL ? process.env.PUBLIC_URL + '/login-illustration.png' : '/login-illustration.png'}
              alt="TravelSensei login illustration"
              style={{
                width: '100%',
                maxWidth: 350,
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                margin: '0 auto',
                background: 'transparent',
                boxShadow: 'none',
                borderRadius: 0
              }}
              loading="lazy"
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 1, mt: 1, textAlign: 'center', fontSize: { xs: 18, md: 20 } }}>
            Make your work easier and organized
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0, textAlign: 'center', fontSize: { xs: 14, md: 15 } }}>
            Plan trips, manage itineraries, and collaborate with your travel buddies using <b>TravelSensei</b>.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;