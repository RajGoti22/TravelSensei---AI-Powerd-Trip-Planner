// import React from 'react';
// import { 
//   Box, 
//   Container, 
//   Typography, 
//   Grid, 
//   Card,
//   Button,
//   Chip,
//   Rating
// } from '@mui/material';
// import { 
//   SmartToy, 
//   TravelExplore, 
//   Group 
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// const PopularTours = () => {
//   const navigate = useNavigate();

//   const features = [
//     {
//       icon: <SmartToy sx={{ fontSize: 40, color: 'white' }} />,
//       title: 'AI-Powered Planning',
//       description: 'Get personalized travel recommendations based on your preferences and budget.',
//     },
//     {
//       icon: <TravelExplore sx={{ fontSize: 40, color: 'white' }} />,
//       title: 'Discover Hidden Gems',
//       description: 'Find unique destinations and experiences that match your travel style.',
//     },
//     {
//       icon: <Group sx={{ fontSize: 40, color: 'white' }} />,
//       title: 'Community Insights',
//       description: 'Learn from fellow travelers and share your own experiences.',
//     },
//   ];

//   const popularDestinations = [
//     {
//       id: 1,
//       name: 'Tokyo, Japan',
//       image: '/api/placeholder/300/200',
//       rating: 4.8,
//       price: '$2,500',
//       days: 7,
//       highlights: ['Cultural Sites', 'Food Tours', 'Shopping'],
//     },
//     {
//       id: 2,
//       name: 'Paris, France',
//       image: '/api/placeholder/300/200',
//       rating: 4.7,
//       price: '$3,200',
//       days: 5,
//       highlights: ['Museums', 'Architecture', 'Romance'],
//     },
//     {
//       id: 3,
//       name: 'Bali, Indonesia',
//       image: '/api/placeholder/300/200',
//       rating: 4.9,
//       price: '$1,800',
//       days: 10,
//       highlights: ['Beaches', 'Temples', 'Wellness'],
//     },
//   ];

//   return (
//     <>

//       {/* Popular Destinations */}
//       <Box sx={{ py: { xs: 2.5, sm: 3, md: 4 }, bgcolor: '#fff' }}>
//         <Container maxWidth="lg">
//           <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 2.5, md: 3 } }}>
//             <Typography
//               variant="h2"
//               sx={{
//                 fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
//                 fontWeight: 700,
//                 textTransform: 'uppercase',
//                 letterSpacing: '0.5px',
//                 color: '#000',
//               }}
//             >
//               Most popular tours
//             </Typography>
//           </Box>
          
//           <Grid container spacing={{ xs: 1.5, sm: 2, md: 2 }} justifyContent="center" alignItems="stretch">
//             {popularDestinations.map((destination, index) => (
//               <Grid item xs={12} sm={6} md={4} key={destination.id}>
//                 <Card
//                   sx={{
//                     height: { xs: '310px', sm: '330px', md: '330px' },
//                     position: 'relative',
//                     borderRadius: 2,
//                     overflow: 'hidden',
//                     border: '1px solid #e0e0e0',
//                     boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
//                     transition: 'all 0.2s ease',
//                     maxWidth: { xs: '80%', sm: '270px' },
//                     mx: 'auto',
//                     '&:hover': {
//                       transform: 'translateY(-3px)',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//                       borderColor: '#000',
//                     },
//                   }}
//                 >
//                   {/* Card Image */}
//                   <Box
//                     sx={{
//                       height: { xs: '110px', sm: '115px' },
//                       background: index === 0 
//                         ? 'linear-gradient(to right bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://plus.unsplash.com/premium_photo-1666700698920-d2d2bba589f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHRva3lvfGVufDB8fDB8fHww")'
//                         : index === 1
//                         ? 'linear-gradient(to right bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFyaXN8ZW58MHx8MHx8fDA%3D")'
//                         : 'linear-gradient(to right bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGJhbGl8ZW58MHx8MHx8fDA%3D")',
//                       backgroundSize: 'cover',
//                       backgroundPosition: 'center',
//                       position: 'relative',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                     }}
//                   >
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         color: 'white',
//                         fontWeight: 700,
//                         fontSize: { xs: '1rem', sm: '1.1rem' },
//                         textTransform: 'uppercase',
//                         textAlign: 'center',
//                         textShadow: '0 2px 8px rgba(0,0,0,0.8)',
//                         letterSpacing: '0.5px',
//                         px: 2,
//                       }}
//                     >
//                       {destination.name}
//                     </Typography>
//                   </Box>

