import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Default credentials - Change these to your own!
  const USERS = [
    { username: 'lizette', password: 'winkel2', name: 'Lizette' },
    { username: 'hannelet', password: 'shop2025', name: 'HannDevelop' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password');
      setPassword('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #2c5530 0%, #1a3d1f 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            backgroundColor: '#e8f5e9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2c5530'
          }}>
            <Lock size={40} />
          </div>
          <h1 style={{ fontSize: '28px', color: '#1a3d1f', marginBottom: '8px' }}>
            Farm Shop
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Please login to continue
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
                style={{ paddingLeft: '40px' }}
              />
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ paddingLeft: '40px' }}
              />
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '12px',
              fontSize: '16px',
              marginTop: '8px'
            }}
          >
            Login
          </button>
        </form>

        <div style={{ 
          marginTop: '32px', 
          padding: '16px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>Default Accounts:</strong>
                    <div style={{ marginTop: '8px', fontSize: '11px', fontStyle: 'italic' }}>
            Change these in Login.jsx file
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
