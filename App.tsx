import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from './components/Note';
import { Connections } from './components/Connections';
import { CustomizationPanel } from './components/CustomizationPanel';
import { AddNoteButton } from './components/AddNoteButton';
import { ZoneNavigator } from './components/ZoneNavigator';
import type { NoteType, ConnectionType, Position, CustomizationOptions, Zone } from './types';
import { DEFAULT_CUSTOMIZATION, ZONES, WORLD_WIDTH, WORLD_HEIGHT, NOTE_DEFAULT_WIDTH, NOTE_DEFAULT_HEIGHT, NOTE_DEFAULT_FONT_SIZE, NOTE_MIN_WIDTH, NOTE_MIN_HEIGHT, NOTE_MIN_FONT_SIZE, CORKBOARD_TEXTURE_SVG } from './constants';
import { Icon } from './components/Icon';

const MIN_SCALE = 0.2;
const MAX_SCALE = 2;
const PAN_SPEED = 10;

const getZoneFromPosition = (position: Position): Zone | null => {
    for (const zone of Object.values(ZONES)) {
        const noteCenterX = position.x + (NOTE_DEFAULT_WIDTH / 2);
        const noteCenterY = position.y + (NOTE_DEFAULT_HEIGHT / 2);
        if (
            noteCenterX >= zone.bounds.x &&
            noteCenterX < zone.bounds.x + zone.bounds.width &&
            noteCenterY >= zone.bounds.y &&
            noteCenterY < zone.bounds.y + zone.bounds.height
        ) {
            return zone;
        }
    }
    return null;
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [connections, setConnections] = useState<ConnectionType[]>([]);
  const [customization, setCustomization] = useState<CustomizationOptions>(DEFAULT_CUSTOMIZATION);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [connectingNoteId, setConnectingNoteId] = useState<string | null>(null);
  const [tempLineEnd, setTempLineEnd] = useState<Position | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [draggedNote, setDraggedNote] = useState<{ id: string, position: Position } | null>(null);

  const [scale, setScale] = useState(0.8);
  const [viewOffset, setViewOffset] = useState<Position>({ x: 0, y: 0 });
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const isPanning = useRef(false);
  const panStart = useRef<Position>({ x: 0, y: 0 });

  const panDirection = useRef<'up' | 'down' | 'left' | 'right' | null>(null);
  const panIntervalRef = useRef<number | null>(null);
  const zIndexCounter = useRef(1);

  const isPinching = useRef(false);
  const pinchStartDist = useRef(0);
  const lastScale = useRef(scale);

  const focusOnZone = useCallback((zoneId: string) => {
    const zone = ZONES[zoneId];
    if (!zone) return;

    const padding = 0.9; // 90% of viewport, makes focus more immersive
    const scaleX = (window.innerWidth * padding) / zone.bounds.width;
    const scaleY = (window.innerHeight * padding) / zone.bounds.height;
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE);

    const newViewOffsetX = (window.innerWidth / 2) - (zone.bounds.x + zone.bounds.width / 2) * newScale;
    const newViewOffsetY = (window.innerHeight / 2) - (zone.bounds.y + zone.bounds.height / 2) * newScale;

    setScale(newScale);
    setViewOffset(clampViewOffset({ x: newViewOffsetX, y: newViewOffsetY }, newScale));
    setActiveZoneId(zoneId);
  }, []);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('corkboard-notes');
      const savedConnections = localStorage.getItem('corkboard-connections');
      const savedCustomization = localStorage.getItem('corkboard-customization');
      if (savedNotes) {
        const parsedNotes: NoteType[] = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        const maxZ = Math.max(0, ...parsedNotes.map(n => n.zIndex || 0));
        zIndexCounter.current = maxZ + 1;
      }
      if (savedConnections) setConnections(JSON.parse(savedConnections));
      if (savedCustomization) setCustomization(JSON.parse(savedCustomization));
    } catch (error) {
      console.error("Failed to load from local storage", error);
    }
    
    // Start view centered on Brain Dump zone
    focusOnZone(ZONES.BRAIN_DUMP.id);
  }, [focusOnZone]);

  // Save all data to local storage with debouncing to improve performance
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem('corkboard-notes', JSON.stringify(notes));
        localStorage.setItem('corkboard-connections', JSON.stringify(connections));
        localStorage.setItem('corkboard-customization', JSON.stringify(customization));
      } catch (error) {
        console.error("Failed to save to local storage", error);
      }
    }, 500); // waits 500ms after the last change before saving

    return () => {
      clearTimeout(handler);
    };
  }, [notes, connections, customization]);


  // Dynamic Note Resizing Effect
  useEffect(() => {
    const notesByZone: Record<string, NoteType[]> = {};
    Object.values(ZONES).forEach(zone => {
      notesByZone[zone.id] = [];
    });

    notes.forEach(note => {
      const zone = getZoneFromPosition(note.position);
      if (zone) {
        notesByZone[zone.id].push(note);
      }
    });

    let hasChanges = false;
    const newNotes = [...notes];

    Object.values(ZONES).forEach(zone => {
      const zoneNotes = notesByZone[zone.id];
      const count = zoneNotes.length;
      if (count === 0) return;

      const scaleFactor = Math.max(0, 1 - Math.log1p(count * 0.1) * 0.2);
      const targetWidth = Math.max(NOTE_MIN_WIDTH, NOTE_DEFAULT_WIDTH * scaleFactor);
      const targetHeight = Math.max(NOTE_MIN_HEIGHT, NOTE_DEFAULT_HEIGHT * scaleFactor);
      const targetFontSize = Math.max(NOTE_MIN_FONT_SIZE, NOTE_DEFAULT_FONT_SIZE * scaleFactor);

      zoneNotes.forEach(note => {
        const noteIndex = newNotes.findIndex(n => n.id === note.id);
        if (noteIndex !== -1) {
            const currentNote = newNotes[noteIndex];
            if (currentNote.width !== targetWidth || currentNote.height !== targetHeight || currentNote.fontSize !== targetFontSize) {
                newNotes[noteIndex] = { ...currentNote, width: targetWidth, height: targetHeight, fontSize: targetFontSize };
                hasChanges = true;
            }
        }
      });
    });

    if (hasChanges) {
      setNotes(newNotes);
    }
  }, [notes.length, JSON.stringify(notes.map(n => n.position))]); // Rerun when notes are added/removed or moved
  
  const clampViewOffset = (offset: Position, currentScale: number): Position => {
    const minX = -(WORLD_WIDTH * currentScale - window.innerWidth * 0.8);
    const minY = -(WORLD_HEIGHT * currentScale - window.innerHeight * 0.8);
    const maxX = window.innerWidth * 0.2;
    const maxY = window.innerHeight * 0.2;
    return {
      x: Math.min(maxX, Math.max(minX, offset.x)),
      y: Math.min(maxY, Math.max(minY, offset.y)),
    };
  };

  const addNote = useCallback(() => {
    // Always add notes to the "Brain Dump" zone.
    const zoneToAddTo = ZONES.BRAIN_DUMP;
    const newNote: NoteType = {
      id: crypto.randomUUID(),
      position: {
        x: zoneToAddTo.bounds.x + (Math.random() * (zoneToAddTo.bounds.width - NOTE_DEFAULT_WIDTH)),
        y: zoneToAddTo.bounds.y + (Math.random() * (zoneToAddTo.bounds.height - NOTE_DEFAULT_HEIGHT)),
      },
      content: 'New idea...',
      color: customization.noteColor,
      zIndex: zIndexCounter.current++,
    };
    setNotes((prev) => [...prev, newNote]);

    // Automatically focus the camera on the Brain Dump zone so the user sees the new note.
    focusOnZone(ZONES.BRAIN_DUMP.id);
  }, [customization.noteColor, focusOnZone]);

  const updateNotePosition = useCallback((id: string, position: Position) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, position } : note))
    );
  }, []);

  const updateDraggedNotePosition = useCallback((id: string, position: Position) => {
    setDraggedNote({ id, position });
  }, []);

  const handleNoteDragEnd = useCallback(() => {
    if (draggedNote) {
      updateNotePosition(draggedNote.id, draggedNote.position);
    }
    setDraggedNote(null);
  }, [draggedNote, updateNotePosition]);

  const updateNoteContent = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content } : note))
    );
  }, []);

  const updateNoteColor = useCallback((id: string, color: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, color } : note))
    );
  }, []);
  
  const handleDefaultNoteColorChange = useCallback((color: string) => {
    setCustomization(prev => ({ ...prev, noteColor: color }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    setConnections((prev) =>
      prev.filter((conn) => conn.startNoteId !== id && conn.endNoteId !== id)
    );
  }, []);

  const addConnectedNote = useCallback((parentId: string) => {
    const parentNote = notes.find(n => n.id === parentId);
    if (!parentNote) return;

    const newNote: NoteType = {
      id: crypto.randomUUID(),
      position: { 
        x: parentNote.position.x + (parentNote.width || NOTE_DEFAULT_WIDTH) + 40, 
        y: parentNote.position.y 
      },
      content: 'New idea...',
      color: customization.noteColor,
      zIndex: zIndexCounter.current++,
    };

    const newConnection: ConnectionType = {
      id: crypto.randomUUID(),
      startNoteId: parentId,
      endNoteId: newNote.id,
    };

    setNotes((prev) => [...prev, newNote]);
    setConnections((prev) => [...prev, newConnection]);
  }, [notes, customization.noteColor]);

  const bringToFront = useCallback((id: string) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === id ? { ...n, zIndex: zIndexCounter.current++ } : n
      )
    );
  }, []);

  const startConnecting = useCallback((id: string) => setConnectingNoteId(id), []);

  const finishConnecting = useCallback((endNoteId: string) => {
    if (connectingNoteId && connectingNoteId !== endNoteId) {
      setConnections((prev) => [...prev, { id: crypto.randomUUID(), startNoteId: connectingNoteId, endNoteId }]);
    }
    setConnectingNoteId(null);
    setTempLineEnd(null);
  }, [connectingNoteId]);

  const cancelConnecting = useCallback((e: React.MouseEvent | KeyboardEvent) => {
     if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
     setConnectingNoteId(null);
     setTempLineEnd(null);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => cancelConnecting(e);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelConnecting]);

  const getNoteCenter = (note: NoteType): Position => ({
    x: note.position.x + (note.width || NOTE_DEFAULT_WIDTH) / 2,
    y: note.position.y + (note.height || NOTE_DEFAULT_HEIGHT) / 2,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setActiveZoneId(null);

    if (e.touches.length === 2) {
        isPanning.current = false;
        isPinching.current = true;
        pinchStartDist.current = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        lastScale.current = scale;
    } else if (e.touches.length === 1) {
        isPinching.current = false;
        isPanning.current = true;
        panStart.current = { x: e.touches[0].clientX - viewOffset.x, y: e.touches[0].clientY - viewOffset.y };
        if(boardRef.current) boardRef.current.style.cursor = 'grabbing';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault();

      if (isPinching.current && e.touches.length === 2) {
          const newDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          const scaleFactor = newDist / pinchStartDist.current;
          const newScale = lastScale.current * scaleFactor;
          const clampedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

          const midPoint = {
              x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
              y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          };

          const newViewOffsetX = midPoint.x - (midPoint.x - viewOffset.x) * (clampedScale / scale);
          const newViewOffsetY = midPoint.y - (midPoint.y - viewOffset.y) * (clampedScale / scale);

          setScale(clampedScale);
          setViewOffset(clampViewOffset({ x: newViewOffsetX, y: newViewOffsetY }, clampedScale));
      } else if (isPanning.current && e.touches.length === 1) {
          const x = e.touches[0].clientX - panStart.current.x;
          const y = e.touches[0].clientY - panStart.current.y;
          setViewOffset(clampViewOffset({ x, y }, scale));
      }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
          isPinching.current = false;
      }
      if (e.touches.length < 1) {
          isPanning.current = false;
          if (boardRef.current) boardRef.current.style.cursor = 'default';
      } else if (e.touches.length === 1) {
          // If we were pinching and one finger is lifted, transition to panning
          isPanning.current = true;
          panStart.current = { x: e.touches[0].clientX - viewOffset.x, y: e.touches[0].clientY - viewOffset.y };
      }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setActiveZoneId(null); // Manual interaction resets focused zone
    const zoomFactor = 1.1;
    const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    const clampedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const newViewOffsetX = mouseX - (mouseX - viewOffset.x) * (clampedScale / scale);
    const newViewOffsetY = mouseY - (mouseY - viewOffset.y) * (clampedScale / scale);
    
    setScale(clampedScale);
    setViewOffset(clampViewOffset({ x: newViewOffsetX, y: newViewOffsetY }, clampedScale));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { 
      setActiveZoneId(null); // Manual interaction resets focused zone
      isPanning.current = true;
      panStart.current = { x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y };
      boardRef.current!.style.cursor = 'grabbing';
      e.preventDefault();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const x = e.clientX - panStart.current.x;
      const y = e.clientY - panStart.current.y;
      setViewOffset(clampViewOffset({ x, y }, scale));
    }
    
    if (connectingNoteId && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - viewOffset.x) / scale;
      const worldY = (e.clientY - rect.top - viewOffset.y) / scale;
      setTempLineEnd({ x: worldX, y: worldY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning.current) {
      isPanning.current = false;
      boardRef.current!.style.cursor = 'default';
    }
  };

  const handlePanCamera = useCallback((direction: 'up' | 'down' | 'left' | 'right' | null) => {
    if (direction) setActiveZoneId(null); // Manual interaction resets focused zone
    panDirection.current = direction;
    if (direction && !panIntervalRef.current) {
        panIntervalRef.current = window.setInterval(() => {
            setViewOffset(prev => {
                let newOffset = { ...prev };
                if (panDirection.current === 'up') newOffset.y += PAN_SPEED;
                if (panDirection.current === 'down') newOffset.y -= PAN_SPEED;
                if (panDirection.current === 'left') newOffset.x += PAN_SPEED;
                if (panDirection.current === 'right') newOffset.x -= PAN_SPEED;
                return clampViewOffset(newOffset, scale);
            });
        }, 16);
    } else if (!direction && panIntervalRef.current) {
        clearInterval(panIntervalRef.current);
        panIntervalRef.current = null;
    }
  }, [scale]);

  const isCorkboard = customization.boardColor === 'corkboard';
  const boardClasses = isCorkboard ? '' : customization.boardColor;
  const boardStyle: React.CSSProperties = isCorkboard ? { backgroundImage: CORKBOARD_TEXTURE_SVG } : {};

  const clearBoard = useCallback(() => {
    setNotes([]);
    setConnections([]);
    setCustomization(DEFAULT_CUSTOMIZATION);
  }, []);


  return (
    <main
      ref={boardRef}
      className={`w-screen h-screen overflow-hidden relative font-sans transition-colors duration-300 ${boardClasses}`}
      style={boardStyle}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => { if (e.target === boardRef.current) cancelConnecting(e); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Connections 
        notes={notes} 
        connections={connections} 
        connectionColor={customization.connectionColor}
        connectingInfo={connectingNoteId ? { startPos: getNoteCenter(notes.find(n => n.id === connectingNoteId)!), currentPos: tempLineEnd } : null}
        scale={scale}
        viewOffset={viewOffset}
      />
      
      <div 
        className="absolute top-0 left-0"
        style={{ 
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: WORLD_WIDTH,
          height: WORLD_HEIGHT,
        }}
      >
        {Object.values(ZONES).map(zone => {
            const zoneBorderClass = isCorkboard ? 'border-gray-600' : 'border-gray-400';
            const zoneLabelClass = isCorkboard ? 'text-gray-700' : 'text-gray-400';

            return (
                <div key={zone.id}
                     className="absolute pointer-events-none"
                     style={{
                         left: zone.bounds.x,
                         top: zone.bounds.y,
                         width: zone.bounds.width,
                         height: zone.bounds.height
                     }}>
                    <div className={`w-full h-full border-2 ${zoneBorderClass} border-dashed rounded-xl`} />
                    <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-2xl font-bold font-mono ${zoneLabelClass} select-none whitespace-nowrap`}>{zone.name}</div>
                </div>
            );
        })}

        {notes.map((note) => (
          <Note
            key={note.id}
            note={note}
            draggedNote={draggedNote}
            onUpdateDraggedPosition={updateDraggedNotePosition}
            onDragEnd={handleNoteDragEnd}
            onUpdatePosition={updateNotePosition}
            onUpdateContent={updateNoteContent}
            onUpdateColor={updateNoteColor}
            onDelete={deleteNote}
            onStartConnecting={startConnecting}
            onFinishConnecting={finishConnecting}
            onAddConnectedNote={addConnectedNote}
            onPanCamera={handlePanCamera}
            isConnecting={!!connectingNoteId}
            scale={scale}
            viewOffset={viewOffset}
            onBringToFront={bringToFront}
          />
        ))}
      </div>
      
      <div
        className="fixed top-5 left-5 z-10"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <AddNoteButton 
          onAddNote={addNote}
          currentColor={customization.noteColor}
          onColorChange={handleDefaultNoteColorChange}
        />
      </div>

      <div
        className="fixed bottom-5 right-5 z-30"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <ZoneNavigator
          activeZoneId={activeZoneId}
          onNavigate={focusOnZone}
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
          panelButtonColor={customization.noteColor}
        />
      </div>


      <CustomizationPanel
        options={customization}
        setOptions={setCustomization}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onClearBoard={clearBoard}
        panelColor={customization.noteColor}
      />
      {connectingNoteId && (
        <div
          className="fixed top-5 right-5 z-10 bg-blue-200 border-2 border-black p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-mono animate-pulse"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
            Connecting... Click a note to link, or ESC to cancel.
        </div>
      )}
    </main>
  );
};

export default App;