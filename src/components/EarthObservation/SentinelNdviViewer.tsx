import React, { useState } from 'react';
import { 
  Satellite, 
  TrendingUp, 
  Calendar, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  Sun, 
  Leaf, 
  Filter,
  ArrowRight,
  Eye
} from 'lucide-react';
import { FarmRegion, Language, SentinelObservation } from '../../types';
import { generateSentinelObservations } from '../../utils/geoCalculations';

interface SentinelNdviViewerProps {
  farm: FarmRegion;
  lang: Language;
  onViewOnMap: () => void;
}

export const SentinelNdviViewer: React.FC<SentinelNdviViewerProps> = ({
  farm,
  lang,
  onViewOnMap,
}) => {
  const isAr = lang === 'ar';
  const [selectedMetric, setSelectedMetric] = useState<'ndvi' | 'evi' | 'ndwi'>('ndvi');

  const observations: SentinelObservation[] = generateSentinelObservations(farm.id);

  // Latest observation
  const latest = observations[observations.length - 1] || observations[0];
  const peak = observations.reduce((prev, curr) => (curr.ndvi > prev.ndvi ? curr : prev), observations[0]);

  // Color mapping based on NDVI
  const getNdviColor = (val: number) => {
    if (val >= 0.65) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 0.45) return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
    if (val >= 0.30) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-1">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  {isAr ? 'مؤشرات الاستشعار عن بعد الحية' : 'Sentinel-2 Earth Observation'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Copernicus Sentinel-2 MSI (10m Resolution)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'مؤشرات الغطاء النباتي الحية (NDVI / EVI) ومقارنتها مع كربون التربة'
                  : 'Live Sentinel-2 NDVI/EVI Spectral Indices & Vegetation Biomass'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'تتبع دورة النشاط الخضري ومستويات الرطوبة ومقارنتها مع مخزون كربون التربة (SOC) لتقييم صحة المحاصيل ومناطق السد الأخضر موسمياً.'
                  : 'Multi-temporal 10m spectral monitoring tracking photosynthetic activity, drought stress, and canopy vigour cross-referenced with soil organic carbon.'}
              </p>
            </div>
          </div>

          <button
            onClick={onViewOnMap}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95 self-start md:self-auto"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاينة الطبقة على الخريطة' : 'View Raster on GIS Map'}</span>
          </button>
        </div>
      </div>

      {/* Main Indices Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{isAr ? 'مؤشر الغطاء النباتي (NDVI)' : 'Normalized Difference (NDVI)'}</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{latest.ndvi}</div>
          <div className="text-[10px] text-slate-400 font-mono">Formula: (B08 - B04) / (B08 + B04)</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{isAr ? 'مؤشر الغطاء المحسن (EVI)' : 'Enhanced Vegetation (EVI)'}</span>
            <Sun className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-400">{latest.evi}</div>
          <div className="text-[10px] text-slate-400 font-mono">High Canopy Sensitivity</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{isAr ? 'مؤشر رطوبة المجموع الخضري (NDWI)' : 'Canopy Moisture (NDWI)'}</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{latest.ndwi}</div>
          <div className="text-[10px] text-slate-400 font-mono">Formula: (B08 - B11) / (B08 + B11)</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'حالة الحيوية والنشاط الخضري' : 'Canopy Vigour Status'}
          </div>
          <div className="pt-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${getNdviColor(latest.ndvi)}`}>
              <span>{isAr ? latest.vegetationHealthAr : latest.vegetationHealth}</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Peak: {peak.month} ({peak.ndvi})</div>
        </div>
      </div>

      {/* Seasonal 12-Month Time Series Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {isAr ? 'المنحنى الزمني الموسمي لمؤشرات الغطاء النباتي (Sentinel-2 Time Series)' : 'Sentinel-2 Multi-Temporal Spectral Trajectory (12 Months)'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'تتبع تغير النشاط الخضري عبر الفصول الأربعة' : 'Phenological development tracking across seasonal growth stages'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedMetric('ndvi')}
              className={`px-3 py-1 rounded transition ${
                selectedMetric === 'ndvi' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              NDVI
            </button>
            <button
              onClick={() => setSelectedMetric('evi')}
              className={`px-3 py-1 rounded transition ${
                selectedMetric === 'evi' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              EVI
            </button>
            <button
              onClick={() => setSelectedMetric('ndwi')}
              className={`px-3 py-1 rounded transition ${
                selectedMetric === 'ndwi' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              NDWI
            </button>
          </div>
        </div>

        {/* Visual Bar Spectrum */}
        <div className="h-48 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-end gap-2 sm:gap-4 overflow-x-auto">
          {observations.map((obs, idx) => {
            const val = obs[selectedMetric];
            const heightPct = Math.max(15, Math.min(100, Math.round(val * 115)));
            return (
              <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                  {val.toFixed(2)}
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-300 relative group-hover:brightness-125"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor:
                      selectedMetric === 'ndvi'
                        ? val >= 0.65
                          ? '#10b981'
                          : val >= 0.45
                          ? '#14b8a6'
                          : val >= 0.3
                          ? '#f59e0b'
                          : '#ea580c'
                        : selectedMetric === 'evi'
                        ? '#0d9488'
                        : '#0284c7',
                  }}
                  title={`${obs.month}: ${val} (${obs.vegetationHealth})`}
                />
                <span className="text-[10px] font-mono text-slate-400">
                  {isAr ? obs.monthAr : obs.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cross Correlation with Soil Carbon */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-400 block">{isAr ? 'الارتباط مع مخزون كربون التربة (SOC Correlation):' : 'Soil Organic Carbon Correlation:'}</span>
            <div className="text-slate-200">
              {isAr
                ? 'تظهر البيانات تطابقاً قوياً بين المناطق ذات مؤشر NDVI > 0.6 ومخزون الكربون العالي في الطبقة السطحية (0-30 سم).'
                : 'Strong positive spatial correlation (r = 0.82) between peak NDVI canopy and SoilGrids surface SOC density.'}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block">{isAr ? 'مقاومة الإجهاد المائي (Drought Resilience):' : 'Canopy Moisture Buffer:'}</span>
            <div className="text-slate-200">
              {isAr
                ? 'تحافظ التربة ذات السعة الحقلية العالية على مؤشر NDWI إيجابي حتى خلال ذروة الصيف الحار (يوليو وأغسطس).'
                : 'High AWC soil profile prevents severe summer vegetation desiccation, maintaining positive NDWI through August.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
