import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabId } from './components/NavigationTabs';
import { PipelineController } from './components/Pipeline/PipelineController';
import { GisMap } from './components/Map/GisMap';
import { ArchitectureTopology } from './components/Architecture/ArchitectureTopology';
import { PostGisConsole } from './components/Database/PostGisConsole';
import { QueueMonitor } from './components/Queue/QueueMonitor';
import { PythonGeoEngineViewer } from './components/Engine/PythonGeoEngineViewer';
import { SoilCarbonAfforestation } from './components/Carbon/SoilCarbonAfforestation';
import { SentinelNdviViewer } from './components/EarthObservation/SentinelNdviViewer';
import { SmartFertilizerAdvisor } from './components/Agronomy/SmartFertilizerAdvisor';
import { IntegrationTestSuite } from './components/Testing/IntegrationTestSuite';
import { ClimateRiskAnalysis } from './components/Climate/ClimateRiskAnalysis';
import { PostFireRiskPipeline } from './components/PostFire/PostFireRiskPipeline';
import { GeoJsonUploadModal } from './components/Modals/GeoJsonUploadModal';
import { PrintReportModal } from './components/Modals/PrintReportModal';

import { PRESET_FARMS } from './data/presetRegions';
import { INITIAL_MICROSERVICES } from './data/microservicesData';
import { FarmRegion, Language, CalibratedPixel, MicroserviceStatus } from './types';
import { generateCalibratedGrid } from './utils/geoCalculations';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<TabId>('pipeline');
  const [farmsList, setFarmsList] = useState<FarmRegion[]>(PRESET_FARMS);
  const [currentFarm, setCurrentFarm] = useState<FarmRegion>(PRESET_FARMS[0]);
  const [alpha, setAlpha] = useState<number>(0.65);
  const [services, setServices] = useState<MicroserviceStatus[]>(INITIAL_MICROSERVICES);
  const [selectedPixel, setSelectedPixel] = useState<CalibratedPixel | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Set document title and direction
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Compute calibrated grid whenever farm or alpha changes
  const calibratedGrid = useMemo(() => {
    return generateCalibratedGrid(
      currentFarm.coordinates,
      currentFarm.baseSoilGrids,
      currentFarm.samples,
      alpha,
      7 // 7x7 grid = 49 sampling raster cells
    );
  }, [currentFarm, alpha]);

  const handleRefreshHealth = () => {
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        latencyMs: Math.max(2, Math.floor(s.latencyMs + (Math.random() * 6 - 3))),
        cpuPercent: Math.max(0.4, Math.round((s.cpuPercent + (Math.random() * 0.8 - 0.4)) * 10) / 10),
      }))
    );
  };

  const handleAddCustomFarm = (newFarm: FarmRegion) => {
    setFarmsList([newFarm, ...farmsList]);
    setCurrentFarm(newFarm);
    setActiveTab('gis-map');
  };

  const handleExportGeoJson = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      metadata: {
        platform: 'SolVision Spatial Intelligence Platform',
        exportedAt: new Date().toISOString(),
        farmId: currentFarm.id,
        farmName: currentFarm.nameEn,
        crs: currentFarm.epsgCode,
        alphaCalibration: alpha,
        isMultiPolygon: currentFarm.isMultiPolygon || false,
      },
      features: [
        // Farm boundary polygon or multipolygon
        {
          type: 'Feature',
          properties: {
            entity: 'Farm Boundary',
            name: currentFarm.nameEn,
            nameAr: currentFarm.nameAr,
            areaHectares: currentFarm.areaHectares,
            primaryCrop: currentFarm.primaryCropEn,
            utmZone: currentFarm.utmZone,
          },
          geometry: currentFarm.isMultiPolygon && currentFarm.multiPolygons
            ? {
                type: 'MultiPolygon',
                coordinates: currentFarm.multiPolygons.map((ring) => [
                  [...ring.map((c) => [c.lng, c.lat]), [ring[0].lng, ring[0].lat]],
                ]),
              }
            : {
                type: 'Polygon',
                coordinates: [
                  [
                    ...currentFarm.coordinates.map((c) => [c.lng, c.lat]),
                    [currentFarm.coordinates[0].lng, currentFarm.coordinates[0].lat],
                  ],
                ],
              },
        },
        // Ground borehole lab samples
        ...currentFarm.samples.map((s) => ({
          type: 'Feature',
          properties: {
            entity: 'Ground Auger Borehole',
            id: s.id,
            name: s.name,
            depthCm: s.depthCm,
            sandPercent: s.sandPercent,
            siltPercent: s.siltPercent,
            clayPercent: s.clayPercent,
            organicMatterPercent: s.organicMatterPercent,
            phH2o: s.phH2o,
            cec: s.cec,
          },
          geometry: {
            type: 'Point',
            coordinates: [s.lng, s.lat],
          },
        })),
      ],
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solvision-${currentFarm.id}-${currentFarm.epsgCode}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans ${lang === 'ar' ? 'font-tajawal' : ''}`}>
      {/* Top Header */}
      <Header
        currentFarm={currentFarm}
        allFarms={farmsList}
        onSelectFarm={setCurrentFarm}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
        services={services}
        onExportGeoJson={handleExportGeoJson}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        lang={lang}
        pendingJobsCount={0}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeTab === 'pipeline' && (
          <PipelineController
            farm={currentFarm}
            lang={lang}
            alpha={alpha}
            onAlphaChange={setAlpha}
            calibratedGrid={calibratedGrid}
            onExportGeoJson={handleExportGeoJson}
          />
        )}

        {activeTab === 'gis-map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
              <div>
                <span className="font-bold text-slate-100">
                  {lang === 'ar' ? currentFarm.nameAr : currentFarm.nameEn}
                </span>
                {currentFarm.isMultiPolygon && (
                  <span className="mx-2 px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MultiPolygon
                  </span>
                )}
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-emerald-400 font-mono">{currentFarm.areaHectares} ha</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-cyan-400 font-mono">UTM Zone {currentFarm.utmZone} ({currentFarm.epsgCode})</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                {lang === 'ar'
                  ? 'انقر على أي خلية رستر أو نقطة حفر لعرض الخصائص المخبرية'
                  : 'Click any raster cell or borehole pin to inspect pedotransfer properties'}
              </div>
            </div>

            <GisMap
              farm={currentFarm}
              lang={lang}
              calibratedGrid={calibratedGrid}
              selectedPixel={selectedPixel}
              onSelectPixel={setSelectedPixel}
            />
          </div>
        )}

        {activeTab === 'post-fire' && (
          <PostFireRiskPipeline
            currentFarm={currentFarm}
            lang={lang}
          />
        )}

        {activeTab === 'climate' && (
          <ClimateRiskAnalysis
            farm={currentFarm}
            lang={lang}
            calibratedGrid={calibratedGrid}
          />
        )}

        {activeTab === 'carbon' && (
          <SoilCarbonAfforestation
            farm={currentFarm}
            lang={lang}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenPrint={() => setIsPrintModalOpen(true)}
            onExportGeoJson={handleExportGeoJson}
          />
        )}

        {activeTab === 'ndvi' && (
          <SentinelNdviViewer
            farm={currentFarm}
            lang={lang}
            onViewOnMap={() => setActiveTab('gis-map')}
          />
        )}

        {activeTab === 'fertilizer' && (
          <SmartFertilizerAdvisor
            farm={currentFarm}
            lang={lang}
          />
        )}

        {activeTab === 'testing' && (
          <IntegrationTestSuite
            currentFarm={currentFarm}
            onSelectFarm={setCurrentFarm}
            lang={lang}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureTopology
            services={services}
            lang={lang}
            onRefreshHealth={handleRefreshHealth}
          />
        )}

        {activeTab === 'postgis' && (
          <PostGisConsole lang={lang} />
        )}

        {activeTab === 'queue' && (
          <QueueMonitor lang={lang} />
        )}

        {activeTab === 'geo-engine' && (
          <PythonGeoEngineViewer
            farm={currentFarm}
            lang={lang}
          />
        )}
      </main>

      {/* Modals */}
      <GeoJsonUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddFarm={handleAddCustomFarm}
        lang={lang}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        farm={currentFarm}
        lang={lang}
        alpha={alpha}
        calibratedGrid={calibratedGrid}
        onExportGeoJson={handleExportGeoJson}
      />

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0B0F19] py-4 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SolVision Platform © 2026 • Core Spatial & Agricultural Intelligence Stack
          </div>
          <div className="flex items-center gap-3">
            <span>FastAPI:8000</span>
            <span>•</span>
            <span>PostGIS:5432</span>
            <span>•</span>
            <span>Redis:6379</span>
            <span>•</span>
            <span className="text-emerald-400">EPSG:32631 (Zone 31N)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
