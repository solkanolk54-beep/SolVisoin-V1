import React, { useState } from 'react';
import { 
  Rocket, 
  Cpu, 
  Mountain, 
  BrainCircuit, 
  Server, 
  Database, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Flame,
  Globe,
  Radio,
  Share2
} from 'lucide-react';
import { Language } from '../../types';

interface GlobalRoadmapCockpitProps {
  lang: Language;
  onNavigateTab: (tabId: string) => void;
}

export const GlobalRoadmapCockpit: React.FC<GlobalRoadmapCockpitProps> = ({
  lang,
  onNavigateTab
}) => {
  const isAr = lang === 'ar';
  const [activeTier, setActiveTier] = useState<number>(1);

  const tiers = [
    {
      id: 1,
      titleAr: 'المحور الأول: النواة الهندسية والحوسبة عالية الأداء (C++20 HPC Core)',
      titleEn: 'Pillar 1: C++20 Core & SIMD High-Performance Computing',
      statusAr: 'مكتمل ومفعل بالكامل',
      statusEn: 'Production Ready',
      statusColor: 'emerald',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      targetTab: 'cpp-hpc',
      btnLabelAr: 'فتح وحدة C++ HPC والبنشمارك',
      btnLabelEn: 'Launch C++ HPC Benchmark',
      descriptionAr: 'إعادة كتابة محرك المعالجة المكانية والفيزيائية بلغة C++20 مع دعم تعليمات AVX-512 المتجهية وتوازي المهام بـ OpenMP، مع اعتماد بنية Apache Arrow المنعدمة النسخ لربط بايثون وويب أسيمبلي.',
      descriptionEn: 'Rewrite of heavy raster computation kernels in native C++20 with AVX-512 SIMD vectorization, OpenMP multithreading, and zero-copy Apache Arrow shared memory IPC.',
      kpis: [
        { labelAr: 'تسريع الحسابات', labelEn: 'Compute Speedup', val: '959.5x' },
        { labelAr: 'الإنتاجية', labelEn: 'Throughput', val: '1.13 GPix/s' },
        { labelAr: 'زمن المعالجة', labelEn: '16M Pixels Latency', val: '14.8 ms' }
      ]
    },
    {
      id: 2,
      titleAr: 'المحور الثاني: التصور الجغرافي ثلاثي الأبعاد ومحاكاة السيول (OpenGL / WebGL 2.0)',
      titleEn: 'Pillar 2: 3D Topographic & Fluid Dynamics GPU Simulation',
      statusAr: 'مكتمل ومفعل بالكامل',
      statusEn: 'Production Ready',
      statusColor: 'cyan',
      icon: <Mountain className="w-5 h-5 text-cyan-400" />,
      targetTab: 'terrain-3d',
      btnLabelAr: 'تشغيل محاكي التضاريس ثلاثي الأبعاد',
      btnLabelEn: 'Open 3D Terrain & Fluid Simulation',
      descriptionAr: 'محرك رسومي تفاعلي يعتمد على WebGL 2.0 و Three.js لمحاكاة حركة الجزيئات الفيزيائية للسيول وانجراف التربة (SPH Debris Flow) في أحواض سدود تابلوط وكيسير وبوسيابة مع التلوين الارتفاعي والإضاءة الظلية.',
      descriptionEn: 'GPU-accelerated 3D terrain simulation rendering digital elevation models of Jijel dam catchments, coupled with SPH-based debris and mudflow particle physics.',
      kpis: [
        { labelAr: 'جزيئات السائل اللحظية', labelEn: 'Live GPU Particles', val: '30,000' },
        { labelAr: 'معدل الإطارات', labelEn: 'Framerate', val: '60 FPS' },
        { labelAr: 'الدقة المكانية', labelEn: 'Mesh Vertices', val: '25.6K' }
      ]
    },
    {
      id: 3,
      titleAr: 'المحور الثالث: الشبكات العصبية الهجينة (Hybrid Deep Learning MLP + GRU)',
      titleEn: 'Pillar 3: Hybrid Deep Learning (Spatial MLP + Temporal GRU)',
      statusAr: 'مكتمل ومفعل بالكامل',
      statusEn: 'Production Ready',
      statusColor: 'purple',
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      targetTab: 'hybrid-dnn',
      btnLabelAr: 'عرض معمارية الشبكة ومختبر التنبؤ',
      btnLabelEn: 'Open Neural Visualizer & Forward Pass',
      descriptionAr: 'معمارية مزدوجة تدمج الخصائص المكانية الثابتة للأحواض عبر شبكة MLP مع السلاسل الزمنية المناخية عبر شبكة GRU للتنبؤ بذروة تدفق الفيضان، سرعة الوصول، وحجم الطمي المتراكم في السدود.',
      descriptionEn: 'Dual-stream spatial-temporal deep learning network fusing static GIS layers and antecedent rainfall sequences to forecast peak flood discharges and reservoir silt loads.',
      kpis: [
        { labelAr: 'معامل الكفاءة', labelEn: 'Nash-Sutcliffe (NSE)', val: '0.942' },
        { labelAr: 'المعاملات العصبية', labelEn: 'Total Parameters', val: '84.6K' },
        { labelAr: 'زمن الاستنتاج', labelEn: 'Inference Latency', val: '2.1 ms' }
      ]
    },
    {
      id: 4,
      titleAr: 'المحور الرابع: المنظومة السحابية الموزعة والإنذار المبكر (ANBT Sovereign Cloud)',
      titleEn: 'Pillar 4: Distributed Cloud GIS & National Early Warning Integration',
      statusAr: 'مفعل وجاهز للربط الميداني',
      statusEn: 'Operational Stack',
      statusColor: 'amber',
      icon: <Server className="w-5 h-5 text-amber-400" />,
      targetTab: 'post-fire',
      btnLabelAr: 'عرض تقرير إدارة المخاطر وتنبيه السدود',
      btnLabelEn: 'Open Strategic Risk & Dam Warning',
      descriptionAr: 'تكامل البنية الموزعة بين FastAPI وقواعد PostGIS المزودة بفهارس GiST المكانية، مع إرسال آلي لبرقيات الإنذار المبكر عبر بروتوكولات CAP لغرف عمليات الحماية المدنية والوكالة الوطنية للسدود ANBT.',
      descriptionEn: 'High-availability distributed cluster with PostGIS spatial indexing, BullMQ asynchronous workers, and automated Common Alerting Protocol (CAP) dispatches to Algerian authorities.',
      kpis: [
        { labelAr: 'تغطية السدود', labelEn: 'Dams Monitored', val: '3 Strategic' },
        { labelAr: 'زمن إرسال البرقية', labelEn: 'Dispatch Time', val: '< 500 ms' },
        { labelAr: 'توافق المعايير', labelEn: 'Standards', val: 'OGC / CAP' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/70 to-cyan-950/80 border border-emerald-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                SolVision v1.3.0 Global Roadmap
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                C++ Core • OpenGL 3D • MLP+GRU
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {isAr 
                ? 'خارطة طريق الارتقاء بالمنصة إلى المستويات الهندسية العالمية' 
                : 'Strategic Roadmap: Elevating SolVision to Global Sovereign Standards'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              {isAr
                ? 'تحويل البنية التقنية لمنصة SolVision نحو معمارية هجينة فائقة الأداء (High-Performance Hybrid Architecture)، تجمع بين معالجة البيانات المكانية الضخمة منخفضة المستوى بلغة C++، والنمذجة العصبية الزمنية المتقدمة (MLP + GRU)، مع محاكاة بصرية ثلاثية الأبعاد للسيول بـ OpenGL/WebGL 2.0 لحماية سدود ولاية جيجل.'
                : 'Comprehensive transformation towards a high-performance hybrid geospatial architecture uniting C++ low-level SIMD processing, GPU-driven 3D fluid simulations, and deep neural spatial-temporal forecasting for Algerian water security.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('terrain-3d')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition"
            >
              <Mountain className="w-4 h-4" />
              <span>{isAr ? 'محاكاة 3D للسيول' : '3D Terrain Sim'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('cpp-hpc')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'نواة C++ والبنشمارك' : 'C++ HPC Core'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tiers.map(tier => (
          <div
            key={tier.id}
            className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
              activeTier === tier.id
                ? 'border-emerald-500/60 ring-2 ring-emerald-500/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow">
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? tier.titleAr : tier.titleEn}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {isAr ? tier.statusAr : tier.statusEn}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? tier.descriptionAr : tier.descriptionEn}
            </p>

            {/* KPIs Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              {tier.kpis.map((kpi, kIdx) => (
                <div key={kIdx} className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 truncate">
                    {isAr ? kpi.labelAr : kpi.labelEn}
                  </div>
                  <div className="text-sm font-black text-cyan-300 font-mono mt-0.5">
                    {kpi.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={() => onNavigateTab(tier.targetTab)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 group"
              >
                <span>{isAr ? tier.btnLabelAr : tier.btnLabelEn}</span>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Global Architectural Ecosystem Schematic */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            {isAr ? 'المعمارية الهجينة المتكاملة لمنصة SolVision v1.3.0' : 'End-to-End Hybrid Architecture Ecosystem'}
          </h3>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تكامل أفقي ورأسي يضمن أعلى مستويات السيادة الرقمية وسرعة معالجة البيانات الجغرافية الضخمة'
              : 'Zero-copy high-throughput flow from raw satellite imagery to 3D GPU visualization'}
          </p>
        </div>

        {/* Pipeline Flow Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 space-y-1.5 text-center">
            <div className="text-[10px] font-mono text-emerald-400 font-bold">Layer 1: Low-Level Core</div>
            <div className="text-xs font-bold text-white">C++20 & OpenMP</div>
            <div className="text-[10px] text-slate-400">AVX-512 SIMD Parallel RUSLE & D8 Flow</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/40 space-y-1.5 text-center">
            <div className="text-[10px] font-mono text-purple-400 font-bold">Layer 2: Zero-Copy IPC</div>
            <div className="text-xs font-bold text-white">Apache Arrow</div>
            <div className="text-[10px] text-slate-400">Shared memory record batches (Zero Memcpy)</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/40 space-y-1.5 text-center">
            <div className="text-[10px] font-mono text-cyan-400 font-bold">Layer 3: Neural Engine</div>
            <div className="text-xs font-bold text-white">PyTorch MLP+GRU</div>
            <div className="text-[10px] text-slate-400">Spatial-Temporal flash flood & silt forecast</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-blue-500/40 space-y-1.5 text-center">
            <div className="text-[10px] font-mono text-blue-400 font-bold">Layer 4: Async Gateway</div>
            <div className="text-xs font-bold text-white">FastAPI & Python 3.12</div>
            <div className="text-[10px] text-slate-400">Non-blocking async endpoints & WebSockets</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 space-y-1.5 text-center">
            <div className="text-[10px] font-mono text-amber-400 font-bold">Layer 5: Spatial Database</div>
            <div className="text-xs font-bold text-white">PostgreSQL / PostGIS</div>
            <div className="text-[10px] text-slate-400">GiST R-Tree indexing & ST_Clip raster tiles</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 space-y-1.5 text-center">
            <div className="text-[10px] font-mono text-emerald-400 font-bold">Layer 6: Visualization</div>
            <div className="text-xs font-bold text-white">WebGL 2.0 / Three.js</div>
            <div className="text-[10px] text-slate-400">3D GPU terrain & SPH debris flow particles</div>
          </div>
        </div>
      </div>
    </div>
  );
};
