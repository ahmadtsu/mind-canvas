import React from 'react';
import { COLOR_PALETTE, CORKBOARD_TEXTURE_SVG } from '../constants';
import type { CustomizationOptions } from '../types';
import { Icon } from './Icon';

interface CustomizationPanelProps {
  options: CustomizationOptions;
  setOptions: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
  isOpen: boolean;
  onClose: () => void;
  panelColor: string;
}

const ColorSwatch: React.FC<{
  colorClass: string;
  style?: React.CSSProperties;
  onClick: () => void;
  isSelected: boolean;
}> = ({ colorClass, style, onClick, isSelected }) => (
  <button
    style={style}
    onClick={onClick}
    className={`w-8 h-8 rounded-none border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110 ${colorClass} ${isSelected ? 'ring-2 ring-offset-2 ring-black' : ''}`}
  />
);


export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ options, setOptions, isOpen, onClose, panelColor }) => {
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire board? This action cannot be undone.")) {
      // Directly remove all saved data from local storage.
      localStorage.removeItem('corkboard-notes');
      localStorage.removeItem('corkboard-connections');
      localStorage.removeItem('corkboard-customization');
      // Force a page reload to ensure the application starts fresh.
      window.location.reload();
    }
  };

  return (
    <aside
      className={`fixed top-0 right-0 h-full border-l-2 border-black p-6 z-20 transform transition-transform duration-300 ease-in-out text-black ${panelColor} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ width: 300 }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-mono">Customize</h2>
            <button onClick={onClose} className="p-1 bg-white border-2 border-black rounded-full hover:bg-red-300 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Icon icon="x" className="w-5 h-5" />
            </button>
        </div>

        <div className="space-y-6">
            <div>
                <h3 className="font-bold mb-2 font-mono">Board Color</h3>
                <div className="flex space-x-2">
                    {COLOR_PALETTE.board.map(colorValue => {
                      const isCork = colorValue === 'corkboard';
                      return (
                        <ColorSwatch
                          key={colorValue}
                          colorClass={isCork ? 'bg-transparent' : colorValue}
                          style={isCork ? { backgroundImage: CORKBOARD_TEXTURE_SVG } : {}}
                          isSelected={options.boardColor === colorValue}
                          onClick={() => setOptions(prev => ({...prev, boardColor: colorValue}))}
                        />
                      );
                    })}
                </div>
            </div>
             <div>
                <h3 className="font-bold mb-2 font-mono">Default Note Color</h3>
                <div className="flex space-x-2">
                     {COLOR_PALETTE.notes.map(color => (
                        <ColorSwatch
                          key={color}
                          colorClass={color}
                          isSelected={options.noteColor === color}
                          onClick={() => setOptions(prev => ({...prev, noteColor: color}))}
                        />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-bold mb-2 font-mono">Connection Color</h3>
                <div className="flex space-x-2">
                     {COLOR_PALETTE.connections.map(color => (
                        <ColorSwatch
                          key={color}
                          colorClass={color.replace('stroke-', 'bg-')}
                          isSelected={options.connectionColor === color}
                          onClick={() => setOptions(prev => ({...prev, connectionColor: color}))}
                        />
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-12">
            <button onClick={handleClear} className="w-full text-left p-3 font-bold bg-red-400 border-2 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-500 transition-colors">
                Clear Board
            </button>
        </div>
    </aside>
  );
};