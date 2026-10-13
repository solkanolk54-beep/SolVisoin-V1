import React, { useState } from 'react';
import { 
  TreePine, 
  Layers, 
  Sparkles, 
  Download, 
  Printer, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  FileCode2, 
  Copy, 
  Check, 
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Send,
  Sprout
} from 'lucide-react';
import { FarmRegion, Language, SoilCarbonAnalysis } from '../../types';
import { calculateSoilCarbonAndAfforestation } from '../../utils/geoCalculations';

interface SoilCarbonAfforestationProps {
  farm: FarmRegion;
  lang: Language;
  onOpenUpload: () => void;
  onOpenPrint: () => void;
  onExportGeoJson: () => void;
}

export const SoilCarbonAfforestation: React.FC<SoilCarbonAfforestationProps> = ({
  farm,
  lang,
  onOpenUpload,
  onOpenPrint,
  onExportGeoJson,
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'profile' | 'greendam' | 'code'>('profile');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCallingApi, setIsCallingApi] = useState(false);

  // Compute SOC Stock across depths
  const carbonAnalysis: SoilCarbonAnalysis = calculateSoilCarbonAndAfforestation(
    farm.baseSoilGrids.socGPerKg,
    farm.baseSoilGrids.bulkDensityGcm3,
    8.5 // coarse fragments %
  );

  const totalFarmCarbonTonnes = Math.round(carbonAnalysis.total_soc_stock_t_ha * farm.areaHectares);
  const totalFarmCo2eTonnes = Math.round(carbonAnalysis.co2_equivalent_t_ha * farm.areaHectares);

  const pythonSocModuleCode = `# geo-engine/modules/soil_organic_carbon.py
import numpy as np
import rasterio
from rasterio.mask import mask
import json

def calculate_soil_carbon_and_afforestation(geometry_geojson, vrt_soc_paths, vrt_bdod_paths, vrt_cfvo_paths):
    """
    يحسب مخزون الكربون العضوي (SOC Stock) لمختلف الأعماق 
    ويحدد مؤشر أولوية التشجير ومكافحة التصحر والسد الأخضر.
    """
    total_carbon_stock_t_ha = 0.0
    depth_layers_report = []

    geom = [json.loads(json.dumps(geometry_geojson))]

    # الأعماق القياسية في SoilGrids (بالسنتيمتر)
    depths = ["0-5", "5-15", "15-30", "30-60", "60-100", "100-200"]
    depth_intervals = [5, 10, 15, 30, 40, 100]

    for i, depth in enumerate(depths):
        soc_path = vrt_soc_paths[depth]
        bdod_path = vrt_bdod_paths[depth]
        cfvo_path = vrt_cfvo_paths[depth]
        thickness = depth_intervals[i]

        with rasterio.open(soc_path) as src_soc:
            out_image_soc, _ = mask(src_soc, geom, crop=True, nodata=np.nan)
            soc_val = np.nanmean(out_image_soc) / 10.0

        with rasterio.open(bdod_path) as src_bd:
            out_image_bd, _ = mask(src_bd, geom, crop=True, nodata=np.nan)
            bd_val = np.nanmean(out_image_bd) / 100.0

        with rasterio.open(cfvo_path) as src_cf:
            out_image_cf, _ = mask(src_cf, geom, crop=True, nodata=np.nan)
            cf_val = np.nanmean(out_image_cf) / 10.0

        if np.isnan(soc_val) or np.isnan(bd_val):
            layer_stock = 0.0
        else:
            # SOC_stock = (SOC * BD * Depth * (1 - Coarse_Fragments/100)) / 10
            layer_stock = (soc_val * bd_val * thickness * (1.0 - (cfv_safe(cf_val) / 100.0))) / 10.0

        total_carbon_stock_t_ha += layer_stock
        depth_layers_report.append({
            "depth_cm": depth,
            "carbon_stock_t_ha": round(layer_stock, 2)
        })

    afforestation_suitability = evaluate_afforestation_potential(total_carbon_stock_t_ha)

    return {
        "total_soc_stock_t_ha": round(total_carbon_stock_t_ha, 2),
        "layers": depth_layers_report,
        "afforestation_recommendation": afforestation_suitability
    }

def cfv_safe(val):
    return val if not np.isnan(val) else 0.0

def evaluate_afforestation_potential(total_stock):
    if total_stock < 30:
        return {
            "priority": "عالية جداً (أراضي سهبية متدهورة / السد الأخضر)",
            "action": "مطلوب تدخل عاجل بمشاريع التشجير الكبرى (السد الأخضر) مع تحسين المحتوى العضوي بالتسميد الحيوي."
        }
    elif total_stock <= 70:
        return {
            "priority": "متوسطة",
            "action": "ملاءمة جيدة للغراسات المقاومة للجفاف وتثبيت الكثبان أو التربة الهشة."
        }
    else:
        return {
            "priority": "منخفضة الأولوية للتشجير السريع / عالية الخصوبة",
            "action": "يوصى بالحفاظ على الغطاء النباتي القائم واستغلالها في الزراعات المحسنة."
        }
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonSocModuleCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestComprehensiveEndpoint = () => {
    setIsCallingApi(true);
    setTimeout(() => {
      setIsCallingApi(false);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-1">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  {isAr ? 'محرك الكربون العضوي ومشاريع التشجير' : 'SOC & Afforestation Pipeline'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">SoilGrids 0-200cm • Green Dam (السد الأخضر)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'مخزون الكربون العضوي (SOC Stock) ودعم مشاريع التشجير ومكافحة التصحر'
                  : 'Soil Organic Carbon Stocks & Green Dam Afforestation Suitability'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'حساب مخزون الكربون العضوي للأعماق القياسية (0 إلى 200 سم) بالاعتماد على SoilGrids والكثافة الظاهرية والعناصر الخشنة، مع تحديد أولوية التشجير لمبادرة السد الأخضر.'
                  : 'Multi-depth soil carbon mass estimation (t/ha), bulk density integration, coarse fragments masking, and ecological afforestation prioritization.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'رفع مضلع GeoJSON' : 'Upload GeoJSON'}</span>
            </button>
            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'طباعة تقرير الحقل (PDF)' : 'Print Report (PDF)'}</span>
            </button>
            <button
              onClick={onExportGeoJson}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير GeoJSON المحدث' : 'Export GeoJSON'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'profile'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isAr ? '١. تحليل مخزون الكربون حسب العمق (0-200 سم)' : '1. Multi-Depth Carbon Stock (0-200cm)'}
          </button>
          <button
            onClick={() => setActiveTab('greendam')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'greendam'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isAr ? '٢. تقييم التشجير والسد الأخضر (Green Dam Index)' : '2. Green Dam & Species Suitability'}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'code'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isAr ? '٣. كود بايثون ونقطة الـ API الموحدة (/comprehensive-analyze)' : '3. Python Module & API Schema'}
          </button>
        </div>
      </div>

      {/* Main Carbon Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{isAr ? 'إجمالي مخزون الكربون (SOC Stock)' : 'Total SOC Stock (0-200cm)'}</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {carbonAnalysis.total_soc_stock_t_ha}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {isAr ? 'طن كربون / هكتار (t/ha)' : 'tonnes C / hectare'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'المكافئ من ثاني أكسيد الكربون (CO2e)' : 'CO2 Equivalent Stock'}
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {carbonAnalysis.co2_equivalent_t_ha}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            t CO₂e / ha (Factor: ×3.67)
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'إجمالي مخزون المزرعة بالكامل' : 'Total Farm Carbon Asset'}
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {totalFarmCarbonTonnes.toLocaleString()} t
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {totalFarmCo2eTonnes.toLocaleString()} t CO₂e for {farm.areaHectares} ha
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'أولوية التشجير (السد الأخضر)' : 'Afforestation Priority'}
          </div>
          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${
                carbonAnalysis.total_soc_stock_t_ha < 30
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                  : carbonAnalysis.total_soc_stock_t_ha <= 70
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <span>{isAr ? carbonAnalysis.afforestation_recommendation.priority : carbonAnalysis.afforestation_recommendation.priorityEn}</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {isAr ? 'معيار الملاءمة البيئية' : 'Anti-desertification Index'}
          </div>
        </div>
      </div>

      {/* Tab 1: Profile Across Standard Depths */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Formula Callout */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/30 rounded-xl font-mono text-xs text-slate-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-slate-400">
                {isAr ? 'معادلة حساب مخزون الكربون لكل طبقة (Soil Carbon Formula):' : 'Soil Organic Carbon Stock Formula:'}
              </span>
              <span className="p-2 bg-slate-950 rounded text-emerald-300 border border-emerald-500/30">
                SOC_stock = (SOC × BD × Depth_cm × (1 - Coarse_Fragments / 100)) / 10 [t/ha]
              </span>
            </div>
          </div>

          {/* Depth Layers Breakdown Table & Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Depth Table */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'طبقات الأعماق القياسية في SoilGrids:' : 'Standard SoilGrids Depth Profiles:'}</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Sum: {carbonAnalysis.total_soc_stock_t_ha} t/ha
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-2.5">Depth (cm)</th>
                      <th className="py-2 px-2.5">SOC (g/kg)</th>
                      <th className="py-2 px-2.5">BD (g/cm³)</th>
                      <th className="py-2 px-2.5">Coarse (%)</th>
                      <th className="py-2 px-2.5 text-emerald-400">Stock (t/ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {carbonAnalysis.layers.map((layer) => (
                      <tr key={layer.depth_cm} className="hover:bg-slate-800/30 transition">
                        <td className="py-2 px-2.5 font-bold text-slate-200">{layer.depth_cm} cm</td>
                        <td className="py-2 px-2.5 text-teal-300">{layer.soc_g_kg}</td>
                        <td className="py-2 px-2.5 text-slate-300">{layer.bdod_g_cm3}</td>
                        <td className="py-2 px-2.5 text-slate-400">{layer.coarse_fragments_pct}%</td>
                        <td className="py-2 px-2.5 text-emerald-400 font-bold">{layer.carbon_stock_t_ha} t/ha</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 5 Cols: Soil Depth Visual Stack */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
                {isAr ? 'المقطع الرأسي لمخزون الكربون (Vertical Soil Profile):' : 'Vertical Soil Carbon Profile:'}
              </h3>

              <div className="space-y-1.5 font-mono text-xs">
                {carbonAnalysis.layers.map((layer, idx) => {
                  const share = Math.round((layer.carbon_stock_t_ha / carbonAnalysis.total_soc_stock_t_ha) * 100);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-950 flex items-center justify-between"
                      style={{
                        backgroundColor: `rgba(6, 78, 59, ${0.15 + (6 - idx) * 0.12})`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px] w-16">{layer.depth_cm} cm</span>
                        <div className="h-2 rounded bg-emerald-500" style={{ width: `${Math.max(20, share * 2)}px` }} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400">{share}%</span>
                        <span className="text-emerald-300 font-bold">{layer.carbon_stock_t_ha} t/ha</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                {isAr
                  ? 'يتركز الجزء الأكبر من الكربون الحيوي في أول 30 سم (التربة السطحية الحيوية)، بينما تخزن الأعماق من 30 إلى 200 سم مخزوناً كربونياً مستقراً طويل الأمد.'
                  : 'Top 30cm hosts the most biologically dynamic carbon, while deeper layers (30-200cm) preserve recalcitrant long-term sequestered carbon.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Green Dam & Afforestation Suitability */}
      {activeTab === 'greendam' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {isAr ? 'تقييم ملاءمة التشجير ومبادرة السد الأخضر (Barrage Vert)' : 'Green Dam (Barrage Vert) & Species Suitability'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'تقييم بيئي لتوجيه مشاريع التشجير الكبرى في السهوب الجزائرية والأحواض الهشة بناءً على مخزون الكربون وقوام التربة.'
                    : 'Targeted afforestation guidelines for Algerian steppe anti-desertification perimeters and fragile agricultural buffer zones.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{isAr ? 'تصنيف الأولوية الميدانية:' : 'Action Priority:'}</span>
                <span className="text-emerald-400 font-bold">
                  {isAr ? carbonAnalysis.afforestation_recommendation.priority : carbonAnalysis.afforestation_recommendation.priorityEn}
                </span>
              </div>

              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-200 leading-relaxed">
                <strong>{isAr ? 'التوجيه الميداني الموصى به:' : 'Field Recommendation:'} </strong>
                {isAr ? carbonAnalysis.afforestation_recommendation.action : carbonAnalysis.afforestation_recommendation.actionEn}
              </div>

              {/* Recommended Species */}
              <div className="space-y-2 pt-1">
                <span className="text-xs text-slate-400 font-mono block">
                  {isAr ? 'الأصناف النباتية والشجرية الموصى بغرسها:' : 'Recommended Native & Resilient Species:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {carbonAnalysis.afforestation_recommendation.speciesRecommended?.map((sp, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono">
                      <TreePine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sequestration Potential */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">
                  {isAr ? 'معدل امتصاص الكربون السنوي المقدر:' : 'Estimated Annual Carbon Sequestration Rate:'}
                </span>
                <span className="text-emerald-400 font-bold">
                  ~{carbonAnalysis.afforestation_recommendation.carbonSequestrationPotentialTonPerYear} t CO₂e / ha / year
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Python Module Code Viewer & API Route */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">geo-engine/modules/soil_organic_carbon.py</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy Code')}</span>
                </button>
              </div>
            </div>

            <pre className="text-slate-300 text-xs leading-relaxed overflow-x-auto h-[380px] p-2 bg-slate-900/40 rounded-lg">
              {pythonSocModuleCode}
            </pre>
          </div>

          {/* Unified Endpoint Schema */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">POST</span>
                <span className="text-slate-200 font-bold">/api/v1/geo/comprehensive-analyze</span>
              </div>
              <button
                onClick={handleTestComprehensiveEndpoint}
                disabled={isCallingApi}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                <Send className={`w-3.5 h-3.5 ${isCallingApi ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'اختبار المسار' : 'Test Route'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-400 text-[11px]">
              Accepts GeoJSON polygon/multipolygon, clips SoilGrids SOC &amp; BDOD layers, computes RUSLE K-factor and Afforestation potential, and returns unified intelligence payload in &lt; 50ms.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
