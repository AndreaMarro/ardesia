// ============================================
// ELAB Tutor - Context Autenticazione Server-Side
// Tutti i diritti riservati
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as supabaseAuth from '../services/supabaseAuth';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [hasLicense, setHasLicense] = useState(false);
    const [licenseExpired, setLicenseExpired] = useState(false);
    const [loading, setLoading] = useState(true);

    // Al mount: verifica sessione (Supabase → legacy token → DEV mock)
    useEffect(() => {
        let cancelled = false;

        async function initAuth() {
            // ── E2E override: localStorage user bypasses real auth ──
            // SECURITY: gate behind DEV/test mode only. In PROD, any visitor
            // could set `elab_e2e_user` in DevTools and become admin.
            // Dead-code elimination by Vite removes this block from prod bundle.
            if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
                try {
                    const e2eRaw = localStorage.getItem('elab_e2e_user');
                    if (e2eRaw) {
                        const e2eUser = JSON.parse(e2eRaw);
                        if (!cancelled) { setUser(e2eUser); setHasLicense(true); setLoading(false); }
                        return;
                    }
                } catch { /* ignore malformed */ }
            }

            // ── Supabase path: se configurato, controlla sessione Supabase ──
            if (isSupabaseConfigured()) {
                try {
                    const supaUser = await supabaseAuth.getCurrentUser();
                    if (!cancelled && supaUser) {
                        setUser(supaUser);
                        setHasLicense(true);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    logger.warn('[AuthContext] Supabase session check failed:', e);
                }
                // Supabase configurato ma nessuna sessione → continua con legacy
            }

            // ── Legacy path: token in sessionStorage → profilo dal server ──
            if (!authService.isAuthenticated()) {
                // No token = no user. Admin requires real login.
                setLoading(false);
                return;
            }

            try {
                const profile = await authService.getProfile();
                if (!cancelled && profile) {
                    setUser(profile.user);
                    setHasLicense(profile.hasLicense);
                    setLicenseExpired(profile.licenseExpired || false);

                    authService.startAutoRefresh(() => {
                        setUser(null);
                        setHasLicense(false);
                        setLicenseExpired(false);
                    });
                }
            } catch {
                if (import.meta.env.DEV && !cancelled) {
                    logger.warn('[AuthContext] DEV mode — server unreachable, mock user attivo (solo localhost)');
                    setUser({
                        id: 'dev-mock-001', email: 'dev@localhost',
                        username: 'dev.test', name: 'Dev', surname: 'Tester',
                        ruolo: 'docente', userType: 'family',
                        kits: ['Volume 1', 'Volume 2', 'Volume 3'],
                        premium: true, points: 0, level: 1
                    });
                    setHasLicense(true);
                }
            }

            if (!cancelled) setLoading(false);
        }

        initAuth();

        // Supabase auth state listener
        let unsubscribe;
        if (isSupabaseConfigured()) {
            const { data } = supabaseAuth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const mapped = supabaseAuth.getCurrentUser().then(u => { if (u) { setUser(u); setHasLicense(true); } });
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setHasLicense(false);
                }
            });
            unsubscribe = data?.subscription?.unsubscribe;
        }

        return () => { cancelled = true; authService.stopAutoRefresh(); unsubscribe?.(); };
    }, []);

    // Andrea Marro — 18/02/2026

    const login = useCallback(async (emailOrUsername, password) => {
        // Supabase login se configurato
        if (isSupabaseConfigured()) {
            const sbResult = await supabaseAuth.signIn(emailOrUsername, password);
            if (sbResult.success) {
                setUser(sbResult.user);
                setHasLicense(true);
                setLicenseExpired(false);
                return sbResult;
            }
            // Se Supabase fallisce con errore non di rete, ritorna errore
            if (!sbResult.error?.includes('non configurato')) return sbResult;
        }
        // Fallback a legacy auth
        const result = await authService.login(emailOrUsername, password);
        if (result.success) {
            setUser(result.user);
            setHasLicense(result.hasLicense || false);
            setLicenseExpired(false);
            authService.startAutoRefresh(() => {
                setUser(null);
                setHasLicense(false);
                setLicenseExpired(false);
            });
        }
        return result;
    }, []);

    const register = useCallback(async (data) => {
        // Supabase register se configurato
        if (isSupabaseConfigured()) {
            const sbResult = await supabaseAuth.signUp({
                email: data.email,
                password: data.password,
                nome: data.name || data.nome || data.username,
                cognome: data.surname || data.cognome || '',
                ruolo: data.ruolo || data.role || 'studente',
                scuola: data.scuola || data.school || '',
                citta: data.citta || data.city || '',
            });
            if (sbResult.success) {
                setUser(sbResult.user);
                setHasLicense(false);
                return sbResult;
            }
            if (!sbResult.error?.includes('non configurato')) return sbResult;
        }
        // Fallback a legacy auth
        const result = await authService.register(data);
        if (result.success) {
            setUser(result.user);
            setHasLicense(false);
            authService.startAutoRefresh(() => {
                setUser(null);
                setHasLicense(false);
            });
        }
        return result;
    }, []);

    const logout = useCallback(async () => {
        authService.stopAutoRefresh();
        if (isSupabaseConfigured()) await supabaseAuth.signOut();
        await authService.logout();
        setUser(null);
        setHasLicense(false);
        setLicenseExpired(false);
        window.history.replaceState(null, '', '#login');
    }, []);

    const activateLicense = useCallback(async (licenseCode) => {
        const result = await authService.activateLicense(licenseCode);
        if (result.success) {
            setHasLicense(true);
            // Aggiorna user con nuovi kits
            if (user) {
                setUser(prev => ({
                    ...prev,
                    kits: result.kits || prev.kits,
                    premium: true,
                }));
            }
        }
        return result;
    }, [user]);

    const refreshUser = useCallback(async () => {
        const profile = await authService.getProfile();
        if (profile) {
            setUser(profile.user);
            setHasLicense(profile.hasLicense);
            setLicenseExpired(profile.licenseExpired || false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            hasLicense,
            licenseExpired,
            isAuthenticated: !!user,
            isAdmin: user?.ruolo === 'admin',
            isDocente: user?.ruolo === 'docente' || user?.ruolo === 'teacher',
            isStudente: user?.ruolo === 'studente' || user?.ruolo === 'student',
            login,
            register,
            logout,
            activateLicense,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
    return ctx;
}

export default AuthContext;
