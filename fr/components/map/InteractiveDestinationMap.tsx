'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { MapDestination } from '@/types/destination-api';
import 'leaflet/dist/leaflet.css';

interface InteractiveDestinationMapProps {
  destinations: MapDestination[];
  selectedDestinationId: number | null;
  onSelectDestination: (destination: MapDestination) => void;
}

const SRI_LANKA_CENTER: L.LatLngExpression = [7.8731, 80.7718];
const SRI_LANKA_BOUNDS = L.latLngBounds([5.55, 79.35], [10.15, 82.15]);

function pressureClass(level: MapDestination['tourism_pressure_level']) {
  switch (level) {
    case 'LOW':
      return 'is-low';
    case 'MEDIUM':
      return 'is-medium';
    case 'HIGH':
      return 'is-high';
    default:
      return 'is-unknown';
  }
}

function MapViewport({
  destinations,
}: Pick<InteractiveDestinationMapProps, 'destinations'>) {
  const map = useMap();

  useEffect(() => {
    if (destinations.length === 1) {
      map.flyTo([destinations[0].latitude, destinations[0].longitude], 10, { duration: 0.7 });
      return;
    }

    if (destinations.length > 1) {
      map.fitBounds(
        destinations.map((destination) => [destination.latitude, destination.longitude] as L.LatLngTuple),
        { padding: [44, 44], maxZoom: 9 },
      );
    }
  }, [destinations, map]);

  return null;
}

export function InteractiveDestinationMap({
  destinations,
  selectedDestinationId,
  onSelectDestination,
}: InteractiveDestinationMapProps) {
  const icons = useMemo(
    () =>
      new Map(
        destinations.map((destination) => {
          const selected = destination.id === selectedDestinationId;
          const levelClass = pressureClass(destination.tourism_pressure_level);
          return [
            destination.id,
            L.divIcon({
              className: 'ceylontour-map-marker-shell',
              html: `<span class="ceylontour-map-marker ${levelClass}${selected ? ' is-selected' : ''}">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              </span>`,
              iconSize: [38, 38],
              iconAnchor: [19, 34],
              popupAnchor: [0, -35],
            }),
          ];
        }),
      ),
    [destinations, selectedDestinationId],
  );

  return (
    <MapContainer
      center={SRI_LANKA_CENTER}
      zoom={7}
      minZoom={7}
      maxZoom={17}
      maxBounds={SRI_LANKA_BOUNDS}
      maxBoundsViscosity={0.8}
      scrollWheelZoom
      className="h-full w-full"
      aria-label="Interactive map of Sri Lanka travel destinations"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <MapViewport destinations={destinations} />
      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          position={[destination.latitude, destination.longitude]}
          icon={icons.get(destination.id)}
          eventHandlers={{ click: () => onSelectDestination(destination) }}
          title={destination.name}
          alt={`${destination.name} map marker`}
          zIndexOffset={destination.id === selectedDestinationId ? 1000 : 0}
        >
          <Popup>
            <div className="space-y-1">
              <strong className="block text-sm">{destination.name}</strong>
              <span className="block text-xs">{destination.region} Region</span>
              <span className="block text-xs">
                Crowd level: {destination.tourism_pressure_level?.toLowerCase() ?? 'unavailable'}
              </span>
              <span className="block text-xs">
                Sustainability score: {destination.sustainability_score ?? 'unavailable'}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
