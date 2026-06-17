import React, { createContext, useContext, useRef, useCallback } from 'react';

const SessionRecorderContext = createContext(null);

export function SessionRecorderProvider({ children }) {
    const timelineRef = useRef([]);
    const snapshotsRef = useRef([]);
    const sessionStartRef = useRef(Date.now());

    const recordEvent = useCallback((type, details = {}) => {
        timelineRef.current.push({
            timestamp: Date.now(),
            elapsed: Date.now() - sessionStartRef.current,
            type,
            ...details,
        });
    }, []);

    const recordSnapshot = useCallback((label, circuitState) => {
        snapshotsRef.current.push({
            timestamp: Date.now(),
            elapsed: Date.now() - sessionStartRef.current,
            label,
            state: circuitState ? JSON.parse(JSON.stringify(circuitState)) : null,
        });
    }, []);

    const getTimeline = useCallback(() => [...timelineRef.current], []);
    const getSnapshots = useCallback(() => [...snapshotsRef.current], []);
    const getSessionDuration = useCallback(() => Date.now() - sessionStartRef.current, []);

    const resetSession = useCallback(() => {
        timelineRef.current = [];
        snapshotsRef.current = [];
        sessionStartRef.current = Date.now();
    }, []);

    const value = {
        recordEvent,
        recordSnapshot,
        getTimeline,
        getSnapshots,
        getSessionDuration,
        resetSession,
    };

    return (
        <SessionRecorderContext.Provider value={value}>
            {children}
        </SessionRecorderContext.Provider>
    );
}

export function useSessionRecorder() {
    const ctx = useContext(SessionRecorderContext);
    if (!ctx) {
        // Graceful fallback: se usato fuori dal Provider, NON crashare
        return {
            recordEvent: () => { },
            recordSnapshot: () => { },
            getTimeline: () => [],
            getSnapshots: () => [],
            getSessionDuration: () => 0,
            resetSession: () => { },
        };
    }
    return ctx;
}

export default SessionRecorderContext;
