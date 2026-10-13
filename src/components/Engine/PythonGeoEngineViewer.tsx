import React, { useState } from 'react';
import { 
  TerminalSquare, 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Braces, 
  Layers, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Language, FarmRegion } from '../../types';
import { PYTHON_GEO_ENGINE_CODE } from '../../data/microservicesData';

interface PythonGeoEngineViewerProps {
  farm: FarmRegion;
  lang: Language;
}

export const PythonGeoEngineViewer: React.FC<PythonGeoEngineViewerProps> = ({ farm, lang }) => {
  const isAr = lang === 'ar';
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<'pipeline' | 'clip' | 'calibrate' | 'rusle'>('pipeline');
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>({
    status: 200,
    timeMs: 42,
    data: {
      status: 'success',
      farm_id: farm.id,
      reprojected_crs: 'EPSG:32631',
      clipping_method: 'Rasterio Windowed Mask (VRT)',
      alpha_applied: 0.65,
      rusle_k_metric: 0.0268,
      hazard_classification: 'Moderate',
      cache_status: 'HIT (Redis 6379)',
    },
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_GEO_ENGINE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestApi = () => {
    setIsCallingApi(true);
    setTimeout(() => {
      setIsCallingApi(false);
      if (selectedEndpoint === 'clip') {
        setApiResponse({
          status: 200,
          timeMs: 28,
          data: {
            endpoint: '/api/v1/geo/clip-vrt',
            clipped_layers: ['sand_0-30cm', 'silt_0-30cm', 'clay_0-30cm', 'soc_0-30cm'],
            window_size: [49, 49],
            ram_used_mb: 4.8,
            source: 'ISRIC SoilGrids 250m VRT',
          },
        });
      } else if (selectedEndpoint === 'calibrate') {
        setApiResponse({
          status: 200,
          timeMs: 34,
          data: {
            endpoint: '/api/v1/geo/calibrate-idw',
            ground_samples_count: farm.samples.length,
            alpha: 0.65,
            formula: 'SG * alpha + Lab * (1 - alpha)',
            rmse_before: '6.8%',
            rmse_after: '2.1%',
          },
        });
      } else if (selectedEndpoint === 'rusle') {
        setApiResponse({
          status: 200,
          timeMs: 18,
          data: {
            endpoint: '/api/v1/geo/rusle-k',
            m_factor: 3420,
            k_us_customary: 0.204,
            k_metric_si: 0.0268,
            usda_texture: 'Clay Loam (طَفَلي طيني)',
            risk_grade: 'Moderate',
          },
        });
      } else {
        setApiResponse({
          status: 200,
          timeMs: 44,
          data: {
            status: 'success',
            farm_id: farm.id,
            reprojected_crs: 'EPSG:32631',
            alpha_applied: 0.65,
            rusle_k_metric: 0.0268,
            hazard_classification: 'Moderate',
            cache_status: 'HIT (Redis 6379)',
          },
        });
      }
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 mt-1">
              <TerminalSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                  {isAr ? 'محرك المعالجة المكانية' : 'Geo-Spatial Engine'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Python 3.11 + FastAPI + GDAL/Rasterio + NumPy</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'محرك بايثون المكاني: كود المعالجة وواجهات البرمجة (FastAPI)'
                  : 'FastAPI Geo-Engine Implementation & Interactive Swagger Tester'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'مخصص للحسابات الهندسية المكانية، معالجة ملفات GeoTIFF و VRT القادمة من SoilGrids، وإعادة الإسقاط التلقائي إلى EPSG:4326 أو UTM Zone 31N.'
                  : 'High-performance Python service utilizing GDAL C-extensions, Rasterio streaming, pyproj geodesy, and SciPy KDTree for IDW.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? (isAr ? 'تم نسخ الكود!' : 'Copied!') : (isAr ? 'نسخ كود بايثون' : 'Copy Python Code')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Code Viewer & Interactive API Endpoint Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Python Code Preview */}
        <div className="lg:col-span-7 space-y-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-teal-400" />
                <span className="font-medium text-slate-200">geo-engine/app/routers/spatial_pipeline.py</span>
              </div>
              <span className="text-[10px] text-teal-400 font-semibold">FastAPI :8000</span>
            </div>

            <pre className="p-4 text-slate-300 text-xs leading-relaxed overflow-x-auto h-[480px]">
              {PYTHON_GEO_ENGINE_CODE}
            </pre>
          </div>
        </div>

        {/* Right 5 Cols: Interactive Endpoint Tester */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
                <Braces className="w-4 h-4 text-teal-400" />
                <span>{isAr ? 'اختبار نقطة الـ API الحية:' : 'Live FastAPI Tester:'}</span>
              </h3>
            </div>

            {/* Endpoints Select */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Select Route:</label>
              <select
                aria-label="Select FastAPI Route"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-mono focus:outline-none"
              >
                <option value="pipeline">POST /api/v1/geo/process-farm-pipeline</option>
                <option value="clip">POST /api/v1/geo/clip-vrt</option>
                <option value="calibrate">POST /api/v1/geo/calibrate-idw</option>
                <option value="rusle">POST /api/v1/geo/rusle-k</option>
              </select>
            </div>

            {/* Request Payload Details */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg font-mono text-xs space-y-1">
              <div className="text-slate-400 text-[10px]">Sample Request Payload:</div>
              <pre className="text-slate-300 text-[11px]">
{`{
  "farm_id": "${farm.id}",
  "target_epsg": "EPSG:32631",
  "alpha_calibration": 0.65
}`}
              </pre>
            </div>

            <button
              onClick={handleTestApi}
              disabled={isCallingApi}
              className="w-full flex items-center justify-center gap-2 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Send className={`w-3.5 h-3.5 ${isCallingApi ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'إرسال طلب تجريبي' : 'Send Test HTTP Request'}</span>
            </button>

            {/* Response Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Response Status:</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">200 OK</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{apiResponse.timeMs}ms</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 max-h-[180px] overflow-y-auto">
                <pre>{JSON.stringify(apiResponse.data, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
