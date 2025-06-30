//src/components/avatar/AvatarPersonalization.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Brain, Heart, Zap, Settings, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTavusStore } from '@/stores/useTavusStore';
import { avatarPersonas } from '@/lib/tavus';

interface PersonalizationSettings {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficultyPreference: number;
  interactionFrequency: number;
  encouragementLevel: number;
  explanationDepth: 'brief' | 'moderate' | 'detailed';
  useRealWorldExamples: boolean;
  adaptiveDifficulty: boolean;
  personalInterests: string;
}

export function AvatarPersonalization() {
  const { currentPersona, setPersonalizationSettings, personalizationSettings } = useTavusStore();
  
  const [settings, setSettings] = useState<PersonalizationSettings>(
    personalizationSettings || {
      learningStyle: 'visual',
      difficultyPreference: 3,
      interactionFrequency: 5,
      encouragementLevel: 7,
      explanationDepth: 'moderate',
      useRealWorldExamples: true,
      adaptiveDifficulty: true,
      personalInterests: '',
    }
  );

  const handleSave = () => {
    setPersonalizationSettings(settings);
  };

  const updateSetting = <K extends keyof PersonalizationSettings>(
    key: K,
    value: PersonalizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const learningStyleDescriptions = {
    visual: 'Learn best with diagrams, charts, and visual demonstrations',
    auditory: 'Prefer verbal explanations and discussions',
    kinesthetic: 'Learn through hands-on activities and movement',
    reading: 'Prefer text-based information and written instructions',
  };

  const difficultyLabels = ['Very Easy', 'Easy', 'Moderate', 'Challenging', 'Advanced'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Personalize Your Learning Experience
        </CardTitle>
        <p className="text-sm text-gray-600">
          Help {currentPersona?.name || 'your AI teacher'} adapt to your learning preferences
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Learning Style */}
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-medium">
            <Brain className="h-4 w-4 mr-2" />
            Learning Style
          </Label>
          <Select
            value={settings.learningStyle}
            onValueChange={(value: any) => updateSetting('learningStyle', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(learningStyleDescriptions).map(([style, description]) => (
                <SelectItem key={style} value={style}>
                  <div>
                    <div className="font-medium capitalize">{style}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Preference */}
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-medium">
            <Zap className="h-4 w-4 mr-2" />
            Preferred Difficulty Level
          </Label>
          <div className="space-y-2">
            <Slider
              value={[settings.difficultyPreference]}
              onValueChange={(value) => updateSetting('difficultyPreference', value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              {difficultyLabels.map((label, index) => (
                <span key={index} className={index + 1 === settings.difficultyPreference ? 'font-medium text-blue-600' : ''}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Interaction Frequency */}
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-medium">
            <Heart className="h-4 w-4 mr-2" />
            Interaction Frequency
          </Label>
          <div className="space-y-2">
            <Slider
              value={[settings.interactionFrequency]}
              onValueChange={(value) => updateSetting('interactionFrequency', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Minimal</span>
              <span className={settings.interactionFrequency === 5 ? 'font-medium text-blue-600' : ''}>
                Balanced
              </span>
              <span>Frequent</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            How often would you like {currentPersona?.name} to check in and offer guidance?
          </p>
        </div>

        {/* Encouragement Level */}
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-medium">
            <Heart className="h-4 w-4 mr-2" />
            Encouragement Level
          </Label>
          <div className="space-y-2">
            <Slider
              value={[settings.encouragementLevel]}
              onValueChange={(value) => updateSetting('encouragementLevel', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Minimal</span>
              <span className={settings.encouragementLevel === 5 ? 'font-medium text-blue-600' : ''}>
                Moderate
              </span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Explanation Depth */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Explanation Depth</Label>
          <Select
            value={settings.explanationDepth}
            onValueChange={(value: any) => updateSetting('explanationDepth', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brief">Brief - Quick, concise explanations</SelectItem>
              <SelectItem value="moderate">Moderate - Balanced detail level</SelectItem>
              <SelectItem value="detailed">Detailed - Comprehensive explanations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferences Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Use Real-World Examples</Label>
              <p className="text-xs text-gray-600">Include practical applications and everyday analogies</p>
            </div>
            <Switch
              checked={settings.useRealWorldExamples}
              onCheckedChange={(checked) => updateSetting('useRealWorldExamples', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Adaptive Difficulty</Label>
              <p className="text-xs text-gray-600">Automatically adjust based on your performance</p>
            </div>
            <Switch
              checked={settings.adaptiveDifficulty}
              onCheckedChange={(checked) => updateSetting('adaptiveDifficulty', checked)}
            />
          </div>
        </div>

        {/* Personal Interests */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Personal Interests</Label>
          <Textarea
            value={settings.personalInterests}
            onChange={(e) => updateSetting('personalInterests', e.target.value)}
            placeholder="Tell us about your interests, hobbies, or career goals to help personalize examples..."
            rows={3}
          />
        </div>

        {/* Current Persona Info */}
        {currentPersona && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Current AI Teacher</h4>
            <div className="flex items-center space-x-2 mb-2">
              <Badge>{currentPersona.name}</Badge>
              <Badge variant="outline">{currentPersona.subject}</Badge>
            </div>
            <p className="text-sm text-gray-600">{currentPersona.personality}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}