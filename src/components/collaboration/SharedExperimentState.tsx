import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, RotateCcw, AlertTriangle, CheckCircle, Clock, Hand as HandRaised, ThumbsUp, ThumbsDown, UserCheck, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CollaborativeAction } from '@/lib/collaboration';

interface SharedExperimentStateProps {
  experimentId: string;
  currentStep: number;
  totalSteps: number;
  onUserAction: (action: any) => void;
  className?: string;
}

export function SharedExperimentState({ 
  experimentId, 
  currentStep, 
  totalSteps,
  onUserAction,
  className = '' 
}: SharedExperimentStateProps) {
  const { user } = useAuthStore();
  const {
    currentSession,
    sessionMembers,
    actionHistory,
    pendingApprovals,
    executeAction,
    approveAction,
    rejectAction,
    requestControl,
    releaseControl,
  } = useCollaborationStore();

  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [controlRequests, setControlRequests] = useState<any[]>([]);
  const [lastAction, setLastAction] = useState<CollaborativeAction | null>(null);
  const [showActionHistory, setShowActionHistory] = useState(false);

  useEffect(() => {
    // Update last action when new actions come in
    if (actionHistory.length > 0) {
      setLastAction(actionHistory[actionHistory.length - 1]);
    }
  }, [actionHistory]);

  const isLeader = sessionMembers.find(m => m.user_id === user?.id)?.role === 'leader';
  const isObserver = sessionMembers.find(m => m.user_id === user?.id)?.role === 'observer';
  const isTurnBased = currentSession?.settings.collaboration_mode === 'turn_based';
  const isLeaderControlled = currentSession?.settings.collaboration_mode === 'leader_controlled';
  const requiresApproval = currentSession?.settings.require_approval_for_actions;

  const canTakeAction = () => {
    if (isObserver) return false;
    if (isLeaderControlled && !isLeader) return false;
    if (isTurnBased && activeUser !== user?.id) return false;
    return true;
  };

  const handleAction = async (action: any) => {
    if (!canTakeAction()) {
      if (isTurnBased || isLeaderControlled) {
        await requestControl();
      }
      return;
    }

    // Execute the action
    await executeAction('experiment_action', {
      experiment_id: experimentId,
      action,
      requires_approval: requiresApproval && !isLeader,
    });

    // Pass to parent component
    onUserAction(action);
  };

  const handleRequestControl = async () => {
    await requestControl();
  };

  const handleReleaseControl = async () => {
    await releaseControl();
  };

  const handleApproveAction = async (actionId: string) => {
    await approveAction(actionId);
  };

  const handleRejectAction = async (actionId: string) => {
    await rejectAction(actionId);
  };

  const formatActionType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'add_reagent': return <Beaker className="h-4 w-4" />;
      case 'measurement': return <Clock className="h-4 w-4" />;
      case 'undo': return <RotateCcw className="h-4 w-4" />;
      default: return <Beaker className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Beaker className="h-5 w-5 mr-2" />
              Shared Experiment
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Progress Badge */}
              <Badge variant="outline">
                Step {currentStep} of {totalSteps}
              </Badge>
              
              {/* Collaboration Mode */}
              <Badge variant="secondary" className="capitalize">
                {currentSession?.settings.collaboration_mode.replace('_', ' ')}
              </Badge>
              
              {/* Control Indicator */}
              {isTurnBased && (
                <Badge variant={activeUser === user?.id ? "default" : "outline"}>
                  {activeUser === user?.id ? (
                    <>
                      <UserCheck className="h-3 w-3 mr-1" />
                      Your Turn
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Waiting
                    </>
                  )}
                </Badge>
              )}
              
              {isLeaderControlled && !isLeader && (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Leader Control
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Experiment Progress</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Control Request UI */}
          {(isTurnBased || isLeaderControlled) && !isObserver && (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Experiment Control</h4>
                <p className="text-xs text-gray-500">
                  {isTurnBased 
                    ? 'Take turns performing actions' 
                    : 'Leader controls the experiment'}
                </p>
              </div>
              
              {activeUser === user?.id ? (
                <Button variant="outline" size="sm" onClick={handleReleaseControl}>
                  <Unlock className="h-4 w-4 mr-1" />
                  Release Control
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleRequestControl}>
                  <HandRaised className="h-4 w-4 mr-1" />
                  Request Control
                </Button>
              )}
            </div>
          )}

          {/* Control Requests (for leader) */}
          {isLeader && controlRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Control Requests</h4>
              <div className="space-y-2">
                {controlRequests.map((request) => {
                  const member = sessionMembers.find(m => m.user_id === request.user_id);
                  
                  return (
                    <div key={request.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member?.avatar_url} alt={member?.display_name} />
                          <AvatarFallback>
                            {member?.display_name.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member?.display_name || 'Unknown'} requests control</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-500">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          {isLeader && requiresApproval && pendingApprovals.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Pending Approvals</h4>
              <div className="space-y-2">
                {pendingApprovals.map((action) => {
                  const member = sessionMembers.find(m => m.user_id === action.user_id);
                  
                  return (
                    <div key={action.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member?.avatar_url} alt={member?.display_name} />
                          <AvatarFallback>
                            {member?.display_name.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm">{member?.display_name || 'Unknown'}</span>
                          <div className="text-xs text-gray-600">
                            {formatActionType(action.action_type)}: {JSON.stringify(action.action_data).slice(0, 30)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => handleRejectAction(action.id)}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-green-500"
                          onClick={() => handleApproveAction(action.id)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Last Action */}
          {lastAction && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last Action
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowActionHistory(!showActionHistory)}
                  className="h-6 text-xs"
                >
                  {showActionHistory ? 'Hide History' : 'Show History'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {sessionMembers.find(m => m.user_id === lastAction.user_id)?.display_name.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {sessionMembers.find(m => m.user_id === lastAction.user_id)?.display_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(lastAction.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 flex items-center">
                    {getActionIcon(lastAction.action_type)}
                    <span className="ml-1">{formatActionType(lastAction.action_type)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action History */}
          <AnimatePresence>
            {showActionHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <h4 className="text-sm font-medium">Action History</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {actionHistory.slice().reverse().map((action) => (
                    <div key={action.id} className="flex items-center space-x-2 p-2 text-xs bg-gray-50 rounded">
                      <div className="w-4 h-4 flex-shrink-0">
                        {getActionIcon(action.action_type)}
                      </div>
                      <div className="flex-1 truncate">
                        <span className="font-medium">
                          {sessionMembers.find(m => m.user_id === action.user_id)?.display_name || 'Unknown'}
                        </span>
                        : {formatActionType(action.action_type)}
                      </div>
                      <span className="text-gray-500">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction({ type: 'undo' })}
              disabled={!canTakeAction() || actionHistory.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Undo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}