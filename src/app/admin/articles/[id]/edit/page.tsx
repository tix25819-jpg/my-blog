import { ArticleEditor } from '@/components/article-editor';
import { AdminShell } from '@/components/admin-shell';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminShell>
      <ArticleEditor articleId={id} />
    </AdminShell>
  );
}
