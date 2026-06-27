export const dynamic = 'force-dynamic';
import { AdminShell } from '@/components/admin-shell';
import { AdminCategories } from '@/components/admin-categories';

export default function CategoriesPage() {
  return (
    <AdminShell>
      <AdminCategories />
    </AdminShell>
  );
}
