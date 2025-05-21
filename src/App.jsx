import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from'./pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProviderDashboard from './pages/ProviderDashboard';
import ProtectedRoute from './contexts/ProtectedRoute';
import CustomerDashboard from './pages/CustomerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/provider/signup" element={<Signup provider={true}/>} />
        <Route path="/customer/signup" element={<Signup />} /> 
        <Route path="/login" element={<Login />} />
        <Route
           path="/provider/dashboard"
           element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
        />
        <Route
           path="/customer/dashboard"
           element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
        />

      </Routes>
    </Router>
  );
}

export default App;