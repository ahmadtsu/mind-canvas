import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { NoteType, Position } from '../types';
import { Icon } from './Icon';
import { COLOR_PALETTE, NOTE_DEFAULT_FONT_SIZE, NOTE_DEFAULT_HEIGHT, NOTE_DEFAULT_WIDTH } from '../constants';

interface NoteProps {
  note: NoteType;
  draggedNote: { id: string, position: Position } | null;
  onUpdatePosition: (id: string, position: Position) => void;
  onUpdateDraggedPosition: (id: string, position: Position) => void;
  onDragEnd: () => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  onStartConnecting: (id: string) => void;
  onFinishConnecting: (id: string) => void;
  onAddConnectedNote: (id: string) => void;
  onPanCamera: (direction: 'up' | 'down' | 'left' | 'right' | null) => void;
  onBringToFront: (id: string) => void;
  isConnecting: boolean;
  scale: number;
  viewOffset: Position;
}

const ColorSwatch: React.FC<{ color: string, onClick: () => void }> = ({ color, onClick }) => (
  <button
    onClick={onClick}
    className={`w-6 h-6 rounded-none border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110 ${color}`}
  />
);

const PAN_EDGE_THRESHOLD = 60; // Pixels from the edge to trigger panning

export const Note: React.FC<NoteProps> = ({
  note,
  draggedNote,
  onUpdatePosition,
  onUpdateDraggedPosition,
  onDragEnd,
  onUpdateContent,
  onUpdateColor,
  onDelete,
  onStartConnecting,
  onFinishConnecting,
  onAddConnectedNote,
  onPanCamera,
  onBringToFront,
  isConnecting,
  scale,
  viewOffset,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [content, setContent] = useState(note.content);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragStartOffsetInWorld = useRef<Position>({ x: 0, y: 0 });

  const viewStateRef = useRef({ scale, viewOffset });
  useEffect(() => {
    viewStateRef.current = { scale, viewOffset };
  }, [scale, viewOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onBringToFront(note.id);
    
    if (e.button !== 0 || isEditing || (e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    
    const { scale: currentScale } = viewStateRef.current;
    const noteRect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - noteRect.left) / currentScale;
    const offsetY = (e.clientY - noteRect.top) / currentScale;
    dragStartOffsetInWorld.current = { x: offsetX, y: offsetY };

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const { scale: latestScale, viewOffset: latestViewOffset } = viewStateRef.current;
      
      const mouseWorldX = (moveEvent.clientX - latestViewOffset.x) / latestScale;
      const mouseWorldY = (moveEvent.clientY - latestViewOffset.y) / latestScale;

      const targetNoteTopLeftWorldX = mouseWorldX - dragStartOffsetInWorld.current.x;
      const targetNoteTopLeftWorldY = mouseWorldY - dragStartOffsetInWorld.current.y;

      onUpdateDraggedPosition(note.id, { x: targetNoteTopLeftWorldX, y: targetNoteTopLeftWorldY });

      let panDirection: 'up' | 'down' | 'left' | 'right' | null = null;
      if (moveEvent.clientX < PAN_EDGE_THRESHOLD) panDirection = 'left';
      else if (moveEvent.clientX > window.innerWidth - PAN_EDGE_THRESHOLD) panDirection = 'right';
      else if (moveEvent.clientY < PAN_EDGE_THRESHOLD) panDirection = 'up';
      else if (moveEvent.clientY > window.innerHeight - PAN_EDGE_THRESHOLD) panDirection = 'down';
      onPanCamera(panDirection);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd();
      onPanCamera(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [note.id, onUpdateDraggedPosition, onDragEnd, isEditing, onPanCamera, onBringToFront]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onBringToFront(note.id);
    
    if (isEditing || (e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    
    const touch = e.touches[0];
    const { scale: currentScale } = viewStateRef.current;
    const noteRect = e.currentTarget.getBoundingClientRect();
    const offsetX = (touch.clientX - noteRect.left) / currentScale;
    const offsetY = (touch.clientY - noteRect.top) / currentScale;
    dragStartOffsetInWorld.current = { x: offsetX, y: offsetY };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      if (moveEvent.touches.length === 0) return;
      
      const currentTouch = moveEvent.touches[0];
      const { scale: latestScale, viewOffset: latestViewOffset } = viewStateRef.current;

      const touchWorldX = (currentTouch.clientX - latestViewOffset.x) / latestScale;
      const touchWorldY = (currentTouch.clientY - latestViewOffset.y) / latestScale;

      const targetNoteTopLeftWorldX = touchWorldX - dragStartOffsetInWorld.current.x;
      const targetNoteTopLeftWorldY = touchWorldY - dragStartOffsetInWorld.current.y;
      
      onUpdateDraggedPosition(note.id, { x: targetNoteTopLeftWorldX, y: targetNoteTopLeftWorldY });

      let panDirection: 'up' | 'down' | 'left' | 'right' | null = null;
      if (currentTouch.clientX < PAN_EDGE_THRESHOLD) panDirection = 'left';
      else if (currentTouch.clientX > window.innerWidth - PAN_EDGE_THRESHOLD) panDirection = 'right';
      else if (currentTouch.clientY < PAN_EDGE_THRESHOLD) panDirection = 'up';
      else if (currentTouch.clientY > window.innerHeight - PAN_EDGE_THRESHOLD) panDirection = 'down';
      onPanCamera(panDirection);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      onDragEnd();
      onPanCamera(null);

      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}, [note.id, onUpdateDraggedPosition, onDragEnd, isEditing, onPanCamera, onBringToFront]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateContent(note.id, content);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);
  
  const handleNoteClick = () => {
    if (isConnecting) {
      onFinishConnecting(note.id);
    }
  };

  const handleColorChange = (color: string) => {
    onUpdateColor(note.id, color);
    setIsColorPickerOpen(false);
  }

  const isNoteDragged = draggedNote?.id === note.id;
  const currentPosition = isNoteDragged ? draggedNote.position : note.position;

  const noteStyle: React.CSSProperties = {
    left: currentPosition.x,
    top: currentPosition.y,
    width: note.width || NOTE_DEFAULT_WIDTH,
    height: note.height || NOTE_DEFAULT_HEIGHT,
    fontSize: `${note.fontSize || NOTE_DEFAULT_FONT_SIZE}px`,
    transitionProperty: 'width, height, font-size, background-color, border-color, box-shadow',
    zIndex: note.zIndex || 1,
  };

  return (
    <div
      ref={noteRef}
      className={`absolute flex flex-col p-4 border-2 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] ${note.color} ${isConnecting ? 'cursor-crosshair hover:border-blue-500 hover:shadow-[4px_4px_0px_#3b82f6]' : 'cursor-grab'} ${!isDragging ? 'transition-all duration-200' : ''} text-black select-none`}
      style={noteStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      onClick={handleNoteClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-black select-text"
          style={{ fontSize: 'inherit' }}
        />
      ) : (
        <div className="w-full h-full break-words font-mono whitespace-pre-wrap" style={{ lineHeight: `${(note.fontSize || NOTE_DEFAULT_FONT_SIZE) * 1.5}px` }}>{note.content}</div>
      )}
      <div className="absolute -top-3 -right-3 flex space-x-1">
        <button onClick={() => onDelete(note.id)} className="p-1 bg-white border-2 border-black rounded-full hover:bg-red-300 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <Icon icon="trash" className="w-4 h-4" />
        </button>
        <button onClick={() => onStartConnecting(note.id)} className="p-1 bg-white border-2 border-black rounded-full hover:bg-blue-200 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <Icon icon="link" className="w-4 h-4" />
        </button>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} className="p-1 bg-white border-2 border-black rounded-full hover:bg-gray-200 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <Icon icon="palette" className="w-4 h-4" />
        </button>
        <button onClick={() => onAddConnectedNote(note.id)} className="p-1 bg-white border-2 border-black rounded-full hover:bg-lime-300 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <Icon icon="plus" className="w-4 h-4" />
        </button>
      </div>
      
       {isColorPickerOpen && (
        <div onMouseDown={(e) => e.stopPropagation()} className="absolute top-8 -right-3 flex flex-col space-y-2 p-2 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10">
          {COLOR_PALETTE.notes.map(color => (
            <ColorSwatch key={color} color={color} onClick={() => handleColorChange(color)} />
          ))}
        </div>
      )}
    </div>
  );
};
