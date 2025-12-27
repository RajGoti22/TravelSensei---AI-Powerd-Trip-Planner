// Mobile-first responsive utility functions and components

export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
};

// Responsive padding/spacing utilities
export const responsiveSpacing = {
  container: {
    px: { xs: 1.5, sm: 2, md: 3 },
    py: { xs: 2, sm: 3, md: 4 },
  },
  section: {
    mb: { xs: 3, sm: 4, md: 6 },
  },
  card: {
    p: { xs: 2, sm: 3 },
    mb: { xs: 2, sm: 3 },
  },
  button: {
    px: { xs: 2, sm: 3 },
    py: { xs: 1, sm: 1.5 },
  },
};

// Typography responsive sizes
export const responsiveTypography = {
  hero: {
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
    fontWeight: 700,
    lineHeight: 1.2,
  },
  title: {
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
    fontWeight: 600,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: { xs: '1.125rem', sm: '1.25rem' },
    fontWeight: 500,
    lineHeight: 1.4,
  },
  body: {
    fontSize: { xs: '0.875rem', sm: '1rem' },
    lineHeight: 1.6,
  },
};

// Grid responsive configurations
export const responsiveGrid = {
  // For cards/items display
  cardGrid: {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
  },
  // For form layouts
  formGrid: {
    xs: 12,
    sm: 6,
    md: 4,
  },
  // For feature sections
  featureGrid: {
    xs: 12,
    sm: 6,
    md: 3,
  },
  // For content sections
  contentGrid: {
    xs: 12,
    md: 8,
  },
  sidebarGrid: {
    xs: 12,
    md: 4,
  },
};

// Mobile-first media queries
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.sm})`,
  tablet: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  desktop: `@media (min-width: ${breakpoints.md})`,
  largeDesktop: `@media (min-width: ${breakpoints.lg})`,
};

// Responsive component variants
export const responsiveVariants = {
  // Button variants for different screen sizes
  button: {
    mobile: {
      size: 'medium',
      fullWidth: true,
    },
    desktop: {
      size: 'large',
      fullWidth: false,
    },
  },
  // Dialog/Modal variants
  dialog: {
    mobile: {
      fullScreen: true,
    },
    desktop: {
      fullScreen: false,
      maxWidth: 'md',
    },
  },
  // Navigation variants
  navigation: {
    mobile: {
      variant: 'drawer',
      anchor: 'left',
    },
    desktop: {
      variant: 'persistent',
      position: 'static',
    },
  },
};

// Utility function to check if device is mobile
export const isMobileDevice = () => {
  return typeof window !== 'undefined' && window.innerWidth < 600;
};

// Utility function to get responsive value
export const getResponsiveValue = (values, currentBreakpoint = 'xs') => {
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // Find the appropriate value for current breakpoint or closest smaller one
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i];
    if (values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }
  
  // Fallback to the first available value
  return Object.values(values)[0];
};

// Common responsive styles
export const commonResponsiveStyles = {
  // Hide on mobile
  hideOnMobile: {
    display: { xs: 'none', sm: 'block' },
  },
  // Show only on mobile
  showOnMobile: {
    display: { xs: 'block', sm: 'none' },
  },
  // Center content on mobile
  centerOnMobile: {
    textAlign: { xs: 'center', sm: 'left' },
  },
  // Full width on mobile
  fullWidthOnMobile: {
    width: { xs: '100%', sm: 'auto' },
  },
  // Stack on mobile
  stackOnMobile: {
    flexDirection: { xs: 'column', sm: 'row' },
  },
  // Responsive flex gaps
  flexGap: {
    gap: { xs: 1, sm: 2, md: 3 },
  },
  // Responsive margins
  marginY: {
    my: { xs: 2, sm: 3, md: 4 },
  },
  marginX: {
    mx: { xs: 1, sm: 2, md: 3 },
  },
  // Responsive padding
  paddingY: {
    py: { xs: 2, sm: 3, md: 4 },
  },
  paddingX: {
    px: { xs: 1, sm: 2, md: 3 },
  },
};