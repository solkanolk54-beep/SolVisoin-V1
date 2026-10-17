import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sliders, 
  Activity, 
  FileText,
  AlertTriangle,
  Sparkles,
  TreePine
} from 'lucide-react';
import { FarmRegion, Language, CalibratedPixel } from '../../types';
import { calculateRusleK, classifyUsdaTexture } from '../../utils/geoCalculations';

interface Step3RusleModelProps {
  farm: FarmRegion;
  lang: Language;
  alpha: number;
  calibratedGrid: CalibratedPixel[];
  onNext: () => void;
  onPrev: () => void;
}

export const Step3RusleModel: React.FC<Step3RusleModelProps> = ({
  farm,
  lang,
  alpha,
  calibratedGrid,
  onNext,
  onPrev,
}) => {
  const isAr = lang === 'ar';

  const [structureCode, setStructureCode] = useState<number>(2); // 1-4
  const [permeabilityClass, setPermeabilityClass] = useState<number>(3); // 1-6
  const [simulatedOmBoost, setSimulatedOmBoost] = useState<number>(0.0); // What-if +OM%

  // Calculate mean texture from calibrated grid
  const meanCalSand = calibratedGrid.reduce((s, p) => s + p.calibrated.sandPercent, 0) / (calibratedGrid.length || 1);
  const meanCalSilt = calibratedGrid.reduce((s, p) => s + p.calibrated.siltPercent, 0) / (calibratedGrid.length || 1);
  const meanCalClay = calibratedGrid.reduce((s, p) => s + p.calibrated.clayPercent, 0) / (calibratedGrid.length || 1);
  const baseCalOm = calibratedGrid.reduce((s, p) => s + p.calibrated.organicMatterPercent, 0) / (calibratedGrid.length || 1);

  const effectiveOm = baseCalOm + simulatedOmBoost;

  // Calculate RUSLE with current interactive params
  const rusle = calculateRusleK(
    meanCalSand,
    meanCalSilt,
    meanCalClay,
    effectiveOm,
    structureCode,
    permeabilityClass
  );

  // Baseline without OM boost to show mitigation gain
  const baselineRusle = calculateRusleK(
    meanCalSand,
    meanCalSilt,
    meanCalClay,
    baseCalOm,
    structureCode,
    permeabilityClass
  );

  const erodibilityReductionPct = baselineRusle.kMetric > 0 
    ? Math.max(0, ((baselineRusle.kMetric - rusle.kMetric) / baselineRusle.kMetric) * 100)
    : 0;

  const texture = classifyUsdaTexture(meanCalSand, meanCalSilt, meanCalClay);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very Low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Low': return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'Moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Severe': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  {isAr ? 'المرحلة الثالثة' : 'Stage 03'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Revised Universal Soil Loss Equation (RUSLE)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? '٣. نموذج قابلية تآكل التربة (RUSLE - K-factor)'
                  : '3. RUSLE Soil Erodibility K-Factor Modeling'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'حساب معامل التآكل الأوتوماتيكي وفق معادلة Wischmeier & Smith بناءً على نسب الرمل والطمي والطين والمادة العضوية المعايرة، لتحديد درجة حساسية تربة الحقل للانجراف المائي.'
                  : 'Empirical soil erodibility nomograph modeling by Wischmeier & Smith based on silt, very fine sand, clay, organic matter, structure, and permeability.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
            <button
              onClick={onPrev}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition w-full sm:w-auto active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? 'المعايرة الحقلية' : 'Back to Calibration'}</span>
            </button>
            <button
              onClick={onNext}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <span>{isAr ? 'إصدار التقرير الذكي' : 'Next: Smart Report'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Main K-Factor Key Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric K Value */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1 relative overflow-hidden">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{isAr ? 'معامل التآكل المتري K' : 'K-Factor (SI Metric)'}</span>
            <span className="text-[10px] font-mono text-emerald-400">SI Units</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {rusle.kMetric.toFixed(4)}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            t·ha·h / (ha·MJ·mm)
          </div>
        </div>

        {/* Erodibility Risk Class */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'فئة خطورة الانجراف' : 'Erodibility Hazard'}
          </div>
          <div className="pt-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getRiskColor(rusle.riskClass)}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAr ? rusle.riskClassAr : rusle.riskClass}</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {isAr ? 'مقياس وشميير القياسي' : 'Wischmeier Nomograph Matrix'}
          </div>
        </div>

        {/* USDA Texture Class */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'قوام التربة (مثلث USDA)' : 'USDA Texture Class'}
          </div>
          <div className="text-lg font-bold text-slate-100">
            {isAr ? texture.ar : texture.en}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {isAr ? texture.en : texture.ar}
          </div>
        </div>

        {/* M Factor */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'معامل التوزيع الحبيبي M' : 'Grain Distribution Factor (M)'}
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {rusle.mFactor.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            M = (%Silt + %VFS) × (100 - %Clay)
          </div>
        </div>
      </div>

      {/* Grid: RUSLE Math Breakdown & Nomograph Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Equation Terms & Parameter Tuning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  {isAr ? 'تفكيك معادلة Wischmeier & Smith (1978)' : 'Wischmeier & Smith Formulation Breakdown'}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">K = F(Silt, Sand, Clay, OM, s, p)</span>
            </div>

            {/* Formula display */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
              <div className="text-amber-400 font-semibold">
                100 × K<sub>US</sub> = 2.1 × 10<sup>-4</sup> × M<sup>1.14</sup> × (12 - OM) + 3.25 × (s - 2) + 2.5 × (p - 3)
              </div>
              <div className="text-slate-400 text-[11px]">
                K<sub>SI</sub> = K<sub>US</sub> × 0.1317 [t·ha·h / (ha·MJ·mm)]
              </div>
            </div>

            {/* Interactive Inputs: Structure Code & Permeability Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Soil Structure code (s) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{isAr ? 'رتبة البنية التركيبية (Structure Code s):' : 'Soil Structure Code (s):'}</span>
                  <span className="text-amber-400 font-mono font-bold">{structureCode}</span>
                </label>
                <select
                  aria-label="Soil Structure Code"
                  value={structureCode}
                  onChange={(e) => setStructureCode(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value={1}>1 - {isAr ? 'حبيبي دقيق جداً (< 1mm)' : 'Very fine granular (< 1mm)'}</option>
                  <option value={2}>2 - {isAr ? 'حبيبي دقيق (1-2mm) [الافتراضي]' : 'Fine granular (1-2mm) [Default]'}</option>
                  <option value={3}>3 - {isAr ? 'حبيبي متوسط إلى خشن (2-10mm)' : 'Medium or coarse granular (2-10mm)'}</option>
                  <option value={4}>4 - {isAr ? 'كتلي، صفيحي أو مصمت (Massive)' : 'Blocky, platy or massive'}</option>
                </select>
              </div>

              {/* Permeability class (p) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{isAr ? 'فئة النفاذية المائية (Permeability Class p):' : 'Permeability Class (p):'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{permeabilityClass}</span>
                </label>
                <select
                  aria-label="Permeability Class"
                  value={permeabilityClass}
                  onChange={(e) => setPermeabilityClass(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value={1}>1 - {isAr ? 'سريعة جداً (> 130 mm/h)' : 'Rapid (> 130 mm/h)'}</option>
                  <option value={2}>2 - {isAr ? 'معتدلة إلى سريعة (60-130 mm/h)' : 'Moderate to rapid (60-130 mm/h)'}</option>
                  <option value={3}>3 - {isAr ? 'معتدلة (20-60 mm/h) [الافتراضي]' : 'Moderate (20-60 mm/h) [Default]'}</option>
                  <option value={4}>4 - {isAr ? 'بطيئة إلى معتدلة (5-20 mm/h)' : 'Slow to moderate (5-20 mm/h)'}</option>
                  <option value={5}>5 - {isAr ? 'بطيئة (1-5 mm/h)' : 'Slow (1-5 mm/h)'}</option>
                  <option value={6}>6 - {isAr ? 'بطيئة جداً (< 1 mm/h)' : 'Very slow (< 1 mm/h)'}</option>
                </select>
              </div>
            </div>

            {/* Fractions Distribution Bar */}
            <div className="space-y-2 pt-2">
              <div className="text-xs text-slate-400 flex justify-between">
                <span>{isAr ? 'توزيع حبيبات التربة المعايرة:' : 'Calibrated Granulometric Fractions:'}</span>
                <span className="font-mono text-slate-300">Total: 100%</span>
              </div>
              <div className="flex h-3.5 rounded-full overflow-hidden font-mono text-[9px] text-slate-950 font-bold">
                <div
                  className="bg-amber-400 flex items-center justify-center transition-all"
                  style={{ width: `${meanCalSand}%` }}
                  title={`Sand: ${meanCalSand.toFixed(1)}%`}
                >
                  {meanCalSand > 15 ? 'SAND' : ''}
                </div>
                <div
                  className="bg-teal-400 flex items-center justify-center transition-all"
                  style={{ width: `${meanCalSilt}%` }}
                  title={`Silt: ${meanCalSilt.toFixed(1)}%`}
                >
                  {meanCalSilt > 15 ? 'SILT' : ''}
                </div>
                <div
                  className="bg-orange-500 flex items-center justify-center transition-all"
                  style={{ width: `${meanCalClay}%` }}
                  title={`Clay: ${meanCalClay.toFixed(1)}%`}
                >
                  {meanCalClay > 15 ? 'CLAY' : ''}
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400">{isAr ? 'رمل:' : 'Sand:'} {meanCalSand.toFixed(1)}%</span>
                <span className="text-teal-400">{isAr ? 'طمي:' : 'Silt:'} {meanCalSilt.toFixed(1)}%</span>
                <span className="text-orange-400">{isAr ? 'طين:' : 'Clay:'} {meanCalClay.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Organic Matter Mitigation Simulation */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                {isAr ? 'محاكي رفع المادة العضوية (OM)' : 'Organic Amendment Simulator'}
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              {isAr
                ? 'اختبر كيف يقلل رفع نسبة الدبال والمادة العضوية (عبر التسميد العضوي وزراعة المحاصيل التغطوية) من معامل التآكل K.'
                : 'Simulate how adding compost and bio-amendments increases soil aggregate stability and lowers K-factor erodibility.'}
            </p>

            <div className="space-y-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{isAr ? 'إضافة مادة عضوية (ΔOM):' : 'Organic Matter Boost:'}</span>
                <span className="font-mono text-emerald-400 font-bold">+{simulatedOmBoost.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.1"
                value={simulatedOmBoost}
                onChange={(e) => setSimulatedOmBoost(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0.0% ({isAr ? 'الوضع الحالي' : 'Current'})</span>
                <span>+2.5% ({isAr ? 'تسميد مكثف' : 'Regenerative'})</span>
              </div>
            </div>

            {/* Impact Metric */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'المادة العضوية الفعالة:' : 'Effective OM:'}</span>
                <span className="text-emerald-300 font-bold">{effectiveOm.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'معامل K الأصلي:' : 'Original K-Metric:'}</span>
                <span className="text-slate-300">{baselineRusle.kMetric.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'معامل K بعد التحسين:' : 'Amended K-Metric:'}</span>
                <span className="text-emerald-400 font-bold">{rusle.kMetric.toFixed(4)}</span>
              </div>
              {simulatedOmBoost > 0 && (
                <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between text-emerald-400 font-bold">
                  <span>{isAr ? 'نسبة حماية التربة:' : 'Erosion Risk Drop:'}</span>
                  <span>-{erodibilityReductionPct.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
