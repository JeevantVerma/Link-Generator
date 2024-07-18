import { Routes, Route } from 'react-router-dom';
import MainContentSection from './Maincontent';
import Adminpage from './Adminpage';
import ProtectedRoute from './utils/ProtectedRoute';
import "./App.css";
import LoginPage from "./LoginPage";

const App = () => {
  return (
    <div className='app'>
      <Routes>
          <Route path="/" element={<MainContentSection />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/Adminpage" element={
            <ProtectedRoute>
              <Adminpage />
            </ProtectedRoute>
            } /> 
      </Routes>     
    </div>
  );
};

export default App;