import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, 
  Star, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  Eye,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface PeerReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  experiment_id: string;
  session_id: string;
  rating: number;
  feedback: string;
  criteria: Record<string, number>;
  is_anonymous: boolean;
  created_at: Date;
}

interface ReviewCriterion {
  id: string;
  name: string;
  description: string;
  max_score: number;
}

export function PeerReviewSystem() {
  const { user } = useAuthStore();
  const { sessionMembers } = useCollaborationStore();

  const [pendingReviews, setPendingReviews] = useState<any[]>([
    {
      id: '1',
      user_id: 'user1',
      experiment_id: 'exp1',
      due_date: new Date(Date.now() + 86400000), // Tomorrow
    },
    {
      id: '2',
      user_id: 'user2',
      experiment_id: 'exp2',
      due_date: new Date(Date.now() + 172800000), // Day after tomorrow
    },
  ]);

  const [completedReviews, setCompletedReviews] = useState<PeerReview[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<PeerReview[]>([]);
  
  const [selectedReviewee, setSelectedReviewee] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Sample review criteria
  const reviewCriteria: ReviewCriterion[] = [
    {
      id: 'scientific_accuracy',
      name: 'Scientific Accuracy',
      description: 'Correctness of scientific concepts and procedures',
      max_score: 5,
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Appropriate experimental methods and techniques',
      max_score: 5,
    },
    {
      id: 'data_analysis',
      name: 'Data Analysis',
      description: 'Proper collection and interpretation of data',
      max_score: 5,
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      description: 'Effective teamwork and communication',
      max_score: 5,
    },
  ];

  const handleRatingChange = (criterionId: string, value: number) => {
    setRatings(prev => ({ ...prev, [criterionId]: value }));
  };

  const submitReview = () => {
    if (!selectedReviewee || !reviewFeedback || Object.keys(ratings).length === 0) return;

    const review: PeerReview = {
      id: crypto.randomUUID(),
      reviewer_id: user?.id || '',
      reviewee_id: selectedReviewee,
      experiment_id: 'exp1', // Would come from props
      session_id: 'session1', // Would come from props
      rating: Object.values(ratings).reduce((sum, val) => sum + val, 0) / Object.keys(ratings).length,
      feedback: reviewFeedback,
      criteria: ratings,
      is_anonymous: isAnonymous,
      created_at: new Date(),
    };

    setCompletedReviews(prev => [...prev, review]);
    setPendingReviews(prev => prev.filter(r => r.user_id !== selectedReviewee));
    
    // Reset form
    setSelectedReviewee(null);
    setReviewFeedback('');
    setRatings({});
    setIsAnonymous(false);
  };

  const getUserName = (userId: string) => {
    const member = sessionMembers.find(m => m.user_id === userId);
    return member?.display_name || 'Unknown User';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getAverageRating = (reviews: PeerReview[]) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const renderStars = (rating: number, max: number = 5) => {
    return Array.from({ length: max }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardCheck className="h-5 w-5 mr-2" />
          Peer Review System
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedReviews.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              Received ({receivedReviews.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4 pt-4">
            {pendingReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No pending reviews</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {getUserName(review.user_id).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{getUserName(review.user_id)}</h3>
                          <p className="text-sm text-gray-500">Experiment: {review.experiment_id}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Due: {formatDate(review.due_date)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedReviewee(review.user_id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Work
                      </Button>
                      <Button onClick={() => setSelectedReviewee(review.user_id)}>
                        <ClipboardCheck className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Review Form */}
            <AnimatePresence>
              {selectedReviewee && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-lg p-4 mt-6"
                >
                  <h3 className="font-medium mb-4">
                    Review for {getUserName(selectedReviewee)}
                  </h3>
                  
                  {/* Rating Criteria */}
                  <div className="space-y-4 mb-4">
                    {reviewCriteria.map((criterion) => (
                      <div key={criterion.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center">
                            {criterion.name}
                            <HelpCircle className="h-3 w-3 ml-1 text-gray-400" />
                          </Label>
                          <div className="flex items-center">
                            {Array.from({ length: criterion.max_score }).map((_, i) => (
                              <Button
                                key={i}
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 ${
                                  (ratings[criterion.id] || 0) > i ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                                onClick={() => handleRatingChange(criterion.id, i + 1)}
                              >
                                <Star className={`h-5 w-5 ${
                                  (ratings[criterion.id] || 0) > i ? 'fill-yellow-500' : ''
                                }`} />
                              </Button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{criterion.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Feedback */}
                  <div className="space-y-2 mb-4">
                    <Label>Feedback</Label>
                    <Textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Provide constructive feedback..."
                      rows={4}
                    />
                  </div>
                  
                  {/* Anonymous Option */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Submit anonymously
                    </Label>
                  </div>
                  
                  {/* Submit */}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedReviewee(null)}>
                      Cancel
                    </Button>
                    <Button onClick={submitReview}>
                      <Send className="h-4 w-4 mr-1" />
                      Submit Review
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4 pt-4">
            {completedReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No completed reviews</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {getUserName(review.reviewee_id).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{getUserName(review.reviewee_id)}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.is_anonymous && (
                        <Badge variant="outline">Anonymous</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-3">
                      {review.feedback}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {Object.entries(review.criteria).map(([key, value]) => {
                        const criterion = reviewCriteria.find(c => c.id === key);
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <span>{criterion?.name || key}</span>
                            <div className="flex">
                              {renderStars(value, criterion?.max_score || 5)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="received" className="space-y-4 pt-4">
            {receivedReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No reviews received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {!review.is_anonymous && (
                          <Avatar>
                            <AvatarFallback>
                              {getUserName(review.reviewer_id).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <h3 className="font-medium">
                            {review.is_anonymous ? 'Anonymous Reviewer' : getUserName(review.reviewer_id)}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-3">
                      {review.feedback}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {Object.entries(review.criteria).map(([key, value]) => {
                        const criterion = reviewCriteria.find(c => c.id === key);
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <span>{criterion?.name || key}</span>
                            <div className="flex">
                              {renderStars(value, criterion?.max_score || 5)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Disagree
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Agree
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}