'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, ChevronDown, Play, Square } from 'lucide-react';
import { BACKGROUND_MUSIC_TRACKS } from '@/lib/constants/background-music';

interface BackgroundMusicSelectorProps {
  selectedMusicId: string;
  onMusicChange: (musicId: string) => void;
}

export default function BackgroundMusicSelector({ selectedMusicId, onMusicChange }: BackgroundMusicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedMusic = BACKGROUND_MUSIC_TRACKS.find(m => m.id === selectedMusicId) || BACKGROUND_MUSIC_TRACKS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlayAudio = (music: typeof BACKGROUND_MUSIC_TRACKS[0], e: React.MouseEvent) => {
    e.stopPropagation();

    // If already playing this track, stop it
    if (playingMusicId === music.id) {
      handleStopAudio(e);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Don't try to play "None" option
    if (!music.filename) {
      return;
    }

    const audio = new Audio(`/background-music/${music.filename}`);
    audioRef.current = audio;
    setPlayingMusicId(music.id);

    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      setPlayingMusicId(null);
    });

    audio.onended = () => {
      setPlayingMusicId(null);
      audioRef.current = null;
    };
  };

  const handleStopAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingMusicId(null);
  };

  const handleSelectMusic = (musicId: string) => {
    onMusicChange(musicId);
    setIsOpen(false);

    // Stop playing audio when selecting
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingMusicId(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
        Background Music
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-linkedin-gray-200 rounded-xl text-sm text-linkedin-gray-700 hover:border-linkedin-gray-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linkedin-blue/10">
            <Music className="w-4 h-4 text-linkedin-blue" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-linkedin-gray-900">{selectedMusic.name}</div>
            <div className="text-xs text-linkedin-gray-600">{selectedMusic.description}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-linkedin-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-linkedin-gray-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="max-h-80 overflow-y-auto">
            {BACKGROUND_MUSIC_TRACKS.map((music) => {
              const isPlaying = playingMusicId === music.id;
              const isSelected = selectedMusicId === music.id;

              return (
                <div
                  key={music.id}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-linkedin-gray-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-linkedin-blue/5' : ''
                  }`}
                  onClick={() => handleSelectMusic(music.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-linkedin-blue' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-linkedin-blue' : 'text-linkedin-gray-900'}`}>
                        {music.name}
                      </div>
                      <div className="text-xs text-linkedin-gray-600 truncate">{music.description}</div>
                    </div>
                  </div>

                  {music.filename && (
                    <button
                      onClick={(e) => isPlaying ? handleStopAudio(e) : handlePlayAudio(music, e)}
                      className={`p-2 rounded-lg transition-all hover:scale-110 flex-shrink-0 ${
                        isPlaying ? 'bg-linkedin-blue text-white' : 'bg-linkedin-gray-100 text-linkedin-gray-700 hover:bg-linkedin-gray-200'
                      }`}
                    >
                      {isPlaying ? (
                        <div className="flex items-center gap-1">
                          <div className="w-0.5 h-3 bg-white animate-wave-1 rounded-full"></div>
                          <div className="w-0.5 h-3 bg-white animate-wave-2 rounded-full"></div>
                          <div className="w-0.5 h-3 bg-white animate-wave-3 rounded-full"></div>
                          <div className="w-0.5 h-3 bg-white animate-wave-4 rounded-full"></div>
                        </div>
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
