import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { BoltBadge } from './BoltBadge';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const { sidebarOpen } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            isAuthenticated && sidebarOpen ? "lg:ml-64" : isAuthenticated ? "lg:ml-16" : "",
            className
          )}
        >
          <div className="container mx-auto px-4 py-6 min-h-[calc(100vh-8rem)] max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <BoltBadge />
    </div>
  );
}