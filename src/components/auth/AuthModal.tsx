import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 bg-white border shadow-lg">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        {mode === 'signin' ? (
          <SignIn onToggleMode={toggleMode} />
        ) : (
          <SignUp onToggleMode={toggleMode} />
        )}
      </DialogContent>
    </Dialog>
  );
}