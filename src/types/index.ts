export type Language = 'ar' | 'en';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface UtmCoordinate {
  easting: number;
  northing: number;
  zone: string; // e.g. "31N"
  epsg: string; // "EPSG:32631"
}

export interface BoreholeSample {
  id: string;
  name: string;
  lat: number;
  lng: number;
  depthCm: number;
  sandPercent: number;
  siltPercent: number;
  clayPercent: number;
  organicMatterPercent: number; // OM %
  phH2o: number;
  cec: number; // cmol(+)/kg
  dateSampled: string;
}

export interface SocDepthLayer {
  depth_cm: string;
  thickness_cm: number;
  soc_g_kg: number;
  bdod_g_cm3: number;
  coarse_fragments_pct: number;
  carbon_stock_t_ha: number;
}

export interface AfforestationRecommendation {
  priority: string;
  priorityEn: string;
  action: string;
  actionEn: string;
  speciesRecommended?: string[];
  carbonSequestrationPotentialTonPerYear?: number;
}

export interface SoilCarbonAnalysis {
  total_soc_stock_t_ha: number;
  co2_equivalent_t_ha: number;
  layers: SocDepthLayer[];
  afforestation_recommendation: AfforestationRecommendation;
}

export interface SentinelObservation {
  date: string;
  month: string;
  monthAr: string;
  ndvi: number;
  evi: number;
  ndwi: number;
  cloudCoverPct: number;
  vegetationHealth: 'Vigorous' | 'Moderate' | 'Stress/Dormant' | 'Bare Soil';
  vegetationHealthAr: string;
}

export interface FertilizerDosePlan {
  cropId: string;
  cropNameEn: string;
  cropNameAr: string;
  targetYieldTonHa: number;
  nitrogenN_kgHa: number;
  phosphorusP2O5_kgHa: number;
  potassiumK2O_kgHa: number;
  organicManureTonHa: number;
  cecRating: string;
  cecRatingAr: string;
  phAdjustmentAdvice: string;
  phAdjustmentAdviceAr: string;
  phases: {
    stageEn: string;
    stageAr: string;
    nPct: number;
    pPct: number;
    kPct: number;
    timing: string;
    timingAr: string;
  }[];
}

export interface MonthlyClimatePoint {
  month: string;
  monthAr: string;
  avgPrecipMm: number;
  avgTempC: number;
  petMm: number;
  waterBalanceMm: number;
  spi: number;
  droughtCategory: 'Extreme Drought' | 'Severe' | 'Moderate' | 'Mild' | 'Normal' | 'Surplus';
  droughtCategoryAr: string;
}

export interface ClimateYearMonthCell {
  year: number;
  monthIdx: number;
  monthName: string;
  monthNameAr: string;
  precipMm: number;
  tempMaxC: number;
  spiValue: number;
  severityGrade: 'extreme' | 'severe' | 'moderate' | 'mild' | 'normal' | 'wet';
}

