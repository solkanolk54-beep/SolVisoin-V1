import { LatLng, UtmCoordinate, BoreholeSample, SoilGridsLayerData, CalibratedPixel } from '../types';

/**
 * High precision conversion from WGS84 Lat/Lng to UTM Zone 31N (EPSG:32631)
 * Uses standard Transverse Mercator series approximation (WGS84 ellipsoid).
 */
export function latLngToUtm31N(lat: number, lng: number): UtmCoordinate {
  const a = 6378137.0; // WGS84 Semi-major axis
  const f = 1 / 298.257223563; // Flattening
  const b = a * (1 - f);
  const e2 = (a * a - b * b) / (a * a); // First eccentricity squared
  const ePrime2 = (a * a - b * b) / (b * b);

  const k0 = 0.9996; // Scale factor for UTM
  const centralMeridian = 3; // Zone 31 Central Meridian is 3 degrees East
  const lon0Rad = (centralMeridian * Math.PI) / 180;

  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lng * Math.PI) / 180;

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = ePrime2 * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lonRad - lon0Rad);

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latRad -
    (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latRad) +
    (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latRad) -
    (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latRad)
  );

  const easting = 500000 + k0 * N * (
    A +
    (1 - T + C) * Math.pow(A, 3) / 6 +
    (5 - 18 * T + T * T + 72 * C - 58 * ePrime2) * Math.pow(A, 5) / 120
  );

  const northing = k0 * (
    M +
    N * Math.tan(latRad) * (
      Math.pow(A, 2) / 2 +
      (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 +
      (61 - 58 * T + T * T + 600 * C - 330 * ePrime2) * Math.pow(A, 6) / 720
    )
  );

  return {
    easting: Math.round(easting * 10) / 10,
    northing: Math.round(northing * 10) / 10,
    zone: '31N',
    epsg: 'EPSG:32631',
  };
}

/**
 * Inverse Distance Weighting (IDW) interpolation
 * Computes estimated field property from local lab boreholes.
 * Handles Edge Cases:
 * 1. Zero boreholes: Returns null/0 with safe fallback.
 * 2. Single borehole: Applies uniform value without singularity.
 * 3. Exact coordinate match: Returns point value directly without 0 division.
 */
