import React from 'react';
import type { NoteType, ConnectionType, Position } from '../types';
// FIX: Import NOTE_DEFAULT_WIDTH and NOTE_DEFAULT_HEIGHT as NOTE_WIDTH and NOTE_HEIGHT are not exported.
import { NOTE_DEFAULT_WIDTH, NOTE_DEFAULT_HEIGHT } from '../constants';

interface ConnectionsProps {
  notes: NoteType[];
  connections: ConnectionType[];
  connectionColor: string;
  connectingInfo: {
    startPos: Position | null;
    currentPos: Position | null;
  } | null;
  scale: number;
  viewOffset: Position;
}

// FIX: Use the note's specific width and height if available, otherwise fall back to defaults. This ensures connections point to the center of dynamically resized notes.
const getNoteCenter = (note: NoteType): Position => {
  return {
    x: note.position.x + (note.width || NOTE_DEFAULT_WIDTH) / 2,
    y: note.position.y + (note.height || NOTE_DEFAULT_HEIGHT) / 2,
  };
};

export const Connections: React.FC<ConnectionsProps> = ({
  notes,
  connections,
  connectionColor,
  connectingInfo,
  scale,
  viewOffset,
}) => {
  const notesById = React.useMemo(() => {
    return notes.reduce((acc, note) => {
      acc[note.id] = note;
      return acc;
    }, {} as Record<string, NoteType>);
  }, [notes]);

  const toScreenSpace = (worldPos: Position): Position => {
    return {
      x: worldPos.x * scale + viewOffset.x,
      y: worldPos.y * scale + viewOffset.y,
    };
  };

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {connections.map((connection) => {
        const startNote = notesById[connection.startNoteId];
        const endNote = notesById[connection.endNoteId];
        if (!startNote || !endNote) return null;

        const start = toScreenSpace(getNoteCenter(startNote));
        const end = toScreenSpace(getNoteCenter(endNote));

        return (
          <line
            key={connection.id}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            className={`${connectionColor}`}
            strokeWidth="3"
          />
        );
      })}
      {connectingInfo?.startPos && connectingInfo.currentPos && (
        (() => {
          const start = toScreenSpace(connectingInfo.startPos!);
          const end = toScreenSpace(connectingInfo.currentPos!);
          return (
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              className={`${connectionColor} opacity-70`}
              strokeWidth="3"
              strokeDasharray="5,5"
            />
          );
        })()
      )}
    </svg>
  );
};
