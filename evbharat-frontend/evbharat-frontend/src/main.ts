import './style.css';
import { router } from './router';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { Loader } from './components/loader';
import { renderHomePage } from './pages/home';
import { renderAboutPage } from './pages/about';
import { renderTechnologyPage } from './pages/technology';
import { renderContactPage } from './pages/contact';
import { renderGalleryPage } from './pages/gallery';
import { renderAuthPage } from './pages/auth';
import { renderDashboardPage } from './pages/dashboard';
import { renderBatteryPage } from './pages/battery';
import { renderBatteryAnalyticsPage } from './pages/battery-analytics';
import { renderRAGChatPage } from './pages/rag-chat';
import { renderMapPage } from './pages/map';
import { renderAlertPage } from './pages/alerts';
import { renderProfilePage } from './pages/profile';
import { renderFactoryDashboardPage } from './pages/factory-dashboard';
import { render404Page } from './pages/404';

// Initialize loader
const loader = new Loader();

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize navbar and footer
    new Navbar();
    new Footer();

    // Register routes
    router.register('/', 'EVBharat | AI-Powered EV Intelligence', renderHomePage);
    router.register('/about', 'About Us | EVBharat', renderAboutPage);
    router.register('/technology', 'Technology | EVBharat', renderTechnologyPage);
    router.register('/contact', 'Contact Us | EVBharat', renderContactPage);
    router.register('/gallery', 'Gallery | EVBharat', renderGalleryPage);
    router.register('/auth', 'Login | EVBharat', renderAuthPage);
    router.register('/dashboard', 'Dashboard | EVBharat', renderDashboardPage);
    router.register('/factory-dashboard', 'Dark Factory | EVBharat', renderFactoryDashboardPage);
    router.register('/battery', 'Battery Management | EVBharat', renderBatteryPage);
    router.register('/battery-analytics', 'AI Battery Analytics | EVBharat', renderBatteryAnalyticsPage);
    router.register('/rag-chat', 'AI Assistant | EVBharat', renderRAGChatPage);
    router.register('/map', 'Route Planner | EVBharat', renderMapPage);
    router.register('/alerts', 'Alerts | EVBharat', renderAlertPage);
    router.register('/profile', 'Profile | EVBharat', renderProfilePage);
    router.register('/404', '404 Not Found | EVBharat', render404Page);

    // Initialize router
    router.init();

    // Hide loader after initial load
    setTimeout(() => {
        loader.hide();
    }, 1500);
});
