/**
 * ELAB Simulator — Annotation Component
 * Draggable text notes on the SVG canvas (sticky-note style).
 * Uses foreignObject for editable text.
 * Andrea Marro — 13/02/2026
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

const Annotation = ({
  id,
  x = 0,
  y = 0,
  text = '',
  isSelected = false,
  onTextChange,
  onSelect,
  onDelete,
  onPositionChange,
  onSendToUNLIM,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text);
  const textareaRef = useRef(null);

  // Drag state (local dx/dy offset while dragging)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const dragOffsetRef = useRef({ dx: 0, dy: 0 }); // G42: ref to avoid listener churn
  const dragStartRef = useRef(null); // { mouseX, mouseY, startX, startY }

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
    setLocalText(text);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (onTextChange && localText !== text) {
      onTextChange(id, localText);
    }
  }, [id, localText, text, onTextChange]);

  const handleMouseDown = useCallback((e) => {
    if (isEditing) return; // don't interfere with text editing
    e.stopPropagation();
    e.preventDefault();
    if (onSelect) onSelect(id);

    // Start drag: record mouse position and annotation position
    // Use the nearest SVG element to get SVG coordinates
    const svg = e.target.closest('svg');
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

    dragStartRef.current = {
      mouseX: svgPt.x,
      mouseY: svgPt.y,
      startX: x,
      startY: y,
    };
    setIsDragging(true);
    setDragOffset({ dx: 0, dy: 0 });
  }, [id, onSelect, isEditing, x, y]);

  // Window-level mousemove/mouseup for drag (attached only while dragging)
  // G42: Removed dragOffset.dx/dy from deps to prevent listener churn (~60Hz re-attach).
  // handleMouseUp reads from dragOffsetRef instead of closure.
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!dragStartRef.current) return;
      const svg = document.querySelector('svg');
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

      const dx = svgPt.x - dragStartRef.current.mouseX;
      const dy = svgPt.y - dragStartRef.current.mouseY;
      dragOffsetRef.current = { dx, dy };
      setDragOffset({ dx, dy });
    };

    const handleMouseUp = () => {
      const off = dragOffsetRef.current;
      if (dragStartRef.current && onPositionChange) {
        const newX = dragStartRef.current.startX + off.dx;
        const newY = dragStartRef.current.startY + off.dy;
        if (off.dx !== 0 || off.dy !== 0) {
          onPositionChange(id, newX, newY);
        }
      }
      dragStartRef.current = null;
      dragOffsetRef.current = { dx: 0, dy: 0 };
      setIsDragging(false);
      setDragOffset({ dx: 0, dy: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, id, onPositionChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalText(text); // revert
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleBlur();
    }
    // Prevent Delete/Backspace from deleting the annotation while editing
    e.stopPropagation();
  }, [text, handleBlur]);

  const displayText = isEditing ? localText : text;
  const noteWidth = 160;
  const noteHeight = Math.max(48, 28 + (displayText.split('\n').length) * 16);

  // Apply drag offset to rendered position
  const renderX = x + dragOffset.dx;
  const renderY = y + dragOffset.dy;

  return (
    <g
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : (isEditing ? 'text' : 'grab') }}
    >
      {/* Shadow */}
      <rect
        x={renderX + 2}
        y={renderY + 2}
        width={noteWidth}
        height={noteHeight}
        rx="3"
        fill="#00000015"
      />
      {/* Note body */}
      <rect
        x={renderX}
        y={renderY}
        width={noteWidth}
        height={noteHeight}
        rx="3"
        fill="var(--elab-hex-fff9c4)"
        stroke={isSelected ? 'var(--color-accent, var(--elab-lime))' : '#E6DB74'}
        strokeWidth={isSelected ? 1.5 : 0.8}
        style={isSelected ? { filter: 'drop-shadow(0 0 3px var(--color-accent, var(--elab-lime)))' } : undefined}
      />
      {/* Top fold line */}
      <line
        x1={renderX}
        y1={renderY + 16}
        x2={renderX + noteWidth}
        y2={renderY + 16}
        stroke="var(--elab-hex-e6db74)"
        strokeWidth="0.5"
        opacity="0.6"
      />

      {isEditing ? (
        <foreignObject x={renderX + 4} y={renderY + 4} width={noteWidth - 8} height={noteHeight - 8}>
          <textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              resize: 'none',
              fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
              fontSize: '14px',
              lineHeight: '18px',
              color: 'var(--color-text-gray-700, #333)',
              outline: 'none',
              padding: 0,
              margin: 0,
              overflow: 'hidden',
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={renderX + 6}
          y={renderY + 28}
          fontSize="12"
          fontFamily="'Open Sans', sans-serif"
          fill="var(--color-text-gray-700, #333)"
          style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          onDoubleClick={handleDoubleClick}
        >
          {displayText.split('\n').map((line, i) => (
            <tspan key={i} x={renderX + 6} dy={i === 0 ? 0 : 16}>
              {line || '\u00A0'}
            </tspan>
          ))}
        </text>
      )}

      {/* Action buttons (top-right, visible when selected) */}
      {isSelected && (
        <>
          {/* Send to UNLIM button (chat icon) */}
          {onSendToUNLIM && text.trim() && (
            <g
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSendToUNLIM(`Ho scritto questa annotazione sul circuito: "${text}". Puoi aiutarmi a capire meglio?`);
              }}
            >
              <circle cx={renderX + noteWidth - 14} cy={renderY + 1} r="5" fill="var(--color-primary, var(--elab-navy))" stroke="#fff" strokeWidth="0.5" />
              {/* Chat bubble icon */}
              <path
                d={`M${renderX + noteWidth - 17} ${renderY - 1} h6 a1 1 0 0 1 1 1 v3 a1 1 0 0 1 -1 1 h-3 l-2 1.5 v-1.5 h-1 a1 1 0 0 1 -1 -1 v-3 a1 1 0 0 1 1 -1z`}
                fill="#fff"
                transform={`scale(0.6) translate(${(renderX + noteWidth - 14) * 0.667 - 3} ${(renderY + 1) * 0.667 - 3})`}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={renderX + noteWidth - 14}
                y={renderY + 2.5}
                fontSize="5"
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >G</text>
            </g>
          )}
          {/* Delete button */}
          {onDelete && (
            <g
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(id);
              }}
            >
              <circle cx={renderX + noteWidth - 1} cy={renderY + 1} r="5" fill="var(--color-vol3, var(--elab-red))" stroke="#fff" strokeWidth="0.5" />
              <line x1={renderX + noteWidth - 3.5} y1={renderY - 1.5} x2={renderX + noteWidth + 1.5} y2={renderY + 3.5} stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1={renderX + noteWidth + 1.5} y1={renderY - 1.5} x2={renderX + noteWidth - 3.5} y2={renderY + 3.5} stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}
        </>
      )}
    </g>
  );
};

export default Annotation;
