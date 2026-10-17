import { PostFireWatershedProfile, PostFireHotspot } from '../types';

export const JIJEL_WATERSHEDS_PROFILES: Record<string, PostFireWatershedProfile> = {
  'tabellout': {
    id: 'tabellout',
    nameEn: 'Tabellout Dam Catchment (Oued Djendjen & Texenna)',
    nameAr: 'حوض سد تابلوط (وادي جن جن وغابات تاكسنة)',
    damNameEn: 'Tabellout Hydraulic Dam',
    damNameAr: 'سد تابلوط الهيدروليكي (جيجل)',
    damCapacityMillionM3: 294.0,
    totalWatershedAreaHa: 52400,
    burnedAreaTotalHa: 4280,
    burnedPct: 8.17,
    meanSlopePct: 34.5,
    annualRainfallMm: 1150,
    rFactor: 3200,
    preFireSoilLossTonYear: 230560, // 4.4 t/ha/yr average
    postFireSoilLossTonYear: 1845000, // spikes on burned slopes to ~84 t/ha/yr
    lossIncreaseRatio: 8.0,
    annualSiltDeliveryM3: 1380000, // massive siltation threat
    reservoirDeadStorageLossPctPerYear: 3.2,
    zones: [
      {
        level: 'high',
        nameEn: 'High Severity (Severe Hydrophobicity)',
        nameAr: 'شدة احتراق مرتفعة جداً (كارهة للماء بشدة)',
        dnbrRange: '≥ 660',
        areaHa: 940,
        areaPct: 22.0,
        hydrophobicity: 'Extreme',
        hydrophobicityAr: 'كراهية قصوى للماء (طبقة شمعية عازلة)',
        kMultiplier: 2.15,
        cFactor: 0.52,
        curveNumber: 88,
      },
      {
        level: 'moderate_high',
        nameEn: 'Moderate-High Severity',
        nameAr: 'شدة متوسطة إلى مرتفعة',
        dnbrRange: '440 - 659',
        areaHa: 1480,
        areaPct: 34.6,
        hydrophobicity: 'Severe',
        hydrophobicityAr: 'كراهية حادة للماء',
        kMultiplier: 1.75,
        cFactor: 0.38,
        curveNumber: 82,
      },
      {
        level: 'moderate_low',
        nameEn: 'Moderate-Low Severity',
        nameAr: 'شدة متوسطة إلى منخفضة',
        dnbrRange: '270 - 439',
        areaHa: 1120,
        areaPct: 26.2,
        hydrophobicity: 'Moderate',
        hydrophobicityAr: 'كراهية متوسطة للماء',
        kMultiplier: 1.40,
        cFactor: 0.22,
        curveNumber: 74,
      },
      {
        level: 'low',
        nameEn: 'Low Severity',
        nameAr: 'شدة احتراق منخفضة',
        dnbrRange: '100 - 269',
        areaHa: 740,
        areaPct: 17.2,
        hydrophobicity: 'Low',
        hydrophobicityAr: 'كراهية طفيفة مؤقتة',
        kMultiplier: 1.15,
        cFactor: 0.08,
        curveNumber: 65,
      },
      {
        level: 'unburned',
        nameEn: 'Unburned / Baseline Forest',
        nameAr: 'أراضي غير محترقة (غطاء حراجي أصلي)',
        dnbrRange: '< 100',
        areaHa: 48120,
        areaPct: 91.83,
        hydrophobicity: 'None',
        hydrophobicityAr: 'نفاذية طبيعية عالية',
        kMultiplier: 1.0,
        cFactor: 0.008,
        curveNumber: 55,
      },
    ],
    hotspots: [
      {
        id: 'HTS-JJL-01',
        nameEn: 'Upper Djendjen Torrent - Texenna Gorges',
        nameAr: 'رافد وادي جن جن العلوي ومضائق تاكسنة',
        catchment: 'Tabellout Dam Reservoir Direct Inflow',
        catchmentAr: 'مصب مباشر في حوض سد تابلوط',
        lat: 36.6625,
        lng: 5.9180,
        areaHa: 285,
        slopeDeg: 32,
        slopePct: 62.5,
        dnbrMean: 742,
        severityLevel: 'high',
        preFireErosionTonHa: 5.2,
        postFireErosionTonHa: 124.5,
        firstStormSoilLossTonHa: 124.5,
        siltRiskTonYear: 35480,
        debrisFlowProbabilityPct: 88,
        recommendedInterventionEn: 'Contour Log Felling (LEBs) & Straw Mulching',
        recommendedInterventionAr: 'إنشاء سدود جذوع الأشجار الكفافية (LEBs) لكسر طاقة المياه الهابطة نحو مجرى السد، وتطبيق التغطية بالقش (Straw Mulching)',
        interventionType: 'contour_felling',
        priority: 'Critical',
        priorityAr: 'حرج جداً (> 120 طن/هكتار)',
        estimatedCostDzd: 18500000,
        targetAgenciesAr: ['محافظة الغابات لولاية جيجل', 'الحماية المدنية', 'مديرية الموارد المائية (DRE)'],
        targetAgenciesEn: ['Conservation des Forêts', 'Protection Civile', 'Direction des Ressources en Eau (DRE)'],
        interventionUrgencyAr: 'تدخل هندسي فوري قبل العواصف الأولى لكسر طاقة المياه الهابطة نحو مجرى السد',
      },
      {
        id: 'HTS-JJL-02',
        nameEn: 'Beni Yaadjis Slopes (Overlooking Tabellout Dam)',
        nameAr: 'منحدرات بني ياجيس (المطلة مباشرة على حوض سد تابلوط)',
        catchment: 'Tabellout Dam Shoreline Sector',
        catchmentAr: 'الضفة الجنوبية الشرقية والواجهة المباشرة لبحيرة السد',
        lat: 36.6450,
        lng: 5.9420,
        areaHa: 340,
        slopeDeg: 28,
        slopePct: 53.2,
        dnbrMean: 685,
        severityLevel: 'high',
        preFireErosionTonHa: 4.8,
        postFireErosionTonHa: 98.4,
        firstStormSoilLossTonHa: 98.4,
        siltRiskTonYear: 33450,
        debrisFlowProbabilityPct: 82,
        recommendedInterventionEn: 'Gully Check Dams in Primary Ravines',
        recommendedInterventionAr: 'حواجز ترشيحية من الجابيون (Gully Check Dams) في قيعان الشعاب الرئيسية لحماية السعة الميتة والتشغيلية لسد تابلوط',
        interventionType: 'check_dam',
        priority: 'Critical',
        priorityAr: 'مرتفع للغاية (يهدد سعة السد)',
        estimatedCostDzd: 14200000,
        targetAgenciesAr: ['مديرية الموارد المائية (DRE)', 'الوكالة الوطنية للسدود (ANBT)', 'محافظة الغابات'],
        targetAgenciesEn: ['Direction des Ressources en Eau (DRE)', 'ANBT Dam Agency', 'Conservation des Forêts'],
        interventionUrgencyAr: 'حماية السعة الميتة والتشغيلية ومنع انسداد مآخذ محطة معالجة مياه الشرب',
      },
      {
        id: 'HTS-JJL-03',
        nameEn: 'Djimla Feeder Basin & Oued El Kebir',
        nameAr: 'حوض رافد جيملة ووادي الكبير',
        catchment: 'Tabellout Secondary Tributary',
        catchmentAr: 'الرافد الشمالي لحوض سد تابلوط',
        lat: 36.6320,
        lng: 5.8850,
        areaHa: 420,
        slopeDeg: 24,
        slopePct: 44.5,
        dnbrMean: 520,
        severityLevel: 'moderate_high',
        preFireErosionTonHa: 3.9,
        postFireErosionTonHa: 68.2,
        firstStormSoilLossTonHa: 68.2,
        siltRiskTonYear: 28644,
        debrisFlowProbabilityPct: 64,
        recommendedInterventionEn: 'Loose Rock Check Dams + Riparian Bioengineering',
        recommendedInterventionAr: 'سدود ترشيحية من الصخور المفككة وغرس عقل الصفصاف الحية لتثبيت ضفاف الشعاب',
        interventionType: 'check_dam',
        priority: 'High',
        priorityAr: 'أولوية مرتفعة',
        estimatedCostDzd: 9800000,
        targetAgenciesAr: ['محافظة الغابات لولاية جيجل', 'مديرية المصالح الفلاحية (DSA)'],
        targetAgenciesEn: ['Conservation des Forêts', 'Agricultural Services (DSA)'],
        interventionUrgencyAr: 'تثبيت التربة وإبطاء الجريان السطحي نحو الروافد',
      },
    ],
  },

  'kissir': {
    id: 'kissir',
    nameEn: 'Kissir Dam Catchment (El Aouana Coastal Mountains)',
    nameAr: 'حوض سد كيسير (جبال العوانة الساحلية)',
    damNameEn: 'Kissir Coastal Dam',
    damNameAr: 'سد كيسير الساحلي (جيجل)',
    damCapacityMillionM3: 68.0,
    totalWatershedAreaHa: 18200,
    burnedAreaTotalHa: 1750,
    burnedPct: 9.61,
    meanSlopePct: 38.2,
    annualRainfallMm: 1220,
    rFactor: 3450,
    preFireSoilLossTonYear: 78260,
    postFireSoilLossTonYear: 685000,
    lossIncreaseRatio: 8.75,
    annualSiltDeliveryM3: 540000,
    reservoirDeadStorageLossPctPerYear: 4.8,
    zones: [
      {
        level: 'high',
        nameEn: 'High Severity',
        nameAr: 'شدة مرتفعة جداً (كارهة للماء)',
        dnbrRange: '≥ 660',
        areaHa: 420,
        areaPct: 24.0,
        hydrophobicity: 'Extreme',
        hydrophobicityAr: 'كراهية قصوى للماء',
        kMultiplier: 2.20,
        cFactor: 0.55,
        curveNumber: 90,
      },
      {
        level: 'moderate_high',
        nameEn: 'Moderate-High Severity',
        nameAr: 'شدة متوسطة إلى مرتفعة',
        dnbrRange: '440 - 659',
        areaHa: 650,
        areaPct: 37.1,
        hydrophobicity: 'Severe',
        hydrophobicityAr: 'كراهية حادة للماء',
        kMultiplier: 1.80,
        cFactor: 0.40,
        curveNumber: 84,
      },
      {
        level: 'moderate_low',
        nameEn: 'Moderate-Low Severity',
        nameAr: 'شدة متوسطة إلى منخفضة',
        dnbrRange: '270 - 439',
        areaHa: 430,
        areaPct: 24.6,
        hydrophobicity: 'Moderate',
        hydrophobicityAr: 'كراهية متوسطة',
        kMultiplier: 1.45,
        cFactor: 0.25,
        curveNumber: 76,
      },
      {
        level: 'low',
        nameEn: 'Low Severity',
        nameAr: 'شدة منخفضة',
        dnbrRange: '100 - 269',
        areaHa: 250,
        areaPct: 14.3,
        hydrophobicity: 'Low',
        hydrophobicityAr: 'كراهية طفيفة',
        kMultiplier: 1.15,
        cFactor: 0.09,
        curveNumber: 66,
      },
      {
        level: 'unburned',
        nameEn: 'Unburned',
        nameAr: 'غير محترقة',
        dnbrRange: '< 100',
        areaHa: 16450,
        areaPct: 90.39,
        hydrophobicity: 'None',
        hydrophobicityAr: 'نفاذية طبيعية',
        kMultiplier: 1.0,
        cFactor: 0.007,
        curveNumber: 54,
      },
    ],
    hotspots: [
      {
        id: 'HTS-KSR-01',
        nameEn: 'Bouguerra Mountain Ridge & El Aouana Gorges (Kissir Dam)',
        nameAr: 'مرتفعات جبل بوقرعة وخوانق العوانة (سد كيسير)',
        catchment: 'Kissir Dam Upper Reservoir Catchment',
        catchmentAr: 'الحوض الصباب العلوي لسد كيسير ومحاور الطرق الساحلية',
        lat: 36.7780,
        lng: 5.6720,
        areaHa: 195,
        slopeDeg: 36,
        slopePct: 72.6,
        dnbrMean: 780,
        severityLevel: 'high',
        preFireErosionTonHa: 6.4,
        postFireErosionTonHa: 138.0,
        firstStormSoilLossTonHa: 138.0,
        siltRiskTonYear: 26910,
        debrisFlowProbabilityPct: 92,
        recommendedInterventionEn: 'Early Warning Acoustic Debris Flow Sensors + Gully Check Dams & Aerial Straw Mulch',
        recommendedInterventionAr: 'تركيب محطات إنذار صوتي مبكر للسيول الوحلية لحماية الطرقات والمحاور الحيوية أسفل الوادي، وتثبيت سدود ترشيحية والنشر الجوي للقش',
        interventionType: 'warning_system',
        priority: 'Critical',
        priorityAr: 'أولوية قصوى (حرج جداً)',
        estimatedCostDzd: 16800000,
        targetAgenciesAr: ['الحماية المدنية', 'مديرية الأشغال العمومية (DTP)', 'محافظة الغابات لولاية جيجل', 'مديرية الموارد المائية'],
        targetAgenciesEn: ['Protection Civile', 'Direction des Travaux Publics (DTP)', 'Conservation des Forêts', 'Direction des Ressources en Eau'],
        interventionUrgencyAr: 'إنذار مبكر فوري للسلامة العامة وحماية شبكة الطرقات الساحلية وسد كيسير',
      },
      {
        id: 'HTS-KSR-02',
        nameEn: 'Oued Kissir Feeder Valley',
        nameAr: 'وادي كيسير المجرى الرئيسي',
        catchment: 'Kissir Direct Intake',
        catchmentAr: 'مأخذ المياه المباشر لسد كيسير',
        lat: 36.7690,
        lng: 5.6540,
        areaHa: 220,
        slopeDeg: 26,
        slopePct: 48.8,
        dnbrMean: 580,
        severityLevel: 'moderate_high',
        preFireErosionTonHa: 4.5,
        postFireErosionTonHa: 76.5,
        siltRiskTonYear: 16830,
        debrisFlowProbabilityPct: 70,
        recommendedInterventionEn: 'Gabion Check Dams in Torrent Beds + Silt Basins',
        recommendedInterventionAr: 'سدود ترشيحية جابيونية وأحواض ترسيب مهدئة قبل بحيرة السد',
        interventionType: 'check_dam',
        priority: 'High',
        priorityAr: 'أولوية مرتفعة',
        estimatedCostDzd: 11200000,
      },
    ],
  },

  'boussiaba': {
    id: 'boussiaba',
    nameEn: 'Boussiaba Dam Catchment (El Milia & Ouled Yahia)',
    nameAr: 'حوض سد بوسيابة (الميلية وأولاد يحيى خدروش)',
    damNameEn: 'Boussiaba Strategic Dam',
    damNameAr: 'سد بوسيابة الاستراتيجي (جيجل)',
    damCapacityMillionM3: 120.0,
    totalWatershedAreaHa: 34800,
    burnedAreaTotalHa: 2860,
    burnedPct: 8.22,
    meanSlopePct: 29.8,
    annualRainfallMm: 1080,
    rFactor: 2950,
    preFireSoilLossTonYear: 135720,
    postFireSoilLossTonYear: 1120000,
    lossIncreaseRatio: 8.25,
    annualSiltDeliveryM3: 890000,
    reservoirDeadStorageLossPctPerYear: 3.8,
    zones: [
      {
        level: 'high',
        nameEn: 'High Severity',
        nameAr: 'شدة مرتفعة جداً (كارهة للماء)',
        dnbrRange: '≥ 660',
        areaHa: 620,
        areaPct: 21.7,
        hydrophobicity: 'Extreme',
        hydrophobicityAr: 'كراهية قصوى للماء',
        kMultiplier: 2.10,
        cFactor: 0.50,
        curveNumber: 87,
      },
      {
        level: 'moderate_high',
        nameEn: 'Moderate-High Severity',
        nameAr: 'شدة متوسطة إلى مرتفعة',
        dnbrRange: '440 - 659',
        areaHa: 1040,
        areaPct: 36.4,
        hydrophobicity: 'Severe',
        hydrophobicityAr: 'كراهية حادة للماء',
        kMultiplier: 1.70,
        cFactor: 0.36,
        curveNumber: 81,
      },
      {
        level: 'moderate_low',
        nameEn: 'Moderate-Low Severity',
        nameAr: 'شدة متوسطة إلى منخفضة',
        dnbrRange: '270 - 439',
        areaHa: 760,
        areaPct: 26.5,
        hydrophobicity: 'Moderate',
        hydrophobicityAr: 'كراهية متوسطة',
        kMultiplier: 1.38,
        cFactor: 0.20,
        curveNumber: 73,
      },
      {
        level: 'low',
        nameEn: 'Low Severity',
        nameAr: 'شدة منخفضة',
        dnbrRange: '100 - 269',
        areaHa: 440,
        areaPct: 15.4,
        hydrophobicity: 'Low',
        hydrophobicityAr: 'كراهية طفيفة',
        kMultiplier: 1.12,
        cFactor: 0.08,
        curveNumber: 64,
      },
      {
        level: 'unburned',
        nameEn: 'Unburned',
        nameAr: 'غير محترقة',
        dnbrRange: '< 100',
        areaHa: 31940,
        areaPct: 91.78,
        hydrophobicity: 'None',
        hydrophobicityAr: 'نفاذية طبيعية',
        kMultiplier: 1.0,
        cFactor: 0.009,
        curveNumber: 56,
      },
    ],
    hotspots: [
      {
        id: 'HTS-BSB-01',
        nameEn: 'El Ancer Ravine & Boussiaba West Feeder',
        nameAr: 'وادي العنصر والرافد الغربي لسد بوسيابة',
        catchment: 'Boussiaba Reservoir Direct Flank',
        catchmentAr: 'المصب المباشر في بحيرة بوسيابة',
        lat: 36.7150,
        lng: 6.1850,
        areaHa: 260,
        slopeDeg: 30,
        slopePct: 57.7,
        dnbrMean: 710,
        severityLevel: 'high',
        preFireErosionTonHa: 4.9,
        postFireErosionTonHa: 104.2,
        siltRiskTonYear: 27092,
        debrisFlowProbabilityPct: 84,
        recommendedInterventionEn: 'Contour Log Felling + Sediment Settling Ponds',
        recommendedInterventionAr: 'سدود جذوع الأشجار الكفافية وأحواض تهدئة الرسوبيات الترابية',
        interventionType: 'contour_felling',
        priority: 'Critical',
        priorityAr: 'أولوية قصوى (حرج جداً)',
        estimatedCostDzd: 15400000,
      },
    ],
  },
};

