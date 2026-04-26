
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
