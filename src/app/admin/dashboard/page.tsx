import { AdminDashboard } from '@/components/admin-dashboard';
import { AdminShell } from '@/components/admin-shell';

export default function DashboardPage() {
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  );
}
