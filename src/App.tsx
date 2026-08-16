/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Cockpit } from './pages/Cockpit';
import { Garage } from './pages/Garage';
import { CarDetail } from './pages/CarDetail';
import { Builds } from './pages/Builds';
import { TestLab } from './pages/TestLab';
import { Telemetry } from './pages/Telemetry';
import { Knowledge } from './pages/Knowledge';
import { AIEngineer } from './pages/AIEngineer';
import { Settings } from './pages/Settings';
import { RaceRadioHUD } from './components/RaceRadioHUD';
import { LogIn } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] overflow-hidden font-sans border-8 border-[#1a1a1a] items-center justify-center">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[#ef4444] font-bold animate-pulse">Initializing Telemetry...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const LoginScreen = () => {
  const { user, signIn } = useAuth();
  if (user) return <Navigate to="/" />;
  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] overflow-hidden font-sans border-8 border-[#1a1a1a]">
      <div className="m-auto w-full max-w-md p-8 border border-[#222] bg-[#080808] flex flex-col items-center">
        <h1 className="text-[10px] uppercase tracking-[0.3em] text-[#ef4444] font-bold mb-1">Engineering</h1>
        <h2 className="text-4xl font-black tracking-tighter leading-none mb-8 italic">COCKPIT <span className="text-[#444]">FH6</span></h2>
        
        <p className="text-[#666] mb-8 text-center text-xs tracking-widest uppercase">Racing Command Center Authorization</p>
        <button 
          onClick={signIn}
          className="flex items-center justify-center gap-3 w-full py-4 border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-black transition-all text-xs font-black uppercase italic tracking-widest"
        >
          <LogIn className="w-4 h-4" />
          AUTHORIZE ACCESS
        </button>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] overflow-hidden font-sans border-8 border-[#1a1a1a]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <Routes>
          <Route path="/" element={<Cockpit />} />
          <Route path="/garage" element={<Garage />} />
          <Route path="/garage/car/:id" element={<CarDetail />} />
          <Route path="/builds" element={<Builds />} />
          <Route path="/tuning" element={<Navigate to="/garage" replace />} />
          <Route path="/tests" element={<TestLab />} />
          <Route path="/lab" element={<Navigate to="/tests" replace />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/engineer" element={<AIEngineer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <RaceRadioHUD />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
