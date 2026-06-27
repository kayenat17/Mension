"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Music, CloudRain, Wind } from 'lucide-react';

const CHANNELS = [
  { id: 'lofi', name: 'Lofi Focus', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', icon: Music },
  { id: 'ambient', name: 'Deep Space', url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3', icon: Radio },
  { id: 'rain', name: 'Midnight Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', icon: CloudRain },
  { id: 'bowls', name: 'Singing Bowls', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', icon: Wind },
];

export default function VibeRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannelIdx, setActiveChannelIdx] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.error("Playback failed", e);
        setIsPlaying(false);
      });
    }
  };

  const handleChannelChange = (idx: number) => {
    if (idx === activeChannelIdx) return;
    setActiveChannelIdx(idx);
    
    if (audioRef.current) {
      // Pause current before switching
      audioRef.current.pause();
      
      // Update state and when the audio element's src updates via render,
      // it will automatically play because we use an onCanPlay event or just play after timeout.
      // But React will update the DOM src prop on next render.
      // We will handle the playback in a useEffect.
    }
  };

  useEffect(() => {
    // When channel changes, if we were playing, load and play the new one.
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback failed after channel switch", e);
          setIsPlaying(false);
        });
      }
    }
  }, [activeChannelIdx]);

  const currentChannel = CHANNELS[activeChannelIdx];
  const ActiveIcon = currentChannel.icon;

  return (
    <div className="bg-white/60 backdrop-blur-3xl border border-white/60 shadow-[0_8px_32px_rgba(107,56,212,0.08)] rounded-3xl p-6 relative overflow-hidden group w-full max-w-sm mx-auto">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentChannel.url} 
        loop 
        preload="auto"
      />

      {/* Decorative Blob */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#e9ddff]/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isPlaying ? 'bg-[#6b38d4] text-white animate-pulse' : 'bg-[#e9ddff] text-[#6b38d4]'}`}>
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#1c1b1b] leading-tight">Vibe Radio</h3>
              <p className="text-xs text-[#7b7486] font-medium tracking-wide uppercase">{currentChannel.name}</p>
            </div>
          </div>
          
          <button 
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center bg-[#1c1b1b] text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>
        </div>

        {/* Channel Selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {CHANNELS.map((channel, idx) => {
            const Icon = channel.icon;
            const isActive = activeChannelIdx === idx;
            return (
              <button
                key={channel.id}
                onClick={() => handleChannelChange(idx)}
                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#1c1b1b] text-[#ffe24c] shadow-md scale-105' 
                    : 'bg-white/50 text-[#7b7486] hover:bg-white hover:text-[#1c1b1b]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{channel.id}</span>
              </button>
            )
          })}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 bg-white/40 p-2.5 rounded-full border border-white/50">
          <button onClick={() => setIsMuted(!isMuted)} className="text-[#494454] hover:text-[#1c1b1b]">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-full h-1 bg-[#dcd9d9] rounded-lg appearance-none cursor-pointer accent-[#6b38d4]"
          />
        </div>
      </div>
    </div>
  );
}
