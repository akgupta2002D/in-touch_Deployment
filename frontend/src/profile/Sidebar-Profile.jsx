import React from 'react';
import './Sidebar.css';

const links = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Messages', href: '/messages' },
    { label: 'Logout', href: '/logout' },
];

const SidebarProfile = () => {
    const [hovered, setHovered] = React.useState(null);

    return (
        <aside className="sidebar-profile">
                <div className="sidebar-profile-header">
                    <div className="icon-circle">A</div>
                    <div className="sidebar-profile-name">Ankit Gupta</div>
                    <div className="sidebar-profile-email">ankit@example.com</div>
                </div>
            
            <nav className="sidebar-profile-nav">
                    {links.map((link, idx) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`sidebar-profile-link${hovered === idx ? ' hovered' : ''}`}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
            <div className="sidebar-profile-footer">
                @in-touch
            </div>
        </aside>
    );
};

export default SidebarProfile;
