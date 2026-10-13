# geo-engine/modules/soil_organic_carbon.py
import numpy as np
import rasterio
from rasterio.mask import mask
import json

def calculate_soil_carbon_and_afforestation(geometry_geojson, vrt_soc_paths, vrt_bdod_paths, vrt_cfvo_paths):
    """
    يحسب مخزون الكربون العضوي (SOC Stock) لمختلف الأعماق 
    ويحدد مؤشر أولوية التشجير ومكافحة التصحر.
    """
    total_carbon_stock_t_ha = 0.0
    depth_layers_report = []

    # التحويل إلى شكل هندسي لـ Rasterio
    geom = [json.loads(json.dumps(geometry_geojson))]

    # الأعماق القياسية في SoilGrids (بالسنتيمتر)
    depths = ["0-5", "5-15", "15-30", "30-60", "60-100", "100-200"]
    depth_intervals = [5, 10, 15, 30, 40, 100] # سم لكل طبقة

    for i, depth in enumerate(depths):
        soc_path = vrt_soc_paths[depth]  # g/kg (decipassed by 10 usually -> g/kg)
        bdod_path = vrt_bdod_paths[depth] # cg/cm³ (Bulk Density)
        cfvo_path = vrt_cfvo_paths[depth] # cm³/100cm³ (Coarse fragments)

        thickness = depth_intervals[i]

        # قراءة وقص طبقة الكربون العضوي
        with rasterio.open(soc_path) as src_soc:
            out_image_soc, _ = mask(src_soc, geom, crop=True, nodata=np.nan)
            soc_val = np.nanmean(out_image_soc) / 10.0 # تحويل إلى g/kg أو النسبة المئوية حسب معايرة الملف

        # قراءة الكثافة الظاهرية Bulk Density
        with rasterio.open(bdod_path) as src_bd:
            out_image_bd, _ = mask(src_bd, geom, crop=True, nodata=np.nan)
            bd_val = np.nanmean(out_image_bd) / 100.0 # g/cm³

        # قراءة العناصر الخشنة Coarse Fragments
        with rasterio.open(cfvo_path) as src_cf:
            out_image_cf, _ = mask(src_cf, geom, crop=True, nodata=np.nan)
            cf_val = np.nanmean(out_image_cf) / 10.0 # %

        if np.isnan(soc_val) or np.isnan(bd_val):
            layer_stock = 0.0
        else:
            # معادلة حساب مخزون الكربون العضوي لكل طبقة (t/ha)
            # SOC_stock = (SOC * BD * Depth * (1 - Coarse_Fragments/100)) / 10
            layer_stock = (soc_val * bd_val * thickness * (1.0 - (cfv_safe(cf_val) / 100.0))) / 10.0

        total_carbon_stock_t_ha += layer_stock
        depth_layers_report.append({
            "depth_cm": depth,
            "carbon_stock_t_ha": round(layer_stock, 2)
        })

    # تقييم أولوية التشجير (مثلاً لدعم السد الأخضر في السهوب أو الأراضي الهشة)
    afforestation_suitability = evaluate_afforestation_potential(total_carbon_stock_t_ha)

    return {
        "total_soc_stock_t_ha": round(total_carbon_stock_t_ha, 2),
        "layers": depth_layers_report,
        "afforestation_recommendation": afforestation_suitability
    }

def cfv_safe(val):
    return val if not np.isnan(val) else 0.0

def evaluate_afforestation_potential(total_stock):
    if total_stock < 30:
        return {
            "priority": "عالية جداً (أراضي سهبية متدهورة / السد الأخضر)",
            "action": "مطلوب تدخل عاجل بمشاريع التشجير الكبرى (السد الأخضر) مع تحسين المحتوى العضوي بالتسميد الحيوي وتثبيت الكثبان."
        }
    elif total_stock <= 70:
        return {
            "priority": "متوسطة",
            "action": "ملاءمة جيدة للغراسات المقاومة للجفاف وتثبيت الكثبان أو التربة الهشة ومصدات الرياح."
        }
    else:
        return {
            "priority": "منخفضة الأولوية للتشجير السريع / عالية الخصوبة",
            "action": "يوصى بالحفاظ على الغطاء النباتي القائم واستغلالها في الزراعات المحسنة والغابات الإنتاجية."
        }
