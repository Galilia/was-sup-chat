import {useCallback, useRef} from 'react';

/**
 * A hook that allows you to cancel the previous function call until the delay expires
 * @param callback
 * @param delay - delay in ms
 */
export function useDebounce(
    callback: (...args: any[]) => void,
    delay: number,
) {
    const timer = useRef<any>(null);

    return useCallback(
        (...args: any[]) => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay],
    );
}
