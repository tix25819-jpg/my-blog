import { BlogNav } from '@/components/blog-nav';
import { BlogFooter } from '@/components/blog-footer';
import { ArticleDetail } from '@/components/article-detail';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex min-h-screen flex-col">
      <BlogNav />
      <main className="flex-1">
        <ArticleDetail articleId={id} />
      </main>
      <BlogFooter />
    </div>
  );
}