export interface ClimateRiskAnalysisData {
  annualPrecipMm: number;
  annualAvgTempC: number;
  aridityIndex: number; // P / PET
  aridityClassEn: string;
  aridityClassAr: string;
  consecutiveDryDaysMax: number;
  heatStressDaysAbove35C: number;
  droughtVulnerabilityScore: number; // 0-100
  droughtVulnerabilityGradeEn: 'Critical Risk' | 'High Risk' | 'Moderate Risk' | 'Low Risk';
  droughtVulnerabilityGradeAr: string;
  monthlyNormals: MonthlyClimatePoint[];
  historicalMatrix: {
    years: number[];
    months: string[];
    monthsAr: string[];
    cells: ClimateYearMonthCell[][];
  };
  adaptationMeasures: {
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export interface SoilGridsLayerData {
  sandPercent: number;
  siltPercent: number;
  clayPercent: number;
  socGPerKg: number; // Soil organic carbon g/kg
  organicMatterPercent: number; // Derived OM % (SOC * 1.724 / 10)
  phH2o: number;
  bulkDensityGcm3: number;
  uncertaintyRatio: number;
}

export interface CalibratedPixel {
  id: string;
  lat: number;
  lng: number;
  utmEasting: number;
  utmNorthing: number;
  rawSoilGrids: SoilGridsLayerData;
  labInterpolated: {
    sandPercent: number;
    siltPercent: number;
    clayPercent: number;
    organicMatterPercent: number;
  };
  calibrated: {
    sandPercent: number;
    siltPercent: number;
    clayPercent: number;
    organicMatterPercent: number;
    phH2o: number;
  };
  rusleK: {
    kMetric: number; // t·ha·h / (ha·MJ·mm)
    kUs: number; // US customary
    mFactor: number;
    riskClass: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Severe';
    riskClassAr: string;
    textureClass: string;
    textureClassAr: string;
  };
}

export interface FarmRegion {
  id: string;
  nameEn: string;
  nameAr: string;
  regionEn: string;
  regionAr: string;
  utmZone: string;
  epsgCode: string;
  center: LatLng;
  zoom: number;
  areaHectares: number;
  coordinates: LatLng[]; // Primary or outer boundary
  multiPolygons?: LatLng[][]; // For complex non-contiguous parcels (Mila, Steppes)
  isMultiPolygon?: boolean;
  elevationRangeM: [number, number];
  primaryCropEn: string;
  primaryCropAr: string;
  samples: BoreholeSample[];
  baseSoilGrids: SoilGridsLayerData;
  descriptionEn: string;
  descriptionAr: string;
}

export interface BenchmarkMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  throughputReqPerSec: number;
  memoryPeakMb: number;
  cacheHitRatio: number;
  latencies: number[];
}

export interface MicroserviceStatus {
  name: string;
  roleEn: string;
  roleAr: string;
  containerName: string;
  image: string;
  port: string;
  status: 'healthy' | 'running' | 'degraded' | 'idle';
  uptime: string;
  latencyMs: number;
  memoryUsageMb: number;
  cpuPercent: number;
  tech: string;
}

export interface QueueJob {
  id: string;
  name: string;
  service: string;
  status: 'completed' | 'processing' | 'queued' | 'failed';
  progress: number;
  queuedAt: string;
  completedAt?: string;
  durationMs: number;
  payloadSummary: string;
  logs: string[];
}

export interface AgronomicRecommendation {
  category: 'erosion' | 'fertilization' | 'irrigation' | 'tillage';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  urgency: 'high' | 'medium' | 'low';
  icon: string;
}

export type BurnSeverityLevel = 'unburned' | 'low' | 'moderate_low' | 'moderate_high' | 'high';

export interface BurnSeverityZone {
  level: BurnSeverityLevel;
  nameEn: string;
  nameAr: string;
  dnbrRange: string;
  areaHa: number;
  areaPct: number;
  hydrophobicity: 'None' | 'Low' | 'Moderate' | 'Severe' | 'Extreme';
  hydrophobicityAr: string;
  kMultiplier: number;
  cFactor: number;
  curveNumber: number;
}

export interface PostFireHotspot {
  id: string;
  nameEn: string;
  nameAr: string;
  catchment: string;
  catchmentAr: string;
  lat: number;
  lng: number;
  areaHa: number;
  slopeDeg: number;
  slopePct: number;
  dnbrMean: number;
  severityLevel: BurnSeverityLevel;
  preFireErosionTonHa: number;
  postFireErosionTonHa: number;
  siltRiskTonYear: number;
  debrisFlowProbabilityPct: number;
  recommendedInterventionEn: string;
  recommendedInterventionAr: string;
  interventionType: 'contour_felling' | 'check_dam' | 'straw_mulching' | 'sediment_basin' | 'warning_system';
  priority: 'Critical' | 'High' | 'Moderate';
  priorityAr: string;
  estimatedCostDzd: number;
  firstStormSoilLossTonHa?: number;
  targetAgenciesAr?: string[];
  targetAgenciesEn?: string[];
  interventionUrgencyAr?: string;
}

export interface PostFireWatershedProfile {
  id: string;
  nameEn: string;
  nameAr: string;
  damNameEn: string;
  damNameAr: string;
  damCapacityMillionM3: number;
  totalWatershedAreaHa: number;
  burnedAreaTotalHa: number;
  burnedPct: number;
  meanSlopePct: number;
  annualRainfallMm: number;
  rFactor: number;
  preFireSoilLossTonYear: number;
  postFireSoilLossTonYear: number;
  lossIncreaseRatio: number;
  annualSiltDeliveryM3: number;
  reservoirDeadStorageLossPctPerYear: number;
  zones: BurnSeverityZone[];
  hotspots: PostFireHotspot[];
}
