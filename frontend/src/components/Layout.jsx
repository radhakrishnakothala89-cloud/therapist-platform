import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Navbar */}
      <header style={headerStyle}>
        <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px', color: '#4F46E5' }}>
          UNFAZED
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <NavLink to="/dashboard" style={navLinkStyle}>Profile</NavLink>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <aside style={sidebarStyle}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <NavLink to="/dashboard" style={({ isActive }) => sidebarItemStyle(isActive)}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/therapist/notes" style={({ isActive }) => sidebarItemStyle(isActive)}>
              📝 Notes
            </NavLink>
            <NavLink to="/chat" style={({ isActive }) => sidebarItemStyle(isActive)}>
              💬 Chat
            </NavLink>
            <NavLink to="/analytics" style={({ isActive }) => sidebarItemStyle(isActive)}>
              📈 Analytics
            </NavLink>
          </nav>
        </aside>

        {/* Content Area */}
        <main style={contentStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Minimal & Professional Clean Styles
const headerStyle = {
  height: '60px',
  backgroundColor: '#FFFFFF',
  borderBottom: '1px solid #E5E7EB',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
};

const sidebarStyle = {
  width: '220px',
  backgroundColor: '#F9FAFB',
  borderRight: '1px solid #E5E7EB',
  padding: '20px 12px',
};

const contentStyle = {
  flex: 1,
  backgroundColor: '#e5349c',
  padding: '28px',
  overflowY: 'auto',
};

const navLinkStyle = {
  textDecoration: 'none',
  color: '#4B5563',
  fontWeight: '500',
  fontSize: '14px',
};

const logoutButtonStyle = {
  backgroundColor: 'transparent',
  border: '1px solid #E5E7EB',
  borderRadius: '6px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#EF4444',
  fontWeight: '600',
};

const sidebarItemStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: isActive ? '600' : '500',
  color: isActive ? '#4F46E5' : '#374151',
  backgroundColor: isActive ? '#EEF2FF' : 'transparent',
});