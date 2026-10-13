import React, { useState } from 'react';
import { 
  Sprout, 
  FlaskConical, 
  Layers, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  FileText,
  Calendar,
  Check,
  Share2,
  TreePine,
  ShieldCheck
} from 'lucide-react';
import { FarmRegion, Language, FertilizerDosePlan } from '../../types';
import { calculateCropFertilizerPlan } from '../../utils/geoCalculations';

interface SmartFertilizerAdvisorProps {
  farm: FarmRegion;
  lang: Language;
}

export const SmartFertilizerAdvisor: React.FC<SmartFertilizerAdvisorProps> = ({
  farm,
  lang,
}) => {
  const isAr = lang === 'ar';

  // Crop type state
  const [selectedCrop, setSelectedCrop] = useState<'citrus' | 'wheat' | 'date_palm' | 'olive' | 'steppe_pastoral'>(
    farm.id.includes('mitidja') ? 'citrus' :
    farm.id.includes('biskra') ? 'date_palm' :
    farm.id.includes('mascara') ? 'olive' :
    farm.id.includes('steppe') ? 'steppe_pastoral' : 'wheat'
  );

  const [targetYield, setTargetYield] = useState<number>(
    farm.id.includes('mitidja') ? 35 :
    farm.id.includes('biskra') ? 12 :
    farm.id.includes('steppe') ? 8 : 45
  );

  const [copiedPrescription, setCopiedPrescription] = useState(false);

  // Mean borehole CEC or fallback
  const meanCec = farm.samples.length > 0
    ? farm.samples.reduce((s, b) => s + b.cec, 0) / farm.samples.length
    : 22.0;

  const plan: FertilizerDosePlan = calculateCropFertilizerPlan(
    selectedCrop,
    targetYield,
    farm.baseSoilGrids.organicMatterPercent,
    farm.baseSoilGrids.phH2o,
    meanCec
  );

  // Commercial fertilizer products equivalents
  // Urea 46% N, Triple Superphosphate (TSP) 46% P2O5, Potassium Sulfate (SOP) 50% K2O
  const ureaBagsHa = Math.round((plan.nitrogenN_kgHa / 0.46) / 50); // 50kg bags
  const tspBagsHa = Math.round((plan.phosphorusP2O5_kgHa / 0.46) / 50);
  const sopBagsHa = Math.round((plan.potassiumK2O_kgHa / 0.50) / 50);

  const totalFarmCompost = Math.round(plan.organicManureTonHa * farm.areaHectares);

  const handleCopyPrescription = () => {
    const text = `--- SolVision Smart Fertilizer Prescription ---
Farm: ${farm.nameEn} (${farm.nameAr})
Target Crop: ${plan.cropNameEn} (${plan.cropNameAr})
Target Yield: ${targetYield} t/ha
Soil CEC: ${meanCec.toFixed(1)} cmol/kg (${plan.cecRating})
Soil pH: ${farm.baseSoilGrids.phH2o} | Organic Matter: ${farm.baseSoilGrids.organicMatterPercent}%

Recommended Pure Nutrients per Hectare:
- Pure Nitrogen (N): ${plan.nitrogenN_kgHa} kg/ha (~${ureaBagsHa} bags Urea 46%)
- Phosphorus (P2O5): ${plan.phosphorusP2O5_kgHa} kg/ha (~${tspBagsHa} bags TSP 46%)
- Potassium (K2O): ${plan.potassiumK2O_kgHa} kg/ha (~${sopBagsHa} bags SOP 50%)
- Matured Organic Compost: ${plan.organicManureTonHa} tonnes/ha (Total farm: ${totalFarmCompost} t)

Soil Buffering Advisory:
${plan.phAdjustmentAdvice}`;

    navigator.clipboard.writeText(text);
    setCopiedPrescription(true);
    setTimeout(() => setCopiedPrescription(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 mt-1">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                  {isAr ? 'محرك التوصيات السمادية الذكي' : 'Smart Fertilizer Advisor'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">NPK Balance • CEC Leaching Safeguard • Soil pH Buffering</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'برنامج التسميد العضوي والمعدني المخصص (N-P-K & CEC)'
                  : 'Site-Specific Nutrient Prescription & Split Application Engine'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'دمج السعة التبادلية الكاتيونية (CEC)، المادة العضوية، ودرجة الحموضة لحساب الجرعات السمادية العضوية والمعدنية الدقيقة وتجنب غسيل الآزوت أو تثبيت الفوسفور.'
                  : 'Balances agronomic crop extraction against soil buffering capacity (CEC) and calcareous pH fixation to optimize fertilizer use efficiency (FUE).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={handleCopyPrescription}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition active:scale-95"
            >
              {copiedPrescription ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedPrescription ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الوصفة' : 'Copy Prescription')}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? 'طباعة الوصفة السمادية' : 'Print Prescription (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Crop & Target Yield Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Crop & Yield Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
            {isAr ? 'تحديد المحصول والإنتاج المستهدف:' : 'Target Crop & Yield Setting:'}
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">Select Crop:</label>
            <select
              aria-label="Select Target Crop"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500/50"
            >
              <option value="citrus">🍊 الحمضيات (Citrus - Orange/Clementine)</option>
              <option value="wheat">🌾 القمح الصلب والشعير (Durum Wheat & Barley)</option>
              <option value="date_palm">🌴 نخيل دقلة نور (Deglet Nour Date Palms)</option>
              <option value="olive">🫒 أشجار الزيتون (Olive Groves)</option>
              <option value="steppe_pastoral">🌱 الأعلاف السهبية والرعوية (Steppe Fodder)</option>
            </select>
          </div>

          <div className="space-y-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">{isAr ? 'المردود المستهدف:' : 'Target Yield:'}</span>
              <span className="font-mono text-teal-400 font-bold">{targetYield} t/ha</span>
            </div>
            <input
              type="range"
              min="5"
              max="65"
              step="1"
              value={targetYield}
              onChange={(e) => setTargetYield(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5 t/ha (Extensive)</span>
              <span>65 t/ha (High Density)</span>
            </div>
          </div>

          {/* Soil Baseline Indicators */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Soil CEC:</span>
              <span className="text-slate-200 font-bold">{meanCec.toFixed(1)} cmol/kg</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Soil pH:</span>
              <span className="text-cyan-400 font-bold">{farm.baseSoilGrids.phH2o}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Organic Matter:</span>
              <span className="text-emerald-400 font-bold">{farm.baseSoilGrids.organicMatterPercent}%</span>
            </div>
          </div>
        </div>

        {/* Center & Right 2 Cols: Pure Nutrients & Commercial Bags Output */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center justify-between">
            <span>{isAr ? 'الاحتياجات السمادية الصافية (Pure Nutrient Requirements):' : 'Pure Nutrient Prescription (kg/ha):'}</span>
            <span className="text-teal-400 font-bold">{plan.cropNameEn}</span>
          </h3>

          {/* 4 Nutrient Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            {/* Nitrogen */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'الآزوت الصافي (N)' : 'Pure Nitrogen (N)'}</span>
              <div className="text-2xl font-bold text-emerald-400">{plan.nitrogenN_kgHa}</div>
              <span className="text-[10px] text-slate-400 block">kg N / ha</span>
              <div className="text-[10px] text-emerald-500 pt-1 border-t border-slate-800">
                ~{ureaBagsHa} {isAr ? 'كيس يوريا 46%' : 'Urea 46% bags'}
              </div>
            </div>

            {/* Phosphorus */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'الفوسفور (P2O5)' : 'Phosphate (P2O5)'}</span>
              <div className="text-2xl font-bold text-teal-400">{plan.phosphorusP2O5_kgHa}</div>
              <span className="text-[10px] text-slate-400 block">kg P₂O₅ / ha</span>
              <div className="text-[10px] text-teal-500 pt-1 border-t border-slate-800">
                ~{tspBagsHa} {isAr ? 'كيس TSP 46%' : 'TSP 46% bags'}
              </div>
            </div>

            {/* Potassium */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'البوتاسيوم (K2O)' : 'Potash (K2O)'}</span>
              <div className="text-2xl font-bold text-cyan-400">{plan.potassiumK2O_kgHa}</div>
              <span className="text-[10px] text-slate-400 block">kg K₂O / ha</span>
              <div className="text-[10px] text-cyan-500 pt-1 border-t border-slate-800">
                ~{sopBagsHa} {isAr ? 'كيس SOP 50%' : 'SOP 50% bags'}
              </div>
            </div>

            {/* Organic Compost */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400 text-[10px] block">{isAr ? 'السماد العضوي المخمر' : 'Matured Compost'}</span>
              <div className="text-2xl font-bold text-amber-400">{plan.organicManureTonHa}</div>
              <span className="text-[10px] text-slate-400 block">t / ha</span>
              <div className="text-[10px] text-amber-500 pt-1 border-t border-slate-800">
                Total: {totalFarmCompost} t
              </div>
            </div>
          </div>

          {/* CEC Buffering and pH Advice Box */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'توجيهات السعة التبادلية الكاتيونية (CEC) وحموضة التربة:' : 'CEC Buffering & pH Advisory:'}</span>
            </div>
            <div className="text-slate-300 leading-relaxed font-mono text-[11px]">
              <div>• <strong>CEC Status:</strong> {isAr ? plan.cecRatingAr : plan.cecRating}</div>
              <div className="mt-1">• <strong>pH Buffering:</strong> {isAr ? plan.phAdjustmentAdviceAr : plan.phAdjustmentAdvice}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Application Schedule Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-400" />
          <span>{isAr ? 'جدول تجزئة الجرعات السمادية عبر المراحل الفينولوجية:' : 'Split Fertigation Schedule Across Phenological Stages:'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">{isAr ? 'المرحلة الفينولوجية' : 'Growth Stage'}</th>
                <th className="py-2.5 px-3">{isAr ? 'التوقيت الميداني' : 'Timing & Mode'}</th>
                <th className="py-2.5 px-3 text-emerald-400">N Share (%)</th>
                <th className="py-2.5 px-3 text-teal-400">P₂O₅ Share (%)</th>
                <th className="py-2.5 px-3 text-cyan-400">K₂O Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {plan.phases.map((ph, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {isAr ? ph.stageAr : ph.stageEn}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {isAr ? ph.timingAr : ph.timing}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{ph.nPct}% ({Math.round(plan.nitrogenN_kgHa * ph.nPct / 100)} kg/ha)</td>
                  <td className="py-2.5 px-3 font-bold text-teal-400">{ph.pPct}% ({Math.round(plan.phosphorusP2O5_kgHa * ph.pPct / 100)} kg/ha)</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{ph.kPct}% ({Math.round(plan.potassiumK2O_kgHa * ph.kPct / 100)} kg/ha)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
