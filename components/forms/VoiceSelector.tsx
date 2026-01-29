'use client';

import { useState, useRef, useEffect } from 'react';
import { ELEVENLABS_VOICES, Voice } from '@/lib/constants/voices';
import { Volume2, ChevronDown, Play, Square } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
}

export default function VoiceSelector({ selectedVoiceId, onVoiceChange }: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedVoice = ELEVENLABS_VOICES.find(v => v.id === selectedVoiceId) || ELEVENLABS_VOICES[0];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = (voice: Voice, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Playing audio for:', voice.name, voice.previewUrl);

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Play new audio
    try {
      const audio = new Audio(voice.previewUrl);
      audioRef.current = audio;
      setPlayingVoiceId(voice.id);

      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        alert(`Failed to play audio: ${err.message}`);
        setPlayingVoiceId(null);
      });

      audio.onended = () => {
        console.log('Audio ended');
        setPlayingVoiceId(null);
        audioRef.current = null;
      };

      audio.onerror = (err) => {
        console.error('Audio error:', err);
        alert('Failed to load audio file');
        setPlayingVoiceId(null);
        audioRef.current = null;
      };
    } catch (err) {
      console.error('Error creating audio:', err);
      alert('Failed to create audio player');
      setPlayingVoiceId(null);
    }
  };

  const handleStopAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Stopping audio');

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  const handleSelectVoice = (voice: Voice) => {
    onVoiceChange(voice.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Narration Voice
        </div>
      </label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border-2 border-linkedin-gray-300 rounded-lg bg-white hover:border-linkedin-blue transition-all group"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Audio Icon with Animation */}
          <div className="relative flex items-center gap-0.5">
            {playingVoiceId === selectedVoice.id ? (
              <>
                <div className="w-1 bg-linkedin-blue rounded-full animate-wave-1" style={{ height: '16px' }}></div>
                <div className="w-1 bg-linkedin-blue rounded-full animate-wave-2" style={{ height: '20px' }}></div>
                <div className="w-1 bg-linkedin-blue rounded-full animate-wave-3" style={{ height: '12px' }}></div>
                <div className="w-1 bg-linkedin-blue rounded-full animate-wave-4" style={{ height: '18px' }}></div>
              </>
            ) : (
              <Volume2 className="w-5 h-5 text-linkedin-gray-600 group-hover:text-linkedin-blue transition-colors" />
            )}
          </div>

          <div className="flex-1 text-left">
            <div className="font-semibold text-sm text-linkedin-gray-900">{selectedVoice.name}</div>
            <div className="text-xs text-linkedin-gray-600">{selectedVoice.description}</div>
          </div>
        </div>

        <ChevronDown className={`w-5 h-5 text-linkedin-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>

          {/* Menu */}
          <div className="absolute z-20 mt-2 w-full bg-white border-2 border-linkedin-gray-300 rounded-xl shadow-linkedin-hover overflow-hidden animate-fade-in">
            <div className="max-h-[240px] overflow-y-auto">
              {ELEVENLABS_VOICES.map((voice) => (
                <div
                  key={voice.id}
                  className={`w-full flex items-center gap-3 p-4 transition-all border-b border-linkedin-gray-200 last:border-b-0 ${
                    voice.id === selectedVoiceId ? 'bg-linkedin-blue/10' : 'hover:bg-linkedin-blue/5'
                  }`}
                >
                  {/* Play/Stop Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      if (playingVoiceId === voice.id) {
                        handleStopAudio(e);
                      } else {
                        handlePlayAudio(voice, e);
                      }
                    }}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-linkedin-blue/10 hover:bg-linkedin-blue/20 transition-all flex-shrink-0"
                  >
                    {playingVoiceId === voice.id ? (
                      <Square className="w-5 h-5 text-linkedin-blue fill-linkedin-blue" />
                    ) : (
                      <Play className="w-5 h-5 text-linkedin-blue fill-linkedin-blue" />
                    )}
                  </button>

                  {/* Voice Info - Click to select */}
                  <button
                    type="button"
                    onClick={() => handleSelectVoice(voice)}
                    className="flex-1 text-left overflow-hidden"
                  >
                    <div className="font-semibold text-sm text-linkedin-gray-900 truncate">{voice.name}</div>
                    <div className="text-xs text-linkedin-gray-600 mt-0.5 line-clamp-1">{voice.description}</div>
                  </button>

                  {/* Selected Indicator */}
                  {voice.id === selectedVoiceId && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-linkedin-blue rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
