import React, { useState } from 'react';
import { 
  Scissors, 
  FlaskConical, 
  ShieldAlert, 
  FileCheck2, 
  Check, 
  Sparkles,
  ArrowRight,
  Clock
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

  const stages: { stage: PipelineStage; titleEn: string; titleAr: string; icon: React.ReactNode; tag: string }[] = [
    {
      stage: 1,
      titleEn: 'Clipping & Reproject',
      titleAr: '١. القص والتحويل',
      icon: <Scissors className="w-4 h-4" />,
      tag: 'Rasterio / UTM 31N',
    },
    {
      stage: 2,
      titleEn: 'Field Calibration',
      titleAr: '٢. المعايرة الحقلية',
      icon: <FlaskConical className="w-4 h-4" />,
      tag: 'IDW / α Blend',
    },
    {
      stage: 3,
      titleEn: 'RUSLE K-Factor',
      titleAr: '٣. نموذج التآكل',
      icon: <ShieldAlert className="w-4 h-4" />,
      tag: 'Wischmeier Nomograph',
    },
    {
      stage: 4,
      titleEn: 'Smart Report',
      titleAr: '٤. التقرير الذكي',
      icon: <FileCheck2 className="w-4 h-4" />,
      tag: 'Advisory & Export',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Step Progress Navigation Header */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stages.map((st) => {
            const isActive = activeStage === st.stage;
            const isCompleted = activeStage > st.stage;
            return (
              <button
                key={st.stage}
                onClick={() => setActiveStage(st.stage)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left rtl:text-right transition ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : isCompleted
                    ? 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : isCompleted
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.stage}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">
                    {isAr ? st.titleAr : st.titleEn}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {st.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Stage Component */}
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
