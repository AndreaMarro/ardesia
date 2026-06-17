// ============================================
// ELAB Tutor - Route Guard: Richiede Autenticazione
// ============================================

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children, onNavigate }) {
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            onNavigate?.('login');
        }
    }, [loading, isAuthenticated, onNavigate]);

    if (loading) return null;
    if (!isAuthenticated) return null;
    return children;
}
