import { Outlet } from 'react-router-dom';
import { Footer } from '../components/navigation/Footer';
import { Navbar } from '../components/navigation/Navbar';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

