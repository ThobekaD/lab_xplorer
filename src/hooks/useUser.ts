import { useAuth } from './useAuth';

export function useUser() {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    user: user?.profile || null,
    authUser: user,
    loading,
    isAuthenticated,
  };
}