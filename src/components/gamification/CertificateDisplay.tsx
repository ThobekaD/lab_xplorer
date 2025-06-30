import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Share2, 
  Clock, 
  CheckCircle, 
  Users 
} from 'lucide-react';
import type { DigitalCertificate } from '@/types/gamification';

interface CertificateDisplayProps {
  certificate: DigitalCertificate;
  experimentTitle?: string;
  userName?: string;
  className?: string;
  onDownload?: (certificate: DigitalCertificate) => void;
  onShare?: (certificate: DigitalCertificate) => void;
}

export function CertificateDisplay({
  certificate,
  experimentTitle = 'Science Experiment',
  userName = 'Student',
  className = '',
  onDownload,
  onShare
}: CertificateDisplayProps) {
  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'completion': return 'bg-blue-100 text-blue-800';
      case 'mastery': return 'bg-purple-100 text-purple-800';
      case 'excellence': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'completion': return 'Certificate of Completion';
      case 'mastery': return 'Certificate of Mastery';
      case 'excellence': return 'Certificate of Excellence';
      default: return 'Certificate';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            {getCertificateTypeLabel(certificate.certificateType)}
          </CardTitle>
          
          <Badge className={getCertificateTypeColor(certificate.certificateType)}>
            {certificate.certificateType.charAt(0).toUpperCase() + certificate.certificateType.slice(1)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="text-xs text-gray-500 mb-1">This certifies that</div>
          <h2 className="text-2xl font-bold mb-1">{userName}</h2>
          <div className="text-xs text-gray-500 mb-3">has successfully completed</div>
          <h3 className="text-xl font-semibold">{experimentTitle}</h3>
          <div className="text-sm text-gray-600 mt-2">
            Issued on {formatDate(certificate.issueDate)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="text-lg font-bold">{certificate.performanceData.score}%</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium">Completion Time</span>
            </div>
            <div className="text-lg font-bold">
              {Math.floor(certificate.performanceData.timeCompleted / 60)} min
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-gray-500">
            Verification Code: {certificate.metadata.verificationCode}
          </div>
          
          {certificate.metadata.institutionName && (
            <div className="text-xs text-gray-500">
              Issued by: {certificate.metadata.institutionName}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onShare?.(certificate)}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <Button 
            size="sm"
            onClick={() => onDownload?.(certificate)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}