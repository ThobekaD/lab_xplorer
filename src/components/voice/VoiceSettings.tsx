//src/components/voice/VoiceSettings.tsx
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, User, Volume2, Mic, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { voiceProfiles } from '@/lib/elevenlabs';

interface VoiceSettingsProps {
  onClose: () => void;
}

export function VoiceSettings({ onClose }: VoiceSettingsProps) {
  const {
    currentVoiceProfile,
    speechRate,
    volume,
    autoSpeak,
    showTranscripts,
    setVoiceProfile,
    setSpeechRate,
    setVolume,
    setAutoSpeak,
    setShowTranscripts,
    testVoice,
  } = useVoiceStore();

  const handleVoiceProfileChange = useCallback((profileId: string) => {
    const profile = voiceProfiles.find(p => p.id === profileId);
    if (profile) {
      setVoiceProfile(profile);
    }
  }, [setVoiceProfile]);

  const handleTestVoice = useCallback(() => {
    const testText = `Hello! I'm ${currentVoiceProfile?.name || 'your voice assistant'}. I'm here to help you with your science experiments. Let's explore the wonderful world of ${currentVoiceProfile?.subject || 'science'} together!`;
    testVoice(testText);
  }, [currentVoiceProfile, testVoice]);

  // Stable callback handlers to prevent infinite re-renders
  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, [setVolume]);

  const handleSpeechRateChange = useCallback((value: number[]) => {
    setSpeechRate(value[0]);
  }, [setSpeechRate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="w-96 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Voice Settings</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Profile Selection */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <User className="h-4 w-4 mr-2" />
              Voice Assistant
            </Label>
            <Select
              value={currentVoiceProfile?.id || ''}
              onValueChange={handleVoiceProfileChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a voice assistant" />
              </SelectTrigger>
              <SelectContent>
                {voiceProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center space-x-2">
                      <span>{profile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({profile.subject} • {profile.gender})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentVoiceProfile && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {currentVoiceProfile.personality}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleTestVoice} className="w-full">
              Test Voice
            </Button>
          </div>

          {/* Volume Control */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <Volume2 className="h-4 w-4 mr-2" />
              Volume
            </Label>
            <div className="space-y-2">
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{volume}%</div>
            </div>
          </div>

          {/* Speech Rate */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <Mic className="h-4 w-4 mr-2" />
              Speech Rate
            </Label>
            <div className="space-y-2">
              <Slider
                value={[speechRate]}
                onValueChange={handleSpeechRateChange}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{speechRate}x</div>
            </div>
          </div>

          {/* Auto-speak Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Auto-speak instructions</Label>
              <Switch
                checked={autoSpeak}
                onCheckedChange={setAutoSpeak}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show transcripts</Label>
              <Switch
                checked={showTranscripts}
                onCheckedChange={setShowTranscripts}
              />
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <Globe className="h-4 w-4 mr-2" />
              Language
            </Label>
            <Select defaultValue="en-US">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accessibility Note */}
          <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
            <strong>Accessibility:</strong> Voice features support screen readers and keyboard navigation. 
            Audio descriptions are available for visual elements.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}