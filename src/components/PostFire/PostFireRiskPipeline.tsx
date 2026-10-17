import React, { useState, useMemo } from 'react';
import {
  Flame,
  Droplets,
  Layers,
  MapPin,
  Compass,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  Activity,
  Sparkles,
  Zap,
  TrendingUp,
  Mountain,
  Waves,
  TreePine,
  Maximize2,
  HelpCircle,
  Eye,
  FileText
} from 'lucide-react';
import { FarmRegion, Language, BurnSeverityLevel, PostFireHotspot } from '../../types';
import { JIJEL_WATERSHEDS_PROFILES, JIJEL_PYTHON_CODE_SNIPPETS } from '../../data/jijelPostFireData';
import { SmartBaerReportModal } from '../Modals/SmartBaerReportModal';

interface PostFireRiskPipelineProps {
  currentFarm: FarmRegion;
  lang: Language;
}

export type PostFireStage = 1 | 2 | 3 | 4 | 5;

export const PostFireRiskPipeline: React.FC<PostFireRiskPipelineProps> = ({
  currentFarm,
  lang,
}) => {
  const isAr = lang === 'ar';

  const [activeStage, setActiveStage] = useState<PostFireStage>(1);
  const [selectedWatershedId, setSelectedWatershedId] = useState<string>('tabellout');
  const [selectedHotspot, setSelectedHotspot] = useState<PostFireHotspot | null>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [isBaerReportModalOpen, setIsBaerReportModalOpen] = useState<boolean>(false);

  // Stage 5 BAER Extraction States
  const [thresholdSoilLoss, setThresholdSoilLoss] = useState<number>(50.0);
  const [isSimulatingHotspots, setIsSimulatingHotspots] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [showAllJijelSites, setShowAllJijelSites] = useState<boolean>(true);

  // Interactive dNBR simulator state
  const [simPreNir, setSimPreNir] = useState<number>(0.58);
  const [simPreSwir, setSimPreSwir] = useState<number>(0.14);
  const [simPostNir, setSimPostNir] = useState<number>(0.22);
  const [simPostSwir, setSimPostSwir] = useState<number>(0.48);

  // Rain storm simulation slider in Stage 4
  const [stormRainfallMm, setStormRainfallMm] = useState<number>(65);

  const watershed = JIJEL_WATERSHEDS_PROFILES[selectedWatershedId] || JIJEL_WATERSHEDS_PROFILES['tabellout'];

  // All hotspots across the 3 key Jijel catchments for comprehensive BAER regional action
  const allJijelHotspots = useMemo(() => {
    return Object.values(JIJEL_WATERSHEDS_PROFILES).flatMap(w => w.hotspots);
  }, []);

  const activeHotspotsList = useMemo(() => {
    const list = showAllJijelSites ? allJijelHotspots : watershed.hotspots;
    return list.filter(h => h.postFireErosionTonHa >= thresholdSoilLoss);
  }, [showAllJijelSites, allJijelHotspots, watershed.hotspots, thresholdSoilLoss]);

  // Calculate live simulated NBR & dNBR
  const liveNbrPre = useMemo(() => {
    const denom = simPreNir + simPreSwir;
    return denom === 0 ? 0 : (simPreNir - simPreSwir) / denom;
  }, [simPreNir, simPreSwir]);

  const liveNbrPost = useMemo(() => {
    const denom = simPostNir + simPostSwir;
    return denom === 0 ? 0 : (simPostNir - simPostSwir) / denom;
  }, [simPostNir, simPostSwir]);

  const liveDnbr = useMemo(() => {
    return Math.round((liveNbrPre - liveNbrPost) * 1000);
  }, [liveNbrPre, liveNbrPost]);

  const liveSeverity = useMemo(() => {
    if (liveDnbr < 100) return { labelEn: 'Unburned / Low (< 100)', labelAr: 'غير محترقة / منخفضة جداً (< 100)', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' };
    if (liveDnbr < 270) return { labelEn: 'Low Severity (100 - 269)', labelAr: 'شدة منخفضة (100 - 269)', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40' };
    if (liveDnbr < 440) return { labelEn: 'Moderate-Low (270 - 439)', labelAr: 'شدة متوسطة إلى منخفضة (270 - 439)', color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/40' };
    if (liveDnbr < 660) return { labelEn: 'Moderate-High (440 - 659)', labelAr: 'شدة متوسطة إلى مرتفعة (440 - 659)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' };
    return { labelEn: 'High Severity / Extreme Hydrophobicity (≥ 660)', labelAr: 'شدة مرتفعة جداً / كراهية قصوى للماء (≥ 660)', color: 'text-rose-400 bg-rose-500/20 border-rose-500/50' };
  }, [liveDnbr]);

  // Stage 4 Storm sediment calculation
  const stormSedimentDeliveryM3 = useMemo(() => {
    const stormFactor = Math.pow(stormRainfallMm / 40, 1.8);
    return Math.round((watershed.annualSiltDeliveryM3 / 12) * stormFactor);
  }, [watershed, stormRainfallMm]);

  const handleCopyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2500);
  };

  const handleRunPythonHotspotExtraction = () => {
    setIsSimulatingHotspots(true);
    setSimulationLogs([
      `⏳ جارٍ تحليل خريطة الانجراف واستخراج النقاط الساخنة (Hotspots)...`,
      `[Rasterio] Opening 'jijel_post_fire_erosion_risk.tif' (CRS: EPSG:32631, Transform: UTM Zone 31N)`,
      `[Hotspot Mask] Isolating cells where erosion >= ${thresholdSoilLoss.toFixed(1)} t/ha/yr...`,
      `[Rasterio Shapes] Vectorizing contiguous critical erosion zones into polygons...`,
      `[Shapely] Computing polygon centroids & buffer zones for immediate field deployment...`,
      `[BAER Engine] Linking targets: Conservation des Forêts, Protection Civile, DRE Jijel`,
      `✅ تم بنجاح استخراج وتصنيف ${activeHotspotsList.length} نقطة ساخنة حرجة مطابقة لمعيار التدخل!`,
    ]);
    setTimeout(() => {
      setIsSimulatingHotspots(false);
    }, 1200);
  };

  const handleExportBaerGeoJson = () => {
    const targetHotspots = activeHotspotsList;
    const geojson = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:EPSG::32631' },
      },
      metadata: {
        platform: 'SolVision Spatial Intelligence Platform v1.3.0 (Geo-Engine)',
        module: 'BAER Action Plan (Post-Fire Hydrological Risk)',
        region: 'Wilaya de Jijel - Algeria',
        threshold_soil_loss: thresholdSoilLoss,
        exported_features_count: targetHotspots.length,
        dam_protection_targets: ['Tabellout Hydraulic Dam', 'Kissir Coastal Dam', 'Boussiaba Strategic Dam'],
        responsible_agencies: [
          'محافظة الغابات لولاية جيجل (Conservation des Forêts)',
          'الحماية المدنية لولاية جيجل (Protection Civile)',
          'مديرية الموارد المائية لولاية جيجل (Direction des Ressources en Eau)',
          'الوكالة الوطنية للسدود والتحويلات (ANBT)'
        ],
        generated_at: new Date().toISOString(),
      },
      features: targetHotspots.map((h) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [h.lng, h.lat],
        },
        properties: {
          id: h.id,
          name: h.nameEn,
          name_ar: h.nameAr,
          risk_level: 'Critical Hotspot',
          estimated_erosion_t_ha: h.postFireErosionTonHa,
          first_storm_erosion_t_ha: h.firstStormSoilLossTonHa || h.postFireErosionTonHa,
          recommended_action: h.recommendedInterventionEn,
          recommended_action_ar: h.recommendedInterventionAr,
          target_dam_risk: 'Tabellout / Kissir / Boussiaba Protection',
          target_agencies: h.targetAgenciesAr || ['محافظة الغابات', 'الحماية المدنية', 'مديرية الموارد المائية'],
          slope_degrees: h.slopeDeg,
          slope_percent: h.slopePct,
          mean_dnbr: h.dnbrMean,
          debris_flow_prob_pct: h.debrisFlowProbabilityPct,
          estimated_cost_dzd: h.estimatedCostDzd,
          urgency_action: h.interventionUrgencyAr || 'تدخل عاجل قبل العواصف الخريفية الأولى',
          centroid: [h.lat, h.lng],
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jijel_baer_hotspots_${thresholdSoilLoss}t_ha.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stages = [
    {
      num: 1,
      titleEn: '1. Data Acquisition & AOI',
      titleAr: '١. إعداد البيانات والموقع الجغرافي',
      subEn: 'Sentinel-2 NIR/SWIR, DEM 30m, UTM 31N',
      subAr: 'صور Sentinel-2 والارتفاعات ونظام UTM 31N',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      num: 2,
      titleEn: '2. dNBR & Burn Severity',
      titleAr: '٢. حساب dNBR وشدة الاحتراق',
      subEn: 'USGS burn severity & hydrophobicity',
      subAr: 'مؤشر الفارق الطيفي وتحديد الكراهية المائية',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      num: 3,
      titleEn: '3. Soil K & C Factors Modification',
      titleAr: '٣. تعديل معاملات التربة K و C',
      subEn: 'Hydrophobic ash layer & Curve Number',
      subAr: 'مضاعفة قابلية الانجراف وانهيار النفاذية',
      icon: <Mountain className="w-4 h-4" />,
    },
    {
      num: 4,
      titleEn: '4. RUSLE & Reservoir Siltation',
      titleAr: '٤. نمذجة RUSLE وحجم الجريان',
      subEn: 'Sediment delivery & dam reservoir siltation',
      subAr: 'فقدان التربة وحمولة توحل سد تابلوط وكيسير',
      icon: <Waves className="w-4 h-4" />,
    },
    {
      num: 5,
      titleEn: '5. Hotspots & BAER Interventions',
      titleAr: '٥. تحديد Hotspots وخرائط التدخل',
      subEn: 'Emergency log felling, check dams & alerts',
      subAr: 'سدود الجذوع، الجابيون والإنذار بالسيول الوحلية',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0F172A]/90 border border-[#1E293B] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-l from-orange-500/10 via-rose-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shadow-md">
                <Flame className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-100">
                {isAr
                  ? 'تحليل مخاطر ما بعد الحرائق الهيدرولوجية - ولاية جيجل'
                  : 'Post-Fire Hydrological Risk Assessment Pipeline (Jijel, Algeria)'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold">
                dNBR + RUSLE + BAER
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EPSG:32631 (Zone 31N)
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isAr
                ? 'نمذجة مكانية متقدمة لاشتقاق شدة الاحتراق من الأقمار الصناعية (Sentinel-2 NIR/SWIR) وتعديل معاملات كراهية التربة للماء وحساب حجم الجريان السطحي والرسوبيات المهددة لسدود ولاية جيجل (سد تابلوط، كيسير، بوسيابة).'
                : 'Advanced spatial pipeline deriving dNBR burn severity from Sentinel-2, quantifying hydrophobic soil repellency, modeling post-fire sediment yield, and prioritizing emergency interventions for Jijel strategic dams.'}
            </p>
          </div>

          {/* Catchment Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-[#0B0F19] border border-[#1E293B] rounded-xl px-3 py-2 text-xs">
              <Mountain className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">{isAr ? 'الحوض الساكب:' : 'Target Basin:'}</span>
              <select
                aria-label="Select Target Basin"
                value={selectedWatershedId}
                onChange={(e) => {
                  setSelectedWatershedId(e.target.value);
                  setSelectedHotspot(null);
                }}
                className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
              >
                <option value="tabellout" className="bg-[#0B0F19]">
                  {isAr ? 'حوض سد تابلوط - وادي جن جن وتاكسنة' : 'Tabellout Dam (Djendjen & Texenna)'}
                </option>
                <option value="kissir" className="bg-[#0B0F19]">
                  {isAr ? 'حوض سد كيسير - غابات العوانة' : 'Kissir Dam (El Aouana Coastal)'}
                </option>
                <option value="boussiaba" className="bg-[#0B0F19]">
                  {isAr ? 'حوض سد بوسيابة - الميلية والعنصر' : 'Boussiaba Dam (El Milia & Ouled Yahia)'}
                </option>
              </select>
            </div>

            <button
              onClick={() => setIsBaerReportModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-500/25 active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? 'التقرير الرسمي الشامل (PDF)' : 'Smart BAER Report (PDF)'}</span>
            </button>

            <button
              onClick={handleExportBaerGeoJson}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير BAER GeoJSON' : 'Export BAER GeoJSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Stage Interactive Workflow Horizontal Tracker */}
      <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl p-3 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {stages.map((st) => {
            const isActive = activeStage === st.num;
            const isCompleted = activeStage > st.num;

            return (
              <button
                key={st.num}
                onClick={() => setActiveStage(st.num as PostFireStage)}
                className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-orange-950/40 via-[#0F172A] to-[#0B0F19] border-orange-500/80 ring-2 ring-orange-500/30 shadow-lg text-slate-100'
                    : isCompleted
                    ? 'bg-[#0F172A]/70 hover:bg-[#0F172A] border-[#1E293B] text-slate-300'
                    : 'bg-[#0B0F19]/60 hover:bg-[#0F172A]/40 border-[#1E293B]/70 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                    isActive
                      ? 'bg-orange-500 text-slate-950'
                      : isCompleted
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.num}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold' : 'opacity-0'
                  }`}>
                    {isAr ? 'نشط' : 'Active'}
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="text-xs font-bold truncate">
                    {isAr ? st.titleAr : st.titleEn}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                    {isAr ? st.subAr : st.subEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: Data Acquisition & Study Area Setup */}
      {activeStage === 1 && (
        <div className="space-y-6">
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
                  {isAr ? 'المرحلة الأولى' : 'Stage 01'}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-1">
                  {isAr
                    ? 'تحديد النطاق الجغرافي وجلب البيانات (Data Acquisition & AOI Setup)'
                    : '1. Spatial AOI Delineation & Multi-Source Data Ingestion'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isAr
                    ? 'إعداد حزم الأقمار الصناعية لصور Sentinel-2 (نطاقات NIR و SWIR) ونموذج الارتفاع الرقمي DEM 30m وإعادة الإسقاط إلى UTM Zone 31N.'
                    : 'Configuring Sentinel-2 L2A multispectral bands (B08 NIR & B12 SWIR) and DEM terrain layers, reprojected into UTM Zone 31N (EPSG:32631).'}
                </p>
              </div>

              <button
                onClick={() => setActiveStage(2)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer self-start md:self-auto shrink-0"
              >
                <span>{isAr ? 'الانتقال لحساب مؤشر dNBR' : 'Next: Calculate dNBR'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            {/* Ingested Layers Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs font-mono">
              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'قبل الحريق (Pre-Fire)' : 'Pre-Fire Sentinel-2'}</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">B08 (NIR) & B12 (SWIR)</span>
                <div className="text-[10px] text-slate-500 mt-2 space-y-1">
                  <div>📅 {isAr ? 'التاريخ: 15 جوان (قبل موسم الجفاف)' : 'Date: June 15 (Early Summer)'}</div>
                  <div>🎯 {isAr ? 'الدقة: 10م / 20م' : 'Resolution: 10m / 20m'}</div>
                  <div>☁️ {isAr ? 'الغيوم: 0.2%' : 'Cloud cover: 0.2%'}</div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'بعد الحريق (Post-Fire)' : 'Post-Fire Sentinel-2'}</span>
                <span className="text-sm font-bold text-orange-400 mt-1 block">B08 (NIR) & B12 (SWIR)</span>
                <div className="text-[10px] text-slate-500 mt-2 space-y-1">
                  <div>📅 {isAr ? 'التاريخ: 28 أوت (مباشرة بعد الحرائق)' : 'Date: August 28 (Post-fire)'}</div>
                  <div>🎯 {isAr ? 'الدقة: 10م / 20م' : 'Resolution: 10m / 20m'}</div>
                  <div>☁️ {isAr ? 'الغيوم: 0.0%' : 'Cloud cover: 0.0%'}</div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'نموذج التضاريس (DEM 30m)' : 'Terrain DEM (COP-DEM)'}</span>
                <span className="text-sm font-bold text-cyan-400 mt-1 block">Slope & Flow Accumulation</span>
                <div className="text-[10px] text-slate-500 mt-2 space-y-1">
                  <div>⛰️ {isAr ? `متوسط الانحدار: ${watershed.meanSlopePct}%` : `Mean Slope: ${watershed.meanSlopePct}%`}</div>
                  <div>🌊 {isAr ? 'المسار: اتجاه وتراكم الجريان D8' : 'Hydrology: D8 Flow Acc'}</div>
                  <div>📏 {isAr ? 'الارتفاع: 160م إلى 940م' : 'Elev: 160m to 940m'}</div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'نظام الإسقاط الموحد' : 'Unified CRS'}</span>
                <span className="text-sm font-bold text-indigo-400 mt-1 block">UTM Zone 31N</span>
                <div className="text-[10px] text-slate-500 mt-2 space-y-1">
                  <div>🌐 EPSG: 32631</div>
                  <div>📍 WGS84 Ellipsoid (مخصص للجزائر)</div>
                  <div>📐 {isAr ? 'إعادة الإسقاط: Bilinear / Nearest' : 'Resampling: Bilinear/Nearest'}</div>
                </div>
              </div>
            </div>

            {/* Watershed Overview stats */}
            <div className="mt-5 p-4 bg-[#0B0F19]/60 border border-[#1E293B] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-200">
                  {isAr ? watershed.nameAr : watershed.nameEn}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? `إجمالي مساحة الحوض: ${watershed.totalWatershedAreaHa.toLocaleString()} هكتار • المساحة المتأثرة بالحرائق: ${watershed.burnedAreaTotalHa.toLocaleString()} هكتار (${watershed.burnedPct}%) • سعة السد: ${watershed.damCapacityMillionM3} مليون م³`
                    : `Total Catchment: ${watershed.totalWatershedAreaHa.toLocaleString()} ha • Burned Area: ${watershed.burnedAreaTotalHa.toLocaleString()} ha (${watershed.burnedPct}%) • Dam Reservoir: ${watershed.damCapacityMillionM3} M m³`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 font-mono text-xs font-bold">
                  {watershed.burnedAreaTotalHa} ha {isAr ? 'محترقة' : 'Burned'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: dNBR & USGS Burn Severity Classification */}
      {activeStage === 2 && (
        <div className="space-y-6">
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
                  {isAr ? 'المرحلة الثانية' : 'Stage 02'}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-1">
                  {isAr
                    ? 'حساب مؤشر dNBR وتصنيف شدة الاحتراق (Burn Severity & Hydrophobicity)'
                    : '2. dNBR Computation & USGS Burn Severity Classification'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isAr
                    ? 'تطبيق معادلة الفارق الطيفي المعياري NBR قبل وبعد الحريق واستنتاج فئات شدة الاحتراق وكراهية التربة للماء.'
                    : 'Applying Normalized Burn Ratio differential formula across Sentinel-2 bands and grading soil hydrophobicity risks.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-3 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-[#1E293B] rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 inline ml-1" />
                  <span>{isAr ? 'الرجوع' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(3)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
                >
                  <span>{isAr ? 'الانتقال لتعديل معاملات K و C' : 'Next: Modify K & C Factors'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Formula Callout Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="p-4 bg-[#0B0F19] border border-orange-500/30 rounded-xl space-y-2">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5 font-mono">
                  <Flame className="w-4 h-4" />
                  {isAr ? 'معادلة الفارق الطيفي لشدة الاحتراق (dNBR)' : 'dNBR Burn Severity Formula'}
                </span>
                <div className="p-2.5 bg-slate-950/80 rounded-lg text-xs font-mono text-cyan-300 border border-slate-800">
                  <div>NBR = (NIR - SWIR) / (NIR + SWIR)</div>
                  <div className="mt-1 text-amber-300 font-bold">dNBR = (NBR_pre - NBR_post) × 1000</div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isAr
                    ? 'في المناطق المحترقة، ينخفض انعكاس NIR (B08) بشدة نتيجة تلف الخلايا النباتية، بينما يرتفع انعكاس SWIR (B12) بسبب جفاف التربة والرماد المكشوف.'
                    : 'Post-fire canopy loss drastically reduces NIR reflectance while bare ash and dry soil increase SWIR response, creating a strong positive dNBR spike.'}
                </p>
              </div>

              {/* Interactive Band Simulator */}
              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {isAr ? 'محاكي بكسل تفاعلي (Pixel Simulator)' : 'Interactive Pixel dNBR Simulator'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${liveSeverity.color}`}>
                    {isAr ? liveSeverity.labelAr : liveSeverity.labelEn}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 text-[10px] block">NIR Pre (B8): {simPreNir.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.02"
                      value={simPreNir}
                      onChange={(e) => setSimPreNir(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">SWIR Pre (B12): {simPreSwir.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.6"
                      step="0.02"
                      value={simPreSwir}
                      onChange={(e) => setSimPreSwir(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">NIR Post (B8): {simPostNir.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.6"
                      step="0.02"
                      value={simPostNir}
                      onChange={(e) => setSimPostNir(parseFloat(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">SWIR Post (B12): {simPostSwir.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.02"
                      value={simPostSwir}
                      onChange={(e) => setSimPostSwir(parseFloat(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>
                </div>

                <div className="p-2 bg-slate-950 rounded-lg flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">NBR Pre: {liveNbrPre.toFixed(3)} • NBR Post: {liveNbrPost.toFixed(3)}</span>
                  <span className="text-orange-400 font-bold">dNBR = {liveDnbr}</span>
                </div>
              </div>
            </div>

            {/* Burn Severity Breakdown Table */}
            <div className="mt-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                {isAr
                  ? `توزيع فئات شدة الاحتراق لحوض ${watershed.nameAr} (معيار USGS)`
                  : `USGS Burn Severity Distribution across ${watershed.nameEn}`}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400 text-left rtl:text-right">
                      <th className="p-2.5">{isAr ? 'فئة شدة الاحتراق' : 'Severity Class'}</th>
                      <th className="p-2.5">{isAr ? 'مجال dNBR' : 'dNBR Range'}</th>
                      <th className="p-2.5">{isAr ? 'المساحة (هكتار)' : 'Area (ha)'}</th>
                      <th className="p-2.5">{isAr ? 'النسبة من المحترق' : '% of Burned'}</th>
                      <th className="p-2.5">{isAr ? 'درجة كراهية الماء (Hydrophobicity)' : 'Soil Hydrophobicity'}</th>
                      <th className="p-2.5">{isAr ? 'مضاعف K-factor' : 'K Multiplier'}</th>
                      <th className="p-2.5">{isAr ? 'معامل C بعد الحريق' : 'Post C-Factor'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60">
                    {watershed.zones.map((z, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-2.5 font-bold flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            z.level === 'high' ? 'bg-rose-500' :
                            z.level === 'moderate_high' ? 'bg-amber-500' :
                            z.level === 'moderate_low' ? 'bg-yellow-500' :
                            z.level === 'low' ? 'bg-cyan-500' : 'bg-emerald-500'
                          }`} />
                          <span className={z.level === 'high' ? 'text-rose-300' : 'text-slate-200'}>
                            {isAr ? z.nameAr : z.nameEn}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-300 font-bold">{z.dnbrRange}</td>
                        <td className="p-2.5 text-slate-200">{z.areaHa.toLocaleString()} ha</td>
                        <td className="p-2.5 text-slate-300">{z.areaPct}%</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            z.hydrophobicity === 'Extreme' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            z.hydrophobicity === 'Severe' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            z.hydrophobicity === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {isAr ? z.hydrophobicityAr : z.hydrophobicity}
                          </span>
                        </td>
                        <td className="p-2.5 text-emerald-400 font-bold">{z.kMultiplier.toFixed(2)}x</td>
                        <td className="p-2.5 text-orange-400 font-bold">{z.cFactor.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Python Code Viewer for Stage 2 */}
            <div className="mt-5 p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    python/geo_engine/process_dnbr.py (Rasterio & GDAL Implementation)
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode('dnbr', JIJEL_PYTHON_CODE_SNIPPETS.dnbrProcessor)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                >
                  {copiedCodeKey === 'dnbr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeKey === 'dnbr' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                {JIJEL_PYTHON_CODE_SNIPPETS.dnbrProcessor}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: Soil Hydrophobicity, K & C Factors Adjustment */}
      {activeStage === 3 && (
        <div className="space-y-6">
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
                  {isAr ? 'المرحلة الثالثة' : 'Stage 03'}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-1">
                  {isAr
                    ? 'تعديل معاملات التربة والغطاء النباتي (Soil K & C Post-Fire Adjustment)'
                    : '3. Post-Fire Soil Erodibility (K) & Cover (C) Nomograph Adjustment'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isAr
                    ? 'تأثير تشكل الطبقة الكارهة للماء (Water Repellency Layer) على تسرب مياه الأمطار ومضاعفة معامل الانجراف K وتدهور معامل Curve Number.'
                    : 'Accounting for hydrophobic wax deposition, infiltration collapse, Curve Number inflation, and vegetative cover factor spikes.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setActiveStage(2)}
                  className="px-3 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-[#1E293B] rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 inline ml-1" />
                  <span>{isAr ? 'الرجوع' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(4)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
                >
                  <span>{isAr ? 'الانتقال لنمذجة RUSLE وتوحل السد' : 'Next: RUSLE & Siltation'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Soil Hydrophobicity Mechanism Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                  <Flame className="w-4 h-4" />
                  {isAr ? 'تشكل الطبقة الكارهة للماء (Wax Layer)' : 'Hydrophobic Wax Layer Formation'}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'تؤدي حرارة النيران الشديدة إلى تبخير المواد العضوية الهيدروكربونية من غابات البلوط والصنوبر، لتتكثف مجدداً على عمق 1 إلى 5 سم تحت السطح وتشكل غشاءً شمعياً مانعاً لنفاذ المياه.'
                    : 'Intense fire volatilizes aliphatic organic compounds which condense downward (1-5 cm depth) onto cooler mineral particles, forming an impermeable waxy hydrophobic horizon.'}
                </p>
                <div className="mt-3 p-2 bg-slate-950 rounded text-[11px] font-mono text-rose-300">
                  WDPT (اختبار نفاذ قطرة الماء): &gt; 300 ثانية
                </div>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                  <Activity className="w-4 h-4" />
                  {isAr ? 'مضاعفة معامل تآكل التربة K-Factor' : 'Soil Erodibility Multiplier (K)'}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'بسبب انعدام التماسك البنائي وتفكك الحبيبات الطينية بفعل الاحتراق، يرتفع معامل K بنسبة 115% في المناطق الشديدة الاحتراق، مما يجعل التربة سهلة الانجراف مع أول زخة مطرية.'
                    : 'Aggregate structural breakdown and hydrophobic sealing amplify soil detachment by 2.15x compared to baseline SoilGrids values.'}
                </p>
                <div className="mt-3 p-2 bg-slate-950 rounded text-[11px] font-mono text-amber-300">
                  K_post = K_base × 2.15 (High Severity)
                </div>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
                  <TrendingUp className="w-4 h-4" />
                  {isAr ? 'ارتفاع معامل الغطاء C ورقم المنحنى CN' : 'C-Factor & Curve Number (CN) Spike'}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'ينهار الغطاء النباتي الحامي (C-factor) من 0.008 إلى 0.52، بينما يرتفع رقم المنحنى الهيدرولوجي CN من 55 إلى 88، مما يقلل النفاذية من 25 ملم/ساعة إلى أقل من 3 ملم/ساعة.'
                    : 'C-factor jumps from 0.008 to 0.52 while runoff Curve Number surges from 55 to 88, slumping infiltration capacity to <3 mm/h.'}
                </p>
                <div className="mt-3 p-2 bg-slate-950 rounded text-[11px] font-mono text-cyan-300">
                  CN: 55 → 88 | Infiltration: 25 → 3 mm/h
                </div>
              </div>
            </div>

            {/* Python Code Snippet */}
            <div className="mt-5 p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    python/geo_engine/soil_hydrophobicity.py
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode('hydro', JIJEL_PYTHON_CODE_SNIPPETS.hydrophobicityMod)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                >
                  {copiedCodeKey === 'hydro' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeKey === 'hydro' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-52 leading-relaxed">
                {JIJEL_PYTHON_CODE_SNIPPETS.hydrophobicityMod}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: RUSLE Modeling & Dam Reservoir Siltation */}
      {activeStage === 4 && (
        <div className="space-y-6">
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
                  {isAr ? 'المرحلة الرابعة' : 'Stage 04'}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-1">
                  {isAr
                    ? `نمذجة RUSLE وحجم الجريان السطحي والرسوبيات - ${watershed.damNameAr}`
                    : `4. Post-Fire RUSLE Soil Loss & Siltation Influx - ${watershed.damNameEn}`}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isAr
                    ? 'تقدير حمولة الرسوبيات السنوية نحو حوض السد ومخاطر فقدان السعة الميتة وتوقف محطات معالجة مياه الشرب.'
                    : 'Quantifying sediment delivery ratio (SDR), reservoir siltation volume, and water treatment plant vulnerability.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setActiveStage(3)}
                  className="px-3 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-[#1E293B] rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 inline ml-1" />
                  <span>{isAr ? 'الرجوع' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setActiveStage(5)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
                >
                  <span>{isAr ? 'الانتقال لخرائط التدخل العاجل (Hotspots)' : 'Next: Emergency Hotspots'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Before vs After Impact Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs font-mono">
              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'فقدان التربة قبل الحريق' : 'Pre-Fire Soil Loss'}</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                  {(watershed.preFireSoilLossTonYear / watershed.totalWatershedAreaHa).toFixed(1)} t/ha/yr
                </span>
                <span className="text-slate-500 text-[10px] mt-1 block">
                  {watershed.preFireSoilLossTonYear.toLocaleString()} {isAr ? 'طن/سنة إجمالي' : 't/yr total'}
                </span>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-rose-500/40 rounded-xl">
                <span className="text-rose-300 text-[11px] block font-bold">{isAr ? 'فقدان التربة بعد الحريق' : 'Post-Fire Soil Loss'}</span>
                <span className="text-2xl font-bold text-rose-400 mt-1 block">
                  {(watershed.postFireSoilLossTonYear / watershed.burnedAreaTotalHa).toFixed(1)} t/ha/yr
                </span>
                <span className="text-rose-400/80 text-[10px] mt-1 block font-bold">
                  ▲ {watershed.lossIncreaseRatio}x {isAr ? 'أضعاف المعدل الطبيعي' : 'multiplication factor'}
                </span>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
                <span className="text-slate-400 text-[11px] block">{isAr ? 'حجم الرسوبيات الوافدة للسد' : 'Silt Inflow to Dam'}</span>
                <span className="text-2xl font-bold text-orange-400 mt-1 block">
                  {(watershed.annualSiltDeliveryM3 / 1000).toLocaleString()} k m³/yr
                </span>
                <span className="text-slate-400 text-[10px] mt-1 block">
                  SDR = 0.42 • ρ = 1.35 t/m³
                </span>
              </div>

              <div className="p-4 bg-[#0B0F19] border border-amber-500/40 rounded-xl">
                <span className="text-amber-300 text-[11px] block font-bold">{isAr ? 'خسارة السعة الميتة للسد' : 'Reservoir Siltation Rate'}</span>
                <span className="text-2xl font-bold text-amber-400 mt-1 block">
                  {watershed.reservoirDeadStorageLossPctPerYear}% / yr
                </span>
                <span className="text-slate-400 text-[10px] mt-1 block">
                  {isAr ? 'تهديد محطة الضخ والمعالجة' : 'Intake turbidity alert'}
                </span>
              </div>
            </div>

            {/* Storm Simulator */}
            <div className="mt-5 p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">
                    {isAr ? 'محاكاة العواصف الخريفية الأولى (Autumn Rain Event Simulator)' : 'Autumn Torrential Storm Event Simulator'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr
                      ? 'الأمطار الخريفية الأولى بعد الحرائق هي الأخطر على الإطلاق بسبب عدم استعادة الغطاء النباتي واستمرار الطبقة الشمعية العازلة.'
                      : 'The first intense autumn storm causes catastrophic hyper-concentrated sediment flushes into reservoir bays.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-cyan-400 font-mono">{stormRainfallMm} mm</span>
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'في ساعتين' : 'in 2 hours'}</span>
                </div>
              </div>

              <input
                type="range"
                min="20"
                max="120"
                step="5"
                value={stormRainfallMm}
                onChange={(e) => setStormRainfallMm(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />

              <div className="p-3 bg-slate-950 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  {isAr ? 'حجم الرسوبيات الناتجة عن العاصفة الواحدة:' : 'Single storm sediment volume flush:'}
                </span>
                <span className="text-amber-400 font-bold text-sm">
                  {stormSedimentDeliveryM3.toLocaleString()} m³ ({Math.round(stormSedimentDeliveryM3 * 1.35).toLocaleString()} {isAr ? 'طن أتربة' : 'tons'})
                </span>
              </div>
            </div>

            {/* Python Code Snippet */}
            <div className="mt-5 p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    python/geo_engine/rusle_siltation_jijel.py
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode('rusle', JIJEL_PYTHON_CODE_SNIPPETS.rusleRunoffSiltation)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                >
                  {copiedCodeKey === 'rusle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeKey === 'rusle' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-52 leading-relaxed">
                {JIJEL_PYTHON_CODE_SNIPPETS.rusleRunoffSiltation}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: Hotspots Identification & BAER Emergency Plan */}
      {activeStage === 5 && (
        <div className="space-y-6">
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl">
            {/* Header with Title and Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                    {isAr ? 'المرحلة الخامسة (الأخيرة)' : 'Stage 05 (Final)'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                    BAER Action Plan • GeoJSON Export
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-100 mt-1">
                  {isAr
                    ? 'تحديد النقاط الساخنة (Hotspots) وتوليد إحداثيات التدخل العاجل (BAER Action Plan)'
                    : '5. Critical Hotspots Extraction & BAER Action Plan Coordinates'}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  {isAr
                    ? 'ربط المخرجات الرياضية والفضائية بقرارات ميدانية تنفيذية موجهة لمحافظة الغابات، الحماية المدنية، ومديريات الموارد المائية في ولاية جيجل.'
                    : 'Bridging satellite dNBR, DEM slope, and RUSLE models into operational field interventions for Forestry Conservation, Civil Protection, and Water Resources Directorates in Jijel.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={() => setActiveStage(4)}
                  className="px-3 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 border border-[#1E293B] rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 inline ml-1" />
                  <span>{isAr ? 'الرجوع' : 'Back'}</span>
                </button>
                <button
                  onClick={handleRunPythonHotspotExtraction}
                  disabled={isSimulatingHotspots}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B0F19] hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition shadow active:scale-95 cursor-pointer"
                >
                  <Code2 className={`w-3.5 h-3.5 ${isSimulatingHotspots ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingHotspots ? (isAr ? 'جارٍ التحليل...' : 'Analyzing...') : (isAr ? 'تشغيل الخوارزمية' : 'Run Hotspots Py')}</span>
                </button>
                <button
                  onClick={() => setIsBaerReportModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isAr ? 'عرض التقرير الرسمي الشامل (PDF)' : 'Official BAER Report (PDF)'}</span>
                </button>
                <button
                  onClick={handleExportBaerGeoJson}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-500/25 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تصدير إحداثيات التدخل (GeoJSON)' : 'Export BAER GeoJSON'}</span>
                </button>
              </div>
            </div>

            {/* Institutional Link Banner: Targeted Regional Authorities */}
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-[#0B0F19] to-slate-900 border border-[#1E293B]">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  {isAr ? 'الجهات التنفيذية المستهدفة بخطة التدخل العاجل (ولاية جيجل):' : 'Key Stakeholder Agencies for Field Deployment (Jijel):'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {isAr ? 'تنسيق ميداني مشترك' : 'Multi-Agency Protocol'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-3">
                <div className="p-3 bg-slate-950/80 rounded-lg border border-emerald-500/30 flex items-start gap-2.5">
                  <TreePine className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300 block">{isAr ? 'محافظة الغابات لولاية جيجل' : 'Conservation des Forêts (Jijel)'}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {isAr ? 'إنشاء سدود الجذوع الكفافية (LEBs)، التغطية بالقش (Mulching) وإدارة الحزام الغابي' : 'Contour log felling, straw mulching, bioengineering and burned timber clearing.'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-rose-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block">{isAr ? 'الحماية المدنية لولاية جيجل' : 'Protection Civile (Jijel)'}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {isAr ? 'محطات الإنذار المبكر للسيول الوحلية وحماية التجمعات السكنية وشبكة الطرقات' : 'Early warning sirens for torrential debris flows, road corridors and village safety.'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-500/30 flex items-start gap-2.5">
                  <Waves className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-300 block">{isAr ? 'مديريات الموارد المائية و ANBT' : 'DRE & Dam Agency (ANBT)'}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {isAr ? 'حواجز الجابيون الترشيحية، صيانة بحيرات السدود وحماية مآخذ مياه الشرب' : 'Heavy gabion check dams, sediment traps, protecting drinking water intakes & dead storage.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Algorithm Parameter Controller */}
            <div className="mt-5 p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-200">
                    {isAr ? 'معيار عزل البؤر الساخنة (Hotspot Extraction Threshold)' : 'Erosion Severity Threshold (Soil Loss t/ha/yr)'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr
                      ? `عزل البؤر التي يتجاوز فيها معدل تآكل التربة الحد الحرج (حالياً: ${thresholdSoilLoss} طن/هكتار/سنة)`
                      : `Masking raster cells exceeding threshold loss (currently >= ${thresholdSoilLoss} t/ha/yr)`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-bold text-rose-400 font-mono">≥ {thresholdSoilLoss}</span>
                    <span className="text-[10px] text-slate-400 block">t/ha/yr</span>
                  </div>
                  <button
                    onClick={() => setShowAllJijelSites(!showAllJijelSites)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                      showAllJijelSites
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                        : 'bg-slate-900 text-slate-400 border-[#1E293B]'
                    }`}
                  >
                    {showAllJijelSites
                      ? (isAr ? 'كل بؤر ولاية جيجل (شامل)' : 'All Jijel Basins')
                      : (isAr ? 'الحوض المختار فقط' : 'Selected Basin')}
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={thresholdSoilLoss}
                onChange={(e) => setThresholdSoilLoss(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>30 t/ha (Moderate)</span>
                <span className="text-yellow-400">50 t/ha (Standard Python Default)</span>
                <span className="text-rose-400">120 t/ha (Extreme / First Storm)</span>
              </div>

              {/* Simulation Terminal Output */}
              {simulationLogs.length > 0 && (
                <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                  {simulationLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BAER Action Plan Report (تقرير مخرجات المرحلة الخامسة) */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  {isAr
                    ? 'تقرير مخرجات المرحلة الخامسة (خطة التدخل العاجل - BAER Action Plan):'
                    : 'Phase 5 Output Report: Prioritized BAER Action Plan Interventions:'}
                </span>
                <span className="text-slate-400 font-mono">
                  {activeHotspotsList.length} {isAr ? 'بؤر حرجة مستوفية للمعيار' : 'Hotspots Qualifying'}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {activeHotspotsList.map((h) => {
                  const isSelected = selectedHotspot?.id === h.id;
                  const isUltraCritical = (h.firstStormSoilLossTonHa || h.postFireErosionTonHa) >= 100;

                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHotspot(h)}
                      className={`p-4 rounded-xl border text-left rtl:text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#0F172A] border-rose-500 ring-2 ring-rose-500/40 shadow-xl'
                          : isUltraCritical
                          ? 'bg-[#0F172A]/80 hover:bg-[#0F172A] border-rose-500/50'
                          : 'bg-[#0B0F19] hover:bg-[#0F172A] border-[#1E293B]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              isUltraCritical
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {isAr ? h.priorityAr : h.priority}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">{h.id}</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 mt-2">
                          {isAr ? h.nameAr : h.nameEn}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          {isAr ? h.catchmentAr : h.catchment}
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
                          <div className="p-2 bg-slate-950 rounded border border-slate-900">
                            <span className="text-slate-500 block text-[9px]">{isAr ? 'الانحدار' : 'Slope'}</span>
                            <span className="text-amber-400 font-bold">{h.slopePct}% ({h.slopeDeg}°)</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-900">
                            <span className="text-slate-500 block text-[9px]">dNBR</span>
                            <span className="text-rose-400 font-bold">{h.dnbrMean}</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-900">
                            <span className="text-slate-500 block text-[9px]">{isAr ? 'احتمال السيل الوحلي' : 'Debris Flow Prob.'}</span>
                            <span className="text-red-400 font-bold">{h.debrisFlowProbabilityPct}%</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-rose-950/50">
                            <span className="text-slate-500 block text-[9px]">{isAr ? 'الانجراف بعد العواصف الأولى' : 'First Storm Erosion'}</span>
                            <span className="text-rose-400 font-bold">
                              {h.firstStormSoilLossTonHa || h.postFireErosionTonHa} t/ha
                            </span>
                          </div>
                        </div>

                        {/* Target Agencies Tags */}
                        {h.targetAgenciesAr && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {h.targetAgenciesAr.map((agency, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {agency}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#1E293B]">
                        <span className="text-[10px] font-bold text-rose-400 block mb-1">
                          🛠️ {isAr ? 'التدخل الهندسي الفوري:' : 'Immediate Engineering Action:'}
                        </span>
                        <p className="text-[11px] text-slate-200 leading-snug">
                          {isAr ? h.recommendedInterventionAr : h.recommendedInterventionEn}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>
                            {isAr ? 'الميزانية التقديرية:' : 'Est. Budget:'} {(h.estimatedCostDzd / 1000000).toFixed(1)} {isAr ? 'مليون دج' : 'M DZD'}
                          </span>
                          <span className="text-cyan-400 cursor-pointer hover:underline">
                            {isAr ? 'عرض الإحداثيات' : 'Inspect GPS'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hotspot Detailed Inspector Drawer */}
            {selectedHotspot && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#0F172A] to-slate-950 border border-rose-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-rose-400 animate-spin" />
                    <span className="font-bold text-sm text-slate-100 font-mono">
                      {isAr ? `إحداثيات وتفاصيل التدخل الميداني: ${selectedHotspot.nameAr}` : `Field Intervention Specs: ${selectedHotspot.nameEn}`}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedHotspot(null)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-mono px-2 py-1 rounded bg-slate-900"
                  >
                    ✕ {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'الإحداثيات الجغرافية (Centroid)' : 'WGS84 Centroid Coordinates'}</span>
                    <span className="text-emerald-400 font-bold text-xs mt-1 block">
                      {selectedHotspot.lat.toFixed(6)}° N, {selectedHotspot.lng.toFixed(6)}° E
                    </span>
                    <span className="text-slate-500 text-[10px] mt-0.5 block">
                      UTM 31N: {(selectedHotspot.lng * 111320).toFixed(0)}m E, {(selectedHotspot.lat * 110574).toFixed(0)}m N
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'معدل الانجراف التقديري' : 'Post-Fire Soil Loss'}</span>
                    <span className="text-rose-400 font-bold text-xs mt-1 block">
                      {selectedHotspot.postFireErosionTonHa} t/ha/yr
                    </span>
                    <span className="text-amber-400 text-[10px] mt-0.5 block">
                      {isAr ? 'العواصف الأولى:' : 'First Storm:'} {selectedHotspot.firstStormSoilLossTonHa || selectedHotspot.postFireErosionTonHa} t/ha
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'حماية بحيرة السد' : 'Target Dam Protection'}</span>
                    <span className="text-cyan-400 font-bold text-xs mt-1 block">
                      {selectedHotspot.catchmentAr}
                    </span>
                    <span className="text-slate-500 text-[10px] mt-0.5 block">
                      {isAr ? 'خطر الإطماء:' : 'Silt Risk:'} {selectedHotspot.siltRiskTonYear.toLocaleString()} {isAr ? 'طن/سنة' : 't/yr'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'نوع التدخل الهندسي' : 'Engineering Category'}</span>
                    <span className="text-yellow-400 font-bold text-xs mt-1 block uppercase">
                      {selectedHotspot.interventionType.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 text-[10px] mt-0.5 block">
                      {selectedHotspot.priorityAr}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs">
                  <span className="text-emerald-400 font-bold block mb-1 font-mono">
                    📋 {isAr ? 'دفتر الشروط الهندسية للميدان (BAER Field Specifications):' : 'Field Engineering Implementation Specifications:'}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {selectedHotspot.interventionType === 'contour_felling' && (
                      isAr
                        ? 'قطع وتثبيت جذوع الأشجار المحترقة بأقطار تتراوح بين 20 إلى 35 سم على خطوط الكنتور بمسافات رأسية 6-8 أمتار، وتدعيمها بأوتاد فولاذية، مصحوبة بتغطية بالقش الزراعي النظيف (Straw Mulch) بمعدل 2.5 طن/هكتار لحماية سطح التربة من الطاقة الحركية لقطرات المطر وكسر طبقة الشمع الكارهة للماء.'
                        : 'Contour log felling using 20-35 cm diameter trunks secured with rebar stakes at 6-8 m vertical intervals, accompanied by weed-free straw mulching at 2.5 t/ha to absorb raindrop impact energy and disrupt hydrophobic surface seals.'
                    )}
                    {selectedHotspot.interventionType === 'check_dam' && (
                      isAr
                        ? 'إنشاء سدود ترشيحية جابيونية من الشباك المعدنية المجلفنة والصخور المفككة بارتفاع 1.5 إلى 2.0 م في قيعان الشعاب والأخاديد الرئيسية لتهدئة سرعة الجريان السطحي واحتجاز الرسوبيات الخشنة ومنع تآكل القاع والجوانب قبل وصولها لبحيرة السد.'
                        : 'Construction of galvanized wire gabion and loose-rock check dams (1.5 - 2.0 m high) across high-gradient gullies to dissipate hydraulic flow velocity, retain coarse sediment, and prevent channel incision before reaching the reservoir.'
                    )}
                    {selectedHotspot.interventionType === 'warning_system' && (
                      isAr
                        ? 'تركيب مجسات استشعار صوتي وزلزالي دقيقة في أعالي الأودية لرصد السيول الوحلية (Debris Flows) فور انطلاقها، وربطها بغرفة عمليات الحماية المدنية ومديرية الأشغال العمومية لإغلاق المحاور الطرقية الساحلية تلقائياً وتشغيل صفارات الإنذار للسكان المحليين.'
                        : 'Installation of early-warning acoustic and seismic geophone sensors on upper torrential channels to detect debris-flow initiation in real-time, triggering automated sirens and road closures via Civil Protection emergency network.'
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Python Implementation Code Snippet (from prompt) */}
            <div className="mt-6 p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    geo_engine/post_fire/baer_hotspots.py • extract_erosion_hotspots()
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode('baer_py', JIJEL_PYTHON_CODE_SNIPPETS.hotspotExtraction)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                >
                  {copiedCodeKey === 'baer_py' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeKey === 'baer_py' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                {JIJEL_PYTHON_CODE_SNIPPETS.hotspotExtraction}
              </pre>
            </div>

            {/* BAER Engineering Intervention Descriptions Reference Guide */}
            <div className="mt-6 p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                {isAr ? 'دليل التدابير الهندسية العاجلة لحماية سدود جيجل (BAER Strategy Reference):' : 'BAER Emergency Technical Interventions for Jijel Dams Protection:'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 border border-[#1E293B] rounded-lg">
                  <span className="font-bold text-amber-300 block mb-1">
                    🌲 1. سدود جذوع الأشجار الكفافية (Contour Log Felling - LEBs)
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {isAr
                      ? 'قطع جذوع الأشجار المحترقة وتثبيتها أفقياً على المنحدرات بزوايا كفافية لاحتجاز ما يصل إلى 75% من الرسوبيات المتدفقة ومنع تشكل الأخاديد العميقة نحو مجرى وادي جن جن.'
                      : 'Felling burned tree trunks positioned on the contour to create sediment storage traps and break slope length on steep gradients.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-950/70 border border-[#1E293B] rounded-lg">
                  <span className="font-bold text-cyan-300 block mb-1">
                    🪨 2. سدود الجابيون والترشيح (Gully Check Dams)
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {isAr
                      ? 'إنشاء سدود ترشيحية صخرية وسلال جابيونية في قيعان الأودية والشعاب الفرعية المطلة على سد تابلوط وبوسيابة لتهدئة طاقة السيول واحتجاز الكتل الصخرية.'
                      : 'Constructing loose-rock and gabion check dams across primary torrent beds to dissipate kinetic velocity and retain coarse debris.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-950/70 border border-[#1E293B] rounded-lg">
                  <span className="font-bold text-emerald-300 block mb-1">
                    🌾 3. التغطية بالقش والبذر الهيدروليكي (Straw Mulching)
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {isAr
                      ? 'نشر القش الزراعي بمعدل 2 إلى 2.5 طن/هكتار لحماية سطح التربة من طاقة صدم قطرات المطر وكسر الغشاء الشمعي الكاره للماء على منحدرات تاكسنة وبني ياجيس.'
                      : 'Spreading certified weed-free agricultural straw (2.5 t/ha) over high burn severity soils to prevent raindrop splash and rill formation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Smart BAER Technical Report Modal */}
      <SmartBaerReportModal
        isOpen={isBaerReportModalOpen}
        onClose={() => setIsBaerReportModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
