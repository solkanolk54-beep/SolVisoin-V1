import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  Layers, 
  Eye, 
  EyeOff, 
  Compass, 
  MapPin, 
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  ChevronDown,
  X
} from 'lucide-react';
import { FarmRegion, Language, CalibratedPixel, BoreholeSample } from '../../types';
import { latLngToUtm31N } from '../../utils/geoCalculations';

interface GisMapProps {
  farm: FarmRegion;
  lang: Language;
  calibratedGrid: CalibratedPixel[];
  selectedPixel: CalibratedPixel | null;
  onSelectPixel: (pixel: CalibratedPixel | null) => void;
  focusLocation?: { lat: number; lng: number; zoom?: number; title?: string } | null;
}

export const GisMap: React.FC<GisMapProps> = ({
  farm,
  lang,
  calibratedGrid,
  selectedPixel,
  onSelectPixel,
  focusLocation,
}) => {
  const isAr = lang === 'ar';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const [baseMapType, setBaseMapType] = useState<'satellite' | 'dark'>('satellite');
  const [showBoundary, setShowBoundary] = useState(true);
  const [showBoreholes, setShowBoreholes] = useState(true);
  const [showRasterGrid, setShowRasterGrid] = useState(true);
  const [rasterMode, setRasterMode] = useState<'rusle' | 'om' | 'clay' | 'ndvi'>('rusle');
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ lat: number; lng: number; easting: number; northing: number } | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [farm.center.lat, farm.center.lng],
        zoom: farm.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);

      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        const utm = latLngToUtm31N(e.latlng.lat, e.latlng.lng);
        setCursorPos({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          easting: utm.easting,
          northing: utm.northing,
        });
      });
    }

    return () => {
      // Don't destroy map immediately on every render, handle updates smoothly
    };
  }, []);

  // Update center & zoom when farm changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([farm.center.lat, farm.center.lng], farm.zoom);
    }
  }, [farm.id]);

  // Animate and fly to focusLocation if requested by Copilot
  useEffect(() => {
    if (mapInstanceRef.current && focusLocation) {
      mapInstanceRef.current.flyTo(
        [focusLocation.lat, focusLocation.lng], 
        focusLocation.zoom || 15, 
        { duration: 1.5 }
      );

      const focusMarker = L.circleMarker([focusLocation.lat, focusLocation.lng], {
        radius: 12,
        color: '#22d3ee',
        weight: 3,
        fillColor: '#06b6d4',
        fillOpacity: 0.6,
      }).addTo(mapInstanceRef.current);

      if (focusLocation.title) {
        focusMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 11px; color: #0f172a; font-weight: bold;">
            📍 ${focusLocation.title}
          </div>
        `).openPopup();
      }
    }
  }, [focusLocation]);

  // Update tile layer & GIS overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    // Clear previous dynamic layers
    group.clearLayers();

    // Remove existing tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add selected Base Tile layer
    if (baseMapType === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
    }

    // 1. Draw Farm Boundary Polygon (or MultiPolygon)
    if (showBoundary) {
      if (farm.isMultiPolygon && farm.multiPolygons && farm.multiPolygons.length > 0) {
        farm.multiPolygons.forEach((polyCoords, pIdx) => {
          const latLngs = polyCoords.map(c => [c.lat, c.lng] as [number, number]);
          const polygon = L.polygon(latLngs, {
            color: '#10b981',
            weight: 2.5,
            fillColor: '#059669',
            fillOpacity: 0.18,
            dashArray: '5, 5',
          });
          polygon.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; color: #f8fafc;">
              <strong style="color: #34d399; font-size: 13px;">${farm.nameEn}</strong><br/>
              <span style="color: #94a3b8;">${farm.nameAr} - Sector #${pIdx + 1}</span><br/>
              <hr style="border: 0; border-top: 1px solid #334155; margin: 6px 0;" />
              <strong>Type:</strong> Complex MultiPolygon<br/>
              <strong>Total Area:</strong> ${farm.areaHectares} ha<br/>
              <strong>CRS:</strong> ${farm.epsgCode} (UTM Zone 31N)
            </div>
          `);
          group.addLayer(polygon);
        });
      } else if (farm.coordinates.length > 2) {
        const latLngs = farm.coordinates.map(c => [c.lat, c.lng] as [number, number]);
        const polygon = L.polygon(latLngs, {
          color: '#10b981', // emerald-500
          weight: 2.5,
          fillColor: '#059669',
          fillOpacity: 0.15,
          dashArray: '4, 4',
        });
        polygon.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #f8fafc;">
            <strong style="color: #34d399; font-size: 13px;">${farm.nameEn}</strong><br/>
            <span style="color: #94a3b8;">${farm.nameAr}</span><br/>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 6px 0;" />
            <strong>Area:</strong> ${farm.areaHectares} ha<br/>
            <strong>CRS:</strong> ${farm.epsgCode} (UTM Zone 31N)
          </div>
        `);
        group.addLayer(polygon);
      }
    }

    // 2. Draw Raster Grid Cells (Heatmap / Erodibility)
    if (showRasterGrid && calibratedGrid.length > 0) {
      calibratedGrid.forEach((pixel) => {
        let cellColor = '#10b981';
        let cellOpacity = 0.45;

        if (rasterMode === 'rusle') {
          // Color based on K-factor erodibility
          if (pixel.rusleK.kMetric < 0.020) cellColor = '#10b981'; // Green
          else if (pixel.rusleK.kMetric < 0.030) cellColor = '#f59e0b'; // Amber
          else if (pixel.rusleK.kMetric < 0.045) cellColor = '#f97316'; // Orange
          else cellColor = '#ef4444'; // Red (Severe)
        } else if (rasterMode === 'om') {
          // Color based on Organic Matter %
          if (pixel.calibrated.organicMatterPercent > 3.0) cellColor = '#065f46';
          else if (pixel.calibrated.organicMatterPercent > 2.0) cellColor = '#059669';
          else if (pixel.calibrated.organicMatterPercent > 1.2) cellColor = '#d97706';
          else cellColor = '#b45309';
        } else if (rasterMode === 'clay') {
          // Color based on Clay %
          if (pixel.calibrated.clayPercent > 35) cellColor = '#854d0e';
          else if (pixel.calibrated.clayPercent > 25) cellColor = '#b45309';
          else cellColor = '#eab308';
        } else if (rasterMode === 'ndvi') {
          // Simulated Sentinel-2 spectral NDVI
          const approxNdvi = Math.min(0.85, Math.max(0.18, (pixel.calibrated.organicMatterPercent / 4.5) * 0.75 + 0.15));
          if (approxNdvi >= 0.65) cellColor = '#10b981';
          else if (approxNdvi >= 0.45) cellColor = '#14b8a6';
          else if (approxNdvi >= 0.30) cellColor = '#f59e0b';
          else cellColor = '#ea580c';
        }

        // Circular or small polygon cell
        const cell = L.circle([pixel.lat, pixel.lng], {
          radius: 45, // ~45 meters cell radius
          color: cellColor,
          weight: 1,
          fillColor: cellColor,
          fillOpacity: cellOpacity,
        });

        cell.on('click', () => {
          onSelectPixel(pixel);
        });

        cell.bindPopup(`
          <div style="font-family: inherit; font-size: 11px; color: #f8fafc; min-width: 170px;">
            <div style="font-weight: 700; color: #34d399; font-family: monospace;">Cell ${pixel.id}</div>
            <div style="color: #94a3b8; font-family: monospace; font-size: 10px;">UTM: ${pixel.utmEasting} E, ${pixel.utmNorthing} N</div>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 4px 0;" />
            <strong>RUSLE K:</strong> ${pixel.rusleK.kMetric.toFixed(4)} [${pixel.rusleK.riskClass}]<br/>
            <strong>Texture:</strong> ${pixel.rusleK.textureClass}<br/>
            <strong>Sand/Silt/Clay:</strong> ${pixel.calibrated.sandPercent}% / ${pixel.calibrated.siltPercent}% / ${pixel.calibrated.clayPercent}%<br/>
            <strong>Organic Matter:</strong> ${pixel.calibrated.organicMatterPercent}%
          </div>
        `);

        group.addLayer(cell);
      });
    }

    // 3. Draw Ground Borehole Lab Sampling Points
    if (showBoreholes && farm.samples.length > 0) {
      farm.samples.forEach((sample) => {
        // Custom borehole icon using SVG
        const customIcon = L.divIcon({
          className: 'custom-borehole-pin',
          html: `
            <div style="
              width: 22px; 
              height: 22px; 
              background: #f59e0b; 
              border: 2px solid #ffffff; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.6);
              color: #0f172a;
              font-size: 10px;
              font-weight: 800;
              font-family: monospace;
            ">
              ⛏
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([sample.lat, sample.lng], { icon: customIcon });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #f8fafc; min-width: 190px;">
            <div style="font-weight: 700; color: #f59e0b; font-family: monospace;">${sample.id}</div>
            <div style="color: #cbd5e1; font-weight: 600; font-size: 11px;">${sample.name}</div>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 5px 0;" />
            <div style="font-size: 11px; line-height: 1.5;">
              <strong>Depth:</strong> ${sample.depthCm} cm<br/>
              <strong>Sand:</strong> ${sample.sandPercent}% | <strong>Silt:</strong> ${sample.siltPercent}%<br/>
              <strong>Clay:</strong> ${sample.clayPercent}% | <strong>OM:</strong> ${sample.organicMatterPercent}%<br/>
              <strong>pH (H2O):</strong> ${sample.phH2o} | <strong>CEC:</strong> ${sample.cec} cmol/kg<br/>
              <span style="color: #64748b; font-size: 10px;">Date: ${sample.dateSampled}</span>
            </div>
          </div>
        `);

        group.addLayer(marker);
      });
    }
  }, [farm, baseMapType, showBoundary, showBoreholes, showRasterGrid, rasterMode, calibratedGrid]);

  return (
    <div className="relative w-full h-[540px] sm:h-[640px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* The Leaflet DOM element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Backdrop to close layers dropdown when clicking on map */}
      {isLayersMenuOpen && (
        <div
          className="absolute inset-0 z-15 bg-black/20"
          onClick={() => setIsLayersMenuOpen(false)}
        />
      )}

      {/* Top Floating Controls Bar (Unified responsive header to prevent any overlapping) */}
      <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Row 1: Base Map Selector (Left) & GIS Layers Dropdown Trigger (Right) */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Base Map Selector */}
          <div className="pointer-events-auto flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-1 text-xs font-medium shadow-xl">
            <button
              onClick={() => setBaseMapType('satellite')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition ${
                baseMapType === 'satellite'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🛰</span>
              <span className="hidden xs:inline">{isAr ? 'قمر صناعي (Satellite)' : 'Satellite'}</span>
              <span className="xs:hidden">{isAr ? 'فضائي' : 'Sat'}</span>
            </button>
            <button
              onClick={() => setBaseMapType('dark')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition ${
                baseMapType === 'dark'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🗺</span>
              <span className="hidden xs:inline">{isAr ? 'خريطة داكنة (Dark Vector)' : 'Dark Vector'}</span>
              <span className="xs:hidden">{isAr ? 'داكنة' : 'Dark'}</span>
            </button>
          </div>

          {/* GIS Layers Dropdown Trigger & Popover */}
          <div className="relative pointer-events-auto">
            <button
              onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium shadow-xl transition-all cursor-pointer ${
                isLayersMenuOpen
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-900/95 backdrop-blur-md text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
              title={isAr ? 'إظهار / إخفاء طبقات الخريطة' : 'Toggle Map Layers'}
            >
              <Layers className={`w-3.5 h-3.5 ${isLayersMenuOpen ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span className="whitespace-nowrap">{isAr ? 'طبقات الخريطة' : 'GIS Layers'}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none ${
                isLayersMenuOpen ? 'bg-slate-900/30 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {(showBoundary ? 1 : 0) + (showRasterGrid ? 1 : 0) + (showBoreholes ? 1 : 0)}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLayersMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Anchored Popover for Layer Visibility */}
            {isLayersMenuOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-3 text-xs shadow-2xl z-30 flex flex-col gap-2 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'التحكم في الطبقات' : 'Layer Visibility'}</span>
                  </div>
                  <button
                    onClick={() => setIsLayersMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setShowBoundary(!showBoundary)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      showBoundary
                        ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-emerald-400 rounded-sm bg-emerald-500/20"></span>
                      <span>{isAr ? 'حدود المزرعة' : 'Farm Boundary'}</span>
                    </span>
                    {showBoundary ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  <button
                    onClick={() => setShowRasterGrid(!showRasterGrid)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      showRasterGrid
                        ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-amber-400 rounded-full shadow-sm shadow-amber-500/50"></span>
                      <span>{isAr ? 'شبكة الرستر المعاير' : 'Calibrated Raster'}</span>
                    </span>
                    {showRasterGrid ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  <button
                    onClick={() => setShowBoreholes(!showBoreholes)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      showBoreholes
                        ? 'text-yellow-300 bg-yellow-500/15 border border-yellow-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs">⛏</span>
                      <span>{isAr ? 'عينات الحفر (Boreholes)' : 'Lab Boreholes'}</span>
                    </span>
                    {showBoreholes ? <Eye className="w-3.5 h-3.5 text-yellow-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Raster Mode Selector (Horizontally scrollable, never collides with layer controls) */}
        {showRasterGrid && (
          <div className="pointer-events-auto flex items-center overflow-x-auto max-w-full pb-1 scrollbar-none">
            <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-1 text-[11px] font-mono shadow-xl shrink-0">
              <button
                onClick={() => setRasterMode('rusle')}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  rasterMode === 'rusle'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                RUSLE K-Risk
              </button>
              <button
                onClick={() => setRasterMode('om')}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  rasterMode === 'om'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                OM%
              </button>
              <button
                onClick={() => setRasterMode('clay')}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  rasterMode === 'clay'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Clay%
              </button>
              <button
                onClick={() => setRasterMode('ndvi')}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  rasterMode === 'ndvi'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sentinel NDVI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Telemetry Bar: Live UTM 31N & Geodetic Coordinates */}
      <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-10 flex flex-col md:flex-row items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-mono shadow-2xl mb-14 sm:mb-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-300 w-full md:w-auto text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-emerald-400" />
            <span>CRS: {farm.epsgCode}</span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <div className="text-slate-400 text-[10px] sm:text-[11px] truncate max-w-full">
            {cursorPos ? (
              <span>
                {cursorPos.lat.toFixed(5)}° N, {cursorPos.lng.toFixed(5)}° E
              </span>
            ) : (
              <span>Center: {farm.center.lat.toFixed(5)}° N, {farm.center.lng.toFixed(5)}° E</span>
            )}
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <div className="text-emerald-300 font-semibold text-[10px] sm:text-[11px] truncate max-w-full">
            {cursorPos ? (
              <span>
                UTM E: {cursorPos.easting.toLocaleString()} m | N: {cursorPos.northing.toLocaleString()} m
              </span>
            ) : (
              <span>Zone 31N Metres</span>
            )}
          </div>
        </div>

        {/* Legend */}
        {showRasterGrid && rasterMode === 'rusle' && (
          <div className="flex items-center gap-2 text-[10px] shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800 w-full md:w-auto justify-between md:justify-start">
            <span className="text-slate-400">{isAr ? 'مقياس K:' : 'K-Scale:'}</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Low"></span>
              <span className="text-slate-300">&lt;0.02</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Moderate"></span>
              <span className="text-slate-300">0.03</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" title="High"></span>
              <span className="text-slate-300">0.04</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Severe"></span>
              <span className="text-slate-300">&gt;0.05</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
