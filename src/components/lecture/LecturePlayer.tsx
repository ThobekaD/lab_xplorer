//src/components/lecture/LecturePlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Type,
  BookOpen,
  Brain,
  Globe,
  Lightbulb,
  Microscope,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { useLectures } from '@/hooks/useLectures';
import type { AvatarPersona } from '@/lib/tavus';

interface LecturePlayerProps {
  experimentId: string;
  experimentSubject: string;
  currentPersona?: AvatarPersona | null;
  voiceEnabled?: boolean;
}

interface LectureSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  realWorldExamples?: string[];
  keyPoints?: string[];
  funFacts?: string[];
}

export function LecturePlayer({ 
  experimentId, 
  experimentSubject, 
  currentPersona,
  voiceEnabled 
}: LecturePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState([150]); // words per minute
  const [fontSize, setFontSize] = useState([18]);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState([80]);
  
  const { speakInstruction, stopSpeech, isEnabled: voiceSystemEnabled } = useVoiceStore();
  const { data: lectures, isLoading } = useLectures(experimentId);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);

  // Generate lecture content based on experiment subject
  const generateLectureContent = (): LectureSection[] => {
    const subjectContent = {
      chemistry: [
        {
          id: 'introduction',
          title: 'Introduction to Chemistry',
          icon: <Microscope className="h-5 w-5" />,
          content: `Chemistry is the science of matter and the changes it undergoes. In this experiment, we'll explore the fundamental principles that govern chemical reactions and molecular interactions. Understanding these concepts is crucial for comprehending how substances interact at the atomic level.`,
          keyPoints: [
            'Matter consists of atoms and molecules',
            'Chemical bonds hold atoms together',
            'Energy changes accompany chemical reactions',
            'Conservation of mass applies to all reactions'
          ],
          realWorldExamples: [
            'Digestion breaks down food through chemical reactions',
            'Photosynthesis converts CO₂ and water into glucose',
            'Battery reactions provide electrical energy',
            'Cooking involves chemical changes in food'
          ],
          funFacts: [
            'There are 118 known chemical elements',
            'Water is the only substance that exists naturally in all three states',
            'Your body contains enough carbon to make 900 pencils'
          ]
        },
        {
          id: 'safety',
          title: 'Laboratory Safety',
          icon: <Brain className="h-5 w-5" />,
          content: `Safety is paramount in any chemistry laboratory. Proper handling of chemicals, understanding their properties, and following established protocols ensures both your safety and the success of your experiments. Always wear appropriate protective equipment and be aware of emergency procedures.`,
          keyPoints: [
            'Always wear safety goggles and appropriate clothing',
            'Read Material Safety Data Sheets (MSDS) before handling chemicals',
            'Never eat, drink, or touch your face in the laboratory',
            'Know the location of safety equipment'
          ],
          realWorldExamples: [
            'Industrial chemists follow strict safety protocols',
            'Pharmaceutical labs require sterile environments',
            'Chemical spill response teams use specialized equipment',
            'Food safety labs test for chemical contaminants'
          ]
        },
        {
          id: 'concepts',
          title: 'Key Chemical Concepts',
          icon: <Lightbulb className="h-5 w-5" />,
          content: `This experiment demonstrates several fundamental chemical principles including molecular structure, reaction kinetics, and thermodynamics. By observing how substances interact under controlled conditions, we can better understand the underlying mechanisms that drive chemical change.`,
          keyPoints: [
            'Molecular structure determines chemical properties',
            'Reaction rates depend on temperature and concentration',
            'Catalysts speed up reactions without being consumed',
            'pH measures the acidity or basicity of solutions'
          ],
          realWorldExamples: [
            'Enzymes in your body act as biological catalysts',
            'Soap works by disrupting lipid membranes',
            'Antacids neutralize stomach acid',
            'Rust formation is an oxidation reaction'
          ]
        }
      ],
      physics: [
        {
          id: 'introduction',
          title: 'Understanding Physics',
          icon: <Globe className="h-5 w-5" />,
          content: `Physics is the fundamental science that seeks to understand how the universe works. From the smallest subatomic particles to the largest galaxies, physics provides the mathematical framework to describe natural phenomena. This experiment will help you discover these universal principles through hands-on investigation.`,
          keyPoints: [
            'Physics describes motion, energy, and forces',
            'Mathematical relationships govern physical phenomena',
            'Conservation laws apply throughout the universe',
            'Measurement and precision are crucial for understanding'
          ],
          realWorldExamples: [
            'GPS satellites rely on relativity calculations',
            'Medical imaging uses principles of wave physics',
            'Renewable energy harnesses fundamental forces',
            'Sports equipment design applies physics principles'
          ],
          funFacts: [
            'Light travels 300,000 kilometers per second',
            'Gravity is the weakest of the four fundamental forces',
            'Quantum effects become important at microscopic scales'
          ]
        },
        {
          id: 'forces',
          title: 'Forces and Motion',
          icon: <Brain className="h-5 w-5" />,
          content: `Forces are interactions that can change an object's motion. Newton's laws of motion provide the foundation for understanding how forces affect the movement of objects, from falling apples to orbiting planets. These principles govern everything from walking to space travel.`,
          keyPoints: [
            'Newton\'s first law: Objects in motion stay in motion',
            'Newton\'s second law: Force equals mass times acceleration',
            'Newton\'s third law: Every action has an equal and opposite reaction',
            'Friction opposes motion in most real-world situations'
          ],
          realWorldExamples: [
            'Car brakes use friction to slow down vehicles',
            'Rockets work by Newton\'s third law',
            'Seat belts protect passengers during sudden stops',
            'Athletes use force principles to improve performance'
          ]
        }
      ],
      biology: [
        {
          id: 'introduction',
          title: 'The Science of Life',
          icon: <Microscope className="h-5 w-5" />,
          content: `Biology is the study of living organisms and their interactions with each other and their environment. From microscopic bacteria to complex ecosystems, biology reveals the incredible diversity and interconnectedness of life on Earth. This experiment will help you understand fundamental biological processes.`,
          keyPoints: [
            'All living things are made of cells',
            'DNA carries genetic information',
            'Evolution explains the diversity of life',
            'Ecosystems are interconnected networks'
          ],
          realWorldExamples: [
            'Vaccines train your immune system to fight diseases',
            'Photosynthesis produces the oxygen we breathe',
            'Genetic engineering improves crop yields',
            'Antibiotics target bacterial cell walls'
          ],
          funFacts: [
            'Your body contains about 37 trillion cells',
            'Bacteria have been on Earth for 3.5 billion years',
            'Humans share 99% of their DNA with chimpanzees'
          ]
        },
        {
          id: 'cells',
          title: 'Cellular Biology',
          icon: <Brain className="h-5 w-5" />,
          content: `Cells are the basic units of life. Understanding cellular structure and function is essential for comprehending how living organisms work. From single-celled bacteria to complex multicellular organisms, cells carry out the fundamental processes that sustain life.`,
          keyPoints: [
            'Cell membranes control what enters and leaves cells',
            'Organelles perform specialized functions',
            'DNA replication ensures genetic continuity',
            'Cellular respiration provides energy for life processes'
          ],
          realWorldExamples: [
            'Cancer occurs when cell division goes wrong',
            'Insulin helps cells absorb glucose from blood',
            'Muscle cells contract to enable movement',
            'Nerve cells transmit electrical signals'
          ]
        }
      ]
    };

    return subjectContent[experimentSubject as keyof typeof subjectContent] || subjectContent.chemistry;
  };

  const lectureContent = generateLectureContent();
  const currentLectureSection = lectureContent[currentSection];
  const sentences = currentLectureSection?.content.split('. ').filter(s => s.trim()) || [];

  // Auto-advance through sentences and sections
  useEffect(() => {
    if (isPlaying && autoAdvance) {
      const wordsPerSentence = sentences[currentSentence]?.split(' ').length || 10;
      const readingTimeMs = (wordsPerSentence / readingSpeed[0]) * 60 * 1000;

      intervalRef.current = setTimeout(() => {
        if (currentSentence < sentences.length - 1) {
          setCurrentSentence(prev => prev + 1);
        } else if (currentSection < lectureContent.length - 1) {
          setCurrentSection(prev => prev + 1);
          setCurrentSentence(0);
        } else {
          setIsPlaying(false);
        }
      }, readingTimeMs);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isPlaying, currentSentence, currentSection, autoAdvance, readingSpeed, sentences.length, lectureContent.length]);

  // Speak current sentence when it changes
  useEffect(() => {
    if (isPlaying && voiceEnabled && voiceSystemEnabled && sentences[currentSentence]) {
      speakInstruction(sentences[currentSentence]).catch(error => {
        console.warn('Failed to speak sentence:', error);
      });
    }
  }, [currentSentence, isPlaying, voiceEnabled, voiceSystemEnabled, sentences, speakInstruction]);

  // Auto-scroll teleprompter
  useEffect(() => {
    if (teleprompterRef.current && showHighlights) {
      const highlightedElement = teleprompterRef.current.querySelector('.highlighted-sentence');
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSentence, showHighlights]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (voiceSystemEnabled) {
        stopSpeech();
      }
    } else {
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentSentence(0);
    if (voiceSystemEnabled) {
      stopSpeech();
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setCurrentSentence(0);
    }
  };

  const handleNextSection = () => {
    if (currentSection < lectureContent.length - 1) {
      setCurrentSection(prev => prev + 1);
      setCurrentSentence(0);
    }
  };

  const renderTeleprompterText = () => {
    if (!currentLectureSection) return null;

    return sentences.map((sentence, index) => (
      <span
        key={index}
        className={`
          ${index === currentSentence && showHighlights ? 'highlighted-sentence bg-yellow-200 font-semibold' : ''}
          ${index < currentSentence ? 'text-gray-500' : 'text-gray-900'}
          cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors
        `}
        onClick={() => setCurrentSentence(index)}
        style={{ fontSize: `${fontSize[0]}px`, lineHeight: 1.6 }}
      >
        {sentence.trim()}{index < sentences.length - 1 ? '. ' : '.'}
      </span>
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lecture content...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lecture Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Interactive Lecture: {currentLectureSection?.title}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {currentPersona ? `Presented by ${currentPersona.name}` : 'AI-Powered Learning Experience'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Section {currentSection + 1} of {lectureContent.length}
              </Badge>
              <Badge variant={voiceEnabled ? 'default' : 'secondary'}>
                {voiceEnabled ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
                Voice {voiceEnabled ? 'On' : 'Off'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousSection}
                disabled={currentSection === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handlePlayPause}
                className={isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
              >
                <Square className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextSection}
                disabled={currentSection === lectureContent.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Settings */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={24}
                  min={12}
                  step={1}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">{fontSize[0]}px</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm">Speed:</span>
                <Slider
                  value={readingSpeed}
                  onValueChange={setReadingSpeed}
                  max={200}
                  min={50}
                  step={10}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">{readingSpeed[0]} wpm</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm">Auto-advance:</span>
                <Switch
                  checked={autoAdvance}
                  onCheckedChange={setAutoAdvance}
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>{currentSentence + 1} / {sentences.length} sentences</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSentence + 1) / sentences.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex items-center space-x-2">
            {lectureContent.map((section, index) => (
              <Button
                key={section.id}
                variant={index === currentSection ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCurrentSection(index);
                  setCurrentSentence(0);
                }}
                className="flex items-center"
              >
                {section.icon}
                <span className="ml-1 hidden sm:inline">{section.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Lecture Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teleprompter */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lecture Content</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHighlights(!showHighlights)}
                >
                  <Lightbulb className={`h-4 w-4 ${showHighlights ? 'text-yellow-500' : 'text-gray-400'}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={teleprompterRef}
                className="prose max-w-none bg-white p-6 rounded-lg border min-h-[400px] max-h-[500px] overflow-y-auto"
              >
                {renderTeleprompterText()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplementary Content */}
        <div className="space-y-4">
          {/* Key Points */}
          {currentLectureSection?.keyPoints && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentLectureSection.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Real-World Examples */}
          {currentLectureSection?.realWorldExamples && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-World Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentLectureSection.realWorldExamples.map((example, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">{example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fun Facts */}
          {currentLectureSection?.funFacts && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fun Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentLectureSection.funFacts.map((fact, index) => (
                    <div key={index} className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-800">💡 {fact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}