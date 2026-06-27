import { ArticleEditor } from '@/components/article-editor';
import { AdminShell } from '@/components/admin-shell';

export default function NewArticlePage() {
  return (
    <AdminShell>
      <ArticleEditor />
    </AdminShell>
  );
}
