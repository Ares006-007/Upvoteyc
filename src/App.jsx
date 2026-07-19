import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportPage } from './pages/ReportPage';
import { PresentationPage } from './pages/PresentationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Presentation Route (Full Screen, No Navbar) */}
        <Route path="/presentation" element={<PresentationPage />} />
        
        {/* Standard App Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="discover" element={<DashboardPage />} />
          <Route path="research" element={<DashboardPage />} />
          <Route path="report" element={<ReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
