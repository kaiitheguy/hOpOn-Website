import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import { FinalCTA, InteractiveProductDemo, WhyHopon } from './components/LandingPageSections';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const navigate = useNavigate();

  // Supabase 邮件链接可能指向根路径并带 hash（#access_token=...&type=recovery），交给 /auth/callback 处理
  useEffect(() => {
    const pathname = window.location.pathname || '/';
    const hash = window.location.hash || '';
    if (pathname !== '/' || !hash) return;
    const hasAuthHash =
      hash.includes('access_token=') ||
      hash.includes('type=recovery') ||
      hash.includes('type=signup');
    if (hasAuthHash) {
      navigate(`/auth/callback${hash}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main>
        <Hero />
        <InteractiveProductDemo />
        <WhyHopon />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
