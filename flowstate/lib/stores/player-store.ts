import { create } from "zustand";
import { persist } from "zustand/middleware";
import { musicPlayer } from "@/lib/audio/hls-player";
import { genrePlaylist } from "@/lib/catalog";
import { useAppStore } from "@/lib/stores/app-store";
import { track as trackEvent } from "@/lib/analytics";

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string | null;
  durationS: number;
  hlsUrl: string;
  coverUrl: string | null;
  isPremium: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  slug: string;
  genre: string | null;
  coverUrl: string | null;
  isPremium: boolean;
  tracks: Track[];
}

interface PlayerState {
  currentTrack: Track | null;
  currentPlaylist: Playlist | null;
  activeGenre: string;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: "none" | "one" | "all";
  crossfadeDuration: number;
  playbackError: boolean;
  retryToken: number;

  play: (track: Track, playlist?: Playlist) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setProgress: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaylist: (playlist: Playlist) => void;
  setActiveGenre: (genre: string) => void;
  playGenre: (genre: string) => void;
  setCrossfadeDuration: (duration: number) => void;
  setPlaybackError: (hasError: boolean) => void;
  retryPlayback: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
  currentTrack: null,
  currentPlaylist: null,
  activeGenre: "Lofi Chill", // Default genre tab
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: "all",
  // Users can opt into crossfade; the default must never sound like two
  // unrelated tracks are playing at once.
  crossfadeDuration: 0,
  playbackError: false,
  retryToken: 0,

  play: (track, playlist) => {
    if (track.isPremium && !useAppStore.getState().isPremium) return;
    trackEvent("track_played", { genre: track.genre, premium: track.isPremium });
    set({
      currentTrack: track,
      isPlaying: true,
      playbackError: false,
      progress: 0,
      ...(playlist ? { currentPlaylist: playlist } : {}),
    });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => {
    if (get().currentTrack) set({ isPlaying: true, playbackError: false });
  },

  next: () => {
    const { currentTrack, currentPlaylist, shuffle, repeat, activeGenre } = get();
    // Scope check: If no playlist is active, load the playlist of the currently active genre tab.
    const playlist = currentPlaylist || genrePlaylist(activeGenre || "Lofi Chill");
    const tracks = useAppStore.getState().isPremium
      ? playlist.tracks
      : playlist.tracks.filter((track) => !track.isPremium);
    if (tracks.length === 0) return;

    if (shuffle) {
      const randomIdx = Math.floor(Math.random() * tracks.length);
      set({ 
        currentTrack: tracks[randomIdx], 
        isPlaying: true, 
        progress: 0,
        currentPlaylist: playlist
      });
      return;
    }

    const idx = currentTrack ? tracks.findIndex((t) => t.id === currentTrack.id) : -1;
    const nextIdx = idx + 1;

    if (nextIdx >= tracks.length || idx === -1) {
      if (repeat === "all") {
        set({ 
          currentTrack: tracks[0], 
          isPlaying: true, 
          progress: 0,
          currentPlaylist: playlist
        });
      } else {
        set({ isPlaying: false });
      }
    } else {
      set({ 
        currentTrack: tracks[nextIdx], 
        isPlaying: true, 
        progress: 0,
        currentPlaylist: playlist
      });
    }
  },

  previous: () => {
    const { currentTrack, currentPlaylist, progress, activeGenre } = get();
    // Scope check: If no playlist is active, load the playlist of the currently active genre tab.
    const playlist = currentPlaylist || genrePlaylist(activeGenre || "Lofi Chill");
    const tracks = useAppStore.getState().isPremium
      ? playlist.tracks
      : playlist.tracks.filter((track) => !track.isPremium);
    if (tracks.length === 0) return;

    if (progress > 3) {
      if (typeof window !== "undefined") {
        musicPlayer.seek(0);
      }
      set({ progress: 0 });
      return;
    }

    const idx = currentTrack ? tracks.findIndex((t) => t.id === currentTrack.id) : -1;
    const prevIdx = idx > 0 ? idx - 1 : (idx === -1 ? 0 : tracks.length - 1);
    set({ 
      currentTrack: tracks[prevIdx], 
      isPlaying: true, 
      progress: 0,
      currentPlaylist: playlist
    });
  },

  setVolume: (volume) => set({ volume }),
  setProgress: (seconds) => set({ progress: seconds }),
  setDuration: (seconds) => set({ duration: seconds }),
  toggleShuffle: () => set({ shuffle: !get().shuffle }),
  cycleRepeat: () => {
    const order: Array<"none" | "one" | "all"> = ["none", "one", "all"];
    const idx = order.indexOf(get().repeat);
    set({ repeat: order[(idx + 1) % order.length] });
  },
  setPlaylist: (playlist) => set({ currentPlaylist: playlist }),
  setActiveGenre: (genre) => {
    // Setting active genre tab scopes the playlist to this genre immediately
    set({
      activeGenre: genre,
      currentPlaylist: genrePlaylist(genre)
    });
  },

  // Select a genre AND start playing it (first track, or a random one when shuffle
  // is on). Used by the genre picker so choosing a genre plays immediately.
  playGenre: (genre) => {
    trackEvent("genre_selected", { genre });
    const playlist = genrePlaylist(genre);
    const tracks = useAppStore.getState().isPremium
      ? playlist.tracks
      : playlist.tracks.filter((track) => !track.isPremium);
    if (tracks.length === 0) {
      set({ activeGenre: genre, currentPlaylist: playlist });
      return;
    }
    const track = get().shuffle
      ? tracks[Math.floor(Math.random() * tracks.length)]
      : tracks[0];
    set({
      activeGenre: genre,
      currentPlaylist: playlist,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
    });
  },
  setCrossfadeDuration: (duration) => set({ crossfadeDuration: Math.max(0, Math.min(12, duration)) }),
  setPlaybackError: (hasError) => set({ playbackError: hasError }),
  retryPlayback: () => {
    if (!get().currentTrack) return;
    set({ playbackError: false, isPlaying: true, retryToken: get().retryToken + 1 });
  },
    }),
    {
      name: "flowstate-player",
      // Listening preferences only — never the transport state. Persisting
      // currentTrack/isPlaying would try to resume audio without a user
      // gesture, which autoplay policy blocks.
      partialize: (state) => ({
        activeGenre: state.activeGenre,
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        crossfadeDuration: state.crossfadeDuration,
      }),
    }
  )
);
