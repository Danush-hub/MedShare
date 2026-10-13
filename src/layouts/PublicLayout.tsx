import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/** Shell for all public marketing/entry pages. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
