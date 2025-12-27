import React from 'react';
import {
  Box,
  Tab,
  Tabs,
} from '@mui/material';

const ReviewTabs = ({ activeTab, tabs, onTabChange, getTabCount }) => {
  return (
    <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid #e0e0e0',
          '& .MuiTab-root': {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            py: { xs: 1.25, sm: 1.5 },
            px: { xs: 2, sm: 2.5 },
            color: '#616161',
            minHeight: { xs: 42, sm: 48 },
            minWidth: 'auto',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#000',
            },
            '&.Mui-selected': {
              color: '#000',
              fontWeight: 700,
            }
          },
          '& .MuiTabs-indicator': {
            background: '#000',
            height: 2,
          },
          '& .MuiTabs-flexContainer': {
            gap: 0.5,
          }
        }}
      >
        {tabs.map((tab, index) => (
          <Tab 
            key={index} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{tab.label}</span>
                <Box
                  sx={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#000',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getTabCount(tab.value)}
                </Box>
              </Box>
            } 
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default ReviewTabs;
