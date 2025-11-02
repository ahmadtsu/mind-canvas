import React from 'react';
import { ZONES } from '../constants';
import type { Zone } from '../types';
import { Icon } from './Icon';

interface ZoneNavigatorProps {
  activeZoneId: string | null;
  onNavigate: (zoneId: string) => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  panelButtonColor: string;
}

export const ZoneNavigator: React.FC<ZoneNavigatorProps> = ({
  activeZoneId,
  onNavigate,
  isPanelOpen,
  onTogglePanel,
  panelButtonColor,
}) => {
  return (
    <div className="flex shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
      {/* Zone selection part */}
      <div className={`flex items-center space-x-4 p-2 border-y-2 border-l-2 border-black transition-colors ${panelButtonColor}`}>
        {Object.values(ZONES).map((zone: Zone) => (
          <button
            key={zone.id}
            onClick={() => onNavigate(zone.id)}
            className={`px-3 py-1 font-mono font-bold transition-colors border-2 border-transparent hover:border-black text-black`}
            aria-label={`Navigate to ${zone.name} zone`}
          >
            {activeZoneId === zone.id ? (
              <span>{zone.name}</span>
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-black bg-stone-100" />
            )}
          </button>
        ))}
      </div>
      {/* Customization panel toggle button, now with dividing line */}
      <button
        onClick={onTogglePanel}
        className={`flex items-center justify-center p-4 border-y-2 border-r-2 border-l-2 border-black hover:brightness-110 transition-colors text-black ${panelButtonColor}`}
        aria-label="Toggle customization panel"
      >
        <Icon icon={isPanelOpen ? 'x' : 'palette'} className="w-6 h-6" />
      </button>
    </div>
  );
};
