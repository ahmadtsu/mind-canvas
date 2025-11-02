export interface Position {
  x: number;
  y: number;
}

export interface NoteType {
  id: string;
  position: Position;
  content: string;
  color: string;
  width?: number;
  height?: number;
  fontSize?: number;
  zIndex?: number;
}

export interface ConnectionType {
  id: string;
  startNoteId: string;
  endNoteId: string;
}

export interface CustomizationOptions {
  boardColor: string;
  noteColor: string;
  connectionColor: string;
}

export interface Zone {
  id:string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
  borderClasses: string;
}