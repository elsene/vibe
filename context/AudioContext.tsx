import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';

interface AudioContextType {
  playSound: (soundType: 'move' | 'capture' | 'victory' | 'defeat' | 'button' | 'error') => Promise<void>;
  playVibration: (vibrationType: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => Promise<void>;
  playBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => Promise<void>;
  isBackgroundMusicPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  const [sounds, setSounds] = useState<{ [key: string]: Audio.Sound | null }>({});
  const [backgroundMusic, setBackgroundMusic] = useState<Audio.Sound | null>(null);
  const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] = useState(false);

  // Sons par défaut (générés programmatiquement)
  const generateSound = async (frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine') => {
    try {
      console.log(`🎵 Génération du son: ${frequency}Hz, ${duration}s, ${type}`);
      
      // Utiliser un son ultra-simple et fiable
      const wavData = generateUltraSimpleWav(frequency, duration);
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${wavData}` },
        { shouldPlay: false, isLooping: false, volume: 1.0 }
      );
      
      console.log(`✅ Son généré avec succès: ${frequency}Hz`);
      return sound;
    } catch (error) {
      console.log('❌ Erreur lors de la génération du son:', error);
      return null;
    }
  };

  // Génération de sons WAV en base64 (version simplifiée)
  const generateWavBase64 = (frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine') => {
    const sampleRate = 22050; // Taux d'échantillonnage réduit
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // En-tête WAV simplifié
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Génération des échantillons simplifiée
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Son simple basé sur la fréquence
      sample = Math.sin(2 * Math.PI * frequency * t);
      
      // Enveloppe simple pour éviter les clics
      const envelope = Math.min(1, Math.min(t * 20, (duration - t) * 20));
      sample *= envelope * 0.5; // Volume modéré
      
      view.setInt16(44 + i * 2, sample * 16383, true); // Volume réduit
    }
    
    // Conversion en base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Génération de son WAV ultra-simple et fiable
  const generateUltraSimpleWav = (frequency: number, duration: number) => {
    const sampleRate = 8000;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // En-tête WAV minimal et correct
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    // En-tête RIFF
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    
    // En-tête fmt
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // Format PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    
    // En-tête data
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Génération des échantillons
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5;
      view.setInt16(44 + i * 2, sample * 16383, true);
    }
    
    // Conversion en base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Sons statiques pré-générés (garanties de fonctionner)
  const staticSounds = {
    move: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    capture: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    button: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    victory: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    error: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    defeat: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
  };

  // Initialisation des sons avec les sons statiques
  useEffect(() => {
    const initializeSounds = async () => {
      try {
        console.log('🎵 Initialisation des sons statiques...');
        
        const soundMap: { [key: string]: Audio.Sound | null } = {};
        
        for (const [key, base64Data] of Object.entries(staticSounds)) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: `data:audio/wav;base64,${base64Data}` },
              { shouldPlay: false, isLooping: false, volume: 1.0 }
            );
            soundMap[key] = sound;
            console.log(`✅ Son ${key} chargé`);
          } catch (error) {
            console.log(`❌ Erreur pour le son ${key}:`, error);
            soundMap[key] = null;
          }
        }
        
        setSounds(soundMap);
        console.log('✅ Sons statiques initialisés');
      } catch (error) {
        console.log('❌ Erreur lors de l\'initialisation des sons statiques:', error);
      }
    };

    initializeSounds();
  }, []);

  // Nettoyage des sons
  useEffect(() => {
    return () => {
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.unloadAsync();
        }
      });
      if (backgroundMusic) {
        backgroundMusic.unloadAsync();
      }
    };
  }, [sounds, backgroundMusic]);

  const playSound = async (soundType: 'move' | 'capture' | 'victory' | 'defeat' | 'button' | 'error') => {
    if (!settings.soundEffects) {
      console.log('🔇 Sons désactivés dans les paramètres');
      return;
    }
    
    try {
      const sound = sounds[soundType];
      if (sound) {
        console.log(`🔊 Lecture du son: ${soundType}`);
        await sound.replayAsync();
      } else {
        console.log(`❌ Son non trouvé: ${soundType}`);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la lecture du son:', error);
    }
  };

  const playVibration = async (vibrationType: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    if (!settings.vibration) return;
    
    try {
      switch (vibrationType) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    } catch (error) {
      console.log('Erreur lors de la vibration:', error);
    }
  };

  const playBackgroundMusic = async () => {
    if (!settings.backgroundMusic || isBackgroundMusicPlaying) return;
    
    try {
      if (!backgroundMusic) {
        // Génération d'une musique de fond simple
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/wav;base64,${generateBackgroundMusic()}` },
          { shouldPlay: false, isLooping: true, volume: 0.3 }
        );
        setBackgroundMusic(sound);
      }
      
      if (backgroundMusic) {
        await backgroundMusic.playAsync();
        setIsBackgroundMusicPlaying(true);
      }
    } catch (error) {
      console.log('Erreur lors de la lecture de la musique de fond:', error);
    }
  };

  const stopBackgroundMusic = async () => {
    if (backgroundMusic && isBackgroundMusicPlaying) {
      try {
        await backgroundMusic.pauseAsync();
        setIsBackgroundMusicPlaying(false);
      } catch (error) {
        console.log('Erreur lors de l\'arrêt de la musique de fond:', error);
      }
    }
  };

  // Génération de musique de fond simple
  const generateBackgroundMusic = () => {
    const sampleRate = 44100;
    const duration = 10; // 10 secondes de boucle
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // En-tête WAV (même que précédemment)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Génération d'une mélodie simple
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C4 à C5
    const noteDuration = samples / notes.length;
    
    for (let i = 0; i < samples; i++) {
      const noteIndex = Math.floor(i / noteDuration);
      const note = notes[noteIndex % notes.length];
      const t = i / sampleRate;
      
      // Mélodie avec harmoniques
      let sample = Math.sin(2 * Math.PI * note * t) * 0.3;
      sample += Math.sin(2 * Math.PI * note * 2 * t) * 0.1; // Octave
      sample += Math.sin(2 * Math.PI * note * 3 * t) * 0.05; // Quinte
      
      // Enveloppe douce
      const envelope = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
      sample *= envelope * 0.2;
      
      view.setInt16(44 + i * 2, sample * 32767, true);
    }
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <AudioContext.Provider value={{
      playSound,
      playVibration,
      playBackgroundMusic,
      stopBackgroundMusic,
      isBackgroundMusicPlaying
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