//                   {/* Card Details */}
//                   <Box sx={{ p: { xs: 1.5, sm: 1.6 }, pb: 0.8 }}>
//                     <Typography
//                       variant="subtitle2"
//                       sx={{
//                         fontWeight: 600,
//                         textTransform: 'uppercase',
//                         fontSize: { xs: '0.68rem', sm: '0.7rem' },
//                         mb: 0.5,
//                         color: '#616161',
//                         letterSpacing: '0.5px',
//                       }}
//                     >
//                       {destination.days} day tour
//                     </Typography>
                    
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontSize: { xs: '0.75rem', sm: '0.77rem' },
//                         lineHeight: 1.35,
//                         mb: 0.8,
//                         color: '#424242',
//                         display: '-webkit-box',
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: 'vertical',
//                         overflow: 'hidden',
//                       }}
//                     >
//                       Experience the perfect blend of {destination.highlights.join(', ').toLowerCase()}.
//                     </Typography>

//                     <Box sx={{ mb: 0.8 }}>
//                       {destination.highlights.slice(0, 2).map((highlight, idx) => (
//                         <Chip
//                           key={idx}
//                           label={highlight}
//                           size="small"
//                           sx={{
//                             mr: 0.5,
//                             mb: 0.5,
//                             fontSize: { xs: '0.63rem', sm: '0.65rem' },
//                             height: '18px',
//                             bgcolor: '#f5f5f5',
//                             color: '#424242',
//                             border: '1px solid #e0e0e0',
//                             fontWeight: 600,
//                           }}
//                         />
//                       ))}
//                     </Box>

//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
//                       <Rating value={destination.rating} readOnly precision={0.1} size="small" sx={{ fontSize: '0.95rem', '& .MuiRating-iconFilled': { color: '#FFC107' } }} />
//                       <Typography variant="caption" sx={{ ml: 0.8, fontSize: { xs: '0.68rem', sm: '0.7rem' }, color: '#616161', fontWeight: 600 }}>
//                         ({destination.rating})
//                       </Typography>
//                     </Box>
//                   </Box>

//                   {/* Card Footer */}
//                   <Box
//                     sx={{
//                       position: 'absolute',
//                       bottom: 0,
//                       left: 0,
//                       right: 0,
//                       pt: 0.7,
//                       pr: { xs: 1.5, sm: 1.6 },
//                       pl: { xs: 1.5, sm: 1.6 },
//                       pb: { xs: 1.5, sm: 1.6 },
//                       bgcolor: 'white',
//                       borderTop: '1px solid #e0e0e0',
//                     }}
//                   >
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
//                       <Typography variant="caption" sx={{ fontSize: { xs: '0.66rem', sm: '0.68rem' }, color: '#757575', fontWeight: 500 }}>
//                         Starting from
//                       </Typography>
//                       <Typography
//                         variant="h6"
//                         sx={{
//                           fontWeight: 700,
//                           fontSize: { xs: '1.05rem', sm: '1.1rem' },
//                           color: '#000',
//                         }}
//                       >
//                         {destination.price}
//                       </Typography>
//                     </Box>
//                     <Button
//                       variant="contained"
//                       fullWidth
//                       size="small"
//                       sx={{
//                         bgcolor: '#000',
//                         color: '#fff',
//                         borderRadius: 1.5,
//                         py: { xs: 0.55, sm: 0.6 },
//                         textTransform: 'uppercase',
//                         letterSpacing: '0.5px',
//                         fontWeight: 600,
//                         fontSize: { xs: '0.7rem', sm: '0.72rem' },
//                         transition: 'all 0.2s ease',
//                         '&:hover': {
//                           bgcolor: '#212121',
//                           transform: 'translateY(-1px)',
//                           boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
//                         },
//                       }}
//                       onClick={() => navigate('/explore')}
//                     >
//                       Book Now
//                     </Button>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>
//     </>
//   );
// };

