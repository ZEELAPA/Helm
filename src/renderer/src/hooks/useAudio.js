import { useRef, useEffect, useState } from 'react';
import { Howl } from 'howler';
import defaultBell from '@renderer/assets/sounds/bell.mp3';

export const useAudio = (customSoundData) => {
    const lastPlayedRef = useRef(0);
    const [howlInstance, setHowlInstance] = useState(null);

    // Initialize/Update the Howl instance whenever the sound source changes
    useEffect(() => {
        const src = customSoundData || defaultBell;
        
        const sound = new Howl({
            src: [src],
            volume: 0.5,
            preload: true,
            html5: true
        });

        setHowlInstance(sound);

        return () => {
            sound.unload(); // Cleanup to prevent memory leaks
        }
    }, [customSoundData]);

    const playSound = () => {
        const now = Date.now();
        // Debounce: prevent double playing within 2 seconds
        if (now - lastPlayedRef.current < 2000) return; 

        if (howlInstance) {
            howlInstance.play();
            lastPlayedRef.current = now;
        }
    };

    return { playSound };
};