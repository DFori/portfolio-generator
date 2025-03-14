// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EditPortfolio from './pages/EditPortfolio.jsx';
import ViewPortfolio from './pages/ViewPortfolio.jsx';
import ProtectedRoute from './components/ProtectedRoute';

// Firebase config
import './firebase';

function App() {
  // State declarations
  const [hasError, setHasError] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleError = (error, errorInfo) => {
    console.error('Routing Error:', error);
    console.error('Error Info:', errorInfo);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <p className="mb-4">There was an error loading the application.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit/:portfolioId" 
          element={
            <ProtectedRoute user={user}>
              <EditPortfolio />
            </ProtectedRoute>
          } 
        />
        <Route path="/portfolio/:portfolioId" element={<ViewPortfolio />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;