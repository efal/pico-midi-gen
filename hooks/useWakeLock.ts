import { useEffect, useRef } from 'react';

export const useWakeLock = (enabled: boolean) => {
    const wakeLockRef = useRef<any>(null);

    useEffect(() => {
        const requestLock = async () => {
            // Check if the browser supports the Wake Lock API
            if (!('wakeLock' in navigator)) {
                console.warn('Wake Lock API not supported in this browser.');
                return;
            }

            try {
                // @ts-ignore - navigator.wakeLock might not be in all type definitions yet
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock acquired');
            } catch (err: any) {
                console.error(`Wake Lock error: ${err.name}, ${err.message}`);
            }
        };

        const releaseLock = async () => {
            if (wakeLockRef.current) {
                try {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                    console.log('Wake Lock released');
                } catch (err: any) {
                    console.error(`Wake Lock release error: ${err.name}, ${err.message}`);
                }
            }
        };

        const handleVisibilityChange = () => {
            // Re-acquire lock if the page becomes visible again and it should be enabled
            if (document.visibilityState === 'visible' && enabled) {
                requestLock();
            }
        };

        if (enabled) {
            requestLock();
            document.addEventListener('visibilitychange', handleVisibilityChange);
        } else {
            releaseLock();
        }

        return () => {
            releaseLock();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled]);
};
