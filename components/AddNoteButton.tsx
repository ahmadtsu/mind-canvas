import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { COLOR_PALETTE } from '../constants';

interface AddNoteButtonProps {
  onAddNote: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

const ColorSwatch: React.FC<{ color: string, onClick: () => void }> = ({ color, onClick }) => (
  <button
    onClick={onClick}
    className={`w-6 h-6 rounded-none border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110 ${color}`}
  />
);

export const AddNoteButton: React.FC<AddNoteButtonProps> = ({ onAddNote, currentColor, onColorChange }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsPickerOpen(false);
  };
  
  const noteColorClass = currentColor || 'bg-lime-300';

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <button
          onClick={onAddNote}
          className={`flex items-center space-x-2 p-3 font-bold border-2 border-black rounded-none transition-colors text-black hover:brightness-110 ${noteColorClass}`}
          aria-label="Add a new note"
        >
          <Icon icon="plus" className="w-6 h-6" />
          <span>Add Note</span>
        </button>
        <button
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className={`p-3 font-bold border-y-2 border-r-2 border-black rounded-none transition-colors text-black hover:brightness-110 ${noteColorClass}`}
        >
          <Icon icon="palette" className="w-6 h-6" />
        </button>
      </div>

      {isPickerOpen && (
        <div className="absolute top-full mt-2 p-2 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex space-x-2">
          {COLOR_PALETTE.notes.map(color => (
            <ColorSwatch key={color} color={color} onClick={() => handleColorSelect(color)} />
          ))}
        </div>
      )}
    </div>
  );
};
