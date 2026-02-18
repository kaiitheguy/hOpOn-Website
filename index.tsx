import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { Verify } from './pages/Verify';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { AuthCallback } from './pages/AuthCallback';
import { ResetPassword } from './pages/ResetPassword';
import { Pending } from './pages/Pending';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pending" element={<Pending />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);