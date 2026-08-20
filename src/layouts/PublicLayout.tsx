import { Outlet } from 'react-router-dom';
import { Footer } from '../components/navigation/Footer';
import { Navbar } from '../components/navigation/Navbar';
import { AIAssistantModal } from '../components/ai/AIAssistantModal';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>
      <Footer />
      <AIAssistantModal />
    </div>
  );
}

