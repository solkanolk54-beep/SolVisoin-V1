import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  FileText, 
  Compass, 
  Layers, 
  Waves, 
  TreePine, 
  Flame,
  AlertTriangle,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../../types';

interface SmartBaerReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SmartBaerReportModal: React.FC<SmartBaerReportModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const fullReportText = `التقرير الفني لإدارة مخاطر ما بعد الحرائق وحماية السدود الاستراتيجية بولاية جيجل
الصادر عن: منصة SolVision v1.3.0 (Geo-Engine) — النواة الهندسية للتحليل المكاني والزراعي الذكي
التاريخ: أكتوبر 2026
النطاق الجغرافي: الأحواض الساكبة لسدود تابلوط، كيسير، وبوسيابة (ولاية جيجل)
نظام الإسقاط المعتمد: UTM Zone 31N (EPSG:32631)

1. ملخص تنفيذي (Executive Summary)
تُعدّ ولاية جيجل القطب الأول للتساقط المطري في الجزائر (1000 - 1200 ملم/سنوياً)، وتتميز بتضاريس شديدة الانحدار. عقب حرائق الغابات، أدى احتراق الغطاء الحرجي والراتنجات إلى تشكل طبقة شمعية كارهة للماء (Soil Hydrophobicity) على عمق 1–5 سم. يتوقع أن ترفع هذه الظاهرة معدلات الجريان السطحي والسيول الطينية، مما يهدد بتوحل كلي أو جزئي للسدود الاستراتيجية الثلاثة (تابلوط، كيسير، بوسيابة) واختناق منشآت التصريف والمحاور الطرقية.

2. المنهجية العلمية والنماذج الرقمية المعتمدة (Methodology)
- معالجة الصور الفضائية (dNBR): استخدام نطاقات NIR (B08) و SWIR (B12) من القمر الصناعي Sentinel-2 لحساب dNBR = (NBR_pre - NBR_post) * 1000 وتحديد مناطق High Severity (كراهية الماء العالية).
- نمذجة الفيزياء المائية وتعديل معامل التربة (K): مضاعفة معامل تآكل التربة K * 2.0 وقفز معامل الغطاء النباتي C إلى 0.90، مع تخفيض رقم المنحنى CN ليعكس انعدام النفاذية المائية.
- نمذجة الانجراف (RUSLE): حوسبة المعادلة A = R * K * LS * C * P مع معامل مطرية R = 380 المشتق من البيانات المناخية التاريخية لجيجل.
- تحديد البؤر الحرجة (Hotspot Mapping): استخراج المناطق التي يتجاوز فيها الفقد التربي 50 طن/هكتار/سنة وتصدير مراكز ثقلها الجغرافي (Centroids).

3. نتائج التحليل الميداني حسب الأحواض الهيدروغرافية
- حوض سد تابلوط: المساحة 52,400 ha | معدل الانجراف 98.4 t/ha/yr | أقصى انجراف 124.5 t/ha/yr | الحجم التقديري للرسوبيات ~1,250,000 m³
- حوض سد كيسير: المساحة 18,200 ha | معدل الانجراف 112.0 t/ha/yr | أقصى انجراف 138.0 t/ha/yr | الحجم التقديري للرسوبيات ~450,000 m³
- حوض سد بوسيابة: المساحة 34,800 ha | معدل الانجراف 82.3 t/ha/yr | أقصى انجراف 105.2 t/ha/yr | الحجم التقديري للرسوبيات ~890,000 m³

4. جدول النقاط الساخنة وخطة التدخل العاجل (BAER Action Plan)
البؤرة 1: رافد وادي جن جن العلوي ومضائق تاكسنة
- الخطر: انجراف حرج (124.5 t/ha) يهدد مجرى السد الرئيسي.
- الإجراء الهندسي: سدود جذوع الأشجار الكفافية (LEBs) + التغطية بالقش (Straw Mulching).
- القطاعات المعنية: محافظة الغابات + الحماية المدنية + مديرية الموارد المائية (DRE).

البؤرة 2: منحدرات بني ياجيس المطلة على سد تابلوط
- الخطر: تهديد مباشر لمأخذ محطة التصفية والسعة الميتة لسد تابلوط (98.4 t/ha).
- الإجراء الهندسي: حواجز ترشيحية من الجابيون (Gully Check Dams) بقيعان الشعاب.
- القطاعات المعنية: مديرية الموارد المائية (DRE) + الوكالة الوطنية للسدود (ANBT).

البؤرة 3: مرتفعات جبل بوقرعة وخوانق العوانة (سد كيسير)
- الخطر: سيول وحلية مهددة للطريق الوطني الساحلي ومأخذ مياه الشرب (138.0 t/ha).
- الإجراء الهندسي: محطات إنذار صوتي مبكر + نشر القش الجوي وسدود جابيون.
- القطاعات المعنية: الحماية المدنية + مديرية الأشغال العمومية (DTP).`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([fullReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_technique_baer_jijel_solvision_2026.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0B0F19] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{isAr ? 'التقرير الفني لإدارة مخاطر ما بعد الحرائق وحماية سدود جيجل' : 'Official BAER Technical Report - Jijel Dams Protection'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  PDF / Print Ready
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-[#1E293B] rounded-lg text-xs font-mono font-medium transition cursor-pointer"
              title={isAr ? 'نسخ النص الكامل' : 'Copy Text'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy')}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-[#1E293B] rounded-lg text-xs font-mono font-medium transition cursor-pointer"
              title={isAr ? 'تحميل كملف نصي' : 'Download TXT'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition shadow cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer ml-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div id="printable-baer-report" className="printable-document p-6 sm:p-10 bg-[#0B0F19] text-slate-100 space-y-8 overflow-y-auto print:p-8 print:bg-white print:text-black">
          {/* Official Emblem & Document Header */}
          <div className="border-b-2 border-slate-700 print:border-black pb-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono tracking-widest uppercase text-slate-400 print:text-slate-700 font-semibold">
                  الجمهورية الجزائرية الديمقراطية الشعبية • Ministère des Ressources en Eau & Forêts
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-black mt-1 leading-tight">
                  التقرير الفني لإدارة مخاطر ما بعد الحرائق وحماية السدود الاستراتيجية بولاية جيجل
                </h1>
                <div className="text-xs text-emerald-400 print:text-emerald-800 font-mono font-bold mt-1">
                  الصادر عن: منصة SolVision v1.3.0 (Geo-Engine) — النواة الهندسية للتحليل المكاني والزراعي الذكي
                </div>
              </div>

              {/* Administrative Stamp Pill */}
              <div className="text-right font-mono text-xs text-slate-400 print:text-slate-800 shrink-0 p-3 bg-slate-950/70 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300">
                <div className="font-bold text-slate-200 print:text-black">مرجع الوثيقة: SOL-JJL-BAER-2026</div>
                <div>التاريخ: أكتوبر 2026</div>
                <div className="text-cyan-400 print:text-cyan-900 font-semibold">نظام الإسقاط: UTM Zone 31N (EPSG:32631)</div>
              </div>
            </div>

            <div className="text-xs text-slate-400 print:text-slate-700 font-mono flex items-center gap-2 flex-wrap pt-1">
              <span className="font-bold text-slate-300 print:text-black">النطاق الجغرافي:</span>
              <span>الأحواض الساكبة لسدود تابلوط، كيسير، وبوسيابة (ولاية جيجل)</span>
              <span>•</span>
              <span className="text-emerald-400 print:text-emerald-900">موجه إلى: DRE • Conservation des Forêts • ANBT • Protection Civile</span>
            </div>
          </div>

          {/* SECTION 1: EXECUTIVE SUMMARY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1E293B] print:border-slate-300 pb-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 print:bg-slate-200 print:text-black text-xs font-bold font-mono">
                1
              </span>
              <h2 className="text-base font-bold text-white print:text-black">
                1. ملخص تنفيذي (Executive Summary)
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-900 leading-relaxed text-justify">
              تُعدّ ولاية جيجل القطب الأول للتساقط المطري في الجزائر (1000 - 1200 ملم/سنوياً)، وتتميز بتضاريس شديدة الانحدار. عقب حرائق الغابات، أدى احتراق الغطاء الحرجي والراتنجات إلى تشكل طبقة شمعية كارهة للماء (Soil Hydrophobicity) على عمق 1–5 سم. يتوقع أن ترفع هذه الظاهرة معدلات الجريان السطحي والسيول الطينية، مما يهدد بتوحل كلي أو جزئي للسدود الاستراتيجية الثلاثة (تابلوط، كيسير، بوسيابة) واختناق منشآت التصريف والمحاور الطرقية.
            </p>

            {/* Metric Highlights Pill Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-950/70 print:bg-slate-100 border border-slate-800 print:border-slate-300">
                <span className="text-[11px] text-slate-400 print:text-slate-700 block font-mono">معدل التساقط السنوي الأقصى:</span>
                <span className="text-lg font-bold text-cyan-400 print:text-black font-mono">1000 - 1200 mm/an</span>
                <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-0.5">القطب المطري الأول في الجزائر</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 print:bg-slate-100 border border-slate-800 print:border-slate-300">
                <span className="text-[11px] text-slate-400 print:text-slate-700 block font-mono">عمق طبقة كراهية الماء (Hydrophobicity):</span>
                <span className="text-lg font-bold text-rose-400 print:text-black font-mono">1 – 5 cm</span>
                <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-0.5">طبقة شمعية عازلة من تفحم الراتنجات</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 print:bg-slate-100 border border-slate-800 print:border-slate-300">
                <span className="text-[11px] text-slate-400 print:text-slate-700 block font-mono">المنشآت الاستراتيجية المهددة:</span>
                <span className="text-lg font-bold text-amber-400 print:text-black font-mono">3 سدود هيدروليكية</span>
                <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-0.5">تابلوط (294M m³) • كيسير (68M m³) • بوسيابة (120M m³)</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: METHODOLOGY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1E293B] print:border-slate-300 pb-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 print:bg-slate-200 print:text-black text-xs font-bold font-mono">
                2
              </span>
              <h2 className="text-base font-bold text-white print:text-black">
                2. المنهجية العلمية والنماذج الرقمية المعتمدة (Methodology)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 print:text-black">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>معالجة الصور الفضائية (dNBR - Sentinel-2):</span>
                </div>
                <p className="text-slate-300 print:text-slate-900 leading-relaxed text-[11.5px]">
                  استخدام نطاقات NIR (B08) و SWIR (B12) من القمر الصناعي Sentinel-2 لحساب مؤشر التفحم <code className="font-mono bg-slate-900 print:bg-slate-200 px-1 py-0.5 rounded text-cyan-300 print:text-black">dNBR = (NBR_{`{pre}`} - NBR_{`{post}`}) × 1000</code> وتحديد مناطق High Severity (كراهية الماء العالية ≥ 660).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 print:text-black">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span>نمذجة الفيزياء المائية وتعديل معامل التربة (K):</span>
                </div>
                <p className="text-slate-300 print:text-slate-900 leading-relaxed text-[11.5px]">
                  مضاعفة معامل تآكل التربة <code className="font-mono bg-slate-900 print:bg-slate-200 px-1 py-0.5 rounded text-rose-300 print:text-black">K × 2.0</code> وقفز معامل الغطاء النباتي <code className="font-mono bg-slate-900 print:bg-slate-200 px-1 py-0.5 rounded text-amber-300 print:text-black">C إلى 0.90</code>، مع تخفيض رقم المنحنى الهيدرولوجي CN ليعكس انعدام النفاذية المائية وانطلاق السيول الجارفة.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 print:text-black">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>نمذجة الانجراف الهيدرولوجي (RUSLE Equation):</span>
                </div>
                <p className="text-slate-300 print:text-slate-900 leading-relaxed text-[11.5px]">
                  حوسبة المعادلة المكانية الشاملة <code className="font-mono bg-slate-900 print:bg-slate-200 px-1 py-0.5 rounded text-yellow-300 print:text-black">A = R · K · LS · C · P</code> مع معامل مطرية <code className="font-mono bg-slate-900 print:bg-slate-200 px-1 py-0.5 rounded text-cyan-300 print:text-black">R = 380</code> المشتق من البيانات المناخية التاريخية لولاية جيجل واستخلاص عامل الطبوغرافيا والانحدار LS من نموذج الارتفاع الرقمي DEM.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 print:text-black">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>تحديد البؤر الحرجة وتوليد النواقل (Hotspot Mapping):</span>
                </div>
                <p className="text-slate-300 print:text-slate-900 leading-relaxed text-[11.5px]">
                  استخراج المناطق التي يتجاوز فيها الفقد التربي 50 طن/هكتار/سنة وتصدير مراكز ثقلها الجغرافي (Centroids) بصيغة GeoJSON القياسية الموجهة للمصالح الميدانية.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: WATERSHED COMPARISON TABLE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1E293B] print:border-slate-300 pb-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 print:bg-slate-200 print:text-black text-xs font-bold font-mono">
                3
              </span>
              <h2 className="text-base font-bold text-white print:text-black">
                3. نتائج التحليل الميداني حسب الأحواض الهيدروغرافية
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-400">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-black font-bold border-b border-slate-800 print:border-slate-400">
                  <tr>
                    <th className="p-3">الحوض الساكب / السد</th>
                    <th className="p-3">المساحة (هكتار)</th>
                    <th className="p-3">معدل الانجراف المتوقع (t/ha/yr)</th>
                    <th className="p-3">أقصى قيمة انجراف بعد الحريق</th>
                    <th className="p-3">الحجم التقديري للرسوبيات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 font-mono text-[11px]">
                  <tr className="bg-slate-900/50 print:bg-white hover:bg-slate-900 transition">
                    <td className="p-3 font-sans font-bold text-slate-100 print:text-black">
                      حوض سد تابلوط (وادي جن جن)
                    </td>
                    <td className="p-3 text-slate-300 print:text-black">52,400 ha</td>
                    <td className="p-3 text-amber-400 print:text-black font-bold">98.4 t/ha/yr</td>
                    <td className="p-3 text-rose-400 print:text-black font-bold">124.5 t/ha/yr</td>
                    <td className="p-3 text-cyan-400 print:text-black font-bold">~1,250,000 m³</td>
                  </tr>
                  <tr className="bg-slate-900/30 print:bg-white hover:bg-slate-900 transition">
                    <td className="p-3 font-sans font-bold text-slate-100 print:text-black">
                      حوض سد كيسير (العوانة)
                    </td>
                    <td className="p-3 text-slate-300 print:text-black">18,200 ha</td>
                    <td className="p-3 text-amber-400 print:text-black font-bold">112.0 t/ha/yr</td>
                    <td className="p-3 text-rose-400 print:text-black font-bold">138.0 t/ha/yr</td>
                    <td className="p-3 text-cyan-400 print:text-black font-bold">~450,000 m³</td>
                  </tr>
                  <tr className="bg-slate-900/50 print:bg-white hover:bg-slate-900 transition">
                    <td className="p-3 font-sans font-bold text-slate-100 print:text-black">
                      حوض سد بوسيابة (الميلية)
                    </td>
                    <td className="p-3 text-slate-300 print:text-black">34,800 ha</td>
                    <td className="p-3 text-amber-400 print:text-black font-bold">82.3 t/ha/yr</td>
                    <td className="p-3 text-rose-400 print:text-black font-bold">105.2 t/ha/yr</td>
                    <td className="p-3 text-cyan-400 print:text-black font-bold">~890,000 m³</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: BAER ACTION PLAN HOTSPOTS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E293B] print:border-slate-300 pb-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 print:bg-slate-200 print:text-black text-xs font-bold font-mono">
                4
              </span>
              <h2 className="text-base font-bold text-white print:text-black">
                4. جدول النقاط الساخنة وخطة التدخل العاجل (BAER Action Plan)
              </h2>
            </div>

            <div className="space-y-3">
              {/* Hotspot 1 */}
              <div className="p-4 rounded-xl bg-slate-950/80 print:bg-slate-100 border-l-4 border-l-rose-500 border border-slate-800 print:border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100 print:text-black">
                    البؤرة 1: رافد وادي جن جن العلوي ومضائق تاكسنة
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 print:bg-slate-300 print:text-black border border-rose-500/40">
                    أولوية قصوى عاجلة (124.5 t/ha)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 font-bold block">الخطر المترتب:</span>
                    <span className="text-slate-200 print:text-black">
                      انجراف حرج (124.5 t/ha) يهدد مجرى السد الرئيسي والسعة التشغيلية.
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400 print:text-black font-bold block">الإجراء الهندسي الفوري:</span>
                    <span className="text-slate-200 print:text-black">
                      سدود جذوع الأشجار الكفافية (LEBs) + التغطية بالقش (Straw Mulching).
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400 print:text-black font-bold block">القطاعات المعنية بالتنفيذ:</span>
                    <span className="text-slate-300 print:text-black font-mono">
                      محافظة الغابات + الحماية المدنية + مديرية الموارد المائية (DRE).
                    </span>
                  </div>
                </div>
              </div>

              {/* Hotspot 2 */}
              <div className="p-4 rounded-xl bg-slate-950/80 print:bg-slate-100 border-l-4 border-l-amber-500 border border-slate-800 print:border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100 print:text-black">
                    البؤرة 2: منحدرات بني ياجيس المطلة على سد تابلوط
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 print:bg-slate-300 print:text-black border border-amber-500/40">
                    أولوية حرجة لحماية المأخذ (98.4 t/ha)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 font-bold block">الخطر المترتب:</span>
                    <span className="text-slate-200 print:text-black">
                      تهديد مباشر لمأخذ محطة التصفية والسعة الميتة لسد تابلوط (98.4 t/ha).
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400 print:text-black font-bold block">الإجراء الهندسي الفوري:</span>
                    <span className="text-slate-200 print:text-black">
                      حواجز ترشيحية من الجابيون (Gully Check Dams) بقيعان الشعاب والأخاديد.
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400 print:text-black font-bold block">القطاعات المعنية بالتنفيذ:</span>
                    <span className="text-slate-300 print:text-black font-mono">
                      مديرية الموارد المائية (DRE) + الوكالة الوطنية للسدود (ANBT).
                    </span>
                  </div>
                </div>
              </div>

              {/* Hotspot 3 */}
              <div className="p-4 rounded-xl bg-slate-950/80 print:bg-slate-100 border-l-4 border-l-rose-500 border border-slate-800 print:border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100 print:text-black">
                    البؤرة 3: مرتفعات جبل بوقرعة وخوانق العوانة (سد كيسير)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 print:bg-slate-300 print:text-black border border-rose-500/40">
                    خطر سيول وحلية على المحاور (138.0 t/ha)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 font-bold block">الخطر المترتب:</span>
                    <span className="text-slate-200 print:text-black">
                      سيول وحلية مهددة للطريق الوطني الساحلي ومأخذ مياه الشرب (138.0 t/ha).
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400 print:text-black font-bold block">الإجراء الهندسي الفوري:</span>
                    <span className="text-slate-200 print:text-black">
                      محطات إنذار صوتي مبكر + نشر القش الجوي وسدود ترشيحية جابيون.
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400 print:text-black font-bold block">القطاعات المعنية بالتنفيذ:</span>
                    <span className="text-slate-300 print:text-black font-mono">
                      الحماية المدنية + مديرية الأشغال العمومية (DTP).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OFFICIAL STAMPING & SIGNATURES BLOCK */}
          <div className="pt-6 border-t-2 border-slate-700 print:border-black space-y-4">
            <div className="text-xs font-bold text-slate-300 print:text-black font-mono">
              تأشيرات المصادقة والاعتماد التنفيذي المشترك (Visa & Approvals):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-center">
              <div className="p-3 bg-slate-950 print:bg-white border border-slate-800 print:border-slate-400 rounded-lg space-y-8">
                <span className="block font-bold text-slate-300 print:text-black">مديرية الموارد المائية</span>
                <span className="block text-[10px] text-slate-500 print:text-slate-600">[الختم والتوقيع]</span>
              </div>
              <div className="p-3 bg-slate-950 print:bg-white border border-slate-800 print:border-slate-400 rounded-lg space-y-8">
                <span className="block font-bold text-slate-300 print:text-black">محافظة الغابات</span>
                <span className="block text-[10px] text-slate-500 print:text-slate-600">[الختم والتوقيع]</span>
              </div>
              <div className="p-3 bg-slate-950 print:bg-white border border-slate-800 print:border-slate-400 rounded-lg space-y-8">
                <span className="block font-bold text-slate-300 print:text-black">وكالة السدود (ANBT)</span>
                <span className="block text-[10px] text-slate-500 print:text-slate-600">[الختم والتوقيع]</span>
              </div>
              <div className="p-3 bg-slate-950 print:bg-white border border-slate-800 print:border-slate-400 rounded-lg space-y-8">
                <span className="block font-bold text-slate-300 print:text-black">الحماية المدنية</span>
                <span className="block text-[10px] text-slate-500 print:text-slate-600">[الختم والتوقيع]</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 print:text-slate-600 pt-2 border-t border-slate-800/80 print:border-slate-300">
              <span>SolVision Geo-Engine v1.3.0 • Automated Hydrological BAER Protocol</span>
              <span>Generated in Jijel, Algeria • Timestamp: October 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
