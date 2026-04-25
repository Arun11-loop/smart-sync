'use client'

import React, { useState, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api'
import { AlertTriangle, UserCheck, Loader2, X } from 'lucide-react'

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
}

const defaultCenter = {
  lat: 22.5937,
  lng: 79.9629
}

export interface Need {
  id: string;
  urgency: string;
  location: string;
  description: string;
}

interface DashboardMapProps {
  needs?: Need[];
  matchResults?: Record<string, any>;
  onMatch?: (needId: string, description: string) => void;
  matchingNeedId?: string | null;
}

function getCoordinatesForNeed(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const baseLat = 22.5937;
  const baseLng = 79.9629;
  
  const latOffset = ((Math.abs(hash) % 100) / 100) * 10 - 5;
  const lngOffset = ((Math.abs(hash >> 2) % 100) / 100) * 10 - 5;

  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset
  };
}

export default function DashboardMap({ needs = [], matchResults = {}, onMatch, matchingNeedId }: DashboardMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);

  const needCoords = useMemo(() => {
    const coords: Record<string, {lat: number, lng: number}> = {};
    needs.forEach(n => {
      coords[n.id] = getCoordinatesForNeed(n.id);
    });
    return coords;
  }, [needs]);

  if (!isLoaded) return <div className="w-full h-full bg-card animate-pulse rounded-xl flex items-center justify-center text-sm text-gray-400" aria-label="Loading map" role="status">Loading Map...</div>

  return (
    <div className="w-full h-full shadow-2xl rounded-xl border border-border overflow-hidden relative" data-testid="dashboard-map">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        options={{
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        }}
        onClick={() => setSelectedNeed(null)}
      >
        {needs.map(need => {
          const coords = needCoords[need.id];
          if (!coords) return null;
          const isHigh = need.urgency === 'High';
          const isSelected = selectedNeed?.id === need.id;
          const matched = matchResults[need.id];
          
          return (
            <OverlayView
              key={need.id}
              position={coords}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {/* The Pin */}
                <div 
                  className={`relative w-6 h-6 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer transition-transform hover:scale-125 flex items-center justify-center ${isHigh ? 'bg-destructive' : 'bg-orange-500'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedNeed(need); }}
                >
                  {isHigh && <div className="absolute w-full h-full rounded-full bg-destructive animate-ping opacity-75" />}
                  {matched && <UserCheck size={12} className="text-white relative z-10" />}
                </div>

                {/* The InfoWindow (Custom HTML) */}
                {isSelected && (
                  <div className="absolute bottom-full mb-3 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-visible cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="p-4 relative bg-card rounded-xl z-10">
                      <button 
                        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedNeed(null); }}
                      >
                        <X size={16} />
                      </button>
                      
                      <div className="flex items-start justify-between mb-3 pr-6">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold flex items-center gap-1 ${isHigh ? 'bg-destructive/20 text-destructive' : 'bg-orange-500/20 text-orange-500'}`}>
                          <AlertTriangle size={10} /> {need.urgency} Priority
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-sm mb-1 text-white leading-tight">{need.description}</h3>
                      <p className="text-xs text-gray-500 mb-4">{need.location}</p>
                      
                      {matched ? (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1 text-primary">
                            <UserCheck size={14} />
                            <span className="font-bold text-xs">Matched: {matched.bestMatchName}</span>
                          </div>
                          <p className="text-[10px] text-gray-300 leading-relaxed">{matched.reasoning}</p>
                        </div>
                      ) : (
                        <button 
                          onClick={() => onMatch && onMatch(need.id, need.description)}
                          disabled={matchingNeedId === need.id}
                          className="w-full bg-primary hover:bg-accent disabled:bg-primary/50 text-primary-foreground py-2 text-xs font-semibold rounded-lg transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                        >
                          {matchingNeedId === need.id ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                          ) : (
                            "Match Volunteer via AI"
                          )}
                        </button>
                      )}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45 z-0"></div>
                  </div>
                )}
              </div>
            </OverlayView>
          );
        })}
      </GoogleMap>
    </div>
  )
}
