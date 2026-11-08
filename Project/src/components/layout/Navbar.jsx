import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { ROLE_HOME } from '../../constants';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Opportunities', to: '/opportunities' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'For organizations', to: '/#organizations' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };
  const isActive = (to) => !to.includes('#') && location.pathname === to && !location.hash;

  return (
    <nav aria-label="Main" className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.to) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Button variant="ghost" icon={LogOut} onClick={handleLogout}>Log out</Button>
              <Button to={ROLE_HOME[user.role]} icon={LayoutDashboard}>Dashboard</Button>
            </>
          ) : (
            <>
              <Button to="/login/candidate" variant="ghost">Sign in</Button>
              <Button to="/register/recruiter" variant="secondary">Hire talent</Button>
              <Button to="/register/candidate" iconRight={ArrowRight}>Get started</Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          icon={menuOpen ? X : Menu}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="lg:hidden"
        />
      </div>

      {menuOpen && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          {LINKS.map((link) => (
            <Link key={link.label} to={link.to} onClick={close} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              {link.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3">
            {user ? (
              <>
                <Button to={ROLE_HOME[user.role]} icon={LayoutDashboard} onClick={close} fullWidth>Dashboard</Button>
                <Button variant="secondary" icon={LogOut} onClick={handleLogout} fullWidth>Log out</Button>
              </>
            ) : (
              <>
                <Button to="/register/candidate" onClick={close} fullWidth>Join as a candidate</Button>
                <Button to="/register/recruiter" variant="secondary" onClick={close} fullWidth>Join as a recruiter</Button>
                <Button to="/login/candidate" variant="ghost" onClick={close} fullWidth>Sign in</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
