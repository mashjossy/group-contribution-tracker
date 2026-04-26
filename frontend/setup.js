const fs = require('fs');

// App.js
fs.writeFileSync('src/App.js', `
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
`);

// index.js
fs.writeFileSync('src/index.js', `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

// Login.js
fs.writeFileSync('src/pages/Login.js', `
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#f0f4f8'}}>
      <div style={{background:'#fff',padding:40,borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:380}}>
        <h2 style={{textAlign:'center',color:'#1F4E79'}}>💰 ContriTracker</h2>
        <h3 style={{textAlign:'center',color:'#555',fontWeight:'normal',marginBottom:24}}>Sign In</h3>
        {error && <p style={{background:'#ffe5e5',color:'#c0392b',padding:10,borderRadius:6,marginBottom:16,textAlign:'center'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='email' type='email' placeholder='Email address' value={form.email} onChange={handleChange} required />
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='password' type='password' placeholder='Password' value={form.password} onChange={handleChange} required />
          <button style={{width:'100%',padding:13,background:'#1F4E79',color:'#fff',border:'none',borderRadius:8,fontSize:16,cursor:'pointer'}} type='submit' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:16}}>No account? <Link to='/register'>Register here</Link></p>
      </div>
    </div>
  );
}
`);

// Register.js
fs.writeFileSync('src/pages/Register.js', `
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#f0f4f8'}}>
      <div style={{background:'#fff',padding:40,borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:380}}>
        <h2 style={{textAlign:'center',color:'#1F4E79'}}>💰 ContriTracker</h2>
        <h3 style={{textAlign:'center',color:'#555',fontWeight:'normal',marginBottom:24}}>Create Account</h3>
        {error && <p style={{background:'#ffe5e5',color:'#c0392b',padding:10,borderRadius:6,marginBottom:16,textAlign:'center'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='full_name' type='text' placeholder='Full Name' value={form.full_name} onChange={handleChange} required />
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='email' type='email' placeholder='Email address' value={form.email} onChange={handleChange} required />
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='password' type='password' placeholder='Password' value={form.password} onChange={handleChange} required />
          <button style={{width:'100%',padding:13,background:'#1F4E79',color:'#fff',border:'none',borderRadius:8,fontSize:16,cursor:'pointer'}} type='submit' disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:16}}>Already have an account? <Link to='/login'>Sign in here</Link></p>
      </div>
    </div>
  );
}
`);

// Dashboard.js
fs.writeFileSync('src/pages/Dashboard.js', `
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div style={{padding:40}}>
      <h1 style={{color:'#1F4E79'}}>Welcome, {user?.full_name} 👋</h1>
      <p>Your dashboard is loading...</p>
    </div>
  );
}
`);

// GroupDetail.js
fs.writeFileSync('src/pages/GroupDetail.js', `
import React from 'react';

export default function GroupDetail() {
  return (
    <div style={{padding:40}}>
      <h1 style={{color:'#1F4E79'}}>Group Detail</h1>
    </div>
  );
}
`);

// AddContribution.js
fs.writeFileSync('src/pages/AddContribution.js', `
import React from 'react';

export default function AddContribution() {
  return (
    <div style={{padding:40}}>
      <h1 style={{color:'#1F4E79'}}>Add Contribution</h1>
    </div>
  );
}
`);

// Navbar.js
fs.writeFileSync('src/components/Navbar.js', `
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{background:'#1F4E79',color:'#fff',padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <Link to='/' style={{color:'#fff',textDecoration:'none',fontWeight:'bold',fontSize:20}}>💰 ContriTracker</Link>
      {user && (
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <span style={{fontSize:14,color:'#fff'}}>👤 {user.full_name}</span>
          <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.2)',color:'#fff',border:'none',padding:'7px 14px',borderRadius:6,cursor:'pointer',fontSize:14}}>Logout</button>
        </div>
      )}
    </nav>
  );
}
`);

// AuthContext.js
fs.writeFileSync('src/context/AuthContext.js', `
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('user')) || null
  );

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
`);

// axios.js
fs.writeFileSync('src/api/axios.js', `
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export default api;
`);

console.log('All files written successfully!');