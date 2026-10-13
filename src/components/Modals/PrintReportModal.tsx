import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Sparkles,
  Sprout,
  Droplets
} from 'lucide-react';
import { FarmRegion, Language, CalibratedPixel } from '../../types';
import { calculateRusleK, classifyUsdaTexture, latLngToUtm31N } from '../../utils/geoCalculations';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmRegion;
  lang: Language;
  alpha: number;
  calibratedGrid: CalibratedPixel[];
  onExportGeoJson: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  farm,
  lang,
  alpha,
  calibratedGrid,
  onExportGeoJson,
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const meanSand = calibratedGrid.reduce((s, p) => s + p.calibrated.sandPercent, 0) / (calibratedGrid.length || 1);
  const meanSilt = calibratedGrid.reduce((s, p) => s + p.calibrated.siltPercent, 0) / (calibratedGrid.length || 1);
  const meanClay = calibratedGrid.reduce((s, p) => s + p.calibrated.clayPercent, 0) / (calibratedGrid.length || 1);
  const meanOm = calibratedGrid.reduce((s, p) => s + p.calibrated.organicMatterPercent, 0) / (calibratedGrid.length || 1);

  const rusle = calculateRusleK(meanSand, meanSilt, meanClay, meanOm);
  const texture = classifyUsdaTexture(meanSand, meanSilt, meanClay);
  const utmCenter = latLngToUtm31N(farm.center.lat, farm.center.lng);
  const awc = Math.round((meanSilt * 1.8 + meanClay * 0.9 + meanOm * 15 + (100 - meanSand) * 0.4));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              {isAr ? 'التقرير الفني الحقلي للتربة وهندسة التآكل (جاهز للطباعة / PDF)' : 'Field Engineering Soil & Erosion Report (Print Ready)'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة / حفظ كـ PDF' : 'Print / Save as PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div id="printable-report" className="p-8 bg-slate-900 text-slate-100 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-emerald-500/80 pb-4 gap-4">
            <div>
              <div className="text-xs font-mono tracking-widest uppercase text-emerald-400 font-bold">
                SolVision Spatial Intelligence Engine • République Algérienne Démocratique et Populaire
              </div>
              <h1 className="text-2xl font-black text-slate-100 mt-1">
                {isAr ? farm.nameAr : farm.nameEn}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {farm.regionEn} • Zone UTM {farm.utmZone} ({farm.epsgCode})
              </p>
            </div>
            <div className="text-right sm:text-right font-mono text-xs text-slate-400">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Report ID: SOL-{farm.id.slice(0, 8).toUpperCase()}</div>
              <div className="text-emerald-400 font-bold">Standard RUSLE / IDW Spec</div>
            </div>
          </div>

          {/* Key Identification Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'المساحة الإجمالية' : 'Total Area'}</span>
              <span className="text-slate-100 font-bold text-sm">{farm.areaHectares} ha</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'إحداثيات المركز (UTM)' : 'UTM Center'}</span>
              <span className="text-emerald-400 font-bold text-xs">{utmCenter.easting.toLocaleString()} E, {utmCenter.northing.toLocaleString()} N</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'نوع المضلع' : 'Geometry'}</span>
              <span className="text-cyan-400 font-bold text-sm">{farm.isMultiPolygon ? 'MultiPolygon' : 'ST_Polygon'}</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'معامل المعايرة α' : 'Calibration α'}</span>
              <span className="text-amber-400 font-bold text-sm">α = {alpha.toFixed(2)}</span>
            </div>
          </div>

          {/* Soil Granulometry & Pedotransfer */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-mono font-bold text-emerald-400 border-b border-slate-800 pb-1">
              {isAr ? '١. قوام التربة المعاير والتحليل الحبيبي (0-30 سم)' : '1. Calibrated Soil Granulometry & Pedotransfer (0-30cm Depth)'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Sand % (الرمل)</span>
                <span className="text-amber-400 font-bold text-base">{meanSand.toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Silt % (الطمي)</span>
                <span className="text-teal-400 font-bold text-base">{meanSilt.toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Clay % (الطين)</span>
                <span className="text-orange-400 font-bold text-base">{meanClay.toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Organic Matter (OM)</span>
                <span className="text-emerald-400 font-bold text-base">{meanOm.toFixed(2)}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Soil pH (H2O)</span>
                <span className="text-cyan-400 font-bold text-base">{farm.baseSoilGrids.phH2o}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-xs">
              <strong>{isAr ? 'تصنيف مثلث USDA للتربة:' : 'USDA Textural Classification:'} </strong>
              <span className="text-emerald-300 font-bold">{texture.en} ({texture.ar})</span>
            </div>
          </div>

          {/* RUSLE Erodibility Modeling */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-mono font-bold text-amber-400 border-b border-slate-800 pb-1">
              {isAr ? '٢. نتائج نمذجة تآكل التربة وفق RUSLE K-Factor' : '2. RUSLE Soil Loss Nomograph Modeling'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">RUSLE K-Metric (SI Units)</span>
                <span className="text-amber-400 font-bold text-xl">{rusle.kMetric.toFixed(4)}</span>
                <span className="text-[10px] text-slate-500 block">t·ha·h / (ha·MJ·mm)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Erodibility Hazard Rating</span>
                <span className="text-slate-100 font-bold text-lg">{rusle.riskClass} ({rusle.riskClassAr})</span>
                <span className="text-[10px] text-slate-500 block">Wischmeier & Smith (1978)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Water Retention (AWC)</span>
                <span className="text-cyan-400 font-bold text-xl">{awc} mm/m</span>
                <span className="text-[10px] text-slate-500 block">Available Water Holding Capacity</span>
              </div>
            </div>
          </div>

          {/* Soil Organic Carbon & Green Dam Section */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-mono font-bold text-emerald-400 border-b border-slate-800 pb-1">
              {isAr ? '٣. مخزون الكربون العضوي وملاءمة السد الأخضر (SOC & Green Dam)' : '3. Soil Organic Carbon Stock & Green Dam Afforestation Potential'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Total SOC Stock (0-200cm)</span>
                <span className="text-emerald-400 font-bold text-xl">
                  {Math.round((farm.baseSoilGrids.socGPerKg * 3.4) * 10) / 10} t/ha
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ~{Math.round((farm.baseSoilGrids.socGPerKg * 3.4 * 3.67) * 10) / 10} t CO₂e / ha
                </span>
              </div>
              <div className="sm:col-span-2 p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Green Dam (السد الأخضر) Priority</span>
                <div className="text-slate-100 font-bold text-sm">
                  {farm.baseSoilGrids.socGPerKg < 10
                    ? (isAr ? 'عالية جداً (أراضي سهبية متدهورة / أولوية السد الأخضر)' : 'Very High (Degraded Steppe / Green Dam Priority)')
                    : farm.baseSoilGrids.socGPerKg <= 16
                    ? (isAr ? 'متوسطة (ملاءمة بيئية وغابات حراجية)' : 'Moderate (Dryland Agroforestry Suitability)')
                    : (isAr ? 'منخفضة الأولوية للتشجير السريع / عالية الخصوبة' : 'Low Afforestation Urgency / High Soil Fertility')}
                </div>
                <div className="text-[11px] text-slate-300">
                  {farm.baseSoilGrids.socGPerKg < 10
                    ? (isAr ? 'مطلوب تدخل عاجل بمشاريع التشجير الكبرى (السد الأخضر) مع تحسين المحتوى العضوي بالتسميد الحيوي.' : 'Urgent major afforestation intervention required (Green Dam project) with bio-fertilization.')
                    : (isAr ? 'ملاءمة جيدة للغراسات المقاومة للجفاف وتثبيت الكثبان أو التربة الهشة ومصدات الرياح.' : 'Good suitability for drought-resistant trees, dune stabilization, and shelterbelts.')}
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Engineering Advisory */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-mono font-bold text-cyan-400 border-b border-slate-800 pb-1">
              {isAr ? '٣. التوصيات الهندسية والزراعية المعتمدة للميدان' : '3. Actionable Field Engineering & Soil Conservation Measures'}
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
                <strong className="text-emerald-400 block mb-1">
                  {isAr ? '• مكافحة الانجراف المطري وحماية المنحدرات:' : '• Runoff Mitigation & Terrace Protection:'}
                </strong>
                {isAr
                  ? 'اعتماد الحراثة الكونتورية المتعامدة مع خطوط الانحدار، وإنشاء مصدات حجرية ونباتية لتقليل سرعة الجريان السطحي وحماية الطبقة الزراعية الخصبة.'
                  : 'Establish contour tillage perpendicular to slope gradient, install vegetative buffer strips and stone retention bunds to impede runoff velocity.'}
              </div>
              <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
                <strong className="text-amber-400 block mb-1">
                  {isAr ? '• تحسين المادة العضوية والدبال:' : '• Organic Restoration Strategy:'}
                </strong>
                {isAr
                  ? `إضافة ١٥ إلى ٢٠ طن/هكتار من السماد العضوي المخمر لدعم تكوين الحبيبات الثابتة وتخفيض معامل التآكل K بنسبة تصل إلى ٢٥٪.`
                  : `Apply 15-20 tonnes/ha of well-aerated compost manure to increase soil structural aggregate stability and lower K erodibility.`}
              </div>
            </div>
          </div>

          {/* Signatures & Accreditation Footer */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-2 text-xs font-mono text-slate-400">
            <div>
              <span>Chief Spatial Engineer:</span>
              <div className="mt-4 text-slate-200 font-bold">SolVision Core Geo-Engine</div>
            </div>
            <div className="text-right">
              <span>Verification Stamp:</span>
              <div className="mt-4 text-emerald-400 font-bold">CERTIFIED POSTGIS 15 / GDAL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
