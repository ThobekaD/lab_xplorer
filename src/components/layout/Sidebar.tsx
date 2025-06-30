import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FlaskConical, 
  Gamepad2, 
  BookOpen, 
  Trophy, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Experiments', href: '/experiments', icon: FlaskConical },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Notebook', href: '/notebook', icon: BookOpen },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Achievements', href: '/achievements', icon: Award },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Subscription', href: '/subscription', icon: Zap },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold">Navigation</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-2" role="navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                    !sidebarOpen && "justify-center"
                  )
                }
                onClick={() => {
                  // Close sidebar on mobile when navigating
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                aria-label={item.name}
              >
                <item.icon className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              size={sidebarOpen ? "default" : "icon"}
              className={cn(
                "w-full",
                !sidebarOpen && "justify-center"
              )}
              aria-label="Settings"
            >
              <Settings className={cn("h-4 w-4", sidebarOpen && "mr-2")} />
              {sidebarOpen && <span>Settings</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}