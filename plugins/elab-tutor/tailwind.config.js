/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ═══════════════════════════════════════════════════
                // ELAB VOLUME 1 - Colori estratti dagli SVG originali
                // ═══════════════════════════════════════════════════
                elab: {
                    // Colori Primari - Autentici dal manuale
                    navy: '#1F3D85',           // Footer, titoli - blu scuro principale
                    navyDark: '#1F3C84',       // Variante footer
                    lime: '#91BF45',           // Verde lime ELAB autentico
                    limeLight: '#BBD789',      // Verde lime chiaro (bordi)

                    // Arancione (Sidebar, Header)
                    orange: '#EE9B40',         // Arancione principale
                    orangeLight: '#F2AB5B',    // Arancione chiaro
                    orangeMid: '#F3AC5C',      // Arancione medio

                    // Verde (Breadboard, Componenti)
                    green: '#82BF71',          // Verde breadboard principale
                    greenDark: '#529745',      // Verde scuro
                    greenMid: '#5DAF4E',       // Verde medio
                    greenLight: '#81BF71',     // Verde chiaro

                    // Blu (Contenuto, Schede)
                    blue: '#1F4289',           // Blu contenuto
                    blueMid: '#20478D',        // Blu medio
                    blueLight: '#1F458B',      // Blu chiaro

                    // Rosso (LED, Avvisi)
                    red: '#AB231B',            // Rosso LED
                    redDark: '#A53132',        // Rosso scuro
                    redMid: '#AC3C36',         // Rosso medio

                    // Giallo/Oro (Componenti)
                    yellow: '#D5B814',         // Giallo oro
                    yellowBright: '#DE8E1A',   // Giallo brillante

                    // Ciano (Componenti elettronici)
                    cyan: '#2685BF',           // Ciano componenti
                    cyanLight: '#2584BF',      // Ciano chiaro

                    // Sfondi
                    canvas: '#FCFCFC',         // Sfondo pagina principale
                    canvasAlt: '#FDFDFD',      // Sfondo alternativo
                    cream: '#E5EECE',          // Sfondo cream (da precedenti SVG)

                    // UI
                    ui: '#F3F4F6',
                    dark: '#18181b',
                },

                // Semantic Colors per blocchi
                block: {
                    experiment: '#82BF71',     // Blocchi esperimento
                    warning: '#EE9B40',        // Blocchi avviso
                    info: '#1F4289',           // Blocchi info
                    tip: '#C5E063',            // Blocchi suggerimento
                    danger: '#AB231B',         // Blocchi pericolo
                },

                // Status
                status: {
                    success: '#82BF71',
                    warning: '#EE9B40',
                    error: '#AB231B',
                    info: '#1F4289',
                }
            },
            fontFamily: {
                oswald: ['Oswald', 'sans-serif'],
                sans: ['Open Sans', 'sans-serif'],
                mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                'block': '12px',
                'btn': '8px',
                'btn-lg': '16px',
            },
            boxShadow: {
                'block': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'floating': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
            scale: {
                'lift': '1.05',
            },
            spacing: {
                'a5-w': '148mm',
                'a5-h': '210mm',
                'spread-w': '296mm',
                'spread-h': '210mm',
            }
        },
    },
    plugins: [],
}
