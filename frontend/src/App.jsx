import { Container } from '@mui/material';

import { Routes, Route, Link } from 'react-router-dom';
import MainContentSection from './Maincontent';
import Adminpage from './Adminpage';

import "./App.css";
import LoginPage from "./LoginPage";

const App = () => {
  return (
    <div className='app'>
      <Routes>
          <Route path="/" element={<MainContentSection />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/Adminpage" element={ <Adminpage />} />
      </Routes>     
    </div>
  );
};

export default App;