import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CarFront, 
  Wrench, 
  FlaskConical, 
  Activity, 
  BookOpen, 
  Cpu, 
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

export function Sidebar() {
  const { logOut, user } = useAuth();
  
  const navItems = [
    { name: 'Cockpit', path: '/', icon: LayoutDashboard },
    { name: 'Garagem', path: '/garage', icon: CarFront },
    { name: 'Builds & Upgrades', path: '/builds', icon: Wrench },
    { name: 'Laboratório de Testes', path: '/tests', icon: FlaskConical },
    { name: 'Telemetria', path: '/telemetry', icon: Activity },
    { name: 'Base de Conhecimento', path: '/knowledge', icon: BookOpen },
    { name: 'Engenheiro IA', path: '/engineer', icon: Cpu },
    { name: 'Configurações', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-[#222] flex flex-col bg-[#080808] shrink-0 select-none">
      <div className="p-6 border-b border-[#222] flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444] font-bold">Engenharia</div>
          <div className="text-xl font-black tracking-tighter leading-none mt-1 italic text-white">
            COCKPIT <span className="text-[#555] font-light text-base">FH6</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-[#555] mb-2 px-3 font-mono">Sistemas</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded transition-all text-xs uppercase tracking-wider font-semibold group",
                isActive 
                  ? "bg-[#151515] text-white border-l-2 border-[#ef4444] shadow-inner" 
                  : "text-[#777] hover:text-[#e5e5e5] hover:bg-[#101010]"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors shrink-0", 
                    isActive ? "text-[#ef4444]" : "text-[#555] group-hover:text-white"
                  )} />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-[#222] bg-[#050505]">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[9px] uppercase font-mono text-[#555]">Status da Telemetria</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-pulse"></div>
            <span className="text-[9px] text-[#888] font-mono uppercase">Pronto / UDP</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-[#0c0c0c] border border-[#1a1a1a] rounded">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-[#181818] border border-[#262626] rounded flex items-center justify-center shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover rounded" />
              ) : (
                <span className="text-xs font-mono font-bold text-[#aaa]">{user?.email?.[0].toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="text-[11px] truncate">
              <p className="text-white font-semibold truncate leading-tight">{user?.displayName || 'Engenheiro de Pista'}</p>
              <p className="text-[#666] font-mono text-[9px] truncate leading-tight">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logOut} 
            title="Encerrar Sessão"
            className="p-1.5 text-[#555] hover:text-[#ef4444] transition-colors rounded hover:bg-[#181818]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