export const JIJEL_PYTHON_CODE_SNIPPETS = {
  dnbrProcessor: `import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling

def calculate_nbr(nir_path, swir_path):
    """حساب مؤشر NBR من نطاقي NIR و SWIR (Sentinel-2 B08 & B12)"""
    with rasterio.open(nir_path) as src_nir:
        nir = src_nir.read(1).astype('float32')
        profile = src_nir.profile

    with rasterio.open(swir_path) as src_swir:
        swir = src_swir.read(1).astype('float32')

    # تجنب القسمة على صفر
    denom = nir + swir
    denom[denom == 0] = np.nan
    
    nbr = (nir - swir) / denom
    return nbr, profile

def process_dnbr(pre_nir, pre_swir, post_nir, post_swir, output_path):
    """حساب dNBR وتصنيفه لحساب شدة الاحتراق وكراهية التربة للماء"""
    print("⏳ جارٍ حساب NBR لصور ما قبل الحريق...")
    nbr_pre, profile = calculate_nbr(pre_nir, pre_swir)
    
    print("⏳ جارٍ حساب NBR لصور ما بعد الحريق...")
    nbr_post, _ = calculate_nbr(post_nir, post_swir)

    # حساب dNBR وسحب القيمة لـ scaled int16 (تعديل معياري USGS)
    dnbr = (nbr_pre - nbr_post) * 1000

    # تصنيف المناطق حسب معايير USGS
    # 1: Unburned / Low (< 100)
    # 2: Moderate-Low (100 - 269)
    # 3: Moderate-High (270 - 659)
    # 4: High Severity / High Hydrophobicity Risk (>= 660)
    burn_severity = np.zeros(dnbr.shape, dtype=np.uint8)
    burn_severity[dnbr < 100] = 1
    burn_severity[(dnbr >= 100) & (dnbr < 270)] = 2
    burn_severity[(dnbr >= 270) & (dnbr < 660)] = 3
    burn_severity[dnbr >= 660] = 4

    profile.update(dtype=rasterio.uint8, count=1, nodata=0, compress='lzw')
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(burn_severity, 1)

    print(f"✅ تم إنشاء خريطة شدة الاحتراق بنجاح: {output_path}")`,

  hydrophobicityMod: `# geo-engine/post_fire/soil_hydrophobicity.py
import numpy as np
import rasterio

def adjust_soil_parameters_post_fire(k_base_tif, dnbr_tif, output_k_post_tif):
    """
    تعديل معامل تآكل التربة K والغطاء النباتي C ومؤشر Curve Number
    استناداً إلى شدة الاحتراق وطبقة الكراهية المائية (Hydrophobic Layer)
    """
    with rasterio.open(k_base_tif) as src_k, rasterio.open(dnbr_tif) as src_dnbr:
        k_base = src_k.read(1)
        dnbr = src_dnbr.read(1)
        profile = src_k.profile

    # مصفوفة مضاعف الانجراف K-Multiplier
    k_multiplier = np.ones_like(k_base)
    k_multiplier[dnbr >= 660] = 2.15  # High Hydrophobicity: مضاعفة مرتين وأكثر
    k_multiplier[(dnbr >= 440) & (dnbr < 660)] = 1.75
    k_multiplier[(dnbr >= 270) & (dnbr < 440)] = 1.40
    k_multiplier[(dnbr >= 100) & (dnbr < 270)] = 1.15

    k_post = k_base * k_multiplier

    profile.update(dtype=rasterio.float32)
    with rasterio.open(output_k_post_tif, 'w', **profile) as dst:
        dst.write(k_post.astype('float32'), 1)
        
    return k_post`,

  rusleRunoffSiltation: `# geo-engine/post_fire/rusle_siltation_jijel.py
import numpy as np
import rasterio

def calculate_post_fire_rusle_and_siltation(r_path, k_post_path, ls_path, c_post_path, dam_sdr=0.42):
    """
    نمذجة فقدان التربة A = R * K * LS * C وحساب حمولة الرسوبيات السنوية نحو السد
    """
    with rasterio.open(r_path) as src_r:
        r = src_r.read(1)
        profile = src_r.profile
    with rasterio.open(k_post_path) as src_k:
        k = src_k.read(1)
    with rasterio.open(ls_path) as src_ls:
        ls = src_ls.read(1)
    with rasterio.open(c_post_path) as src_c:
        c = src_c.read(1)

    # RUSLE Equation: Soil Loss (Ton / Ha / Year)
    soil_loss_ton_ha_yr = r * k * ls * c

    # Sediment Delivery Ratio (SDR) لحوض سد تابلوط أو كيسير
    sediment_yield_ton = np.sum(soil_loss_ton_ha_yr) * dam_sdr
    bulk_density_sediment = 1.35 # t/m3
    siltation_volume_m3 = sediment_yield_ton / bulk_density_sediment

    print(f"🌊 إجمالي الرسوبيات المنقولة إلى بحيرة السد: {siltation_volume_m3:,.0f} م³/سنة")
    return soil_loss_ton_ha_yr, siltation_volume_m3`,

  hotspotExtraction: `# geo-engine/post_fire/baer_hotspots.py
import json
import numpy as np
import rasterio
from rasterio.features import shapes
from shapely.geometry import shape, mapping

def extract_erosion_hotspots(erosion_raster_path, dem_path, threshold_soil_loss, output_geojson_path):
    """
    استخراج المناطق ذات معدلات الانجراف الحرجة (Hotspots) وتوليد طبقة نقاط/مضلعات التدخل
    """
    print("⏳ جارٍ تحليل خريطة الانجراف واستخراج النقاط الساخنة (Hotspots)...")
    
    with rasterio.open(erosion_raster_path) as src:
        erosion_data = src.read(1)
        transform = src.transform
        crs = src.crs

    # عزل المناطق التي يتجاوز فيها فقدان التربة الحد الحرج (مثلاً > 50 طن/هكتار/سنة)
    hotspot_mask = (erosion_data >= threshold_soil_loss).astype(np.uint8)

    # تحويل المصفوفة الراسترية الناتجة إلى مضلعات هندسية (Polygons)
    features = []
    for geom, value in shapes(hotspot_mask, transform=transform):
        if value == 1:  # يعني أنه ينتمي للنقاط الساخنة
            poly = shape(geom)
            # حساب مركز الثقل لكل بؤرة حرجة لتحديد إحداثيات نقطة التدخل الميداني
            centroid = poly.centroid
            
            # تحديد نوع التدخل المقترح بناءً على شدة الخطورة
            intervention_type = "Contour Log Felling (LEBs) & Straw Mulching"
            
            feature = {
                "type": "Feature",
                "geometry": mapping(poly),
                "properties": {
                    "risk_level": "Critical Hotspot",
                    "estimated_erosion_t_ha": float(threshold_soil_loss),
                    "recommended_action": intervention_type,
                    "target_dam_risk": "Tabellout / Kissir / Boussiaba Protection"
                }
            }
            features.append(feature)

    geojson_output = {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": str(crs)}},
        "features": features
    }

    # حفظ الملف بصيغة GeoJSON لتصديره لفرق الميدان
    with open(output_geojson_path, 'w', encoding='utf-8') as f:
        json.dump(geojson_output, f, ensure_ascii=False, indent=4)

    print(f"✅ تم بنجاح تصدير {len(features)} نقطة/منطقة ساخنة حرجة إلى: {output_geojson_path}")
    return output_geojson_path

# --- مثال تشغيلي (للإدماج في محرك SolVision) ---
# extract_erosion_hotspots('jijel_post_fire_erosion_risk.tif', 'jijel_dem_30m.tif', 50.0, 'jijel_baer_hotspots.geojson')`,
};
