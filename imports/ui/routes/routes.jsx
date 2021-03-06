import React from 'react';
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';

import ClaimPage from '../pages/ClaimPage.jsx';
import Footer from '../components/Footer.jsx';
import HomePage from '../pages/HomePage.jsx';
import UmcWallet from '../pages/UmcWallet.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import Nav from '../components/Nav.jsx';

export const renderRoutes = () => (
    <Router history={createBrowserHistory()}>
        <div className="flexbox-wrapper">
            <Nav />
            <main className="container">
                <Route exact path="/" component={HomePage} />
                <Route path="/claims/:id" component={ClaimPage} />
                <Route exact path="/umc-wallet" component={UmcWallet} />
                <Route exact path="/notifications" component={NotificationsPage} />
            </main>                                     
            <Footer />
        </div>
    </Router>
);