import { Outlet } from 'react-router-dom';
import { DashboardShell } from '../components/layout/DashboardShell';

export function TouristLayout() {
  return (
    <DashboardShell
      role="tourist"
      title="Tourist dashboard"
      description="A personalized tourism space for trips, saved experiences, eco-passport progress, and cultural discovery."
    >
      <Outlet />
    </DashboardShell>
  );
}

