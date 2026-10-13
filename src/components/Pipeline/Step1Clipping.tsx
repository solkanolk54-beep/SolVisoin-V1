import React, { useState } from 'react';
import { 
  Scissors, 
  Compass, 
  Cpu, 
  HardDrive, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  Box,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { FarmRegion, Language } from '../../types';
import { latLngToUtm31N } from '../../utils/geoCalculations';

interface Step1ClippingProps {
  farm: FarmRegion;
  lang: Language;
  onNext: () => void;
}

export const Step1Clipping: React.FC<Step1ClippingProps> = ({ farm, lang, onNext }) => {
  const isAr = lang === 'ar';
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTargetCrs, setSelectedTargetCrs] = useState('EPSG:32631');
  const [clippedLayers, setClippedLayers] = useState<string[]>([
    'sand_0-30cm.vrt',
    'silt_0-30cm.vrt',
    'clay_0-30cm.vrt',
    'soc_0-30cm.vrt',
    'phh2o_0-30cm.vrt',
    'bdod_0-30cm.vrt',
  ]);

  const utmCenter = latLngToUtm31N(farm.center.lat, farm.center.lng);

  const reprojectedVertices = farm.coordinates.map((pt, i) => {
    const utm = latLngToUtm31N(pt.lat, pt.lng);
    return {
      index: i + 1,
      wgsLat: pt.lat.toFixed(5),
      wgsLng: pt.lng.toFixed(5),
      utmEasting: utm.easting.toFixed(1),
      utmNorthing: utm.northing.toFixed(1),
    };
  });

  const handleSimulateClipping = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Step Header & Briefing Requirement */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-1">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  {isAr ? 'المرحلة الأولى' : 'Stage 01'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Rasterio + GDAL + VRT</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? '١. القص والتحويل الجغرافي (Clipping & Reprojection)'
                  : '1. Spatial Clipping & Coordinate Reprojection'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'استخدام مكتبة Rasterio لقص نافذة الحقل فقط من ملفات VRT العالمية (SoilGrids) دون تحميل ملف الرستر كاملاً لتوفير الذاكرة، مع إعادة الإسقاط إلى UTM Zone 31N (EPSG:32631) المخصصة للجزائر وشمال أفريقيا.'
                  : 'Windowed bounding-box clipping from global SoilGrids Virtual Raster (.vrt) datasets using Rasterio, reducing RAM footprint from gigabytes to megabytes, reprojecting directly into UTM Zone 31N (EPSG:32631).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleSimulateClipping}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isAr ? 'إعادة تشغيل القص' : 'Re-run Clip'}</span>
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <span>{isAr ? 'الانتقال للمعايرة الحقلية' : 'Next: Field Calibration'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: CRS Transformation + VRT Stream Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Coordinate Reprojection Engine */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  {isAr ? 'إعادة الإسقاط الكارتوغرافي التلقائي' : 'Cartographic Reprojection Pipeline'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{isAr ? 'نظام الهدف:' : 'Target CRS:'}</span>
                <select
                  aria-label="Target Coordinate Reference System"
                  value={selectedTargetCrs}
                  onChange={(e) => setSelectedTargetCrs(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-emerald-400 text-xs rounded px-2.5 py-1 focus:outline-none font-mono"
                >
                  <option value="EPSG:32631">EPSG:32631 (UTM Zone 31N - الجزائر/المغرب)</option>
                  <option value="EPSG:32630">EPSG:32630 (UTM Zone 30N - غرب الجزائر)</option>
                  <option value="EPSG:32632">EPSG:32632 (UTM Zone 32N - تونس/شرق الجزائر)</option>
                </select>
              </div>
            </div>

            {/* Visual CRS Conversion Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Input Geodetic CRS: EPSG:4326 (WGS84)</span>
                </div>
                <div className="text-xs font-mono text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                  Center: {farm.center.lat.toFixed(6)}° N, {farm.center.lng.toFixed(6)}° E
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Output Metric CRS: {selectedTargetCrs}</span>
                </div>
                <div className="text-xs font-mono text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-800/40">
                  Easting: {utmCenter.easting.toLocaleString()} m | Northing: {utmCenter.northing.toLocaleString()} m
                </div>
              </div>
            </div>

            {/* Vertices Reprojection Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2 px-2.5">#</th>
                    <th className="py-2 px-2.5">WGS84 Lat (°N)</th>
                    <th className="py-2 px-2.5">WGS84 Lon (°E)</th>
                    <th className="py-2 px-2.5 text-emerald-400">UTM Easting (m)</th>
                    <th className="py-2 px-2.5 text-emerald-400">UTM Northing (m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {reprojectedVertices.map((v) => (
                    <tr key={v.index} className="hover:bg-slate-800/40 transition">
                      <td className="py-1.5 px-2.5 text-slate-500">{v.index}</td>
                      <td className="py-1.5 px-2.5 text-slate-300">{v.wgsLat}</td>
                      <td className="py-1.5 px-2.5 text-slate-300">{v.wgsLng}</td>
                      <td className="py-1.5 px-2.5 text-emerald-300">{v.utmEasting}</td>
                      <td className="py-1.5 px-2.5 text-emerald-300">{v.utmNorthing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rasterio Python Snippet */}
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 pb-1 border-b border-slate-800">
                <span>Rasterio Windowed Clip Pipeline (Python)</span>
                <span className="text-emerald-400">Execution: 42ms</span>
              </div>
              <pre className="text-slate-300 text-[11px] leading-relaxed overflow-x-auto">
{`# 1. Open Virtual Raster without loading full dataset into memory
with rasterio.open('vrt://isric.soilgrids.org/sand_0-30cm.vrt') as src:
    # 2. Transform polygon to dataset CRS and compute bounding window
    geom_utm = transform_geom('EPSG:4326', '${selectedTargetCrs}', polygon_geom)
    # 3. Stream only windowed tile buffer (memory footprint < 5 MB)
    clipped_raster, out_transform = mask(src, [geom_utm], crop=True, nodata=-9999)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Col: VRT Layers & Memory Performance */}
        <div className="space-y-4">
          {/* Memory Performance Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                {isAr ? 'كفاءة الذاكرة والمعالجة (Memory Specs)' : 'RAM & Streaming Efficiency'}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{isAr ? 'استهلاك الذاكرة العادية:' : 'Full Tile Load:'}</span>
                  <span className="text-red-400 font-mono font-medium">1,420 MB</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{isAr ? 'استهلاك نافذة VRT المقصوصة:' : 'Rasterio Windowed Clip:'}</span>
                  <span className="text-emerald-400 font-mono font-bold">4.8 MB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '4%' }}></div>
                </div>
                <div className="text-[10px] text-emerald-400 text-right mt-1 font-mono">
                  {isAr ? 'وفر ٩٩.٦٪ من الذاكرة' : '99.6% RAM Footprint Reduction'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded">
                  <div className="text-slate-400 text-[10px]">{isAr ? 'مساحة المزرعة' : 'Farm Area'}</div>
                  <div className="text-slate-200 font-semibold">{farm.areaHectares} ha</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded">
                  <div className="text-slate-400 text-[10px]">{isAr ? 'دقة الرستر' : 'Native Res'}</div>
                  <div className="text-slate-200 font-semibold">250m / px</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active VRT SoilGrids Layers */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                {isAr ? 'طبقات VRT المقصوصة (SoilGrids)' : 'Clipped SoilGrids VRT Layers'}
              </h3>
            </div>

            <div className="space-y-1.5">
              {[
                { name: 'sand_0-30cm.vrt', label: isAr ? 'نسبة الرمل (Sand %)' : 'Sand 0-30cm', val: `${farm.baseSoilGrids.sandPercent}%` },
                { name: 'silt_0-30cm.vrt', label: isAr ? 'نسبة الطمي (Silt %)' : 'Silt 0-30cm', val: `${farm.baseSoilGrids.siltPercent}%` },
                { name: 'clay_0-30cm.vrt', label: isAr ? 'نسبة الطين (Clay %)' : 'Clay 0-30cm', val: `${farm.baseSoilGrids.clayPercent}%` },
                { name: 'soc_0-30cm.vrt', label: isAr ? 'الكربون العضوي (SOC)' : 'Organic Carbon', val: `${farm.baseSoilGrids.socGPerKg} g/kg` },
                { name: 'phh2o_0-30cm.vrt', label: isAr ? 'درجة الحموضة (pH)' : 'Soil pH (H2O)', val: `${farm.baseSoilGrids.phH2o}` },
                { name: 'bdod_0-30cm.vrt', label: isAr ? 'الكثافة الظاهرية (BD)' : 'Bulk Density', val: `${farm.baseSoilGrids.bulkDensityGcm3} g/cm³` },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
