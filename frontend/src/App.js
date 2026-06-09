import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider, useLang } from './context/LangContext';
import Navbar from './components/Navbar';
import LanguageSelect from './components/LanguageSelect';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Shaadi from './pages/Shaadi';
import ShaadiProfile from './pages/ShaadiProfile';
import Messages from './pages/Messages';
import Badges from './pages/Badges';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="sindoor-loader"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { lang } = useLang();
  if (!lang) return <LanguageSelect />;
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/shaadi" element={<Shaadi />} />
        <Route path="/shaadi/profile/:id" element={<ShaadiProfile />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/badges" element={<PrivateRoute><Badges /></PrivateRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <AppContent />
        </Router>
      </AuthProvider>
    </LangProvider>
  );
}

export default App;
