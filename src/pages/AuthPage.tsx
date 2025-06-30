import { useState } from 'react';
import { motion } from 'framer-motion';
import { SignIn } from '@/components/auth/SignIn';
import { SignUp } from '@/components/auth/SignUp';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'signin' ? 20 : -20 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'signin' ? (
            <SignIn onToggleMode={toggleMode} />
          ) : (
            <SignUp onToggleMode={toggleMode} />
          )}
        </motion.div>
      </div>
    </div>
  );
}