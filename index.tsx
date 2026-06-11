import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MerchantLocaleProvider } from './context/MerchantLocaleContext';
import App from './App';
import { Verify } from './pages/Verify';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { AuthCallback } from './pages/AuthCallback';
import { ResetPassword } from './pages/ResetPassword';
import { Pending } from './pages/Pending';
import { Rejected } from './pages/Rejected';
import { MerchantAuthGate } from './components/merchant/MerchantAuthGate';
import { MerchantLayout } from './components/merchant/MerchantLayout';
import { MerchantLogin } from './pages/merchant/MerchantLogin';
import { MerchantSignup } from './pages/merchant/MerchantSignup';
import { MerchantHome } from './pages/merchant/MerchantHome';
import { MerchantGrowth } from './pages/merchant/MerchantGrowth';
import { MerchantReview } from './pages/merchant/MerchantReview';
import { MerchantHunt } from './pages/merchant/MerchantHunt';
import { MerchantAchievements } from './pages/merchant/MerchantAchievements';
import { MerchantProfile } from './pages/merchant/MerchantProfile';
import { CampaignCreate } from './pages/merchant/CampaignCreate';
import { CampaignDetail } from './pages/merchant/CampaignDetail';
import { MerchantNotifications } from './pages/merchant/MerchantNotifications';
import { CreatorProfile } from './pages/merchant/CreatorProfile';
import { ApplicationChat } from './pages/merchant/ApplicationChat';
import { DraftPostReview } from './pages/merchant/DraftPostReview';
import { GeoMerchantPage } from './components/GeoMerchantPage';
import { GeoDiscoveryPage } from './components/GeoDiscoveryPage';
import { GeoDirectoryPage } from './components/GeoDirectoryPage';

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
        <Route path="/rejected" element={<Rejected />} />
        <Route path="/discover" element={<GeoDirectoryPage />} />
        <Route path="/merchant/:slug" element={<GeoMerchantPage />} />
        <Route path="/discover/:slug" element={<GeoDiscoveryPage />} />

        {/* Merchant (restaurant) app */}
        <Route path="/merchant" element={<MerchantLocaleProvider><Outlet /></MerchantLocaleProvider>}>
          <Route path="login" element={<MerchantLogin />} />
          <Route path="signup" element={<MerchantSignup />} />
          <Route
            path=""
            element={
              <MerchantAuthGate>
                <MerchantLayout />
              </MerchantAuthGate>
            }
          >
            <Route index element={<MerchantGrowth />} />
            <Route path="growth" element={<MerchantGrowth />} />
            <Route path="campaigns" element={<MerchantHome />} />
            <Route path="review" element={<MerchantReview />} />
            <Route path="hunt" element={<MerchantHunt />} />
            <Route path="achievements" element={<MerchantAchievements />} />
            <Route path="profile" element={<MerchantProfile />} />
            <Route path="campaign/new" element={<CampaignCreate />} />
            <Route path="campaign/:id" element={<CampaignDetail />} />
            <Route path="application/:applicationId/chat" element={<ApplicationChat />} />
            <Route path="application/:applicationId/draft-post" element={<DraftPostReview />} />
            <Route path="notifications" element={<MerchantNotifications />} />
            <Route path="creator/:id" element={<CreatorProfile />} />
          </Route>
          <Route path="applicants" element={<Navigate to="/merchant/review" replace />} />
          <Route path="deliverables" element={<Navigate to="/merchant/review" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
