import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import Cursor from './Cursor';


const Layout = () => {
    return (
        <>
            <Cursor />
            <TopBar />
            <Header />
            <main>
                <div className="content-wrapper" style={{ animation: 'none', opacity: 1, transform: 'none' }}>
                    <Outlet />
                </div>
            </main>

            <Footer />
        </>
    );
};

export default Layout;
