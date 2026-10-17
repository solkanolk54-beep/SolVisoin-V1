import React, { useState } from 'react';
import { 
  Scissors, 
  FlaskConical, 
  ShieldAlert, 
  FileCheck2, 
  Check, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Cpu
} from 'lucide-react';
import { FarmRegion, Language, CalibratedPixel } from '../../types';
import { Step1Clipping } from './Step1Clipping';
import { Step2Calibration } from './Step2Calibration';
import { Step3RusleModel } from './Step3RusleModel';
import { Step4SmartReport } from './Step4SmartReport';

interface PipelineControllerProps {
  farm: FarmRegion;
  lang: Language;
  alpha: number;
  onAlphaChange: (alpha: number) => void;
  calibratedGrid: CalibratedPixel[];
  onExportGeoJson: () => void;
}

export type PipelineStage = 1 | 2 | 3 | 4;

export const PipelineController: React.FC<PipelineControllerProps> = ({
  farm,
  lang,
  alpha,
  onAlphaChange,
  calibratedGrid,
  onExportGeoJson,
}) => {
  const isAr = lang === 'ar';
  const [activeStage, setActiveStage] = useState<PipelineStage>(1);

  const stages: {
    stage: PipelineStage;
    titleEn: string;
    titleAr: string;
    tech: string;
    descEn: string;
    descAr: string;
    icon: React.ReactNode;
  }[] = [
    {
      stage: 1,
      titleEn: '1. Clipping & Reprojection',
      titleAr: '١. القص والتحويل (Clipping & Reprojection)',
      tech: 'Utilisation de Rasterio + GDAL + VRT',
      descEn: 'Windowed VRT crop saving memory & reprojection to UTM 31N',
      descAr: 'قص نافذة الحقل من VRT SoilGrids وتوفير الذاكرة مع إعادة الإسقاط إلى UTM 31N',
      icon: <Scissors className="w-4 h-4" />,
    },
    {
      stage: 2,
      titleEn: '2. Field Calibration (IDW / α Blend)',
      titleAr: '٢. المعايرة الحقلية (IDW / α Blend)',
      tech: 'IDW + SciPy + NumPy',
      descEn: 'Lab auger borehole calibration & α-blending calculation',
      descAr: 'معايرة العينات الحقلية بخوارزمية المسافة العكسية وحساب RMSE',
      icon: <FlaskConical className="w-4 h-4" />,
    },
    {
      stage: 3,
      titleEn: '3. Soil Erosion Model (RUSLE / USLE Nomograph)',
      titleAr: '٣. نموذج التآكل (USLE / Wischmeier Nomograph)',
      tech: 'RUSLE K-factor & USDA Texture',
      descEn: 'Wischmeier & Smith nomograph derivation & USDA triangle',
      descAr: 'حساب معامل قابلية الانجراف المائي K ومثلث قوام التربة',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      stage: 4,
      titleEn: '4. Smart Report (Summary & Export)',
      titleAr: '٤. التقرير الذكي (Summary & Export)',
      tech: 'Summary & Export (PDF / GeoJSON)',
      descEn: 'Soil health scorecard, NPK fertilization & geospatial export',
      descAr: 'بطاقة صحة التربة الشاملة، توصيات NPK وتصدير PDF / GeoJSON',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Step Interactive Workflow Grid (2x2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              {isAr
                ? 'مخطط سير العمل المكاني (Grid 2x2) • ٤ مراحل مترابطة'
                : 'Spatial Workflow Pipeline (2x2 Grid) • 4 Core Stages'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#1E293B]">
            {isAr ? `المرحلة النشطة: ${activeStage} من ٤` : `Active Stage: ${activeStage} / 4`}
          </div>
        </div>

        {/* 2x2 Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stages.map((st) => {
            const isActive = activeStage === st.stage;
            const isCompleted = activeStage > st.stage;
            const isUpcoming = activeStage < st.stage;

            return (
              <button
                key={st.stage}
                onClick={() => setActiveStage(st.stage)}
                className={`relative p-4 rounded-2xl border text-left rtl:text-right transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-950/30 via-[#0F172A] to-[#0B0F19] border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-950/40'
                    : isCompleted
                    ? 'bg-[#0F172A]/70 hover:bg-[#0F172A] border-[#1E293B] hover:border-slate-700 text-slate-300'
                    : 'bg-[#0B0F19]/60 hover:bg-[#0F172A]/50 border-[#1E293B]/70 text-slate-500 hover:text-slate-300'
                }`}
              >
                {/* Top row: Stage number, Icon & Status Pill */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                          : isCompleted
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800/80 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.stage}
                    </div>
                    <div>
                      <span
                        className={`text-[11px] font-mono uppercase font-bold tracking-wider ${
                          isActive
                            ? 'text-emerald-400'
                            : isCompleted
                            ? 'text-emerald-500/80'
                            : 'text-slate-500'
                        }`}
                      >
                        {isAr ? `المرحلة 0${st.stage}` : `Stage 0${st.stage}`}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>{isAr ? 'نشط حالياً' : 'Active'}</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{isAr ? 'مكتمل' : 'Completed'}</span>
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#0B0F19] text-slate-500 border border-[#1E293B]">
                        {isAr ? 'غير مفعل' : 'Inactive'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Technical Stack */}
                <div className="mt-3">
                  <div
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {isAr ? st.titleAr : st.titleEn}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                          : 'bg-[#0B0F19] text-slate-400 border border-[#1E293B]'
                      }`}
                    >
                      {st.tech}
                    </span>
                    <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {isAr ? st.descAr : st.descEn}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Stage Component with its Detail Card */}
      {activeStage === 1 && (
        <Step1Clipping
          farm={farm}
          lang={lang}
          onNext={() => setActiveStage(2)}
        />
      )}

      {activeStage === 2 && (
        <Step2Calibration
          farm={farm}
          lang={lang}
          alpha={alpha}
          onAlphaChange={onAlphaChange}
          calibratedGrid={calibratedGrid}
          onNext={() => setActiveStage(3)}
          onPrev={() => setActiveStage(1)}
        />
      )}

      {activeStage === 3 && (
        <Step3RusleModel
          farm={farm}
          lang={lang}
          alpha={alpha}
          calibratedGrid={calibratedGrid}
          onNext={() => setActiveStage(4)}
          onPrev={() => setActiveStage(2)}
        />
      )}

      {activeStage === 4 && (
        <Step4SmartReport
          farm={farm}
          lang={lang}
          alpha={alpha}
          calibratedGrid={calibratedGrid}
          onPrev={() => setActiveStage(3)}
          onExportGeoJson={onExportGeoJson}
        />
      )}
    </div>
  );
};
