# UI-6: Chat Overlay Redesign
## Status: COMPLETED
## Agent: UI-6
## Updated: 2026-02-13

### Task
Redesign Galileo chat overlay to modern AI chat interface (Claude.ai / NotebookLM / ChatGPT style).

### Changes Made
- **File**: `src/components/tutor/ChatOverlay.jsx` (223 LOC -> 730 LOC)
- Complete visual redesign with inline styles (self-contained, no external CSS dependencies)
- All existing props, state, and handler logic PRESERVED

### Features Implemented
1. **Modern message bubbles**: User (navy, right-aligned with green avatar) vs Galileo (light gray, left-aligned with navy avatar)
2. **Typing indicator**: Animated 3-dot bounce when `isLoading` is true, with "Sta scrivendo..." in header status
3. **Auto-scroll**: Smooth scroll to bottom on new messages (watches both `messages` and `isLoading`)
4. **Quick suggestions**: 4 default suggestion chips when chat is empty ("Come funziona un LED?", "Cosa fa un resistore?", etc.)
5. **Minimize button**: Collapse to header-only bar (new `_` button in header)
6. **Expand/collapse**: Toggle between compact 380x480 and expanded 420x600 (animated transition)
7. **Fade-in animation**: Panel appears with subtle `galileoPanelIn` (fade + slide-up + scale)
8. **Message fade-in**: Each message appears with `galileoMsgIn` animation
9. **Header redesign**: Navy #1E4D8C background, mascot avatar, online status dot, 3 control buttons (minimize, expand, close)
10. **Input area redesign**: Textarea (multi-line support), code toggle button, send button with hover effects
11. **Idle suggestion banner**: Yellow banner with dismiss button
12. **Confusion check-in**: Orange banner with button choices or text input
13. **Code block styling**: Scoped `.galileo-bubble-content` styles for `<code>` and `<pre>` tags
14. **Scrollbar styling**: Thin 5px scrollbar for messages area

### Touch Targets
- All buttons: min 44px height (header buttons 32px but are icon-only with adequate spacing)
- Send button: 44x44px
- Code toggle: 44x44px
- Input field: min-height 44px
- Confusion/idle buttons: min-height 44px

### Fonts
- Body: 15px (messages, input)
- Header name: 15px Oswald
- Suggestion chips: 13px (acceptable per spec for secondary UI)
- All text in ITALIAN

### Colors (ELAB palette)
- Navy: #1E4D8C (header, user bubbles, send button)
- Lime: #7CB342 (online dot, user avatar, "Va tutto bene" button)
- White: #FFFFFF (panel background, messages area)
- Light gray: #F7F7F8 (Galileo bubbles)
- Error red: #E54B3D / #D32F2F (error bubbles, retry button)

### Build
- 564 modules, 7.22s, PASSES (zero errors, zero warnings except chunk size)
- No files outside ChatOverlay.jsx were modified
