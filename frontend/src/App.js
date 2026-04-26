
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import AddContribution from './pages/AddContribution';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to='/login' />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path='/group/:id' element={<PrivateRoute><GroupDetail /></PrivateRoute>} />
        <Route path='/group/:id/contribute' element={<PrivateRoute><AddContribution /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