// export default PopularTours;



import React from 'react';
import { Box, Container, Typography, Grid, Card, Button, Chip, Rating } from '@mui/material';
import { SmartToy, TravelExplore, Group } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PopularTours = () => {
  const navigate = useNavigate();
  const popularDestinations = [
    { id: 1, name: 'Tokyo, Japan', rating: 4.8, price: '$2,500', days: 7, highlights: ['Cultural Sites', 'Food Tours', 'Shopping'] },
    { id: 2, name: 'Paris, France', rating: 4.7, price: '$3,200', days: 5, highlights: ['Museums', 'Architecture', 'Romance'] },
    { id: 3, name: 'Bali, Indonesia', rating: 4.9, price: '$1,800', days: 10, highlights: ['Beaches', 'Temples', 'Wellness'] },
  ];
  return (
    <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" sx={{
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' },
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: '#000',
              mb: 0.8,
              textTransform: 'uppercase',
            }}>
            Most popular tours
          </Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center" alignItems="stretch" >
          {popularDestinations.map((destination, index) => (
            <Grid item xs={12} sm={6} md={4} key={destination.id}>
              <Card sx={{ mt:2,mb:2, height: 360, position: 'relative', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 6px 22px rgba(0,0,0,0.08)', transition: 'all 0.25s ease', maxWidth: 300, mx: 'auto', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(0,0,0,0.12)' } }}>
                <Box sx={{ height: 140, background: index === 0 ? 'linear-gradient(to right bottom, rgba(17,17,17,.15), rgba(17,17,17,.35)), url("https://plus.unsplash.com/premium_photo-1666700698920-d2d2bba589f8?w=600&auto=format&fit=crop&q=60")' : index === 1 ? 'linear-gradient(to right bottom, rgba(17,17,17,.15), rgba(17,17,17,.35)), url("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=60")' : 'linear-gradient(to right bottom, rgba(17,17,17,.15), rgba(17,17,17,.35)), url("https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=600&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'screen', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 500, fontSize: '1.3rem', textTransform: 'uppercase', textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.7)', px: 2 }}>
                    {destination.name}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, pb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '.78rem', mb: .8, color: '#111' }}>
                    {destination.days} day tour
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '.9rem', lineHeight: 1.5, mb: 1.2, color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Experience the perfect blend of {destination.highlights.join(', ').toLowerCase()}.
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    {destination.highlights.slice(0, 2).map((highlight, idx) => (
                      <Chip key={idx} label={highlight} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '.68rem', height: 22, bgcolor: 'rgba(17,17,17,0.06)', color: 'primary.main' }} />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={destination.rating} readOnly precision={0.1} size="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>({destination.rating})</Typography>
                  </Box>
                </Box>
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, pt: 0.5, pr: 2, pl: 2, pb: 2, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Starting from</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#111' }}>{destination.price}</Typography>
                  </Box>
                  <Button variant="outlined" fullWidth size="small" sx={{ borderColor: '#111', color: '#111', borderRadius: '12px', py: .8, textTransform: 'uppercase', letterSpacing: '.04rem', fontWeight: 700, fontSize: '.78rem', borderWidth: '2px', transition: 'all 0.2s', '&:hover': { bgcolor: '#111', transform: 'translateY(-1px)', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }} onClick={() => navigate('/explore')}>
                    Book Now
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default PopularTours


