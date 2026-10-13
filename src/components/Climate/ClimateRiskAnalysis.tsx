import React, { useState, useEffect, useMemo } from 'react';
import {
  SunMedium,
  CloudRain,
  Flame,
  Droplets,
  Calendar,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Download,
  Info,
  CheckCircle2,
  Grid3X3,
  Layers,
  Thermometer,
  Wind,
  Check,
  Share2,
  Compass,
  Sprout,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { FarmRegion, Language, CalibratedPixel, ClimateRiskAnalysisData, ClimateYearMonthCell } from '../../types';
import { 
  fetchOrGenerateClimateRiskData, 
  evaluateSpatialMicroParcelDroughtRisk,
  MicroParcelDroughtRisk,
  MONTH_NAMES_EN,
  MONTH_NAMES_AR
} from '../../utils/climateAnalysis';

interface ClimateRiskAnalysisProps {
  farm: FarmRegion;
  lang: Language;
  calibratedGrid?: CalibratedPixel[];
}

type HeatmapMetricMode = 'spi' | 'precip' | 'temp' | 'balance';

export const ClimateRiskAnalysis: React.FC<ClimateRiskAnalysisProps> = ({
  farm,
  lang,
  calibratedGrid = [],
}) => {
  const isAr = lang === 'ar';

  const [yearsCount, setYearsCount] = useState<number>(5);
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('spi');
  const [selectedCell, setSelectedCell] = useState<ClimateYearMonthCell | null>(null);
  const [selectedSpatialPixel, setSelectedSpatialPixel] = useState<MicroParcelDroughtRisk | null>(null);
  const [viewTab, setViewTab] = useState<'temporal' | 'spatial'>('temporal');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<'live_api' | 'calibrated_model'>('calibrated_model');
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [climateData, setClimateData] = useState<ClimateRiskAnalysisData | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Selected crop for sensitivity impact
  const [selectedCropKey, setSelectedCropKey] = useState<string>(
    farm.id.includes('mitidja') ? 'citrus' :
    farm.id.includes('biskra') ? 'date_palm' :
    farm.id.includes('mascara') ? 'olive' :
    farm.id.includes('steppe') ? 'pastoral' : 'wheat'
  );

  // Fetch climate data when farm or yearsCount changes
  const loadClimateData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchOrGenerateClimateRiskData(farm, yearsCount);
      setClimateData(res.data);
      setDataSource(res.source);
      setLatencyMs(res.latencyMs);

      // Select latest available month cell as default inspection
      if (res.data.historicalMatrix.cells.length > 0) {
        const lastRow = res.data.historicalMatrix.cells[res.data.historicalMatrix.cells.length - 1];
        if (lastRow.length > 0) {
          setSelectedCell(lastRow[lastRow.length - 1]);
        }
      }
    } catch {
      // Ignore error as fallback is built into helper
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClimateData();
  }, [farm.id, yearsCount]);

  // Spatial micro-parcel analysis
  const spatialRisks = useMemo<MicroParcelDroughtRisk[]>(() => {
    if (!climateData || calibratedGrid.length === 0) return [];
    return evaluateSpatialMicroParcelDroughtRisk(calibratedGrid, climateData);
  }, [calibratedGrid, climateData]);

  // Handle cell color calculation according to selected metric
  const getCellVisual = (cell: ClimateYearMonthCell) => {
    if (metricMode === 'spi') {
      switch (cell.severityGrade) {
        case 'extreme':
          return {
            bg: 'bg-rose-950/80 text-rose-200 border-rose-600/70 shadow-sm shadow-rose-950',
            label: `${cell.spiValue.toFixed(1)}`,
            sub: isAr ? 'جفاف استثنائي' : 'Extreme',
          };
        case 'severe':
          return {
            bg: 'bg-amber-950/80 text-amber-200 border-amber-600/70',
            label: `${cell.spiValue.toFixed(1)}`,
            sub: isAr ? 'جفاف شديد' : 'Severe',
          };
        case 'moderate':
          return {
            bg: 'bg-amber-900/50 text-amber-300 border-amber-500/40',
            label: `${cell.spiValue.toFixed(1)}`,
            sub: isAr ? 'جفاف معتدل' : 'Moderate',
          };
        case 'mild':
          return {
            bg: 'bg-yellow-950/40 text-yellow-300 border-yellow-600/30',
            label: `${cell.spiValue.toFixed(1)}`,
            sub: isAr ? 'عجز طفيف' : 'Mild',
          };
        case 'normal':
          return {
            bg: 'bg-slate-900/60 text-slate-300 border-slate-700/60',
            label: `${cell.spiValue.toFixed(1)}`,
            sub: isAr ? 'طبيعي' : 'Normal',
          };
        case 'wet':
          return {
            bg: 'bg-emerald-950/70 text-emerald-200 border-emerald-600/60',
            label: `+${cell.spiValue.toFixed(1)}`,
            sub: isAr ? 'رطب / فائض' : 'Wet',
          };
      }
    } else if (metricMode === 'precip') {
      const p = cell.precipMm;
      if (p <= 5) return { bg: 'bg-rose-950/90 text-rose-300 border-rose-800', label: `${p} mm`, sub: 'Arid' };
      if (p <= 20) return { bg: 'bg-amber-950/70 text-amber-300 border-amber-800', label: `${p} mm`, sub: 'Low' };
      if (p <= 45) return { bg: 'bg-slate-800/80 text-slate-200 border-slate-700', label: `${p} mm`, sub: 'Moderate' };
      if (p <= 80) return { bg: 'bg-cyan-950/60 text-cyan-200 border-cyan-700/50', label: `${p} mm`, sub: 'Good' };
      return { bg: 'bg-emerald-950/80 text-emerald-200 border-emerald-600', label: `${p} mm`, sub: 'Abundant' };
    } else if (metricMode === 'temp') {
      const t = cell.tempMaxC;
      if (t >= 38) return { bg: 'bg-red-950/90 text-red-200 border-red-600', label: `${t}°C`, sub: isAr ? 'لهيب شديد' : 'Heatwave' };
      if (t >= 32) return { bg: 'bg-amber-950/80 text-amber-200 border-amber-600', label: `${t}°C`, sub: isAr ? 'حار' : 'Hot' };
      if (t >= 24) return { bg: 'bg-yellow-950/50 text-yellow-300 border-yellow-700/40', label: `${t}°C`, sub: isAr ? 'دافئ' : 'Warm' };
      return { bg: 'bg-cyan-950/50 text-cyan-200 border-cyan-800', label: `${t}°C`, sub: isAr ? 'معتدل' : 'Mild' };
    } else {
      // Water Balance (approx P - PET)
      const p = cell.precipMm;
      const petProxy = Math.round(Math.max(30, cell.tempMaxC * 4.5));
      const bal = p - petProxy;
      if (bal <= -100) return { bg: 'bg-rose-950/90 text-rose-200 border-rose-700', label: `${bal} mm`, sub: isAr ? 'عجز حاد' : 'Severe Deficit' };
      if (bal <= -50) return { bg: 'bg-amber-950/70 text-amber-200 border-amber-700', label: `${bal} mm`, sub: isAr ? 'عجز' : 'Deficit' };
      if (bal <= 0) return { bg: 'bg-slate-850 text-slate-300 border-slate-700', label: `${bal} mm`, sub: isAr ? 'متوازن' : 'Near Balance' };
      return { bg: 'bg-teal-950/80 text-teal-200 border-teal-600', label: `+${bal} mm`, sub: isAr ? 'فائض' : 'Surplus' };
    }
  };

  const handleCopySummary = () => {
    if (!climateData) return;
    const text = isAr
      ? `تقرير تحليل مخاطر الجفاف والمناخ - منصة SolVision\nالمزرعة: ${farm.nameAr} (${farm.regionAr})\nمؤشر القحولة (AI): ${climateData.aridityIndex} (${climateData.aridityClassAr})\nمؤشر حساسية الجفاف: ${climateData.droughtVulnerabilityScore}/100 (${climateData.droughtVulnerabilityGradeAr})\nالمعدل السنوي للأمطار: ${climateData.annualPrecipMm} ملم\nأطول فترة جفاف متتالية (CDD): ${climateData.consecutiveDryDaysMax} يوماً\nأيام الإجهاد الحراري (>35°م): ${climateData.heatStressDaysAbove35C} يوماً\nتوصية الأقلمة: ${climateData.adaptationMeasures[0]?.titleAr}`
      : `SolVision Climate & Regional Drought Risk Report\nFarm: ${farm.nameEn} (${farm.regionEn})\nAridity Index (AI): ${climateData.aridityIndex} (${climateData.aridityClassEn})\nDrought Vulnerability Score: ${climateData.droughtVulnerabilityScore}/100 (${climateData.droughtVulnerabilityGradeEn})\nAnnual Mean Precipitation: ${climateData.annualPrecipMm} mm\nMax Consecutive Dry Days (CDD): ${climateData.consecutiveDryDaysMax} days\nHeat Stress Days (>35°C): ${climateData.heatStressDaysAbove35C} days\nKey Adaptation Priority: ${climateData.adaptationMeasures[0]?.titleEn}`;
    
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2400);
  };

  const handleExportJson = () => {
    if (!climateData) return;
    const exportPayload = {
      platform: 'SolVision Spatial Intelligence Platform',
      module: 'ClimateRiskAnalysis',
      generatedAt: new Date().toISOString(),
      farm: {
        id: farm.id,
        nameEn: farm.nameEn,
        nameAr: farm.nameAr,
        coordinates: farm.center,
        utmZone: farm.utmZone,
        epsgCode: farm.epsgCode,
        areaHectares: farm.areaHectares,
        primaryCrop: farm.primaryCropEn,
      },
      dataSource: dataSource,
      analysisHorizonYears: yearsCount,
      climateMetrics: {
        annualPrecipMm: climateData.annualPrecipMm,
        annualAvgTempC: climateData.annualAvgTempC,
        aridityIndex: climateData.aridityIndex,
        aridityClass: climateData.aridityClassEn,
        droughtVulnerabilityScore: climateData.droughtVulnerabilityScore,
        droughtVulnerabilityGrade: climateData.droughtVulnerabilityGradeEn,
        maxConsecutiveDryDays: climateData.consecutiveDryDaysMax,
        heatStressDaysAbove35C: climateData.heatStressDaysAbove35C,
      },
      historicalMatrix: climateData.historicalMatrix,
      adaptationMeasures: climateData.adaptationMeasures,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solvision-climate-drought-risk-${farm.id}-${yearsCount}yr.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Crop growth critical windows
  const cropSchedules: Record<string, {
    nameEn: string;
    nameAr: string;
    criticalMonthsEn: string;
    criticalMonthsAr: string;
    criticalMonthsIdx: number[];
    vulnerabilityNoteEn: string;
    vulnerabilityNoteAr: string;
    waterRequirementMm: number;
  }> = {
    citrus: {
      nameEn: 'Citrus (Clementine & Orange)',
      nameAr: 'الحمضيات (كليمونتين وبرتقال)',
      criticalMonthsEn: 'May – July (Flowering & Fruit Setting)',
      criticalMonthsAr: 'ماي – جويلية (مرحلة التزهير وعقد الثمار)',
      criticalMonthsIdx: [4, 5, 6],
      vulnerabilityNoteEn: 'Severe drought and sirocco wind during June causes massive fruitlet drop. Requires drip scheduling to maintain soil tension < 35 cbar.',
      vulnerabilityNoteAr: 'الجفاف ورياح الشهيلي خلال جوان يتسببان في سقوط الثمار الصغيرة. يتطلب ضبط الري بالتنقيط للحفاظ على الشد الرطوبي دون 35 سنتيبار.',
      waterRequirementMm: 750,
    },
    wheat: {
      nameEn: 'Durum Wheat & Cereals',
      nameAr: 'القمح الصلب والحبوب',
      criticalMonthsEn: 'March – May (Stem Elongation & Grain Filling)',
      criticalMonthsAr: 'مارس – ماي (الاستطالة وامتلاء الحبوب)',
      criticalMonthsIdx: [2, 3, 4],
      vulnerabilityNoteEn: 'Terminal heat and spring rain deficit shrivels grains, slashing yields by up to 60%. Supplemental irrigation (1-2 applications) is vital.',
      vulnerabilityNoteAr: 'نقص أمطار الربيع وموجات الحر المتأخرة تؤدي إلى ضمور الحبوب وخفض المردود بنسبة 60%. الري التكميلي حاسم.',
      waterRequirementMm: 420,
    },
    olive: {
      nameEn: 'Olive Groves',
      nameAr: 'أشجار الزيتون',
      criticalMonthsEn: 'June – August (Pit Hardening & Oil Synthesis)',
      criticalMonthsAr: 'جوان – أوت (تصلب النواة وتراكم الزيت)',
      criticalMonthsIdx: [5, 6, 7],
      vulnerabilityNoteEn: 'Drought-hardy, but prolonged dry spells trigger alternate bearing (alternate year yield collapse). Deficit irrigation boosts oil yield.',
      vulnerabilityNoteAr: 'شجرة متحملة، لكن الجفاف المطول يفاقم ظاهرة المعاومة. تطبيق الري الناقص يرفع جودة ونسبة الزيت.',
      waterRequirementMm: 380,
    },
    date_palm: {
      nameEn: 'Deglet Nour Date Palms',
      nameAr: 'نخيل دقلة نور',
      criticalMonthsEn: 'July – September (Fruit Ripening & Rutab Stage)',
      criticalMonthsAr: 'جويلية – سبتمبر (تضخم ونضج الرطب)',
      criticalMonthsIdx: [6, 7, 8],
      vulnerabilityNoteEn: 'Extreme evaporative demand (>10 mm/day). Requires continuous artesian or basin irrigation to prevent fruit dry-out.',
      vulnerabilityNoteAr: 'تبخر يومي فائق يفوق 10 ملم/يوم. يحتاج رياً منتظماً في الأحواض لمنع جفاف وتخشب التمور.',
      waterRequirementMm: 1450,
    },
    pastoral: {
      nameEn: 'Steppe Alfa & Pastoral Rangelands',
      nameAr: 'الحلفاء ومراعي السهوب',
      criticalMonthsEn: 'February – April (Spring Regrowth)',
      criticalMonthsAr: 'فيفري – أفريل (انطلاق النموات الربيعية)',
      criticalMonthsIdx: [1, 2, 3],
      vulnerabilityNoteEn: 'Consecutive dry years trigger desertification and collapse of palatable forage biomass. Rangeland resting is required.',
      vulnerabilityNoteAr: 'توالي سنوات الجفاف يسرع التصحر وانهيار الكتلة العلفية. تطبيق إراحة المراعي والتشجير الرعوي أمر ملح.',
      waterRequirementMm: 250,
    },
  };

  const currentCropInfo = cropSchedules[selectedCropKey] || cropSchedules.wheat;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <SunMedium className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
                {isAr ? 'تحليل مخاطر الجفاف والمناخ الإقليمي' : 'Regional Climate & Drought Risk Analysis'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isAr ? 'مصفوفة الرستر الحراري' : 'Risk Heatmap'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono flex items-center gap-1.5 ${
                dataSource === 'live_api'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'live_api' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                {dataSource === 'live_api'
                  ? (isAr ? 'أرشيف Open-Meteo المباشر' : 'Live Open-Meteo Archive')
                  : (isAr ? 'نموذج محطة الأرصاد المعاير' : 'Calibrated Regional Baseline')}
                {latencyMs > 0 && <span className="opacity-70 text-[10px]">({latencyMs}ms)</span>}
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {isAr
                ? `تقييم متقدم لمخاطر الجفاف الزراعي والهيدرولوجي لمزرعة ${farm.nameAr} (${farm.regionAr}) استناداً إلى سجلات الأمطار التاريخية، درجات الحرارة القصوى، ومؤشر SPI، مدمجة مع سعة احتفاظ التربة بالمياه.`
                : `Advanced agro-hydrological drought susceptibility evaluation for ${farm.nameEn} (${farm.regionEn}) analyzing multi-year precipitation deficits, extreme temperature stress, and SPI indices coupled with soil moisture buffering capacity.`}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Horizon Selector */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="px-2 text-slate-400 text-[11px]">
                {isAr ? 'النافذة:' : 'Horizon:'}
              </span>
              {[3, 5, 10].map((y) => (
                <button
                  key={y}
                  onClick={() => setYearsCount(y)}
                  className={`px-2.5 py-1 rounded font-mono transition-all ${
                    yearsCount === y
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {y} {isAr ? 'سنوات' : 'Yrs'}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={loadClimateData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              title={isAr ? 'تحديث البيانات المناخية' : 'Refresh meteorological data'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الملخص' : 'Copy Summary')}</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJson}
              disabled={!climateData}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs flex items-center gap-1.5 transition-colors font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير JSON' : 'Export JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Gauges & Drought Susceptibility Indicators */}
      {climateData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Drought Vulnerability Score */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {isAr ? 'مؤشر حساسية الجفاف الإقليمي' : 'Drought Vulnerability Score'}
              </span>
              <ShieldAlert className={`w-4 h-4 ${
                climateData.droughtVulnerabilityScore >= 75 ? 'text-rose-400' :
                climateData.droughtVulnerabilityScore >= 55 ? 'text-amber-400' :
                climateData.droughtVulnerabilityScore >= 35 ? 'text-yellow-400' : 'text-emerald-400'
              }`} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                climateData.droughtVulnerabilityScore >= 75 ? 'text-rose-400' :
                climateData.droughtVulnerabilityScore >= 55 ? 'text-amber-400' :
                climateData.droughtVulnerabilityScore >= 35 ? 'text-yellow-400' : 'text-emerald-400'
              }`}>
                {climateData.droughtVulnerabilityScore}
              </span>
              <span className="text-slate-500 text-xs font-mono">/ 100</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-medium ml-auto ${
                climateData.droughtVulnerabilityScore >= 75 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                climateData.droughtVulnerabilityScore >= 55 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                climateData.droughtVulnerabilityScore >= 35 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isAr ? climateData.droughtVulnerabilityGradeAr : climateData.droughtVulnerabilityGradeEn}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  climateData.droughtVulnerabilityScore >= 75 ? 'bg-gradient-to-r from-amber-500 to-rose-500' :
                  climateData.droughtVulnerabilityScore >= 55 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                  climateData.droughtVulnerabilityScore >= 35 ? 'bg-gradient-to-r from-emerald-500 to-yellow-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${climateData.droughtVulnerabilityScore}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {isAr
                ? `تخفيف بنسبة ${(farm.baseSoilGrids.organicMatterPercent * 3.5).toFixed(1)}% بفضل مادة التربة العضوية (${farm.baseSoilGrids.organicMatterPercent}%)`
                : `Buffered by ${(farm.baseSoilGrids.organicMatterPercent * 3.5).toFixed(1)}% via soil organic matter (${farm.baseSoilGrids.organicMatterPercent}%)`}
            </p>
          </div>

          {/* Card 2: Aridity Index (P / PET) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {isAr ? 'مؤشر القحولة المناخي (UNEP AI)' : 'UNEP Aridity Index (P / PET)'}
              </span>
              <SunMedium className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-cyan-300 tracking-tight">
                {climateData.aridityIndex.toFixed(2)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium ml-auto bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {isAr ? climateData.aridityClassAr : climateData.aridityClassEn}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>P: {climateData.annualPrecipMm} mm/yr</span>
              <span>•</span>
              <span>Tmax: {climateData.annualAvgTempC}°C</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {isAr ? 'الطلب البخري السنوي يفوق الهطول المطري' : 'Atmospheric demand exceeds total rainfall'}
            </p>
          </div>

          {/* Card 3: Consecutive Dry Days (CDD) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {isAr ? 'أطول فترة جفاف متتالية (CDD)' : 'Max Consecutive Dry Days (CDD)'}
              </span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-orange-400 tracking-tight">
                {climateData.consecutiveDryDaysMax}
              </span>
              <span className="text-slate-400 text-xs font-mono">{isAr ? 'يوماً متواصلاً' : 'days'}</span>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium ml-auto bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {climateData.consecutiveDryDaysMax > 90 ? (isAr ? 'إجهاد حاد' : 'Severe Spell') : (isAr ? 'موسمي اعتيادي' : 'Seasonal')}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(100, (climateData.consecutiveDryDaysMax / 150) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {isAr ? 'انعدام الأمطار الفعالة (<1 ملم/يوم) صيفاً' : 'Continuous rainless spell (<1 mm/day)'}
            </p>
          </div>

          {/* Card 4: Heat Stress Days (>35°C) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {isAr ? 'أيام الإجهاد الحراري (>35°م)' : 'Heat Stress Days (Tmax ≥ 35°C)'}
              </span>
              <Thermometer className="w-4 h-4 text-red-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-red-400 tracking-tight">
                {climateData.heatStressDaysAbove35C}
              </span>
              <span className="text-slate-400 text-xs font-mono">{isAr ? 'يوماً / الفترة' : 'days'}</span>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium ml-auto bg-red-500/20 text-red-300 border border-red-500/30">
                {isAr ? 'موجات شهيلي' : 'Sirocco Risk'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${Math.min(100, (climateData.heatStressDaysAbove35C / 120) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {isAr ? 'تسارع استنزاف الرطوبة عبر نتح النبات' : 'Accelerates crop evapotranspiration & leaf burn'}
            </p>
          </div>
        </div>
      )}

      {/* Heatmap Navigation Toggle & Metric Modes */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('temporal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                viewTab === 'temporal'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isAr ? 'مصفوفة الجفاف التاريخية (شهور × سنوات)' : 'Multi-Year Drought Matrix (Months × Years)'}</span>
            </button>

            <button
              onClick={() => setViewTab('spatial')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                viewTab === 'spatial'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>{isAr ? 'رستر الحساسية المكاني للمزرعة (Micro-Parcel)' : 'Spatial Micro-Parcel Risk Heatmap'}</span>
            </button>
          </div>

          {/* Temporal Metric Switcher */}
          {viewTab === 'temporal' && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-lg text-xs">
              <span className="text-[11px] text-slate-400 px-2">
                {isAr ? 'المؤشر المعروض:' : 'Metric:'}
              </span>
              <button
                onClick={() => setMetricMode('spi')}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  metricMode === 'spi'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'مؤشر SPI (شدة الجفاف)' : 'SPI Drought Index'}
              </button>
              <button
                onClick={() => setMetricMode('precip')}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  metricMode === 'precip'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'الأمطار (ملم)' : 'Precipitation (mm)'}
              </button>
              <button
                onClick={() => setMetricMode('temp')}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  metricMode === 'temp'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'الحرارة القصوى (°م)' : 'Tmax (°C)'}
              </button>
              <button
                onClick={() => setMetricMode('balance')}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  metricMode === 'balance'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'الميزان المائي (P - PET)' : 'Water Balance (P - PET)'}
              </button>
            </div>
          )}
        </div>

        {/* View 1: Temporal Multi-Year Heatmap */}
        {viewTab === 'temporal' && climateData && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">
                {isAr
                  ? `عرض ${climateData.historicalMatrix.years.length} سنوات (${climateData.historicalMatrix.years[0]} - ${climateData.historicalMatrix.years[climateData.historicalMatrix.years.length - 1]}) عبر 12 شهراً`
                  : `Displaying ${climateData.historicalMatrix.years.length} years (${climateData.historicalMatrix.years[0]} - ${climateData.historicalMatrix.years[climateData.historicalMatrix.years.length - 1]}) across 12 calendar months`}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isAr ? 'انقر على أي خلية لفحص تفاصيل الشهر والآثار الزراعية' : 'Click any cell to inspect agro-meteorological anomalies'}
              </span>
            </div>

            {/* Heatmap Grid Table */}
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-center border-collapse min-w-[760px]">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-mono text-slate-400 bg-slate-950/40 border-b border-slate-800 text-left w-20">
                      {isAr ? 'السنة' : 'Year'}
                    </th>
                    {(isAr ? MONTH_NAMES_AR : MONTH_NAMES_EN).map((mName, mIdx) => (
                      <th
                        key={mIdx}
                        className="p-2 text-xs font-medium text-slate-300 bg-slate-950/40 border-b border-slate-800"
                      >
                        {mName}
                      </th>
                    ))}
                    <th className="p-2 text-xs font-mono text-slate-400 bg-slate-950/40 border-b border-slate-800 w-24">
                      {isAr ? 'الإجمالي/المعدل' : 'Annual'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {climateData.historicalMatrix.cells.map((yearRow, rIdx) => {
                    const yr = climateData.historicalMatrix.years[rIdx];
                    const annualP = Math.round(yearRow.reduce((acc, c) => acc + c.precipMm, 0));
                    const avgT = Math.round((yearRow.reduce((acc, c) => acc + c.tempMaxC, 0) / 12) * 10) / 10;
                    return (
                      <tr key={yr} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-2 text-xs font-mono font-bold text-slate-300 text-left">
                          {yr}
                        </td>
                        {yearRow.map((cell) => {
                          const visual = getCellVisual(cell);
                          const isSelected = selectedCell?.year === cell.year && selectedCell?.monthIdx === cell.monthIdx;

                          return (
                            <td key={cell.monthIdx} className="p-1">
                              <button
                                onClick={() => setSelectedCell(cell)}
                                className={`w-full h-14 rounded-lg border text-xs font-mono flex flex-col items-center justify-center transition-all cursor-pointer ${visual.bg} ${
                                  isSelected
                                    ? 'ring-2 ring-amber-400 scale-105 z-10 shadow-lg'
                                    : 'hover:scale-[1.03] hover:z-5'
                                }`}
                              >
                                <span className="font-bold tracking-tight text-[11px] sm:text-xs">
                                  {visual.label}
                                </span>
                                <span className="text-[9px] opacity-80 truncate max-w-full px-1">
                                  {visual.sub}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                        <td className="p-2 text-[11px] font-mono text-slate-400">
                          <div>{annualP} mm</div>
                          <div className="text-[10px] text-slate-500">{avgT}°C</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAr ? 'مقياس شدة الجفاف المعتمد عالمياً (WMO SPI Index):' : 'WMO Standardized Precipitation Index scale:'}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-rose-950 border border-rose-600 inline-block" />
                  <span className="text-rose-300">{isAr ? 'استثنائي (≤ -2.0)' : 'Extreme (≤ -2.0)'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-950 border border-amber-600 inline-block" />
                  <span className="text-amber-300">{isAr ? 'شديد (-1.5 إلى -1.9)' : 'Severe (-1.5 to -1.9)'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-900/50 border border-amber-500 inline-block" />
                  <span className="text-amber-400">{isAr ? 'معتدل (-1.0 إلى -1.4)' : 'Moderate (-1.0 to -1.4)'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 inline-block" />
                  <span className="text-slate-400">{isAr ? 'طبيعي (-0.9 إلى +0.9)' : 'Normal (-0.9 to +0.9)'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-600 inline-block" />
                  <span className="text-emerald-300">{isAr ? 'فائض / رطب (≥ +1.0)' : 'Wet (≥ +1.0)'}</span>
                </span>
              </div>
            </div>

            {/* Selected Month Inspector Drawer */}
            {selectedCell && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-bold text-slate-100 font-mono">
                      {isAr ? selectedCell.monthNameAr : selectedCell.monthName} {selectedCell.year} • {isAr ? 'فحص الحالة المناخية للشهر' : 'Monthly Agro-Climate Profile'}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
                    selectedCell.severityGrade === 'extreme' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    selectedCell.severityGrade === 'severe' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    selectedCell.severityGrade === 'moderate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    selectedCell.severityGrade === 'wet' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {isAr
                      ? `تصنيف SPI: ${selectedCell.spiValue > 0 ? '+' : ''}${selectedCell.spiValue.toFixed(2)}`
                      : `SPI Index: ${selectedCell.spiValue > 0 ? '+' : ''}${selectedCell.spiValue.toFixed(2)}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">{isAr ? 'الأمطار المسجلة' : 'Recorded Rain'}</span>
                    <span className="text-lg font-bold text-cyan-300 mt-1 block">{selectedCell.precipMm} mm</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">{isAr ? 'الحرارة القصوى' : 'Mean Max Temp'}</span>
                    <span className="text-lg font-bold text-red-300 mt-1 block">{selectedCell.tempMaxC} °C</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">{isAr ? 'التبخر التقديري (PET)' : 'Estimated PET'}</span>
                    <span className="text-lg font-bold text-amber-300 mt-1 block">
                      {Math.round(Math.max(30, selectedCell.tempMaxC * 4.6))} mm
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">{isAr ? 'صافي العجز المائي' : 'Water Balance'}</span>
                    <span className={`text-lg font-bold mt-1 block ${
                      (selectedCell.precipMm - Math.round(selectedCell.tempMaxC * 4.6)) < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {(selectedCell.precipMm - Math.round(selectedCell.tempMaxC * 4.6))} mm
                    </span>
                  </div>
                </div>

                {/* Agricultural Impact Note for Selected Month */}
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      {isAr ? 'التأثير الهيدرولوجي والزراعي المحتمل:' : 'Hydrological & Crop Vulnerability Insight:'}
                    </span>
                    <p className="mt-0.5 text-amber-200/90 leading-relaxed text-[11px]">
                      {selectedCell.spiValue <= -1.5
                        ? (isAr
                            ? `عجز مائي حاد تسبب في استنزاف مخزون رطوبة التربة إلى ما دون نقطة الذبول الدائم (PWP). في حال تزامن هذا الشهر مع مرحلة التزهير أو امتلاء الحبوب، فإن الخسارة المحصولية تتراوح بين 35% إلى 55% ما لم يُطبق الري التكميلي المنظم.`
                            : `Severe hydrological moisture deficit depleted root zone water content below the Permanent Wilting Point (PWP). If overlapping with flowering or grain-fill phases, yield penalties can exceed 40% without scheduled deficit fertigation.`)
                        : selectedCell.spiValue >= 1.0
                        ? (isAr
                            ? `فائض مطري ممتاز عزز إعادة تغذية المياه الجوفية ورفع رطوبة قطاع التربة السطحي (0-30 سم)، مع انخفاض مخاطر الإجهاد الحراري إلى الحد الأدنى.`
                            : `Favorable rainfall surplus recharged root zone water content and groundwater reserves, mitigating evaporative crop stress.`)
                        : (isAr
                            ? `ظروف مناخية شبه طبيعية مع توازن تدريجي بين هطول الأمطار ومعدلات البخر اليومية.`
                            : `Conditions within standard regional envelope with balanced seasonal moisture demand.`)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: Spatial Micro-Parcel Heatmap (Farm Grid) */}
        {viewTab === 'spatial' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-mono">
                {isAr
                  ? `تحليل الرستر المكاني لـ ${spatialRisks.length || 49} خلية بمزرعة ${farm.nameAr} بناءً على قوام التربة ونسبة المادة العضوية`
                  : `Spatial raster vulnerability breakdown across ${spatialRisks.length || 49} farm cells combining SoilGrids texture with regional climate stress`}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isAr ? 'انقر على أي خلية لفحص قدرة تخزين المياه (AWC)' : 'Click any cell to inspect soil water retention capacity'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Raster Grid Visualizer */}
              <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
                <div className="grid grid-cols-7 gap-1.5 w-full max-w-[420px] aspect-square p-2">
                  {spatialRisks.map((cell, idx) => {
                    const isSelected = selectedSpatialPixel?.cellId === cell.cellId;

                    let bgClass = 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300';
                    if (cell.spatialRiskGrade === 'Critical Risk') {
                      bgClass = 'bg-rose-950/90 border-rose-600 text-rose-200';
                    } else if (cell.spatialRiskGrade === 'High Risk') {
                      bgClass = 'bg-amber-950/90 border-amber-600 text-amber-200';
                    } else if (cell.spatialRiskGrade === 'Moderate Risk') {
                      bgClass = 'bg-yellow-950/60 border-yellow-600/60 text-yellow-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSpatialPixel(cell)}
                        className={`w-full h-full rounded border flex flex-col items-center justify-center font-mono text-[10px] transition-all cursor-pointer ${bgClass} ${
                          isSelected
                            ? 'ring-2 ring-amber-400 scale-105 z-10 shadow-lg'
                            : 'hover:scale-105 hover:z-5'
                        }`}
                      >
                        <span className="font-bold">{cell.spatialDroughtRiskScore}</span>
                        <span className="text-[8px] opacity-75">{cell.availableWaterCapacityMmM}mm</span>
                      </button>
                    );
                  })}
                </div>

                {/* Spatial Grid Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-rose-950 border border-rose-600 inline-block" />
                    <span>{isAr ? 'حرج (≥ 75)' : 'Critical (≥ 75)'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-950 border border-amber-600 inline-block" />
                    <span>{isAr ? 'مرتفع (55-74)' : 'High (55-74)'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-yellow-950 border border-yellow-600 inline-block" />
                    <span>{isAr ? 'معتدل (35-54)' : 'Moderate (35-54)'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-600 inline-block" />
                    <span>{isAr ? 'صامد (< 35)' : 'Resilient (< 35)'}</span>
                  </span>
                </div>
              </div>

              {/* Spatial Cell Inspector */}
              <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                {selectedSpatialPixel ? (
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-bold text-slate-100 font-mono">
                          {selectedSpatialPixel.cellId}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                        selectedSpatialPixel.spatialRiskGrade === 'Critical Risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        selectedSpatialPixel.spatialRiskGrade === 'High Risk' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        selectedSpatialPixel.spatialRiskGrade === 'Moderate Risk' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isAr ? selectedSpatialPixel.spatialRiskGradeAr : selectedSpatialPixel.spatialRiskGrade}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">{isAr ? 'سعة تخزين الماء (AWC)' : 'Available Water Capacity'}</span>
                        <span className="text-base font-bold text-cyan-300 mt-1 block">
                          {selectedSpatialPixel.availableWaterCapacityMmM} mm/m
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">{isAr ? 'أيام حتى الذبول (PWP)' : 'Days to Wilting Point'}</span>
                        <span className="text-base font-bold text-orange-400 mt-1 block">
                          {selectedSpatialPixel.daysToPermanentWiltingPoint} {isAr ? 'أيام' : 'days'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg col-span-2">
                        <span className="text-slate-400 text-[10px] block">{isAr ? 'تصنيف احتفاظ التربة بالماء' : 'Soil Water Retention Class'}</span>
                        <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                          {isAr ? selectedSpatialPixel.soilWaterRetentionRatingAr : selectedSpatialPixel.soilWaterRetentionRating}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs">
                      <span className="text-slate-400 block text-[11px] font-semibold mb-1">
                        {isAr ? 'العامل المحدد الرئيسي:' : 'Primary Soil Limiting Factor:'}
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {isAr ? selectedSpatialPixel.limitingFactorAr : selectedSpatialPixel.limitingFactorEn}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      GPS: {selectedSpatialPixel.lat.toFixed(4)}°N, {selectedSpatialPixel.lng.toFixed(4)}°E
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Grid3X3 className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-xs">
                      {isAr
                        ? 'انقر على أي خلية في شبكة الرستر لعرض السعة التخزينية ومقاومة الجفاف'
                        : 'Select any raster cell from the 7x7 grid to inspect pedological moisture retention parameters'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crop Sensitivity Analysis & Critical Windows */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              {isAr ? 'حساسية المحصول الزراعي ونوافذ الإجهاد المائي الحرجة' : 'Crop Water Sensitivity & Critical Drought Windows'}
            </h3>
          </div>

          {/* Crop Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-lg text-xs overflow-x-auto">
            {Object.entries(cropSchedules).map(([key, crop]) => (
              <button
                key={key}
                onClick={() => setSelectedCropKey(key)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-all ${
                  selectedCropKey === key
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? crop.nameAr : crop.nameEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium block">
              {isAr ? 'الاحتياج المائي الموسمي للمحصول (ETc)' : 'Seasonal Crop Water Need (ETc)'}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-300">
                {currentCropInfo.waterRequirementMm} mm
              </span>
              <span className="text-slate-500 text-xs">/ {isAr ? 'موسم' : 'season'}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {climateData && (
                <span>
                  {isAr
                    ? `العجز المائي الصافي بدون ري: ${Math.max(0, currentCropInfo.waterRequirementMm - climateData.annualPrecipMm)} ملم`
                    : `Net irrigation deficit: ${Math.max(0, currentCropInfo.waterRequirementMm - climateData.annualPrecipMm)} mm`}
                </span>
              )}
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium block">
              {isAr ? 'المرحلة الفينولوجية الأكثر حساسية' : 'Most Vulnerable Phenological Stage'}
            </span>
            <div className="mt-2 text-sm font-bold text-amber-300">
              {isAr ? currentCropInfo.criticalMonthsAr : currentCropInfo.criticalMonthsEn}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {isAr ? 'أي انقطاع للري في هذه الفترة يهدد المردود مباشرة' : 'Moisture deficit in this window slashes total yield'}
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium block">
              {isAr ? 'توصية استراتيجية الري' : 'Irrigation Strategy Recommendation'}
            </span>
            <div className="mt-2 text-sm font-bold text-emerald-300">
              {isAr ? 'الري الناقص المنظم (RDI) + تغطية الحوض' : 'Regulated Deficit (RDI) + Basal Mulch'}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {isAr ? 'توفير حتى 25% من المياه دون التأثير على الحجم' : 'Preserves up to 25% aquifer water with zero penalty'}
            </p>
          </div>
        </div>

        {/* Diagnostic note */}
        <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-200 block mb-1">
            {isAr ? 'التشخيص الهندسي والزراعي:' : 'Agro-Engineering Diagnosis:'}
          </span>
          {isAr ? currentCropInfo.vulnerabilityNoteAr : currentCropInfo.vulnerabilityNoteEn}
        </div>
      </div>

      {/* Adaptive Agro-Ecological Mitigation Recommendations */}
      {climateData && climateData.adaptationMeasures && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              {isAr ? 'حزمة التدابير الزراعية والهندسية للأقلمة مع الجفاف' : 'Agro-Engineering Drought Adaptation & Mitigation Portfolio'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {climateData.adaptationMeasures.map((measure, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/30 rounded-xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      measure.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {measure.priority} {isAr ? 'أولوية' : 'priority'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mb-1.5 leading-snug">
                    {isAr ? measure.titleAr : measure.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr ? measure.descriptionAr : measure.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
