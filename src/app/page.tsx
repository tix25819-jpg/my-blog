import { BlogNav } from '@/components/blog-nav';
import { BlogFooter } from '@/components/blog-footer';
import { HomeContent } from '@/components/home-content';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BlogNav />
      <main className="flex-1">
        <HomeContent />
      </main>
      <BlogFooter />
    </div>
  );
}
