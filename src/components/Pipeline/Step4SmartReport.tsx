import React, { useState } from 'react';
import { 
  FileCheck2, 
  ArrowLeft, 
  Download, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  Droplets, 
  Sprout, 
  AlertCircle, 
  CheckCircle2, 
  Share2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { FarmRegion, Language, CalibratedPixel, AgronomicRecommendation } from '../../types';
import { calculateRusleK, classifyUsdaTexture } from '../../utils/geoCalculations';

interface Step4SmartReportProps {
  farm: FarmRegion;
  lang: Language;
  alpha: number;
  calibratedGrid: CalibratedPixel[];
  onPrev: () => void;
  onExportGeoJson: () => void;
}

export const Step4SmartReport: React.FC<Step4SmartReportProps> = ({
  farm,
  lang,
  alpha,
  calibratedGrid,
  onPrev,
  onExportGeoJson,
}) => {
  const isAr = lang === 'ar';
  const [isCopied, setIsCopied] = useState(false);

  // Mean calibrated values
  const meanSand = calibratedGrid.reduce((s, p) => s + p.calibrated.sandPercent, 0) / (calibratedGrid.length || 1);
  const meanSilt = calibratedGrid.reduce((s, p) => s + p.calibrated.siltPercent, 0) / (calibratedGrid.length || 1);
  const meanClay = calibratedGrid.reduce((s, p) => s + p.calibrated.clayPercent, 0) / (calibratedGrid.length || 1);
  const meanOm = calibratedGrid.reduce((s, p) => s + p.calibrated.organicMatterPercent, 0) / (calibratedGrid.length || 1);

  const rusle = calculateRusleK(meanSand, meanSilt, meanClay, meanOm);
  const texture = classifyUsdaTexture(meanSand, meanSilt, meanClay);

  // Estimated Available Water Capacity (AWC in mm per meter depth)
  const awcMmPerM = Math.round((meanSilt * 1.8 + meanClay * 0.9 + meanOm * 15 + (100 - meanSand) * 0.4));

  // Compute overall Soil Health Score (0 - 100)
  let healthScore = 70;
  if (meanOm > 2.5) healthScore += 12;
  else if (meanOm < 1.0) healthScore -= 15;
  if (farm.baseSoilGrids.phH2o >= 6.5 && farm.baseSoilGrids.phH2o <= 7.8) healthScore += 8;
  if (rusle.riskClass === 'Very Low' || rusle.riskClass === 'Low') healthScore += 10;
  else if (rusle.riskClass === 'High' || rusle.riskClass === 'Severe') healthScore -= 12;
  healthScore = Math.min(98, Math.max(35, healthScore));

  const recommendations: AgronomicRecommendation[] = [
    {
      category: 'erosion',
      titleEn: `Erosion Control: ${rusle.riskClass} Susceptibility Mitigation`,
      titleAr: `مكافحة الانجراف: تدابير الحد من مخاطر الفئة (${rusle.riskClassAr})`,
      descriptionEn: rusle.riskClass === 'High' || rusle.riskClass === 'Severe'
        ? 'Construct contour vegetative buffer strips and micro-terracing. Immediate winter cover cropping (Vetch + Barley) is required to shield fragile topsoil from rain detachment.'
        : 'Maintain permanent soil groundcover and avoid downhill tillage operations to preserve structural aggregate stability.',
      descriptionAr: rusle.riskClass === 'High' || rusle.riskClass === 'Severe'
        ? 'إنشاء أشرطة مصدات نباتية كونتورية ومدرجات حجرية لحجز الرواسب، مع زراعة محاصيل تغطية شتوية فورية لحماية التربة السطحية من الانجراف المطري.'
        : 'الحفاظ على غطاء نباتي دائم، وتجنب الحراثة في اتجاه الانحدار لحماية بنية الحبيبات من التفكك.',
      urgency: rusle.riskClass === 'High' || rusle.riskClass === 'Severe' ? 'high' : 'medium',
      icon: 'shield',
    },
    {
      category: 'fertilization',
      titleEn: 'Soil Organic Matter & Microbial Regeneration Plan',
      titleAr: 'خطة استعادة المادة العضوية والتسميد التجديدي',
      descriptionEn: `Current organic matter is ${meanOm.toFixed(1)}%. Apply 18-22 tonnes/ha of well-matured bovine/compost manure to raise SOC and lower the K-erodibility factor by ~25%.`,
      descriptionAr: `تبلغ نسبة المادة العضوية الحالية ${meanOm.toFixed(1)}%. يوصى بإضافة ١٨-٢٢ طن/هكتار من السماد العضوي المخمر لرفع الكربون العضوي وخفض معامل التآكل بنسبة ٢٥٪.`,
      urgency: meanOm < 2.0 ? 'high' : 'medium',
      icon: 'sprout',
    },
    {
      category: 'irrigation',
      titleEn: 'Hydrological Management & Water Retention',
      titleAr: 'إدارة الري وتحسين السعة الحقلية والاحتفاظ بالرطوبة',
      descriptionEn: `Estimated Available Water Capacity is ${awcMmPerM} mm/m. For ${farm.primaryCropEn}, schedule pulse-drip irrigation with tensiometers at 25cm and 50cm root zones.`,
      descriptionAr: `السعة المائية المتاحة المقدرة هي ${awcMmPerM} ملم/متر. يوصى باعتماد الري بالتنقيط النبضي مع مجسات رطوبة عند أعماق ٢٥ و ٥٠ سم لتجنب الإجهاد المائي.`,
      urgency: 'medium',
      icon: 'droplets',
    },
  ];

  const handleCopyReportSummary = () => {
    const text = `--- SolVision Smart Agronomic Report ---
Farm: ${farm.nameEn} (${farm.nameAr})
Region: ${farm.regionEn}
Projection: UTM Zone 31N (${farm.epsgCode})
Area: ${farm.areaHectares} ha
Calibrated Soil Texture: ${texture.en} (${texture.ar})
Sand: ${meanSand.toFixed(1)}% | Silt: ${meanSilt.toFixed(1)}% | Clay: ${meanClay.toFixed(1)}%
Organic Matter: ${meanOm.toFixed(1)}%
RUSLE K-Factor (Metric): ${rusle.kMetric.toFixed(4)} t·ha·h/(ha·MJ·mm)
Erodibility Hazard: ${rusle.riskClass} (${rusle.riskClassAr})
Water Retention (AWC): ${awcMmPerM} mm/m
Soil Health Score: ${healthScore}/100`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-1">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  {isAr ? 'المرحلة الرابعة' : 'Stage 04'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Smart Agronomic Synthesis</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? '٤. إصدار التقرير الذكي والتوصيات الزراعية'
                  : '4. Smart Agronomic Report & Soil Health Intelligence'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'توليد التوصيات الزراعية الميدانية، تحليل مؤشر صحة التربة، واستراتيجيات الحد من التآكل وتسميد المحاصيل المستهدفة.'
                  : 'Actionable agronomic advisory, erodibility risk mitigation, organic restoration planning, and GIS export.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto flex-wrap mt-3 md:mt-0">
            <button
              onClick={onPrev}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition w-full sm:w-auto active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? 'نموذج RUSLE' : 'Back to RUSLE'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition active:scale-95 cursor-pointer w-full sm:w-auto"
              title={isAr ? 'طباعة التقرير الفني' : 'Print Field Report'}
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'طباعة (PDF)' : 'Print (PDF)'}</span>
            </button>
            <button
              onClick={handleCopyReportSummary}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الملخص' : 'Copy Summary')}</span>
            </button>
            <button
              onClick={onExportGeoJson}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير GeoJSON' : 'Export GeoJSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Soil Health Score + Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Gauge */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isAr ? 'مؤشر جودة وصحة التربة' : 'Soil Health Index'}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-slate-800">
              <div
                className="absolute inset-0 rounded-full border-4 border-emerald-500 transition-all duration-1000"
                style={{
                  clipPath: `polygon(50% 50%, -50% -50%, ${healthScore}% -50%, ${healthScore}% 150%, -50% 150%)`,
                }}
              />
              <div className="text-center font-mono">
                <span className="text-4xl font-extrabold text-slate-100">{healthScore}</span>
                <span className="text-xs text-slate-400 block">/ 100</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-300">
            {healthScore >= 75
              ? (isAr ? 'حالة جيدة ومستقرة زراعياً' : 'Optimum Agro-Ecological State')
              : (isAr ? 'تتطلب تدخلاً لتحسين المادة العضوية' : 'Requires Organic Matter Amendment')}
          </div>
        </div>

        {/* Farm & Agronomic Metadata */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isAr ? farm.nameAr : farm.nameEn}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? farm.regionAr : farm.regionEn}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
              {farm.areaHectares} ha • {farm.epsgCode}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'قوام التربة' : 'Texture'}</span>
              <span className="text-slate-100 font-bold">{isAr ? texture.ar : texture.en}</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'معامل التآكل K' : 'RUSLE K'}</span>
              <span className="text-emerald-400 font-bold">{rusle.kMetric.toFixed(4)}</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'المادة العضوية' : 'Organic Matter'}</span>
              <span className="text-amber-400 font-bold">{meanOm.toFixed(2)}%</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'السعة المائية' : 'AWC Retention'}</span>
              <span className="text-cyan-400 font-bold">{awcMmPerM} mm/m</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80 text-xs text-slate-300">
            <span className="font-semibold text-emerald-400 block mb-0.5">
              {isAr ? 'المحصول المستهدف:' : 'Primary Target Crop:'}
            </span>
            {isAr ? farm.primaryCropAr : farm.primaryCropEn}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'التوصيات الفنية والهندسية الميدانية:' : 'Actionable Agronomic & Engineering Recommendations:'}</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
                    {rec.category === 'erosion' && <ShieldCheck className="w-4 h-4" />}
                    {rec.category === 'fertilization' && <Sprout className="w-4 h-4" />}
                    {rec.category === 'irrigation' && <Droplets className="w-4 h-4" />}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                    {isAr ? rec.titleAr : rec.titleEn}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    rec.urgency === 'high'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {rec.urgency === 'high' ? (isAr ? 'أولوية قصوى' : 'High Priority') : (isAr ? 'أولوية متوسطة' : 'Recommended')}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? rec.descriptionAr : rec.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
