/**
 * VGP Universe - Audio Engine Hook
 * State management for HealingWave Before/After toggle and visualizer
 */

import { useReducer, useCallback } from 'react';

// ========================================
// TYPES
// ========================================

interface AudioState {
    isProcessed: boolean;      // Before (false) / After (true) toggle
    visualizerSpeed: number;   // Animation speed multiplier
    isPlaying: boolean;        // Audio playback state
    volume: number;            // 0-100
}

type AudioAction =
    | { type: 'TOGGLE_PROCESSING' }
    | { type: 'SET_PLAYING'; payload: boolean }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'RESET' };

// ========================================
// REDUCER
// ========================================

const initialState: AudioState = {
    isProcessed: false,
    visualizerSpeed: 1,
    isPlaying: false,
    volume: 75,
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
    switch (action.type) {
        case 'TOGGLE_PROCESSING':
            return {
                ...state,
                isProcessed: !state.isProcessed,
                // Speed up visualizer when processing is active
                visualizerSpeed: state.isProcessed ? 1 : 1.5,
            };
        case 'SET_PLAYING':
            return { ...state, isPlaying: action.payload };
        case 'SET_VOLUME':
            return { ...state, volume: action.payload };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

// ========================================
// HOOK
// ========================================

export function useAudioEngine() {
    const [state, dispatch] = useReducer(audioReducer, initialState);

    // Memoized handlers to prevent unnecessary re-renders
    const toggleProcessing = useCallback(() => {
        dispatch({ type: 'TOGGLE_PROCESSING' });
    }, []);

    const setPlaying = useCallback((playing: boolean) => {
        dispatch({ type: 'SET_PLAYING', payload: playing });
    }, []);

    const setVolume = useCallback((volume: number) => {
        dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(100, volume)) });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return {
        // State (read-only)
        isProcessed: state.isProcessed,
        visualizerSpeed: state.visualizerSpeed,
        isPlaying: state.isPlaying,
        volume: state.volume,

        // Actions
        toggleProcessing,
        setPlaying,
        setVolume,
        reset,
    };
}
