import React, { useState, useMemo } from 'react';
import { 
  CloudRain, 
  Waves, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  BrainCircuit, 
  Activity, 
  Flame, 
  Droplet, 
  TrendingUp, 
  Radio, 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Compass, 
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { Language } from '../../types';
import { 
  JIJEL_HYDRO_CATCHMENTS, 
  generateDeepLearningHydrograph, 
  ML_FORECAST_SCRIPTS 
} from '../../data/floodForecastingData';

interface DeepLearningFloodForecastingProps {
  lang: Language;
  onFocusMapLocation?: (coords: { lat: number; lng: number; titleEn: string; titleAr: string }) => void;
  onOpenCopilot?: (queryPrompt?: string) => void;
}

export const DeepLearningFloodForecasting: React.FC<DeepLearningFloodForecastingProps> = ({
  lang,
  onFocusMapLocation,
  onOpenCopilot,
}) => {
  const isAr = lang === 'ar';

  const [selectedCatchmentId, setSelectedCatchmentId] = useState<string>('tabellout');
  const [radarRainfallMmH, setRadarRainfallMmH] = useState<number>(55);
  const [soilMoisturePct, setSoilMoisturePct] = useState<number>(82);
  const [isHydrophobic, setIsHydrophobic] = useState<boolean>(true);
  const [selectedModelTab, setSelectedModelTab] = useState<'lstm' | 'prophet'>('lstm');
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [isDispatchSent, setIsDispatchSent] = useState<boolean>(false);
  const [dispatchAgencyLogs, setDispatchAgencyLogs] = useState<string[]>([]);

  const catchment = JIJEL_HYDRO_CATCHMENTS[selectedCatchmentId] || JIJEL_HYDRO_CATCHMENTS.tabellout;

  // Compute live deep learning hydrograph and metrics
  const forecast = useMemo(() => {
    return generateDeepLearningHydrograph(
      selectedCatchmentId,
      radarRainfallMmH,
      soilMoisturePct,
      isHydrophobic
    );
  }, [selectedCatchmentId, radarRainfallMmH, soilMoisturePct, isHydrophobic]);

  const handleCopyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const handleDispatchEmergencyProtocol = () => {
    setIsDispatchSent(true);
    const timeNow = new Date().toLocaleTimeString();
    const logs = [
      isAr 
        ? `[${timeNow}] تم إرسال برقية إنذار أوتوماتيكية إلى غرفة عمليات الحماية المدنية لولاية جيجل (Code: FLASH-WARN-${catchment.id.toUpperCase()})`
        : `[${timeNow}] Automated Early Warning dispatched to Jijel Civil Protection Command Center (Code: FLASH-WARN-${catchment.id.toUpperCase()})`,
      isAr
        ? `[${timeNow}] إشعار إدارة سد ${catchment.damNameAr} والوكالة الوطنية للسدود (ANBT) لفتح مفرغات القاع والتحكم في الرسوبيات`
        : `[${timeNow}] Notified ${catchment.damNameEn} & National Dam Agency (ANBT) to open bottom sluice gates for sediment flushing`,
      isAr
        ? `[${timeNow}] إنذار محافظة الغابات ومديرية الأشغال العمومية لتأمين المحاور الطرقية الحساسة`
        : `[${timeNow}] Transmitted alerts to Forestry Conservation and Public Works regarding vulnerable road arteries`,
    ];
    setDispatchAgencyLogs(logs);
  };

  // Find max value for hydrograph chart scaling
  const maxQ = Math.max(
    ...forecast.hydrograph.map(p => Math.max(p.lstmForecastM3s, p.prophetForecastM3s, p.criticalThresholdM3s * 1.25)),
    120
  );

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                Deep Learning Hydrology • LSTM + Prophet
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-emerald-400">
                Jijel Dams Early Warning
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1.5">
              {isAr
                ? 'التنبؤ الآلي بالسيول والتدفقات الوحلية عبر التعلم العميق (Deep Learning Flood Forecasting)'
                : 'Deep Learning Spatiotemporal Flood & Mudflow Runoff Forecasting'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {isAr
                ? 'نمذجة استباقية بالذكاء الاصطناعي لحركة السيول الجرفية وحجم الرسوبيات قبل وصولها إلى السدود الاستراتيجية بجيجل استناداً لرادار الطقس الفوري وتشبع التربة.'
                : 'AI-driven spatiotemporal forecasting of flash floods and hyperconcentrated mudflows prior to reservoir impact based on Doppler radar, DEM accumulation, and post-fire soil hydrophobicity.'}
            </p>
          </div>

          {/* Quick Catchment Selector Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {Object.values(JIJEL_HYDRO_CATCHMENTS).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCatchmentId(c.id);
                  setIsDispatchSent(false);
                  setDispatchAgencyLogs([]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCatchmentId === c.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md font-bold'
                    : 'bg-[#0B0F19] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>{isAr ? c.nameAr : c.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Alert Status Banner */}
        <div className={`mt-4 p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          forecast.alertLevel === 'EMERGENCY_FLASH_FLOOD'
            ? 'bg-rose-950/50 border-rose-500/60 text-rose-200 shadow-xl shadow-rose-950/40'
            : forecast.alertLevel === 'WARNING'
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : forecast.alertLevel === 'WATCH'
            ? 'bg-yellow-950/30 border-yellow-500/40 text-yellow-200'
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              forecast.alertLevel === 'EMERGENCY_FLASH_FLOOD' 
                ? 'bg-rose-500 text-white animate-bounce' 
                : 'bg-slate-900 border border-slate-700'
            }`}>
              {forecast.alertLevel === 'EMERGENCY_FLASH_FLOOD' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  {isAr ? 'مستوى الإنذار الهيدرولوجي:' : 'Hydrological Alert Status:'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-950 border border-current">
                  {forecast.alertLevel}
                </span>
              </div>
              <h2 className="text-base font-bold mt-0.5">
                {forecast.alertLevel === 'EMERGENCY_FLASH_FLOOD' && (
                  isAr ? '⚠️ حالة طوارئ قصوى: خطر سيل وحلي ركامي جارف متوقع' : 'CRITICAL EMERGENCY: Debris Flash Flood Surge Detected'
                )}
                {forecast.alertLevel === 'WARNING' && (
                  isAr ? 'تحذير برتقالي: تجاوز عتبة التدفق الحرج نحو بحيرة السد' : 'WARNING: Discharge Exceeding Critical Reservoir Threshold'
                )}
                {forecast.alertLevel === 'WATCH' && (
                  isAr ? 'يقظة هيدرولوجية: تصاعد سريع في تصريف مياه الوادي' : 'WATCH: Rapid Upstream Runoff Accumulation'
                )}
                {forecast.alertLevel === 'NORMAL' && (
                  isAr ? 'الوضع طبيعي: التدفق ضمن المعدلات الهيدرولوجية الآمنة' : 'NORMAL: Runoff Within Safe Baseline Capacity'
                )}
              </h2>
              <p className="text-xs opacity-85 mt-0.5">
                {isAr
                  ? `الحوض المستهدف: ${catchment.damNameAr} • المساحة: ${catchment.catchmentAreaKm2} كم² • عتبة التدفق الحرج: ${catchment.criticalDischargeThresholdM3s} م³/ث`
                  : `Target: ${catchment.damNameEn} • Area: ${catchment.catchmentAreaKm2} km² • Critical Threshold: ${catchment.criticalDischargeThresholdM3s} m³/s`}
              </p>
            </div>
          </div>

          {/* Time to impact countdown badge & Action */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {isAr ? 'توقيت وصول الموجة الوحلية:' : 'Mudflow Arrival Lead Time:'}
              </span>
              <span className="text-lg font-bold text-cyan-300">
                {Math.floor(forecast.mudflowArrivalMinutes / 60)}h {forecast.mudflowArrivalMinutes % 60}m
              </span>
            </div>

            <button
              onClick={handleDispatchEmergencyProtocol}
              disabled={isDispatchSent}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                isDispatchSent
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              {isDispatchSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'تم إرسال برقية الإنذار للجهات' : 'Emergency Dispatch Transmitted'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 rtl:rotate-180" />
                  <span>{isAr ? 'إطلاق برقية الإنذار المبكر' : 'Dispatch Early Warning'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Agency Dispatch Confirmation Logs if sent */}
        {isDispatchSent && dispatchAgencyLogs.length > 0 && (
          <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-emerald-500/40 font-mono text-xs text-emerald-300 space-y-1 animate-fadeIn">
            <div className="font-bold flex items-center gap-1.5 text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'سجل الإرسال الآلي للغرف العملياتية (ولاية جيجل):' : 'Automated Dispatch Transmission Log:'}</span>
            </div>
            {dispatchAgencyLogs.map((log, idx) => (
              <div key={idx} className="pl-4 rtl:pr-4 rtl:pl-0 text-[11px] text-slate-300">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Left Controls & Gauges | Right Hydrograph Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Radar & Soil Moisture Inputs */}
        <div className="space-y-5">
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {isAr ? 'المدخلات الحية للنموذج (ML Inputs)' : 'Live Hydro-Meteorological Inputs'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Radar & Sensors
              </span>
            </div>

            {/* Input 1: Weather Radar Instant Rainfall Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  {isAr ? 'قراءة الرادار الجوي وهطول الأمطار الفوري:' : 'Doppler Radar Instant Rainfall:'}
                </span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {radarRainfallMmH} mm/h
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={radarRainfallMmH}
                onChange={(e) => setRadarRainfallMmH(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>5 mm/h (Light)</span>
                <span className="text-yellow-400">45 mm/h (Heavy Storm)</span>
                <span className="text-rose-400">120 mm/h (Cloudburst)</span>
              </div>
            </div>

            {/* Input 2: Soil Water Saturation Index (SWI %) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-emerald-400" />
                  {isAr ? 'معامل التشبع الرطوبي للتربة (SWI %):' : 'Topsoil Moisture Saturation (SWI):'}
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {soilMoisturePct}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="98"
                step="2"
                value={soilMoisturePct}
                onChange={(e) => setSoilMoisturePct(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>20% (Dry)</span>
                <span className="text-emerald-400">55% (Field Capacity)</span>
                <span className="text-rose-400">95% (Saturated Runoff)</span>
              </div>
            </div>

            {/* Input 3: Post-Fire Soil Hydrophobicity Toggle */}
            <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {isAr ? 'كراهية الماء الناتجة عن الحرائق:' : 'Post-Fire Soil Hydrophobicity:'}
                </span>
                <button
                  onClick={() => setIsHydrophobic(!isHydrophobic)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                    isHydrophobic
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {isHydrophobic ? (isAr ? 'مفعل (شمعية شديدة)' : 'Active (High)') : (isAr ? 'معطل' : 'Disabled')}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isAr
                  ? 'الطبقة الشمعية الكارهة للماء تقلل نفاذية التربة وتضاعف سرعة تحول الأمطار إلى سيول وحلية بنسبة +65%.'
                  : 'Waxy resin layers impede infiltration, accelerating rainfall runoff into flash surges by +65%.'}
              </p>
            </div>

            {/* Key Catchment Parameters Display */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'متوسط انحدار الحوض (Slope):' : 'Mean Basin Slope:'}</span>
                <span className="text-amber-400 font-bold">{catchment.meanSlopePct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'زمن التركيز الهيدرولوجي (Tc):' : 'Time of Concentration (Tc):'}</span>
                <span className="text-cyan-400 font-bold">{catchment.timeOfConcentrationHours} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'عتبة التدفق الحرج (Qcrit):' : 'Critical Q Threshold:'}</span>
                <span className="text-rose-400 font-bold">{catchment.criticalDischargeThresholdM3s} m³/s</span>
              </div>
            </div>

            {/* Button to ask Copilot about this scenario */}
            <button
              onClick={() => onOpenCopilot && onOpenCopilot(
                isAr
                  ? `ما هي توقعات السيول العاجلة والإنذار المبكر لحوض ${catchment.nameAr} عند هطول ${radarRainfallMmH} ملم/ساعة؟`
                  : `What is the flood forecast and mudflow alert for ${catchment.nameEn} under ${radarRainfallMmH} mm/h rainfall?`
              )}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحليل السيناريو مع SolAI Copilot' : 'Analyze Scenario with Copilot'}</span>
            </button>
          </div>

          {/* Critical Vulnerabilities Card */}
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {isAr ? 'المحاور والنقاط الحيوية المهددة بالسيول:' : 'Downstream Vulnerable Corridors:'}
            </h4>
            <div className="space-y-2">
              {(isAr ? catchment.targetKeyVulnerabilitiesAr : catchment.targetKeyVulnerabilitiesEn).map((vuln, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{vuln}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Interactive Hydrograph Chart & Model Architecture */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hydrograph Chart Container */}
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  {isAr ? 'هيدروغراف التدفق والتنبؤ الزمني بالسيول (Q vs Time)' : 'Discharge Hydrograph & Spatiotemporal Wave Projection'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'منحنى التدفق (م³/ثانية) ومقارنة نموذج LSTM مع نموذج Prophet خلال 6 ساعات'
                    : 'Instantaneous river discharge (m³/s) comparing LSTM Deep Learning vs Prophet model over 6 hours'}
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
                  LSTM
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-3 h-0.5 bg-purple-400 inline-block" />
                  Prophet
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-3 h-0.5 border-t border-dashed border-rose-400 inline-block" />
                  {isAr ? 'عتبة الخطر' : 'Qcrit'}
                </span>
              </div>
            </div>

            {/* Hydrograph SVG Chart */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="relative h-64 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map((yVal, idx) => (
                    <line
                      key={idx}
                      x1="40"
                      y1={200 - (yVal / maxQ) * 180}
                      x2="590"
                      y2={200 - (yVal / maxQ) * 180}
                      stroke="#1E293B"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Critical Threshold Line */}
                  <line
                    x1="40"
                    y1={200 - (catchment.criticalDischargeThresholdM3s / maxQ) * 180}
                    x2="590"
                    y2={200 - (catchment.criticalDischargeThresholdM3s / maxQ) * 180}
                    stroke="#F43F5E"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                  <text
                    x="585"
                    y={200 - (catchment.criticalDischargeThresholdM3s / maxQ) * 180 - 6}
                    fill="#F43F5E"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    Qcrit = {catchment.criticalDischargeThresholdM3s} m³/s
                  </text>

                  {/* LSTM Area Fill & Path */}
                  {(() => {
                    const points = forecast.hydrograph.map((p, idx) => {
                      const x = 40 + (idx / (forecast.hydrograph.length - 1)) * 550;
                      const y = 200 - (p.lstmForecastM3s / maxQ) * 180;
                      return `${x},${y}`;
                    });
                    const areaPoints = `40,200 ${points.join(' ')} 590,200`;
                    return (
                      <>
                        <polygon points={areaPoints} fill="url(#lstmGradient)" opacity="0.25" />
                        <polyline points={points.join(' ')} fill="none" stroke="#22D3EE" strokeWidth="2.5" />
                      </>
                    );
                  })()}

                  {/* Prophet Line Path */}
                  {(() => {
                    const points = forecast.hydrograph.map((p, idx) => {
                      const x = 40 + (idx / (forecast.hydrograph.length - 1)) * 550;
                      const y = 200 - (p.prophetForecastM3s / maxQ) * 180;
                      return `${x},${y}`;
                    });
                    return <polyline points={points.join(' ')} fill="none" stroke="#C084FC" strokeWidth="1.8" strokeDasharray="4 2" />;
                  })()}

                  {/* Data Points on LSTM Line */}
                  {forecast.hydrograph.map((p, idx) => {
                    const x = 40 + (idx / (forecast.hydrograph.length - 1)) * 550;
                    const y = 200 - (p.lstmForecastM3s / maxQ) * 180;
                    const isPeak = p.lstmForecastM3s === forecast.peakDischargeM3s;
                    return (
                      <g key={idx}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isPeak ? 5 : 3}
                          fill={isPeak ? '#F43F5E' : '#22D3EE'}
                          stroke="#0B0F19"
                          strokeWidth="1.5"
                        />
                        {isPeak && (
                          <text
                            x={x}
                            y={y - 10}
                            fill="#F43F5E"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            Peak: {p.lstmForecastM3s} m³/s
                          </text>
                        )}
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="lstmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Time axis labels */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 px-6">
                {forecast.hydrograph.map((p, idx) => {
                  if (idx % 2 !== 0 && idx !== forecast.hydrograph.length - 1) return null;
                  return (
                    <span key={idx} className="text-center">
                      {isAr ? p.timeLabelAr : p.timeLabel}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Metric Statistics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'ذروة التدفق القصوى (Qpeak):' : 'Peak Discharge:'}
                </span>
                <span className="text-base font-bold text-cyan-400">
                  {forecast.peakDischargeM3s} m³/s
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'زمن الوصول للذروة (Tp):' : 'Time to Peak:'}
                </span>
                <span className="text-base font-bold text-amber-400">
                  {forecast.timeToPeakMinutes} min ({Math.round((forecast.timeToPeakMinutes / 60) * 10) / 10} h)
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'نسبة تركيز الأوحال (Cv):' : 'Debris Concentration:'}
                </span>
                <span className="text-base font-bold text-rose-400">
                  {forecast.debrisConcentrationPct}%
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'حجم الرواسب المجروفة:' : 'Total Sediment Flush:'}
                </span>
                <span className="text-base font-bold text-purple-400">
                  {forecast.totalSedimentVolumeM3.toLocaleString()} m³
                </span>
              </div>
            </div>
          </div>

          {/* Model Topology & Code Snippets Tabs */}
          <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {isAr ? 'هندسة الشبكات العصبية وكود النماذج (ML Pipeline Architecture)' : 'Deep Learning Models & PyTorch Scripts'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedModelTab('lstm')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    selectedModelTab === 'lstm'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  PyTorch LSTM
                </button>
                <button
                  onClick={() => setSelectedModelTab('prophet')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    selectedModelTab === 'prophet'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Prophet Regressor
                </button>
              </div>
            </div>

            {/* Neural Network Architecture Diagram */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                <span>Input Tensors: [Radar_mm, SWI_pct, Slope, Hydrophobic_idx, Q_t-1]</span>
                <span className="text-emerald-400">Sequence Window: 24h (96 steps)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Layer 1</span>
                  <span className="font-bold text-cyan-300">LSTM (64 units)</span>
                  <span className="text-slate-500 block text-[9px]">Dropout 0.2</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Layer 2</span>
                  <span className="font-bold text-cyan-300">LSTM (32 units)</span>
                  <span className="text-slate-500 block text-[9px]">Nonlinear Relu</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Exogenous Additive</span>
                  <span className="font-bold text-purple-300">Prophet Fourier</span>
                  <span className="text-slate-500 block text-[9px]">Seasonal Seasonality</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Output Projection</span>
                  <span className="font-bold text-emerald-300">Dense (Horizon 12)</span>
                  <span className="text-slate-500 block text-[9px]">Q(t+15m ... 360m)</span>
                </div>
              </div>
            </div>

            {/* Code Snippet Viewer */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>
                    {selectedModelTab === 'lstm'
                      ? 'geo_engine/ml_models/flood_lstm.py'
                      : 'geo_engine/ml_models/prophet_runoff.py'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleCopyCode(
                      selectedModelTab,
                      selectedModelTab === 'lstm' ? ML_FORECAST_SCRIPTS.lstmPython : ML_FORECAST_SCRIPTS.prophetPython
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
                >
                  {copiedCodeKey === selectedModelTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeKey === selectedModelTab ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
                </button>
              </div>

              <pre className="p-3 bg-black/60 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56 leading-relaxed">
                {selectedModelTab === 'lstm' ? ML_FORECAST_SCRIPTS.lstmPython : ML_FORECAST_SCRIPTS.prophetPython}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
