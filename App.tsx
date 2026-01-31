import React from 'react';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import { Philosophy } from './components/Philosophy';
import { Concepts } from './components/Concepts';
import { Workflow } from './components/Workflow';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main>
        <Hero />
        <Philosophy />
        <Concepts />
        <Workflow />
      </main>
      <Footer />
    </div>
  );
};

export default App;