export function interpolateIdw(
  targetLat: number,
  targetLng: number,
  samples: BoreholeSample[],
  propertyKey: 'sandPercent' | 'siltPercent' | 'clayPercent' | 'organicMatterPercent',
  power: number = 2
): number {
  // Edge Case 1: Zero samples
  if (!samples || samples.length === 0) return 0;

  // Edge Case 2: Single sample (uniform spatial field)
  if (samples.length === 1) {
    return samples[0][propertyKey];
  }

  let numerator = 0;
  let denominator = 0;

  for (const sample of samples) {
    // Great-circle / Euclidean approximate distance in meters
    const dLat = (sample.lat - targetLat) * 111320;
    const dLng = (sample.lng - targetLng) * 111320 * Math.cos((targetLat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    // Exact match threshold to prevent division by zero
    if (dist < 1.0) {
      return sample[propertyKey];
    }

    const weight = 1 / Math.pow(dist, power);
    numerator += sample[propertyKey] * weight;
    denominator += weight;
  }

  return denominator === 0 ? samples[0][propertyKey] : numerator / denominator;
}

/**
 * USDA Soil Texture Triangle Classification
 * Bulletproof against extreme/abnormal inputs (e.g. 100% sand, 95% clay, negative or unnormalized sums)
 */
export function classifyUsdaTexture(sand: number, silt: number, clay: number): {
  en: string;
  ar: string;
} {
  // Sanitize negative inputs
  const safeSand = Math.max(0, sand || 0);
  const safeSilt = Math.max(0, silt || 0);
  const safeClay = Math.max(0, clay || 0);

  // Normalize to 100%
  const total = safeSand + safeSilt + safeClay;
  if (total <= 0.001) {
    return { en: 'Loam (Default)', ar: 'طَفَلي مزيجي (افتراضي)' };
  }

  const s = (safeSand / total) * 100;
  const si = (safeSilt / total) * 100;
  const c = (safeClay / total) * 100;

  if (c >= 40) {
    if (si >= 40) return { en: 'Silty Clay', ar: 'طيني طميي' };
    if (s >= 45) return { en: 'Sandy Clay', ar: 'طيني رملي' };
    return { en: 'Clay', ar: 'طيني' };
  } else if (c >= 27 && c < 40) {
    if (s >= 20 && s <= 45) return { en: 'Clay Loam', ar: 'طَفَلي طيني' };
    if (s > 45) return { en: 'Sandy Clay Loam', ar: 'طَفَلي طيني رملي' };
    return { en: 'Silty Clay Loam', ar: 'طَفَلي طيني طميي' };
  } else if (c >= 20 && c < 27) {
    if (si >= 50) return { en: 'Silt Loam', ar: 'طَفَلي طميي' };
    if (s >= 52) return { en: 'Sandy Clay Loam', ar: 'طَفَلي طيني رملي' };
    return { en: 'Loam', ar: 'طَفَلي (مزيجي متوازن)' };
  } else if (c >= 7 && c < 20) {
    if (si >= 50) return { en: 'Silt Loam', ar: 'طَفَلي طميي' };
    if (s >= 52) return { en: 'Sandy Loam', ar: 'طَفَلي رملي' };
    return { en: 'Loam', ar: 'طَفَلي (مزيجي متوازن)' };
  } else {
    // Clay < 7%
    if (si >= 80) return { en: 'Silt', ar: 'طميي خالص' };
    if (si >= 50) return { en: 'Silt Loam', ar: 'طَفَلي طميي' };
    if (s >= 85) return { en: 'Sand', ar: 'رملي' };
    if (s >= 70) return { en: 'Loamy Sand', ar: 'رملي طَفَلي' };
    return { en: 'Sandy Loam', ar: 'طَفَلي رملي' };
  }
}

/**
 * RUSLE Soil Erodibility K-Factor calculation according to Wischmeier & Smith (1978)
 * Handles edge cases: extreme sand (100%), extreme clay (100%), negative or excessive OM
 */
export function calculateRusleK(
  sandPercent: number,
  siltPercent: number,
  clayPercent: number,
  organicMatterPercent: number,
  structureCode: number = 2, // 1 to 4
  permeabilityClass: number = 3 // 1 to 6
) {
  // Normalize fractions to 100%
  const safeSand = Math.max(0, sandPercent || 0);
  const safeSilt = Math.max(0, siltPercent || 0);
  const safeClay = Math.max(0, clayPercent || 0);
  const sumTexture = safeSand + safeSilt + safeClay || 100;
  const normSand = (safeSand / sumTexture) * 100;
  const normSilt = (safeSilt / sumTexture) * 100;
  const normClay = (safeClay / sumTexture) * 100;

  // Approximate very fine sand (0.05-0.10 mm) as 18% of total sand fraction per standard pedotransfer
  const vfs = Math.max(0, normSand * 0.18);
  const siltVfs = Math.min(100, Math.max(0, normSilt + vfs));
  const clay = Math.min(100, Math.max(0, normClay));

  // M factor: M = (%silt + %vfs) * (100 - %clay)
  const m = Math.max(0, siltVfs * (100 - clay));

  // Clamp Organic Matter to 0.5% - 4.0% per Wischmeier nomograph boundary constraints
  const om = Math.min(4.0, Math.max(0.5, organicMatterPercent || 0.5));

  // Wischmeier & Smith 100 * K (in customary US units)
  const term1 = 2.1e-4 * Math.pow(m, 1.14) * (12 - om);
  const term2 = 3.25 * (structureCode - 2);
  const term3 = 2.5 * (permeabilityClass - 3);

  let k100Us = term1 + term2 + term3;
  if (k100Us < 2.0) k100Us = 2.0; // minimum physical bound
  if (k100Us > 70.0) k100Us = 70.0; // maximum physical bound

  const kUs = k100Us / 100.0;
  // Convert US customary units to SI metric: t·ha·h / (ha·MJ·mm)
  const kMetric = kUs * 0.1317;

  // Erodibility Hazard Rating
  let riskClass: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Severe' = 'Moderate';
  let riskClassAr = 'متوسط';

  if (kMetric < 0.015) {
    riskClass = 'Very Low';
    riskClassAr = 'منخفض جداً';
  } else if (kMetric < 0.025) {
    riskClass = 'Low';
    riskClassAr = 'منخفض';
  } else if (kMetric < 0.040) {
    riskClass = 'Moderate';
    riskClassAr = 'متوسط';
  } else if (kMetric < 0.055) {
    riskClass = 'High';
    riskClassAr = 'عالي';
  } else {
    riskClass = 'Severe';
    riskClassAr = 'شديد / حرج';
  }

  const texture = classifyUsdaTexture(normSand, normSilt, normClay);

  return {
    kMetric: Math.round(kMetric * 10000) / 10000,
    kUs: Math.round(kUs * 1000) / 1000,
    mFactor: Math.round(m),
    riskClass,
    riskClassAr,
    textureClass: texture.en,
    textureClassAr: texture.ar,
  };
}

/**
 * Generates an interpolated pixel grid inside a bounding box with:
 * 1. SoilGrids baseline
 * 2. Local lab sample IDW (or graceful fallback to SoilGrids if zero boreholes)
 * 3. Final calibrated values (alpha blend)
 * 4. RUSLE K-Factor
 */
export function generateCalibratedGrid(
  polygonCoords: LatLng[],
  baseSoilGrids: SoilGridsLayerData,
  samples: BoreholeSample[],
  alpha: number = 0.65,
  gridResolution: number = 7 // 7x7 grid = 49 sampling raster cells
): CalibratedPixel[] {
  if (!polygonCoords || polygonCoords.length === 0) return [];

  // Determine bounding box
  const lats = polygonCoords.map(c => c.lat);
  const lngs = polygonCoords.map(c => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const pixels: CalibratedPixel[] = [];

  // Edge Case: If zero boreholes provided, fallback automatically to alpha = 1.0 (100% SoilGrids)
  const effectiveAlpha = samples && samples.length > 0 ? alpha : 1.0;

  for (let r = 0; r < gridResolution; r++) {
    for (let c = 0; c < gridResolution; c++) {
      const lat = minLat + ((maxLat - minLat) * (r + 0.5)) / gridResolution;
      const lng = minLng + ((maxLng - minLng) * (c + 0.5)) / gridResolution;

      // Slight natural micro-topographic gradient in raw SoilGrids
      const spatialVariation = Math.sin(r * 0.9) * 2.2 + Math.cos(c * 1.1) * 2.5;
      const rawSand = Math.min(85, Math.max(10, baseSoilGrids.sandPercent + spatialVariation));
      const rawClay = Math.min(70, Math.max(8, baseSoilGrids.clayPercent - spatialVariation * 0.7));
      const rawSilt = Math.max(5, 100 - (rawSand + rawClay));
      const rawOm = Math.min(6, Math.max(0.6, baseSoilGrids.organicMatterPercent + spatialVariation * 0.08));

      // IDW estimation from local ground borehole lab samples (or fallback to raw if 0 samples)
      const labSand = samples && samples.length > 0
        ? interpolateIdw(lat, lng, samples, 'sandPercent')
        : rawSand;
      const labSilt = samples && samples.length > 0
        ? interpolateIdw(lat, lng, samples, 'siltPercent')
        : rawSilt;
      const labClay = samples && samples.length > 0
        ? interpolateIdw(lat, lng, samples, 'clayPercent')
        : rawClay;
      const labOm = samples && samples.length > 0
        ? interpolateIdw(lat, lng, samples, 'organicMatterPercent')
        : rawOm;

      // Calibration Formula: Property_final = SoilGrids * alpha + Local_Lab * (1 - alpha)
      const calSand = rawSand * effectiveAlpha + labSand * (1 - effectiveAlpha);
      const calSilt = rawSilt * effectiveAlpha + labSilt * (1 - effectiveAlpha);
      const calClay = rawClay * effectiveAlpha + labClay * (1 - effectiveAlpha);
      const calOm = rawOm * effectiveAlpha + labOm * (1 - effectiveAlpha);

      // Re-normalize texture percentages to strictly 100%
      const sumTexture = calSand + calSilt + calClay || 100;
      const normSand = (calSand / sumTexture) * 100;
      const normSilt = (calSilt / sumTexture) * 100;
      const normClay = (calClay / sumTexture) * 100;

      const utm = latLngToUtm31N(lat, lng);
      const rusle = calculateRusleK(normSand, normSilt, normClay, calOm);

      pixels.push({
        id: `px-${r}-${c}`,
        lat: Math.round(lat * 100000) / 100000,
        lng: Math.round(lng * 100000) / 100000,
        utmEasting: utm.easting,
        utmNorthing: utm.northing,
        rawSoilGrids: {
          ...baseSoilGrids,
          sandPercent: Math.round(rawSand * 10) / 10,
          siltPercent: Math.round(rawSilt * 10) / 10,
          clayPercent: Math.round(rawClay * 10) / 10,
          organicMatterPercent: Math.round(rawOm * 100) / 100,
        },
        labInterpolated: {
          sandPercent: Math.round(labSand * 10) / 10,
          siltPercent: Math.round(labSilt * 10) / 10,
          clayPercent: Math.round(labClay * 10) / 10,
          organicMatterPercent: Math.round(labOm * 100) / 100,
        },
        calibrated: {
          sandPercent: Math.round(normSand * 10) / 10,
          siltPercent: Math.round(normSilt * 10) / 10,
          clayPercent: Math.round(normClay * 10) / 10,
          organicMatterPercent: Math.round(calOm * 100) / 100,
          phH2o: baseSoilGrids.phH2o,
        },
        rusleK: rusle,
      });
    }
  }

  return pixels;
}

/**
 * Calculates polygon area in hectares using spherical earth formula
 */
export function calculatePolygonAreaHectares(coords: LatLng[]): number {
  if (coords.length < 3) return 0;
  const radius = 6378137; // meters
  let total = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const lat1 = (coords[i].lat * Math.PI) / 180;
    const lat2 = (coords[j].lat * Math.PI) / 180;
    const lng1 = (coords[i].lng * Math.PI) / 180;
    const lng2 = (coords[j].lng * Math.PI) / 180;

    total += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  const areaSqM = Math.abs((total * radius * radius) / 2.0);
  return Math.round((areaSqM / 10000) * 10) / 10;
}

/**
 * Calculates Soil Organic Carbon Stock across standard depths (0-200cm)
 * and determines Afforestation / Green Dam (السد الأخضر) suitability.
 *
 * Formula:
 * SOC_stock = (SOC * BD * Depth_thickness * (1 - Coarse_Fragments / 100)) / 10 [t/ha]
 */
export function calculateSoilCarbonAndAfforestation(
  baseSocGKg: number,
  baseBdGcm3: number,
  baseCoarseFragmentsPct: number = 8.5
): import('../types').SoilCarbonAnalysis {
  // Standard SoilGrids depths and thickness intervals (cm)
  const depthIntervals: { depth: string; thickness: number; factorSoc: number; factorBd: number; factorCf: number }[] = [
    { depth: '0-5', thickness: 5, factorSoc: 1.25, factorBd: 0.95, factorCf: 0.8 },
    { depth: '5-15', thickness: 10, factorSoc: 1.10, factorBd: 0.98, factorCf: 0.9 },
    { depth: '15-30', thickness: 15, factorSoc: 1.00, factorBd: 1.00, factorCf: 1.0 }, // baseline
    { depth: '30-60', thickness: 30, factorSoc: 0.65, factorBd: 1.08, factorCf: 1.2 },
    { depth: '60-100', thickness: 40, factorSoc: 0.38, factorBd: 1.14, factorCf: 1.4 },
    { depth: '100-200', thickness: 100, factorSoc: 0.22, factorBd: 1.20, factorCf: 1.6 },
  ];

  let totalCarbonStock = 0.0;
  const layers: import('../types').SocDepthLayer[] = [];

  for (const item of depthIntervals) {
    const socVal = Math.max(0.5, baseSocGKg * item.factorSoc);
    const bdVal = Math.max(0.8, Math.min(1.85, baseBdGcm3 * item.factorBd));
    const cfVal = Math.min(50, Math.max(0, baseCoarseFragmentsPct * item.factorCf));

    // SOC_stock = (SOC * BD * Depth * (1 - Coarse_Fragments / 100)) / 10
    const layerStock = (socVal * bdVal * item.thickness * (1.0 - cfVal / 100.0)) / 10.0;
    const roundedStock = Math.round(layerStock * 100) / 100;

    totalCarbonStock += roundedStock;
    layers.push({
      depth_cm: item.depth,
      thickness_cm: item.thickness,
      soc_g_kg: Math.round(socVal * 10) / 10,
      bdod_g_cm3: Math.round(bdVal * 100) / 100,
      coarse_fragments_pct: Math.round(cfVal * 10) / 10,
      carbon_stock_t_ha: roundedStock,
    });
  }

  totalCarbonStock = Math.round(totalCarbonStock * 100) / 100;

  // Afforestation Suitability Matrix (Green Dam / السد الأخضر)
  let afforestationRecommendation: import('../types').AfforestationRecommendation;

  if (totalCarbonStock < 30) {
    afforestationRecommendation = {
      priority: 'عالية جداً (أراضي سهبية متدهورة / أولوية السد الأخضر)',
      priorityEn: 'Very High (Degraded Steppe / Green Dam Priority)',
      action: 'مطلوب تدخل عاجل بمشاريع التشجير الكبرى (السد الأخضر) مع تحسين المحتوى العضوي بالتسميد الحيوي وتثبيت الكثبان الرملية.',
      actionEn: 'Urgent major afforestation intervention required (Green Dam project) with bio-fertilization and sandy dune stabilization.',
      speciesRecommended: [
        'Pinus halepensis (الصنوبر الحلبي)',
        'Acacia tortilis (السنط الصحراوي)',
        'Atriplex canescens (القطف الرعوي)',
        'Pistacia atlantica (البطم الأطلسي)',
      ],
      carbonSequestrationPotentialTonPerYear: 3.8,
    };
  } else if (totalCarbonStock <= 70) {
    afforestationRecommendation = {
      priority: 'متوسطة (ملاءمة بيئية وغابات حراجية)',
      priorityEn: 'Moderate (Dryland Agroforestry Suitability)',
      action: 'ملاءمة جيدة للغراسات المقاومة للجفاف وتثبيت الكثبان أو التربة الهشة ومصدات الرياح الحزامية.',
      actionEn: 'Good suitability for drought-resistant trees, dune stabilization, and multi-tier vegetative shelterbelts.',
      speciesRecommended: [
        'Ceratonia siliqua (الخروب)',
        'Olea europaea oleaster (الزيتون البري)',
        'Ziziphus lotus (السدر)',
        'Tamarix aphylla (الأثل)',
      ],
      carbonSequestrationPotentialTonPerYear: 2.4,
    };
  } else {
    afforestationRecommendation = {
      priority: 'منخفضة الأولوية للتشجير السريع / عالية الخصوبة',
      priorityEn: 'Low Afforestation Urgency / High Biological Fertility',
      action: 'يوصى بالحفاظ على الغطاء النباتي القائم واستغلالها في الزراعات المحسنة والغابات الإنتاجية المثمرة.',
      actionEn: 'Preserve established natural canopy and utilize for regenerative agroforestry and high-yield conservation agriculture.',
      speciesRecommended: [
        'Agroforestry Intercropping (تداخل شجري حقلي)',
        'Morus alba (التوت الأبيض)',
        'Juglans regia (الجوز)',
        'Punica granatum (الرمان)',
      ],
      carbonSequestrationPotentialTonPerYear: 1.5,
    };
  }

  return {
    total_soc_stock_t_ha: totalCarbonStock,
    co2_equivalent_t_ha: Math.round(totalCarbonStock * 3.67 * 10) / 10, // 1 ton C = 3.67 ton CO2e
    layers,
    afforestation_recommendation: afforestationRecommendation,
  };
}

/**
 * Generates seasonal 12-month Sentinel-2 spectral observations (NDVI, EVI, NDWI)
 * tailored to the agro-ecological dynamics of the parcel.
 */
export function generateSentinelObservations(farmId: string): import('../types').SentinelObservation[] {
  const months = [
    { m: 'Jan', mAr: 'يناير', base: 0.42 },
    { m: 'Feb', mAr: 'فبراير', base: 0.55 },
    { m: 'Mar', mAr: 'مارس', base: 0.72 },
    { m: 'Apr', mAr: 'أبريل', base: 0.78 }, // Spring peak
    { m: 'May', mAr: 'مايو', base: 0.68 },
    { m: 'Jun', mAr: 'يونيو', base: 0.48 },
    { m: 'Jul', mAr: 'يوليو', base: 0.35 }, // Summer drought
    { m: 'Aug', mAr: 'أغسطس', base: 0.32 },
    { m: 'Sep', mAr: 'سبتمبر', base: 0.38 },
    { m: 'Oct', mAr: 'أكتوبر', base: 0.45 },
    { m: 'Nov', mAr: 'نوفمبر', base: 0.52 },
    { m: 'Dec', mAr: 'ديسمبر', base: 0.46 },
  ];

  let multiplier = 1.0;
  if (farmId.includes('biskra')) multiplier = 0.65; // Arid oasis
  else if (farmId.includes('steppe')) multiplier = 0.45; // Sparse rangeland
  else if (farmId.includes('mitidja')) multiplier = 1.05; // Dense perennial citrus
  else if (farmId.includes('mila')) multiplier = 0.95; // Cereal crops

  return months.map((item, idx) => {
    const ndvi = Math.max(0.12, Math.min(0.88, Math.round((item.base * multiplier + (Math.sin(idx) * 0.03)) * 100) / 100));
    const evi = Math.round((ndvi * 0.72) * 100) / 100;
    const ndwi = Math.round(((ndvi - 0.35) * 0.6) * 100) / 100;

    let vegHealth: 'Vigorous' | 'Moderate' | 'Stress/Dormant' | 'Bare Soil' = 'Moderate';
    let vegHealthAr = 'متوسط النمو';

    if (ndvi >= 0.60) {
      vegHealth = 'Vigorous';
      vegHealthAr = 'غطاء نباتي كثيف ونشط';
    } else if (ndvi >= 0.40) {
      vegHealth = 'Moderate';
      vegHealthAr = 'غطاء نباتي معتدل';
    } else if (ndvi >= 0.25) {
      vegHealth = 'Stress/Dormant';
      vegHealthAr = 'إجهاد مائي / سكون';
    } else {
      vegHealth = 'Bare Soil';
      vegHealthAr = 'تربة عارية / حصاد';
    }

    return {
      date: `2026-${String(idx + 1).padStart(2, '0')}-15`,
      month: item.m,
      monthAr: item.mAr,
      ndvi,
      evi,
      ndwi,
      cloudCoverPct: Math.round(Math.random() * 8 + 2),
      vegetationHealth: vegHealth,
      vegetationHealthAr: vegHealthAr,
    };
  });
}

/**
 * Smart Fertilizer Advisor: Calculates N-P-K & Organic Compost requirements
 * based on target crop, yield target, soil CEC, pH, and Organic Matter.
 */
export function calculateCropFertilizerPlan(
  cropType: 'citrus' | 'wheat' | 'date_palm' | 'olive' | 'steppe_pastoral',
  targetYieldTonHa: number,
  soilOmPct: number,
  soilPh: number,
  soilCecCmolKg: number
): import('../types').FertilizerDosePlan {
  // Crop specific nutrient uptake requirements per ton of harvested yield
  const cropConfigs: Record<string, {
    nameEn: string;
    nameAr: string;
    nPerTon: number;
    pPerTon: number;
    kPerTon: number;
    baseCompost: number;
  }> = {
    citrus: {
      nameEn: 'Citrus (Orange, Clementine)',
      nameAr: 'الحمضيات (برتقال، كليمونتين)',
      nPerTon: 5.5,
      pPerTon: 1.8,
      kPerTon: 6.2,
      baseCompost: 20,
    },
    wheat: {
      nameEn: 'Durum Wheat & Barley',
      nameAr: 'القمح الصلب والشعير',
      nPerTon: 28.0,
      pPerTon: 11.5,
      kPerTon: 22.0,
      baseCompost: 12,
    },
    date_palm: {
      nameEn: 'Deglet Nour Date Palms',
      nameAr: 'نخيل دقلة نور',
      nPerTon: 14.0,
      pPerTon: 4.5,
      kPerTon: 18.0,
      baseCompost: 25,
    },
    olive: {
      nameEn: 'Olive Groves (Oil & Table)',
      nameAr: 'أشجار الزيتون (زيت ومائدة)',
      nPerTon: 16.0,
      pPerTon: 5.0,
      kPerTon: 19.0,
      baseCompost: 15,
    },
    steppe_pastoral: {
      nameEn: 'Pastoral Steppe Fodder (Alfa/Barley)',
      nameAr: 'الأعلاف السهبية والرعوية (حلفاء/شعير)',
      nPerTon: 18.0,
      pPerTon: 6.0,
      kPerTon: 14.0,
      baseCompost: 10,
    },
  };

  const config = cropConfigs[cropType] || cropConfigs.wheat;

  // Credit from soil organic matter mineralization (approx 20 kg N per 1% OM per season)
  const soilNitrogenCredit = Math.min(60, Math.max(10, soilOmPct * 18));

  // CEC Buffering efficiency factor:
  // Low CEC (< 12) leads to rapid leaching -> higher split frequency, slightly higher dosage needed
  const cecFactor = soilCecCmolKg < 15 ? 1.15 : soilCecCmolKg > 28 ? 0.92 : 1.0;

  const rawN = (targetYieldTonHa * config.nPerTon - soilNitrogenCredit) * cecFactor;
  const rawP = targetYieldTonHa * config.pPerTon * (soilPh > 8.0 ? 1.25 : 1.0); // Fixation in alkaline soils
  const rawK = targetYieldTonHa * config.kPerTon * cecFactor;

  const nFinal = Math.max(30, Math.round(rawN));
  const pFinal = Math.max(20, Math.round(rawP));
  const kFinal = Math.max(25, Math.round(rawK));

  // Organic compost needed inversely related to current OM
  const compostTonHa = Math.max(8, Math.round(config.baseCompost + (2.5 - soilOmPct) * 4));

  // CEC Rating
  let cecRating = 'Moderate CEC (Good Retention)';
  let cecRatingAr = 'سعة تبادلية متوسطة (احتفاظ جيد بالعناصر)';
  if (soilCecCmolKg < 12) {
    cecRating = 'Low CEC (Risk of Leaching)';
    cecRatingAr = 'سعة تبادلية منخفضة (عرضة للغسيل - يوصى بتجزئة السماد)';
  } else if (soilCecCmolKg > 25) {
    cecRating = 'High CEC (Excellent Nutrient Buffering)';
    cecRatingAr = 'سعة تبادلية عالية (تثبيت ممتاز ومخزون خصب)';
  }

  // pH Adjustment advice
  let phAdvice = 'Balanced Soil pH (6.5 - 7.5). High nutrient bioavailability.';
  let phAdviceAr = 'درجة حموضة متوازنة (6.5 - 7.5). جاهزية حيوية مثالية للعناصر الكبرى والصغرى.';
  if (soilPh > 7.8) {
    phAdvice = 'Alkaline/Calcareous soil. Add agricultural sulfur or acidifying fertilizers (Ammonium Sulfate, MAP) to prevent Phosphorus & Iron lockup.';
    phAdviceAr = 'تربة كلسية قلوية. يوصى بإضافة الكبريت الزراعي أو استخدام أسمدة محمضة (سلفات النشادر، MAP) لمنع تثبيت الفوسفور والحديد.';
  } else if (soilPh < 6.0) {
    phAdvice = 'Acidic soil. Apply agricultural lime (CaCO3) to enhance root absorption and avoid aluminum toxicity.';
    phAdviceAr = 'تربة حامضية. يوصى بإضافة الجير الزراعي لتحسين امتصاص الجذور وتجنب سمية الألمنيوم.';
  }

  return {
    cropId: cropType,
    cropNameEn: config.nameEn,
    cropNameAr: config.nameAr,
    targetYieldTonHa,
    nitrogenN_kgHa: nFinal,
    phosphorusP2O5_kgHa: pFinal,
    potassiumK2O_kgHa: kFinal,
    organicManureTonHa: compostTonHa,
    cecRating,
    cecRatingAr,
    phAdjustmentAdvice: phAdvice,
    phAdjustmentAdviceAr: phAdviceAr,
    phases: [
      {
        stageEn: 'Basal / Pre-Planting Dressing',
        stageAr: 'التسميد الأساسي (قبل البذر / الخدمة الشتوية)',
        nPct: 25,
        pPct: 80,
        kPct: 35,
        timing: 'Before sowing / dormant winter cultivation',
        timingAr: 'أثناء الحرث الشتوي والخدمة العميقة',
      },
      {
        stageEn: 'Vegetative Growth & Tillering',
        stageAr: 'مرحلة النمو الخضري والتفرع',
        nPct: 50,
        pPct: 20,
        kPct: 25,
        timing: 'Active canopy expansion / spring flush',
        timingAr: 'مع انطلاق النمو الربيعي والاستطالة',
      },
      {
        stageEn: 'Flowering & Fruit/Grain Swelling',
        stageAr: 'عقد وتضخم الثمار / امتلاء الحبوب',
        nPct: 25,
        pPct: 0,
        kPct: 40,
        timing: 'Fruit filling & maturation (Drip fertigation)',
        timingAr: 'أثناء نضج وتضخم الثمار عبر الري بالتنقيط',
      },
    ],
  };
}
