// ============================================
// ELAB Tutor - Route Guard: Richiede Licenza Attiva
// Admin bypassa il check licenza (P1-4)
// Sprint 1 Session 30: License expired banner
// ============================================

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RequireLicense({ children, onNavigate }) {
    const { hasLicense, licenseExpired, isAdmin, isAuthenticated, loading } = useAuth();

    // Redirect via useEffect to avoid setState-during-render
    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) {
            onNavigate?.('login');
        } else if (!isAdmin && !hasLicense && !licenseExpired) {
            onNavigate?.('vetrina');
        }
    }, [loading, isAuthenticated, isAdmin, hasLicense, licenseExpired, onNavigate]);

    if (loading) return null;

    // Non autenticato: render null (useEffect handles redirect)
    if (!isAuthenticated) return null;

    // Admin bypassa tutto
    if (isAdmin) return children;

    // Licenza scaduta: mostra banner inline (non redirect)
    if (licenseExpired) {
        return (
            <div style={{ padding: 20 }}>
                <div style={{
                    background: 'linear-gradient(135deg, var(--elab-hex-fef3c7), var(--elab-hex-fde68a))',
                    border: '1px solid var(--elab-hex-f59e0b)',
                    borderRadius: 12,
                    padding: '24px 32px',
                    maxWidth: 520,
                    margin: '40px auto',
                    textAlign: 'center',
                }}>
                    <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>Scaduta</span>
                    <h2 style={{ margin: '0 0 8px', color: 'var(--elab-hex-92400e)', fontSize: 20 }}>
                        Licenza scaduta
                    </h2>
                    <p style={{ margin: '0 0 16px', color: 'var(--elab-hex-78350f)', fontSize: 14, lineHeight: 1.5 }}>
                        La tua licenza ELAB è scaduta. Rinnovala per continuare ad accedere
                        agli esperimenti e alle sfide.
                    </p>
                    <button
                        onClick={() => onNavigate?.('vetrina')}
                        style={{
                            background: 'var(--elab-navy)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 24px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Rinnova licenza
                    </button>
                </div>
                {/* Render children dimmed behind banner so user sees context */}
                <div style={{ opacity: 0.3, pointerEvents: 'none', filter: 'grayscale(0.5)' }}>
                    {children}
                </div>
            </div>
        );
    }

    // Nessuna licenza: render null (useEffect handles redirect)
    if (!hasLicense) return null;

    return children;
}
