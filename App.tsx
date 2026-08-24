import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import { GrowthProofSection, InteractiveProductDemo, WhyHopon } from './components/LandingPageSections';
import { AudienceSection } from './components/AudienceSection';
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

  useEffect(() => {
    let animationFrame: number | null = null;

    const scrollToHash = () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);

      const hash = window.location.hash;
      if (!hash || hash.includes('=')) return;

      let decodedId = '';
      try {
        decodedId = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }

      if (!/^[A-Za-z][A-Za-z0-9:_-]*$/.test(decodedId)) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        document.getElementById(decodedId)?.scrollIntoView();
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);

    return () => {
      window.removeEventListener('hashchange', scrollToHash);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main>
        <Hero />
        <InteractiveProductDemo />
        <GrowthProofSection />
        <WhyHopon />
        <AudienceSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
