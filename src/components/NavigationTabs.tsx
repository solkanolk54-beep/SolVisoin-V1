import React from 'react';
import { 
  GitBranch, 
  Map as MapIcon, 
  Layers, 
  Server, 
  Database, 
  Zap, 
  TerminalSquare,
  TreePine,
  Satellite,
  FlaskConical,
  SunMedium,
  Flame,
  Bot,
  BrainCircuit
} from 'lucide-react';
import { Language } from '../types';

export type TabId = 'pipeline' | 'gis-map' | 'copilot' | 'flood-forecast' | 'post-fire' | 'climate' | 'carbon' | 'ndvi' | 'fertilizer' | 'testing' | 'architecture' | 'postgis' | 'queue' | 'geo-engine';

interface NavigationTabsProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  lang: Language;
  pendingJobsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  lang,
  pendingJobsCount,
}) => {
  const isAr = lang === 'ar';

  const tabs: { id: TabId; labelEn: string; labelAr: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'pipeline',
      labelEn: 'Spatial Workflow (4 Steps)',
      labelAr: 'المسار المكاني (4 خطوات)',
      icon: <GitBranch className="w-4 h-4" />,
      badge: isAr ? 'الأساس' : 'Core',
    },
    {
      id: 'gis-map',
      labelEn: 'Map & Drawing',
      labelAr: 'الخريطة والرسم',
      icon: <MapIcon className="w-4 h-4" />,
    },
    {
      id: 'copilot',
      labelEn: 'SolAI Copilot (GIS AI)',
      labelAr: 'مساعد الذكاء الاصطناعي (SolAI)',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      badge: isAr ? 'RAG ومحادثة' : 'RAG + Voice',
    },
    {
      id: 'flood-forecast',
      labelEn: 'Deep Learning Flood Forecast',
      labelAr: 'التنبؤ بالسيول (تعلم عميق)',
      icon: <BrainCircuit className="w-4 h-4 text-cyan-400" />,
      badge: isAr ? 'LSTM ورادار' : 'LSTM + Radar',
    },
    {
      id: 'post-fire',
      labelEn: 'Post-Fire Risk (Jijel)',
      labelAr: 'مخاطر ما بعد الحرائق (جيجل)',
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      badge: isAr ? 'dNBR & RUSLE' : 'dNBR & Silt',
    },
    {
      id: 'climate',
      labelEn: 'Climate & Drought Risk',
      labelAr: 'مخاطر الجفاف والمناخ',
      icon: <SunMedium className="w-4 h-4" />,
      badge: isAr ? 'خريطة حرارية' : 'Heatmap',
    },
    {
      id: 'carbon',
      labelEn: 'SOC & Green Dam',
      labelAr: 'مخزون الكربون والتشجير',
      icon: <TreePine className="w-4 h-4" />,
      badge: isAr ? 'السد الأخضر' : 'SOC Stock',
    },
    {
      id: 'ndvi',
      labelEn: 'Live Sentinel-2 NDVI',
      labelAr: 'أقمار Sentinel-2 والغطاء النباتي',
      icon: <Satellite className="w-4 h-4" />,
      badge: '10m',
    },
    {
      id: 'fertilizer',
      labelEn: 'Smart Fertilizer Advisor',
      labelAr: 'التوصيات السمادية (NPK)',
      icon: <FlaskConical className="w-4 h-4" />,
    },
    {
      id: 'testing',
      labelEn: 'Integration & Edge Cases',
      labelAr: 'اختبارات التكامل والحالات الشاذة',
      icon: <Layers className="w-4 h-4" />,
      badge: isAr ? 'مُختبر' : 'Tests',
    },
    {
      id: 'architecture',
      labelEn: 'Microservices & Docker Stack',
      labelAr: 'الهيكلية و Docker',
      icon: <Server className="w-4 h-4" />,
    },
    {
      id: 'postgis',
      labelEn: 'PostGIS Spatial DB',
      labelAr: 'قاعدة بيانات PostGIS',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'queue',
      labelEn: 'Redis & Queue Pipeline',
      labelAr: 'الكاش وطابور المهام',
      icon: <Zap className="w-4 h-4" />,
      badge: pendingJobsCount > 0 ? `${pendingJobsCount}` : undefined,
    },
    {
      id: 'geo-engine',
      labelEn: 'Python Geo-Engine (FastAPI)',
      labelAr: 'محرك بايثون و GDAL',
      icon: <TerminalSquare className="w-4 h-4" />,
    },
  ];

  return (
    <div className="border-b border-[#1E293B] bg-[#0B0F19]/95 backdrop-blur-md sticky top-[57px] sm:top-[65px] z-40 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar px-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0F172A] border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                  {tab.icon}
                </span>
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-[#0F172A] text-slate-400 border border-[#1E293B]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
