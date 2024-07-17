import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) =>{
    console.log(state.user.user.isAuthenticated,);
  return state.user.user.isAuthenticated;
}

);

  if (!isAuthenticated) {
    return <Navigate to="/LoginPage" />;
  }

  return children;
};

export default ProtectedRoute;