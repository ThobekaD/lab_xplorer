//src/components/avatar/VideoLectureLibrary.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Star, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TavusVideoPlayer } from './TavusVideoPlayer';
import type { VideoLecture } from '@/lib/tavus';

interface VideoLectureLibraryProps {
  subject?: 'chemistry' | 'physics' | 'biology';
  onLectureSelect?: (lecture: VideoLecture) => void;
}

export function VideoLectureLibrary({ subject, onLectureSelect }: VideoLectureLibraryProps) {
  const [selectedLecture, setSelectedLecture] = useState<VideoLecture | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>(subject || 'all');

  // Mock lecture data - in real implementation, this would come from Supabase
  const lectures: VideoLecture[] = [
    {
      id: '1',
      title: 'Introduction to Chemical Bonding',
      description: 'Learn about ionic, covalent, and metallic bonds with Dr. Sarah Chen',
      duration: 15,
      video_url: 'https://example.com/video1.mp4',
      transcript: 'Welcome to our lesson on chemical bonding...',
      subject: 'chemistry',
      difficulty: 2,
      learning_objectives: [
        'Understand different types of chemical bonds',
        'Predict bond formation between elements',
        'Explain bond strength and properties'
      ],
      interactive_elements: [
        {
          timestamp: 300,
          type: 'question',
          content: { question: 'What type of bond forms between sodium and chlorine?' },
          required: true,
        },
        {
          timestamp: 600,
          type: 'quiz',
          content: { questions: ['Multiple choice questions about bonding'] },
          required: false,
        }
      ],
    },
    {
      id: '2',
      title: 'Newton\'s Laws of Motion',
      description: 'Explore the fundamental laws that govern motion with Prof. Marcus Thompson',
      duration: 20,
      video_url: 'https://example.com/video2.mp4',
      transcript: 'Today we\'ll discover Newton\'s three laws...',
      subject: 'physics',
      difficulty: 3,
      learning_objectives: [
        'State and explain Newton\'s three laws',
        'Apply laws to real-world scenarios',
        'Calculate forces and accelerations'
      ],
      interactive_elements: [
        {
          timestamp: 400,
          type: 'demonstration',
          content: { activity: 'Virtual force demonstration' },
          required: false,
        }
      ],
    },
    {
      id: '3',
      title: 'Cell Structure and Function',
      description: 'Journey inside the cell with Dr. Elena Rodriguez',
      duration: 18,
      video_url: 'https://example.com/video3.mp4',
      transcript: 'Let\'s explore the amazing world inside cells...',
      subject: 'biology',
      difficulty: 2,
      learning_objectives: [
        'Identify major cell organelles',
        'Explain organelle functions',
        'Compare plant and animal cells'
      ],
      interactive_elements: [
        {
          timestamp: 500,
          type: 'checkpoint',
          content: { question: 'Can you identify the organelles we\'ve discussed?' },
          required: true,
        }
      ],
    },
  ];

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || lecture.difficulty.toString() === difficultyFilter;
    const matchesSubject = subjectFilter === 'all' || lecture.subject === subjectFilter;
    
    return matchesSearch && matchesDifficulty && matchesSubject;
  });

  const handleLectureSelect = (lecture: VideoLecture) => {
    setSelectedLecture(lecture);
    onLectureSelect?.(lecture);
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return labels[difficulty] || 'Unknown';
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800', 'bg-purple-100 text-purple-800'];
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      chemistry: 'bg-blue-100 text-blue-800',
      physics: 'bg-purple-100 text-purple-800',
      biology: 'bg-green-100 text-green-800',
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (selectedLecture) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{selectedLecture.title}</h2>
          <Button variant="outline" onClick={() => setSelectedLecture(null)}>
            Back to Library
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <TavusVideoPlayer
              conversationUrl={selectedLecture.video_url}
              isLive={false}
              className="aspect-video"
            />
          </div>

          {/* Lecture Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lecture Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{selectedLecture.description}</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSubjectColor(selectedLecture.subject)}>
                      {selectedLecture.subject}
                    </Badge>
                    <Badge className={getDifficultyColor(selectedLecture.difficulty)}>
                      {getDifficultyLabel(selectedLecture.difficulty)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {selectedLecture.duration} minutes
                </div>

                <div>
                  <h4 className="font-medium mb-2">Learning Objectives</h4>
                  <ul className="space-y-1">
                    {selectedLecture.learning_objectives.map((objective, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Interactive Elements</h4>
                  <div className="space-y-2">
                    {selectedLecture.interactive_elements.map((element, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{element.type}</span>
                          <span className="text-gray-500">
                            {Math.floor(element.timestamp / 60)}:{(element.timestamp % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        {element.required && (
                          <Badge variant="outline" className="mt-1 text-xs">Required</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Video Lecture Library</h2>
          <p className="text-gray-600">Learn from AI teachers with interactive video content</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search lectures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="biology">Biology</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="1">Beginner</SelectItem>
            <SelectItem value="2">Intermediate</SelectItem>
            <SelectItem value="3">Advanced</SelectItem>
            <SelectItem value="4">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lecture Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLectures.map((lecture, index) => (
          <motion.div
            key={lecture.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleLectureSelect(lecture)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Play Lecture
                  </Button>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/70 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {lecture.duration}m
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getSubjectColor(lecture.subject)}>
                    {lecture.subject}
                  </Badge>
                  <Badge className={getDifficultyColor(lecture.difficulty)}>
                    {getDifficultyLabel(lecture.difficulty)}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg">{lecture.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {lecture.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    {lecture.learning_objectives.length} learning objectives
                  </div>
                  <div className="text-xs text-gray-500">
                    {lecture.interactive_elements.length} interactive elements
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => handleLectureSelect(lecture)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredLectures.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No lectures found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}