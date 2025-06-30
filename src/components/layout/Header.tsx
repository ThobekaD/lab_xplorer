import { useState } from 'react';
import { Bell, Menu, Search, User, Settings, LogOut, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';
import { AuthModal } from '../auth/AuthModal';
import { useNavigate } from 'react-router-dom';
import { PaywallManager } from '../subscription/PaywallManager';
import { SubscriptionBanner } from '../subscription/SubscriptionBanner';

export function Header() {
  const { user, signOut, isAuthenticated } = useAuthStore();
  const { setSidebarOpen, notifications } = useAppStore();
  const { tier, remainingExperiments } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const navigate = useNavigate();
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const userLevel = user ? Math.floor(user.xp / 1000) + 1 : 1;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  return (
    <>
      {isAuthenticated && tier === 'free' && showBanner && remainingExperiments < 2 && (
        <SubscriptionBanner 
          variant="compact" 
          onDismiss={() => setShowBanner(false)}
        />
      )}
      
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center px-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/labx_logo.png" 
                alt="LabXplorer" 
                className="h-8 w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px]"
              />
            </div>

            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search experiments, games, or notes..."
                  className="pl-10 w-full"
                  aria-label="Search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && tier === 'free' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUpgrade}
                className="hidden sm:flex"
              >
                <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                Upgrade
              </Button>
            )}
            
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url} alt={user?.display_name} />
                        <AvatarFallback>
                          {user?.display_name?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.display_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.id}
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Level {userLevel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {user?.xp || 0} XP
                          </span>
                        </div>
                        {tier !== 'free' && (
                          <Badge className="mt-1 w-fit text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {tier === 'student' ? 'Premium' : 'Pro'}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/subscription')}>
                      <Zap className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}