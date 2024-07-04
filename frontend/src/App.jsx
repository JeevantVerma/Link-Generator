// import React from 'react';
import { Container } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import MainContentSection from './Maincontent';
import LoginPageSection from './loginPage';
import ErrorPageSection from './errorPage';
import "./App.css";

const App = () => {
  return (
    <div className='app'>
    <Container
      maxWidth="md" 
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '89vh',
        width: {
          xs: '100%',
          md: '50vw',
        }
      }}
    >
      <Routes>
        <Route path="/" element={<LoginPageSection />} />
        <Route path="/link-gen" element={<MainContentSection />} />
        <Route path="/error" element={<ErrorPageSection />} />
      </Routes>
    </Container>
      
    </div>
  );
};

export default App;