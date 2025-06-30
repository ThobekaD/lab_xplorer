import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function BoltBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <img src="/bolt_logo.png" alt="Bolt" className="w-4 h-4 mr-1" />
          Built with Bolt.new
        </Badge>
      </a>
    </div>
  );
}