import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CursorProvider, CursorGlowTrail } from './components/CursorEffects';
import AnimatedBackground from './components/AnimatedBackground';
import { pageTransition } from './utils/motion';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import Navbar from './components/Navbar';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

/* Shows LandingPage for guests, Home for authenticated users */
function SmartHome() {
  const { user } = useAuth();
  return user ? <Home /> : <LandingPage />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageWrapper><SmartHome /></PageWrapper>
          } />
          <Route path="/login" element={
            <PageWrapper><AuthPage /></PageWrapper>
          } />
          <Route path="/register" element={
            <PageWrapper><AuthPage /></PageWrapper>
          } />
          <Route path="/jobs" element={<Navigate to="/" replace />} />
          <Route path="/jobs/:id" element={
            <PageWrapper><JobDetail /></PageWrapper>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <PageWrapper><Dashboard /></PageWrapper>
            </PrivateRoute>
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CursorProvider>
            <div className="app-container">
              {/* Living animated background — always-moving text + mesh gradients */}
              <AnimatedBackground />

              {/* Cursor-tracking glow trail */}
              <CursorGlowTrail />

              <Navbar />
              <div className="content">
                <AnimatedRoutes />
              </div>
            </div>
          </CursorProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
