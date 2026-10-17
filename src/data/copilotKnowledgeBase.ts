import { CopilotMessage } from '../types';

export interface CopilotKnowledgeItem {
  id: string;
  keywordsEn: string[];
  keywordsAr: string[];
  intent: string;
  responseEn: string;
  responseAr: string;
  metricsSummary?: {
    labelEn: string;
    labelAr: string;
    value: string;
    color?: string;
  }[];
  mapFocus?: {
    lat: number;
    lng: number;
    zoom: number;
    titleEn: string;
    titleAr: string;
    descriptionEn?: string;
    descriptionAr?: string;
    badge?: string;
  };
  geoJsonPayload?: {
    type: string;
    name: string;
    data: Record<string, unknown>;
  };
  suggestedActions?: {
    id: string;
    labelEn: string;
    labelAr: string;
    actionType: 'focus_map' | 'view_report' | 'open_tab' | 'run_simulation';
    payload?: any;
  }[];
}

export const COPILOT_KNOWLEDGE_BASE: CopilotKnowledgeItem[] = [
  // 1. Intent: Citrus parcel Moisture & Fertilizer N-P-K & CEC
  {
    id: 'citrus_moisture_npk',
    keywordsEn: ['citrus', 'moisture', 'fertilizer', 'npk', 'cec', 'ndwi', 'today', 'water requirement'],
    keywordsAr: ['حمضيات', 'رطوبة', 'تسميد', 'سماد', 'سمادية', 'npk', 'cec', 'ndwi', 'اليوم', 'احتياجات'],
    intent: 'agronomy_fertilizer_moisture',
    responseAr: `بناءً على قراءات SoilGrids ومؤشرات Sentinel-2 الحية لقطاع الحمضيات (المساحة: 142.5 هكتار):\n
• **مؤشر الرطوبة النباتية (NDWI):** بلغ 0.42 (حالة رطوبية جيدة إلى متوسطة).\n
• **الرطوبة الحجمية للتربة (0-30 سم):** تبلغ 34.2% مع عجز رطوبي طفيف في الطبقة السطحية الرملية الطميية.\n
• **السعة التبادلية الكاتيونية (CEC):** 24.5 cmol(+)/kg (قدرة احتفاظ ممتازة بالعناصر الغذائية).\n
• **الاحتياجات السمادية الصافية (NPK):**\n
  - الآزوت (N): 160 كغ/هكتار (توزيع مجزأ على 3 دفعات بالتنقيط Fertigation).\n
  - الفوسفور (P₂O₅): 55 كغ/هكتار.\n
  - البوتاسيوم (K₂O): 140 كغ/هكتار لتدعيم جودة الثمار ومقاومة الإجهاد.\n
• **درجة الحموضة (pH):** 7.2 (معتدلة - لا تتطلب معالجة كلسية).`,
    responseEn: `Based on SoilGrids raster layers and live Sentinel-2 multispectral metrics for the Citrus Parcel (Area: 142.5 ha):\n
• **Vegetation Water Index (NDWI):** 0.42 (Healthy to moderate hydration).\n
• **Topsoil Volumetric Moisture (0-30 cm):** 34.2% with slight deficit in surface sandy-loam.\n
• **Cation Exchange Capacity (CEC):** 24.5 cmol(+)/kg (Optimal nutrient retention capacity).\n
• **Net Fertilizer Recommendation (NPK):**\n
  - Nitrogen (N): 160 kg/ha (Split into 3 fertigation doses).\n
  - Phosphorus (P₂O₅): 55 kg/ha.\n
  - Potassium (K₂O): 140 kg/ha for fruit calibers and stress tolerance.\n
• **Soil Reaction (pH H₂O):** 7.2 (Neutral - no liming needed).`,
    metricsSummary: [
      { labelEn: 'NDWI Moisture', labelAr: 'مؤشر الرطوبة NDWI', value: '0.42', color: 'text-cyan-400' },
      { labelEn: 'Soil Moisture', labelAr: 'رطوبة التربة', value: '34.2%', color: 'text-emerald-400' },
      { labelEn: 'CEC Capacity', labelAr: 'السعة التبادلية CEC', value: '24.5 cmol/kg', color: 'text-amber-400' },
      { labelEn: 'N-P-K Plan', labelAr: 'برنامج NPK', value: '160-55-140', color: 'text-purple-400' },
    ],
    mapFocus: {
      lat: 36.652,
      lng: 5.761,
      zoom: 14,
      titleEn: 'Citrus Sector - Mitidja / Jijel Periphery',
      titleAr: 'قطاع الحمضيات - السهول الساحلية',
      descriptionAr: '142.5 هكتار - تربة رملية طميية ذات قدرة احتفاظ جيدة',
      descriptionEn: '142.5 ha - Sandy loam soil with high water holding capacity',
      badge: 'NDWI: 0.42 • CEC: 24.5'
    },
    geoJsonPayload: {
      type: 'Feature',
      name: 'Citrus Sector Boundary',
      data: {
        type: 'Polygon',
        coordinates: [
          [
            [5.752, 36.645],
            [5.772, 36.648],
            [5.768, 36.658],
            [5.748, 36.655],
            [5.752, 36.645]
          ]
        ]
      }
    },
    suggestedActions: [
      { id: 'focus_citrus', labelEn: 'Zoom to Citrus Parcel on Map', labelAr: 'تركيز الخريطة على قطاع الحمضيات', actionType: 'focus_map' },
      { id: 'open_fertilizer', labelEn: 'Open NPK Fertilizer Advisor', labelAr: 'فتح حاسبة التسميد الذكية', actionType: 'open_tab', payload: 'fertilizer' }
    ]
  },

  // 2. Intent: Critical Erosion Hotspot in Tabellout Dam Basin
  {
    id: 'tabellout_critical_hotspot',
    keywordsEn: ['tabellout', 'erosion', 'hotspot', 'critical', 'dam', 'djendjen', 'texenna', 'danger', 'where is'],
    keywordsAr: ['تابلوط', 'بؤرة', 'انجراف', 'أخطر', 'سد', 'جن جن', 'تاكسنة', 'حرائق', 'تآكل', 'أين تقع'],
    intent: 'postfire_hotspot_query',
    responseAr: `أخطر بؤرة انجراف حرجة في حوض سد تابلوط هي **البؤرة HTS-JJL-01 (رافد وادي جن جن العلوي ومضائق تاكسنة)**:\n
• **الإحداثيات الجغرافية:** خط عرض 36.6812°N ، خط طول 5.7945°E (نظام UTM Zone 31N: E 392,340m , N 4,060,250m).\n
• **معدل تآكل التربة بعد الحرائق:** **128.4 طن/هكتار/سنة** (ارتفاع بنسبة +688% مقارنة بما قبل الحريق 16.3 طن).\n
• **الانحدار الطبوغرافي:** 42.5% (منحدرات جبلية شديدة الوعورة).\n
• **حجم الرسوبيات السنوي المهدد لبحيرة السد:** 48,500 م³ من الأوحال.\n
• **التدابير الميدانية العاجلة (BAER):**\n
  - إقامة سدود جذوع كفافية متدرجة (Log Erosion Barriers - LEBs).\n
  - تغطية التربة بالقش الزراعي المعقم (Straw Mulching) لكسر طاقة حبات المطر ومنع الجريان الأخدودي.\n
• **الجهات التنفيذية المكلفة:** محافظة الغابات لولاية جيجل والحماية المدنية.`,
    responseEn: `The most critical erosion hotspot in the Tabellout Dam catchment is **HTS-JJL-01 (Upper Djendjen Torrent & Texenna Gorges)**:\n
• **Coordinates:** Lat 36.6812°N, Lng 5.7945°E (UTM Zone 31N: E 392,340m, N 4,060,250m).\n
• **Post-Fire Soil Loss:** **128.4 tons/ha/year** (+688% surge compared to pre-fire 16.3 t/ha).\n
• **Mean Slope:** 42.5% (Steep mountain ravines).\n
• **Reservoir Silt Delivery Threat:** 48,500 m³ mud and sediment annually.\n
• **Emergency Field Actions (BAER):**\n
  - Construct staggered contour log erosion barriers (LEBs).\n
  - Apply certified agricultural straw mulching to attenuate raindrop kinetic energy.\n
• **Target Agencies:** Conservation des Forêts (Jijel) & Protection Civile.`,
    metricsSummary: [
      { labelEn: 'Soil Loss', labelAr: 'معدل التآكل', value: '128.4 t/ha/yr', color: 'text-rose-400' },
      { labelEn: 'Erosion Surge', labelAr: 'مضاعفة الجرف', value: '+688%', color: 'text-rose-500' },
      { labelEn: 'Slope Gradient', labelAr: 'درجة الانحدار', value: '42.5%', color: 'text-amber-400' },
      { labelEn: 'Coordinates', labelAr: 'الإحداثيات', value: '36.68°N, 5.79°E', color: 'text-cyan-400' },
    ],
    mapFocus: {
      lat: 36.6812,
      lng: 5.7945,
      zoom: 15,
      titleEn: 'HTS-JJL-01: Upper Djendjen & Texenna Gorges',
      titleAr: 'HTS-JJL-01: رافد وادي جن جن العلوي وخوانق تاكسنة',
      descriptionAr: 'أخطر بؤرة انجراف في ولاية جيجل (128.4 طن/هك/سنة) - أولوية تدخل قصوى',
      descriptionEn: 'Highest erosion severity in Jijel (128.4 t/ha/yr) - Priority BAER Zone',
      badge: 'Critical Hotspot • LEBs & Mulch'
    },
    geoJsonPayload: {
      type: 'Feature',
      name: 'HTS-JJL-01 Hotspot Geometry',
      data: {
        type: 'Polygon',
        coordinates: [
          [
            [5.7895, 36.6780],
            [5.8010, 36.6805],
            [5.7980, 36.6855],
            [5.7860, 36.6830],
            [5.7895, 36.6780]
          ]
        ]
      }
    },
    suggestedActions: [
      { id: 'focus_hotspot', labelEn: 'Zoom to Hotspot on Map', labelAr: '📍 تركيز الخريطة على البؤرة الساخنة', actionType: 'focus_map' },
      { id: 'open_postfire', labelEn: 'Open Post-Fire Risk Engine', labelAr: 'فتح مسار مخاطر ما بعد الحرائق (5 مراحل)', actionType: 'open_tab', payload: 'post-fire' },
      { id: 'open_flood', labelEn: 'Run Deep Learning Flood Forecast', labelAr: 'توقع السيول العاجلة للوادي (Deep Learning)', actionType: 'open_tab', payload: 'flood-forecast' }
    ]
  },

  // 3. Intent: Kissir Dam Hotspot & Mudflow warning
  {
    id: 'kissir_hotspot_warning',
    keywordsEn: ['kissir', 'bouguerra', 'aouana', 'drinking water', 'siren', 'warning system', 'mudflow'],
    keywordsAr: ['كيسير', 'بوقرعة', 'العوانة', 'مياه الشرب', 'إنذار صوتي', 'سيول وحلية', 'سد كيسير'],
    intent: 'kissir_warning_query',
    responseAr: `حوض سد كيسير لمياه الشرب يضم البؤرة الحرجة **HTS-KSR-01 (مرتفعات جبل بوقرعة وخوانق العوانة)**:\n
• **طبيعة الخطر:** سد كيسير هو المزود الرئيسي لمياه الشرب لمدينة جيجل وسكان الشريط الساحلي. يؤدي الجريان السطحي الكثيف إلى ارتفاع مفاجئ في عكارة المياه (Turbidity > 450 NTU) مما يعطل محطة المعالجة.\n
• **معدل التآكل:** **98.2 طن/هكتار/سنة** على انحدار شديد يبلغ 46%.\n
• **الإجراء الميداني الفوري:**\n
  - تركيب **محطات إنذار صوتي وهيدرولوجي مبكر** مرتبطة برادار الطقس وحساسات التدفق بالوادي لحماية الطريق الوطني RN43 والمجمعات السفلية.\n
  - حواجز ترشيحية للحصى والطمي لحماية مأخذ مياه الشرب.`,
    responseEn: `The Kissir Dam drinking water basin features critical hotspot **HTS-KSR-01 (Mount Bouguerra & El Aouana Gorges)**:\n
• **Risk Profile:** Kissir dam supplies potable water to Jijel urban cluster. Mudflow surges cause extreme raw water turbidity (>450 NTU), tripping filtration plants.\n
• **Erosion Rate:** **98.2 tons/ha/year** on 46% steep ravines.\n
• **Immediate Field Actions:**\n
  - Install **early warning sirens and ultrasonic stage gauges** linked to civil protection to alert travelers on Coastal Road RN43.\n
  - Deploy upstream silt traps to safeguard water treatment intakes.`,
    metricsSummary: [
      { labelEn: 'Erosion Rate', labelAr: 'معدل التآكل', value: '98.2 t/ha/yr', color: 'text-amber-400' },
      { labelEn: 'Slope', labelAr: 'الانحدار', value: '46.0%', color: 'text-yellow-400' },
      { labelEn: 'Action', labelAr: 'الإجراء', value: 'محطات إنذار صوتي', color: 'text-rose-400' }
    ],
    mapFocus: {
      lat: 36.7915,
      lng: 5.6421,
      zoom: 15,
      titleEn: 'HTS-KSR-01: Mount Bouguerra & El Aouana',
      titleAr: 'HTS-KSR-01: مرتفع جبل بوقرعة وخوانق العوانة',
      badge: 'Drinking Water Threat'
    },
    suggestedActions: [
      { id: 'focus_kissir', labelEn: 'Focus on Kissir Hotspot', labelAr: 'تركيز الخريطة على بؤرة كيسير', actionType: 'focus_map' },
      { id: 'open_postfire', labelEn: 'View BAER Interventions', labelAr: 'عرض خطة التدخل العاجل', actionType: 'open_tab', payload: 'post-fire' }
    ]
  },

  // 4. Intent: Deep Learning Flood Forecasting (LSTM & Prophet)
  {
    id: 'flood_forecasting_general',
    keywordsEn: ['flood', 'forecast', 'lstm', 'deep learning', 'prophet', 'radar', 'runoff', 'flash flood', 'hydrograph'],
    keywordsAr: ['سيول', 'تنبؤ', 'فيضان', 'تعلم عميق', 'lstm', 'رادار', 'جريان', 'هيدروغراف', 'أمطار فورية'],
    intent: 'flood_forecast_query',
    responseAr: `يعتمد نظام التنبؤ بالسيول في منصة SolVision على **نموذج هجين (Bidirectional LSTM + Prophet)**:\n
• **المدخلات الفورية:** قراءات الرادار الجوي وهطول الأمطار الفوري (ملم/ساعة)، مؤشر تشبع التربة (SWI %)، ونموذج الارتفاع الرقمي (DEM) لحساب زمن التركيز الهيدرولوجي ($T_c$).\n
• **التنبؤ التلقائي:** يتم حساب هيدروغراف التدفق بدقة 15 دقيقة على مدار 6 ساعات قادمة.\n
• **الإنذار المبكر:** في حال تجاوز التدفق ذروة $Q_{crit}$، يصدر النظام تنبيهاً فورياً مع عد تنازلي لوصول الموجة الوحلية (Mudflow Travel Time) نحو السدود ومحاور الطرق.`,
    responseEn: `The SolVision flood forecasting engine runs a **hybrid Bidirectional LSTM + Prophet neural architecture**:\n
• **Live Inputs:** Weather radar precipitation rates (mm/h), Soil Water Saturation Index (SWI %), and DEM topographic concentration time ($T_c$).\n
• **Forecasting:** Generates step-by-step discharge hydrograph ($Q$ m³/s) at 15-minute intervals over a 6-hour projection horizon.\n
• **Early Warning:** Upon exceeding critical discharge $Q_{crit}$, the platform activates emergency sirens with exact time-to-impact calculation for dam reservoirs and highway crossings.`,
    metricsSummary: [
      { labelEn: 'Model Type', labelAr: 'نوع النموذج', value: 'PyTorch LSTM + Prophet', color: 'text-purple-400' },
      { labelEn: 'Lead Time', labelAr: 'المهلة الاستباقية', value: '2 إلى 4 ساعات', color: 'text-cyan-400' },
      { labelEn: 'Radar Step', labelAr: 'الدقة الزمنية', value: '15 دقيقة', color: 'text-emerald-400' }
    ],
    suggestedActions: [
      { id: 'open_flood_tab', labelEn: 'Open Deep Learning Flood Forecasting', labelAr: 'فتح منصة التنبؤ بالسيول (تعلم عميق)', actionType: 'open_tab', payload: 'flood-forecast' }
    ]
  },

  // 5. Intent: Boussiaba Dam Siltation & Storage
  {
    id: 'boussiaba_siltation',
    keywordsEn: ['boussiaba', 'silt', 'sediment', 'storage', 'el milia', 'bellara'],
    keywordsAr: ['بوسيابة', 'توحل', 'رسوبيات', 'طمي', 'الميلية', 'بلارة'],
    intent: 'dam_siltation_query',
    responseAr: `حوض سد بوسيابة (الميلية) تبلغ مساحته 268 كم² وسعته الكلية 120 مليون م³:\n
• **حجم الرسوبيات السنوي المتوقع:** 84,200 م³/سنة من الأوحال.\n
• **معدل استهلاك السعة الميتة:** 2.8% سنوياً من حيز التخزين الميت المخصص للرواسب.\n
• **الحماية الاستراتيجية:** السد يغذي المنطقة الصناعية ببلارة ومجمع الحديد والصلب الجزائري-القطري، ما يتطلب سدود حجز ترشيحية بأعالي وادي بوسيابة.`,
    responseEn: `The Boussiaba Dam basin (El Milia) spans 268 km² with 120M m³ storage capacity:\n
• **Annual Expected Sediment Delivery:** 84,200 m³/year.\n
• **Dead Storage Depletion Rate:** 2.8% annually.\n
• **Strategic Objective:** Securing continuous industrial cooling water for Bellara Industrial Complex & Algerian Qatari Steel.`,
    metricsSummary: [
      { labelEn: 'Annual Silt', labelAr: 'الرسوبيات السنوية', value: '84,200 m³', color: 'text-amber-400' },
      { labelEn: 'Dead Storage Loss', labelAr: 'فقدان السعة الميتة', value: '2.8% / yr', color: 'text-rose-400' }
    ],
    mapFocus: {
      lat: 36.7214,
      lng: 6.1842,
      zoom: 14,
      titleEn: 'Boussiaba Dam & Catchment',
      titleAr: 'سد بوسيابة وحوض الميلية',
      badge: 'Industrial Water Hub'
    },
    suggestedActions: [
      { id: 'focus_boussiaba', labelEn: 'Focus on Boussiaba Dam', labelAr: 'تركيز الخريطة على سد بوسيابة', actionType: 'focus_map' },
      { id: 'open_postfire', labelEn: 'Open Dam Siltation Profile', labelAr: 'عرض ملف توحل السدود', actionType: 'open_tab', payload: 'post-fire' }
    ]
  }
];

/**
 * Intelligent semantic query matching with keyword intent extraction & scoring
 */
export function queryCopilotKnowledgeBase(query: string, lang: 'ar' | 'en'): CopilotKnowledgeItem | null {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return null;

  let bestItem: CopilotKnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of COPILOT_KNOWLEDGE_BASE) {
    const list = lang === 'ar' ? [...item.keywordsAr, ...item.keywordsEn] : [...item.keywordsEn, ...item.keywordsAr];
    let score = 0;
    for (const kw of list) {
      if (cleanQuery.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestItem = item;
    }
  }

  return highestScore > 0 ? bestItem : null;
}
