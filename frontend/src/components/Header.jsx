import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuActive, setMenuActive] = useState(false);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper to close menu on link click
    const closeMenu = () => setMenuActive(false);

    // Prevent default for Know Your Faculty to just open dropdown on mobile (or hover desktop)
    const handleDropdownClick = (e, isMobile) => {
        if (isMobile) {
            e.preventDefault();
            // Logic for mobile dropdown toggle could go here if managed by React state, 
            // but CSS hover usually handles desktop. 
            // For mobile, the original script toggled 'active' class on the li.
            // We can rely on CSS :hover for desktop and simple click for mobile navigation if it were a link,
            // but here it's a toggle.
            e.target.parentElement.classList.toggle('active');
        }
    };

    return (
        <header id="main-header" className={scrolled ? 'scrolled' : ''}>
            <div className="logo-container">
                <Link to="/" className="tech-logo" onClick={closeMenu}>
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 L50 5Z" stroke="currentColor" strokeWidth="5" fill="rgba(0, 229, 255, 0.1)" />
                        <circle cx="50" cy="55" r="12" fill="currentColor" />
                        <circle cx="50" cy="25" r="6" fill="currentColor" />
                        <circle cx="24" cy="70" r="6" fill="currentColor" />
                        <circle cx="76" cy="70" r="6" fill="currentColor" />
                        <line x1="50" y1="31" x2="50" y2="43" stroke="currentColor" strokeWidth="4" />
                        <line x1="29" y1="67" x2="40" y2="60" stroke="currentColor" strokeWidth="4" />
                        <line x1="71" y1="67" x2="60" y2="60" stroke="currentColor" strokeWidth="4" />
                    </svg>
                </Link>
                <h1>CampusConnect<span>+</span></h1>
            </div>

            <nav id="main-nav" className={menuActive ? 'active' : ''}>
                <ul>
                    <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                    <li><Link to="/camp-guide" onClick={closeMenu}>CampGuide</Link></li>
                    <li className="dropdown-toggle" onClick={(e) => {
                        if (window.innerWidth <= 900) {
                            e.currentTarget.classList.toggle('active');
                        }
                    }}>
                        <a href="#" onClick={(e) => e.preventDefault()}>Know Your Faculty</a>
                        <ul className="dropdown-menu">
                            <li><Link to="/faculty/btech" onClick={closeMenu}>B.Tech</Link></li>
                            <li><Link to="/faculty/mtech" onClick={closeMenu}>M.Tech</Link></li>
                            <li><Link to="/faculty/mca" onClick={closeMenu}>MCA</Link></li>
                        </ul>
                    </li>
                    <li><Link to="/eduzone" onClick={closeMenu}>EduZone</Link></li>
                    <li><Link to="/about" onClick={closeMenu}>About</Link></li>
                </ul>
            </nav>
            <button
                id="menu-toggle"
                aria-label="Open navigation menu"
                className={menuActive ? 'active' : ''}
                onClick={() => setMenuActive(!menuActive)}
            >
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </button>
        </header>
    );
};

export default Header;
