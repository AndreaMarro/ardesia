import { WebSocketServer } from 'ws';

/**
 * Vite plugin that starts a WebSocket server on port 8080
 * This bridges the MCP server with the React editor
 */
export function elabWebSocketPlugin() {
    let wss = null;
    let editorSocket = null;
    
    return {
        name: 'elab-websocket-bridge',
        
        configureServer(server) {
            // Start WebSocket server on port 8080
            wss = new WebSocketServer({ port: 8080 });
            
            console.log('🔌 ELAB WebSocket Bridge started on ws://localhost:8080');
            
            wss.on('connection', (ws) => {
                console.log('✅ Editor connected to WebSocket bridge');
                editorSocket = ws;
                
                ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        // Forward responses from editor
                        if (message.type === 'RESPONSE') {
                            console.log('📤 Response from editor:', message.requestId);
                        }
                    } catch (e) {
                        console.error('Failed to parse message:', e);
                    }
                });
                
                ws.on('close', () => {
                    console.log('❌ Editor disconnected from WebSocket bridge');
                    editorSocket = null;
                });
                
                ws.on('error', (err) => {
                    console.error('WebSocket error:', err);
                });
            });
            
            wss.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log('⚠️ Port 8080 already in use - WebSocket bridge may already be running');
                } else {
                    console.error('WebSocket server error:', err);
                }
            });
        },
        
        closeBundle() {
            if (wss) {
                wss.close();
            }
        }
    };
}
