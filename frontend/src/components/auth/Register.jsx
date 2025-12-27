import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import { Google, Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /\d/,
  special: /[!@#$%^&*()_+\-=\[\]{};:'"",.<>?/\\|`~]/,
};

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .test('uppercase', 'Password must contain at least one uppercase letter', (value) => {
      return value ? passwordRegex.uppercase.test(value) : false;
    })
    .test('lowercase', 'Password must contain at least one lowercase letter', (value) => {
      return value ? passwordRegex.lowercase.test(value) : false;
    })
    .test('digit', 'Password must contain at least one digit (0-9)', (value) => {
      return value ? passwordRegex.digit.test(value) : false;
    })
    .test('special', 'Password must contain at least one special character (!@#$%^&*...)', (value) => {
      return value ? passwordRegex.special.test(value) : false;
    }),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');
  const { register: registerUser, registerWithGoogle, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Watch password field to show real-time feedback
  const watchedPassword = watch('password');

  React.useEffect(() => {
    setPasswordValue(watchedPassword || '');
  }, [watchedPassword]);

  // Check password requirements
  const getPasswordChecks = () => {
    const pwd = passwordValue;
    return {
      minLength: pwd.length >= 8,
      uppercase: passwordRegex.uppercase.test(pwd),
      lowercase: passwordRegex.lowercase.test(pwd),
      digit: passwordRegex.digit.test(pwd),
      special: passwordRegex.special.test(pwd),
    };
  };

  const checks = getPasswordChecks();
  const allChecksPassed = Object.values(checks).every(v => v === true);

  // Clear errors when component mounts
  React.useEffect(() => {
    clearError();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // clearError is stable from context, no need to include in deps

  const onSubmit = async (data) => {
    try {
      // Fix: Pass name, email, and password as separate parameters, not as an object
      const result = await registerUser(data.name, data.email, data.password);
      if (result.success) {
        navigate('/', { replace: true });
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
        
        // Use the proper registerWithGoogle method
        const authResult = await registerWithGoogle(user, idToken);
        
        if (authResult.success) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        // Suppress CORS and popup-related errors from Firebase
        const errorMsg = error.message || '';
        const isCorsError = errorMsg.includes('window.closed') || 
                           errorMsg.includes('Cross-Origin-Opener-Policy');
        if (!isCorsError) {
          console.error('Google register error:', error);
        }
      }
    } else {
      console.log(`Social login with ${provider} not yet implemented`);
    }
    setSocialLoading(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1100,
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
            flex: { xs: 'unset', md: '0 0 420px' },
            width: { xs: '95vw', sm: 380, md: 420 },
            maxWidth: { xs: 400, md: 420 },
            p: { xs: 3, sm: 4, md: 4 },
            borderRadius: { xs: 2.5, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: { xs: 'auto', md: 520 },
            boxShadow: { xs: 6, md: 'none' },
            background: { xs: '#fff', md: 'transparent' },
            mx: 'auto',
            my: { xs: 2, md: 0 },
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#0f172a' }}>
              Join TravelSensei
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your account and start planning amazing trips
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('name')}
                label="Full Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                autoComplete="name"
                autoFocus
                size="small"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />

              <TextField
                {...register('email')}
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                size="small"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />

              <Box sx={{ position: 'relative', mb: 2 }}>
                <TextField
                  {...register('password')}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
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

                {/* Password Strength Indicator */}
                {passwordValue && !allChecksPassed && (
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #e5e7eb' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 1 }}>
                      Password Requirements:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {/* Min Length */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                          {checks.minLength ? (
                            <Check sx={{ fontSize: 16, color: '#10b981' }} />
                          ) : (
                            <Close sx={{ fontSize: 16, color: '#ef4444' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: checks.minLength ? '#059669' : '#7f1d1d', fontSize: '0.8rem' }}>
                          Minimum 8 characters
                        </Typography>
                      </Box>

                      {/* Uppercase */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                          {checks.uppercase ? (
                            <Check sx={{ fontSize: 16, color: '#10b981' }} />
                          ) : (
                            <Close sx={{ fontSize: 16, color: '#ef4444' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: checks.uppercase ? '#059669' : '#7f1d1d', fontSize: '0.8rem' }}>
                          One uppercase letter (A-Z)
                        </Typography>
                      </Box>

                      {/* Lowercase */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                          {checks.lowercase ? (
                            <Check sx={{ fontSize: 16, color: '#10b981' }} />
                          ) : (
                            <Close sx={{ fontSize: 16, color: '#ef4444' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: checks.lowercase ? '#059669' : '#7f1d1d', fontSize: '0.8rem' }}>
                          One lowercase letter (a-z)
                        </Typography>
                      </Box>

                      {/* Digit */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                          {checks.digit ? (
                            <Check sx={{ fontSize: 16, color: '#10b981' }} />
                          ) : (
                            <Close sx={{ fontSize: 16, color: '#ef4444' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: checks.digit ? '#059669' : '#7f1d1d', fontSize: '0.8rem' }}>
                          One digit (0-9)
                        </Typography>
                      </Box>

                      {/* Special Character */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                          {checks.special ? (
                            <Check sx={{ fontSize: 16, color: '#10b981' }} />
                          ) : (
                            <Close sx={{ fontSize: 16, color: '#ef4444' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: checks.special ? '#059669' : '#7f1d1d', fontSize: '0.8rem' }}>
                          One special character (!@#$%^&*...)
                        </Typography>
                      </Box>
                    </Box>

                    {/* Overall Strength Bar */}
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Object.values(checks).filter(Boolean).length * 20}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: allChecksPassed ? '#10b981' : '#f59e0b',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ position: 'relative', mb: 1 }}>
                <TextField
                  {...register('confirmPassword')}
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <IconButton
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  aria-label={showConfirmPassword ? 'hide password' : 'show password'}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Box>

              <FormControlLabel
                control={<Checkbox {...register('agreeToTerms')} sx={{ '&.Mui-checked': { color: '#000000' } }} />}
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" sx={{ textDecoration: 'none', color: '#000000' }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" sx={{ textDecoration: 'none', color: '#000000' }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mt: 1, alignItems: 'flex-start' }}
              />
              {errors.agreeToTerms && (
                <Typography variant="caption" color="error" sx={{ ml: 4, display: 'block' }}>
                  {errors.agreeToTerms.message}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={loading}
                sx={{ mt: 2, mb: 1, background: '#000', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { background: '#111' } }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
              </Button>

              <Divider sx={{ my: 1.5 }}> <Typography variant="body2" color="text.secondary">or continue with</Typography> </Divider>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Already have an account? <Link component="button" type="button" onClick={() => navigate('/login')}>Sign in</Link></Typography>
          </Box>
        </Paper>

        {/* Right: Illustration Panel with provided image */}
        <Box
          sx={{
            flex: 1,
            minHeight: { xs: 220, md: 520 },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, sm: 4, md: 0 },
            background: 'linear-gradient(120deg, #f0fbf3 60%, #e0e7ff 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{
            width: '100%',
            maxWidth: 480,
            mx: 'auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}>
            <img
              src={process.env.PUBLIC_URL ? process.env.PUBLIC_URL + '/login-illustration_2.png' : '/login-illustration_2.png'}
              alt="TravelSensei register illustration"
              style={{
                width: '100%',
                maxWidth: 450,
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                margin: '0 auto 18px',
                background: 'transparent',
                boxShadow: 'none',
                borderRadius: 0
              }}
              loading="lazy"
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 1, mt: 0, textAlign: 'center', fontSize: { xs: 20, md: 22 } }}>
              Create your account and start exploring
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0, textAlign: 'center', fontSize: { xs: 15, md: 16 } }}>
              Plan trips, manage itineraries, and collaborate with your travel buddies using <b>TravelSensei</b>.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;