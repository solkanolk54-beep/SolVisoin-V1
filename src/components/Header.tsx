import React from 'react';
import { 
  Layers, 
  Globe2, 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  MapPin, 
  ChevronDown, 
  Languages, 
  Download,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { FarmRegion, Language, MicroserviceStatus } from '../types';

interface HeaderProps {
  currentFarm: FarmRegion;
  allFarms: FarmRegion[];
  onSelectFarm: (farm: FarmRegion) => void;
  lang: Language;
  onToggleLang: () => void;
  services: MicroserviceStatus[];
  onExportGeoJson: () => void;
  onOpenUpload: () => void;
  onOpenPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFarm,
  allFarms,
  onSelectFarm,
  lang,
  onToggleLang,
  services,
  onExportGeoJson,
  onOpenUpload,
  onOpenPrint,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-950/50">
            <Layers className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                SolVision
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-medium">
                v1.3.0 • Geo-Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'النواة الهندسية للتحليل المكاني والزراعي الذكي • بنية خدمات مصغرة'
                : 'Spatial Intelligence Architecture & Core Geo-Processing Engine • Microservices Mesh'}
            </p>
          </div>
        </div>

        {/* Live Microservices telemetry pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A]/90 border border-[#1E293B] font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Stack:</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-emerald-400" title="Python 3.11 / FastAPI / GDAL">FastAPI:8000</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400" title="PostgreSQL 15 + PostGIS 3.3">PostGIS:5432</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400" title="Redis 7 + Celery">Redis:6379</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400" title="Node.js 20 Express Core API">Node:5000</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">UTM 31N (EPSG:32631)</span>
        </div>

        {/* Region Selector, Language & Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* Farm Region Select */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs hover:border-emerald-500/60 transition cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <select
                aria-label="Select Farm Region"
                value={currentFarm.id}
                onChange={(e) => {
                  const found = allFarms.find(f => f.id === e.target.value);
                  if (found) onSelectFarm(found);
                }}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-4 font-medium"
              >
                {allFarms.map((farm) => {
                  // Format requested: e.g. "قطاع الحمضيات (ha 142.5)"
                  const zoneLabel = isAr
                    ? (farm.id === 'mitidja-citrus-pilot' ? 'قطاع الحمضيات' : farm.nameAr)
                    : (farm.id === 'mitidja-citrus-pilot' ? 'Citrus Sector' : farm.nameEn);
                  return (
                    <option key={farm.id} value={farm.id} className="bg-[#0B0F19] text-slate-200">
                      {farm.isMultiPolygon ? '⚡ [Multi] ' : ''}
                      {zoneLabel} ({farm.areaHectares} ha)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Upload GeoJSON button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-[#1E293B] rounded-lg text-xs font-medium transition active:scale-95"
            title={isAr ? 'رفع مضلع مزرعة (GeoJSON)' : 'Upload GeoJSON Boundary'}
          >
            <span className="text-emerald-400 font-bold">＋</span>
            <span>{isAr ? 'رفع مضلع' : 'Upload'}</span>
          </button>

          {/* Print Report button */}
          <button
            onClick={onOpenPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-[#1E293B] rounded-lg text-xs font-medium transition active:scale-95"
            title={isAr ? 'طباعة تقرير الحقل (PDF)' : 'Print Field Report (PDF)'}
          >
            <span className="text-cyan-400">🖨</span>
            <span className="hidden sm:inline">{isAr ? 'تقرير PDF' : 'PDF Report'}</span>
          </button>

          {/* Export GeoJSON button */}
          <button
            onClick={onExportGeoJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-[#1E293B] rounded-lg text-xs font-medium transition active:scale-95"
            title={isAr ? 'تصدير مضلع الحقل والطبقات (GeoJSON)' : 'Export Farm & Layers (GeoJSON)'}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">GeoJSON</span>
          </button>

          {/* Language Toggle (EN / AR) */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-[#1E293B] hover:border-amber-500/50 rounded-lg text-xs font-medium transition active:scale-95"
            title={isAr ? 'Switch to English' : 'تبديل إلى العربية'}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold">{isAr ? 'EN' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
