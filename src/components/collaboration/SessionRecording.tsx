import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download,
  Bookmark,
  Clock,
  List,
  Film,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollaborationStore } from '@/stores/useCollaborationStore';

interface SessionRecording {
  id: string;
  session_id: string;
  title: string;
  duration: number;
  created_at: Date;
  thumbnail_url?: string;
  video_url?: string;
  bookmarks: Bookmark[];
  highlights: Highlight[];
}

interface Bookmark {
  id: string;
  timestamp: number;
  label: string;
  description?: string;
  created_by: string;
}

interface Highlight {
  id: string;
  start_time: number;
  end_time: number;
  label: string;
  type: 'achievement' | 'mistake' | 'question' | 'insight';
}

export function SessionRecording() {
  const { sessionMembers } = useCollaborationStore();
  
  const [recordings, setRecordings] = useState<SessionRecording[]>([
    {
      id: '1',
      session_id: 'session1',
      title: 'Chemistry Lab - Acid-Base Titration',
      duration: 45 * 60, // 45 minutes in seconds
      created_at: new Date(Date.now() - 86400000), // Yesterday
      thumbnail_url: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
      bookmarks: [
        {
          id: 'b1',
          timestamp: 320,
          label: 'Color change observed',
          created_by: 'user1',
        },
        {
          id: 'b2',
          timestamp: 1250,
          label: 'Equivalence point reached',
          description: 'The solution turned pink indicating the endpoint',
          created_by: 'user2',
        },
      ],
      highlights: [
        {
          id: 'h1',
          start_time: 300,
          end_time: 360,
          label: 'Important reaction',
          type: 'insight',
        },
        {
          id: 'h2',
          start_time: 1200,
          end_time: 1300,
          label: 'Calculation error',
          type: 'mistake',
        },
      ],
    },
    {
      id: '2',
      session_id: 'session2',
      title: 'Physics Lab - Pendulum Experiment',
      duration: 38 * 60, // 38 minutes in seconds
      created_at: new Date(Date.now() - 172800000), // 2 days ago
      thumbnail_url: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
      bookmarks: [
        {
          id: 'b3',
          timestamp: 450,
          label: 'First measurement',
          created_by: 'user3',
        },
      ],
      highlights: [
        {
          id: 'h3',
          start_time: 1500,
          end_time: 1620,
          label: 'Excellent explanation',
          type: 'achievement',
        },
      ],
    },
  ]);
  
  const [selectedRecording, setSelectedRecording] = useState<SessionRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const handleSelectRecording = (recording: SessionRecording) => {
    setSelectedRecording(recording);
    setCurrentTime(0);
    setIsPlaying(false);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (time: number[]) => {
    setCurrentTime(time[0]);
  };
  
  const jumpToBookmark = (timestamp: number) => {
    setCurrentTime(timestamp);
    setIsPlaying(true);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getHighlightColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-green-200';
      case 'mistake': return 'bg-red-200';
      case 'question': return 'bg-yellow-200';
      case 'insight': return 'bg-blue-200';
      default: return 'bg-gray-200';
    }
  };
  
  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'mistake': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'question': return <Video className="h-4 w-4 text-yellow-600" />;
      case 'insight': return <Bookmark className="h-4 w-4 text-blue-600" />;
      default: return <Bookmark className="h-4 w-4" />;
    }
  };
  
  if (selectedRecording) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Film className="h-5 w-5 mr-2" />
              {selectedRecording.title}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setSelectedRecording(null)}>
              Back to Recordings
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
            {selectedRecording.thumbnail_url && (
              <img 
                src={selectedRecording.thumbnail_url} 
                alt={selectedRecording.title}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Playback Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={togglePlayPause}
                className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </Button>
            </div>
            
            {/* Playback Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(selectedRecording.duration)}</span>
                </div>
                
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={selectedRecording.duration}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-white">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={togglePlayPause}
                      className="text-white"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={playbackRate.toString()} 
                      onValueChange={(value) => setPlaybackRate(parseFloat(value))}
                    >
                      <SelectTrigger className="w-[80px] h-8 text-white bg-transparent border-white/20">
                        <SelectValue placeholder="Speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="ghost" size="sm" className="text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-white">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs for Bookmarks and Highlights */}
          <Tabs defaultValue="bookmarks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookmarks">
                <Bookmark className="h-4 w-4 mr-1" />
                Bookmarks
              </TabsTrigger>
              <TabsTrigger value="highlights">
                <List className="h-4 w-4 mr-1" />
                Highlights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookmarks" className="space-y-4 pt-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {selectedRecording.bookmarks.map((bookmark) => (
                    <div 
                      key={bookmark.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => jumpToBookmark(bookmark.timestamp)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800">
                          <Bookmark className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{bookmark.label}</h4>
                          {bookmark.description && (
                            <p className="text-sm text-gray-600">{bookmark.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{formatTime(bookmark.timestamp)}</Badge>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {selectedRecording.bookmarks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Bookmark className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No bookmarks added yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <Button variant="outline" className="w-full">
                <Bookmark className="h-4 w-4 mr-1" />
                Add Bookmark at Current Time
              </Button>
            </TabsContent>
            
            <TabsContent value="highlights" className="space-y-4 pt-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {selectedRecording.highlights.map((highlight) => (
                    <div 
                      key={highlight.id} 
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${getHighlightColor(highlight.type)}`}
                      onClick={() => jumpToBookmark(highlight.start_time)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
                          {getHighlightIcon(highlight.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{highlight.label}</h4>
                          <p className="text-sm text-gray-600 capitalize">{highlight.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {formatTime(highlight.start_time)} - {formatTime(highlight.end_time)}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {selectedRecording.highlights.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Film className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No highlights added yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="h-5 w-5 mr-2" />
          Session Recordings
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((recording) => (
            <motion.div
              key={recording.id}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleSelectRecording(recording)}
            >
              <Card className="overflow-hidden">
                <div className="aspect-video relative">
                  {recording.thumbnail_url ? (
                    <img 
                      src={recording.thumbnail_url} 
                      alt={recording.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      {formatTime(recording.duration)}
                    </Badge>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                    <Button variant="ghost" className="text-white">
                      <Play className="h-12 w-12" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1 line-clamp-1">{recording.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(recording.duration)}
                    </div>
                    <div>
                      {new Date(recording.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Bookmark className="h-3 w-3 mr-1" />
                      {recording.bookmarks.length} bookmarks
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Film className="h-3 w-3 mr-1" />
                      {recording.highlights.length} highlights
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}