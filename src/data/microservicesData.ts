import { MicroserviceStatus, QueueJob } from '../types';

export const STARTER_DOCKER_COMPOSE = `version: '3.8'

services:
  solvision-db:
    image: postgis/postgis:15-3.3
    container_name: solvision_postgis
    restart: unless-stopped
    environment:
      POSTGRES_DB: solvision_db
      POSTGRES_USER: solvision_admin
      POSTGRES_PASSWORD: super_secure_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U solvision_admin -d solvision_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  solvision-redis:
    image: redis:7-alpine
    container_name: solvision_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  solvision-geo-engine:
    build: 
      context: ./geo-engine
      dockerfile: Dockerfile
    container_name: solvision_geo_engine
    restart: unless-stopped
    environment:
      - REDIS_URL=redis://solvision-redis:6379/0
      - DATABASE_URL=postgres://solvision_admin:super_secure_password@solvision-db:5432/solvision_db
      - SOILGRIDS_VRT_DIR=/data/soilgrids_vrt
      - PROJ_LIB=/usr/share/proj
      - GDAL_DATA=/usr/share/gdal
      - NUM_WORKERS=4
    ports:
      - "8000:8000"
    volumes:
      - ./data/soilgrids:/data/soilgrids_vrt:ro
    depends_on:
      solvision-db:
        condition: service_healthy
      solvision-redis:
        condition: service_healthy

  solvision-core-api:
    build:
      context: ./core-api
      dockerfile: Dockerfile
    container_name: solvision_core_api
    restart: unless-stopped
    environment:
      - PORT=5000
      - DATABASE_URL=postgres://solvision_admin:super_secure_password@solvision-db:5432/solvision_db
      - REDIS_URL=redis://solvision-redis:6379/1
      - GEO_ENGINE_URL=http://solvision-geo-engine:8000
    ports:
      - "5000:5000"
    depends_on:
      - solvision-db
      - solvision-redis
      - solvision-geo-engine

  solvision-gateway:
    image: nginx:alpine
    container_name: solvision_nginx_gateway
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - solvision-core-api
      - solvision-geo-engine

volumes:
  pgdata:
`;

export const INITIAL_MICROSERVICES: MicroserviceStatus[] = [
  {
    name: 'Frontend Console (Spatial UI)',
    roleEn: 'Unified Spatial Intelligence & Agricultural Workstation',
    roleAr: 'واجهة المستخدم الموحدة للتحليل المكاني والزراعي',
    containerName: 'solvision_web_ui',
    image: 'solvision/frontend:v1.0.0',
    port: '3000:80',
    status: 'healthy',
    uptime: '18h 42m',
    latencyMs: 12,
    memoryUsageMb: 94,
    cpuPercent: 1.2,
    tech: 'React 19 / TypeScript / Tailwind CSS / Leaflet',
  },
  {
    name: 'API Gateway (Nginx)',
    roleEn: 'Reverse Proxy, SSL Termination & Microservices Routing',
    roleAr: 'بوابة الـ API وتوجيه الطلبات وإدارة أمان المسارات',
    containerName: 'solvision_nginx_gateway',
    image: 'nginx:alpine',
    port: '80:80 / 443:443',
    status: 'healthy',
    uptime: '22h 15m',
    latencyMs: 4,
    memoryUsageMb: 32,
    cpuPercent: 0.8,
    tech: 'Nginx 1.25 / Lua Stream Proxy',
  },
  {
    name: 'Core API Service',
    roleEn: 'User Auth, Farms, RBAC, Reports & Project State',
    roleAr: 'إدارة المستخدمين، المزارع، الأحواض والتوثيق والتقارير',
    containerName: 'solvision_core_api',
    image: 'solvision/core-api:node20-alpine',
    port: '5000:5000',
    status: 'healthy',
    uptime: '14h 50m',
    latencyMs: 18,
    memoryUsageMb: 142,
    cpuPercent: 2.1,
    tech: 'Node.js 20 / Express / TypeScript / Drizzle ORM',
  },
  {
    name: 'Geo-Spatial Engine',
    roleEn: 'VRT Raster Clipping, UTM Reprojection, IDW & RUSLE K-Factor',
    roleAr: 'محرك المعالجة المكانية، تحويل الإسقاط، كليب الرستر ونمذجة التآكل',
    containerName: 'solvision_geo_engine',
    image: 'solvision/geo-engine:py311-gdal38',
    port: '8000:8000',
    status: 'healthy',
    uptime: '11h 05m',
    latencyMs: 34,
    memoryUsageMb: 380,
    cpuPercent: 5.6,
    tech: 'Python 3.11 / FastAPI / GDAL 3.8 / Rasterio / NumPy / SciPy',
  },
  {
    name: 'PostgreSQL + PostGIS',
    roleEn: 'Spatial Vector Polygons, Soil Samples & Spatial Intersects',
    roleAr: 'التخزين المكاني للمضلعات، نقاط التربة الحقلية والاستعلامات الجغرافية',
    containerName: 'solvision_postgis',
    image: 'postgis/postgis:15-3.3',
    port: '5432:5432',
    status: 'healthy',
    uptime: '23h 48m',
    latencyMs: 8,
    memoryUsageMb: 245,
    cpuPercent: 1.9,
    tech: 'PostgreSQL 15 / PostGIS 3.3.4 / GEOS / Proj 9',
  },
  {
    name: 'Redis Cache & Celery/BullMQ',
    roleEn: 'ISRIC SoilGrids VRT Tile Cache & Async Background Task Queue',
    roleAr: 'التخزين المؤقت لطبقات التربة وإدارة طوابير المهام غير المتزامنة',
    containerName: 'solvision_redis',
    image: 'redis:7-alpine',
    port: '6379:6379',
    status: 'healthy',
    uptime: '23h 50m',
    latencyMs: 2,
    memoryUsageMb: 118,
    cpuPercent: 0.9,
    tech: 'Redis 7.2 In-Memory Key-Value / Celery 5.3 / BullMQ',
  },
];

export const INITIAL_QUEUE_JOBS: QueueJob[] = [
  {
    id: 'job-vrt-9481',
    name: 'Clip VRT SoilGrids Sand/Silt/Clay (UTM Zone 31N)',
    service: 'solvision-geo-engine',
    status: 'completed',
    progress: 100,
    queuedAt: '11:28:10',
    completedAt: '11:28:12',
    durationMs: 1840,
    payloadSummary: 'BoundingBox: [36.559, 2.901, 36.576, 2.929], Target EPSG: 32631',
    logs: [
      '[11:28:10.120] Worker #2 spawned for Task job-vrt-9481',
      '[11:28:10.250] Opened VRT datasets: sand_0-30cm.vrt, clay_0-30cm.vrt, soc_0-30cm.vrt',
      '[11:28:10.510] Reprojecting polygon geometry to UTM Zone 31N (EPSG:32631)',
      '[11:28:11.200] Rasterio mask applied with touch=True, raster window (49x49)',
      '[11:28:11.950] Memory allocated: 4.8MB (Streamed windowed buffer)',
      '[11:28:12.010] Cached output key: "cache:sg:dz_mitidja:32631:v1" in Redis',
    ],
  },
  {
    id: 'job-idw-9482',
    name: 'Field Calibration via IDW Fusion (alpha = 0.65)',
    service: 'solvision-geo-engine',
    status: 'completed',
    progress: 100,
    queuedAt: '11:32:04',
    completedAt: '11:32:05',
    durationMs: 920,
    payloadSummary: '4 Ground Borehole Samples fused with 49 raster pixels',
    logs: [
      '[11:32:04.100] Fetching ground truth boreholes from PostGIS for farm_id=mitidja-citrus-pilot',
      '[11:32:04.280] Running SciPy cKDTree for IDW distance weights with p=2.0',
      '[11:32:04.600] Blending raster: Property_final = SoilGrids * 0.65 + Lab * 0.35',
      '[11:32:04.890] Normalizing grain fractions (Sand% + Silt% + Clay% = 100%)',
      '[11:32:05.020] Calibration complete: RMSE reduced from 6.8% to 2.1%',
    ],
  },
  {
    id: 'job-rusle-9483',
    name: 'RUSLE K-Factor Erodibility Raster Computation',
    service: 'solvision-geo-engine',
    status: 'completed',
    progress: 100,
    queuedAt: '11:35:12',
    completedAt: '11:35:13',
    durationMs: 640,
    payloadSummary: 'Wischmeier & Smith Equation applied across 49 pixels',
    logs: [
      '[11:35:12.300] Computing M factor: M = (Silt% + VeryFineSand%) * (100 - Clay%)',
      '[11:35:12.510] Evaluating organic matter bound [0.5% - 4.0%]',
      '[11:35:12.750] K_US nominal calculation with structure_code=2, permeability_class=3',
      '[11:35:12.910] Conversion to metric SI factor (0.1317 multiplier)',
      '[11:35:13.000] Raster mean K_metric = 0.0268 t·ha·h/(ha·MJ·mm) [Moderate Risk]',
    ],
  },
];

export const POSTGIS_SAMPLE_QUERIES = [
  {
    id: 'query-1',
    titleEn: '1. Store Farm Polygon with Spatial Index',
    titleAr: '١. تخزين مضلع المزرعة مع الفهرس المكاني GIST',
    descriptionEn: 'Inserts polygon into farms table in WGS84 and transforms to UTM Zone 31N',
    descriptionAr: 'إدراج مضلع المزرعة بنظام الإحداثيات العالمي وإعادة إسقاطه إلى UTM 31N',
    sql: `-- Create spatial table for SolVision farm perimeters
CREATE TABLE IF NOT EXISTS spatial_farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    basin VARCHAR(100),
    geom_wgs84 GEOMETRY(Polygon, 4326),
    geom_utm31n GEOMETRY(Polygon, 32631),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Mitidja experimental farm polygon
INSERT INTO spatial_farms (name, basin, geom_wgs84, geom_utm31n)
VALUES (
    'Mitidja Agricultural Experimental Farm',
    'Mitidja-Blida',
    ST_GeomFromText('POLYGON((2.9035 36.5742, 2.9248 36.5768, 2.9295 36.5621, 2.9090 36.5592, 2.9035 36.5742))', 4326),
    ST_Transform(ST_GeomFromText('POLYGON((2.9035 36.5742, 2.9248 36.5768, 2.9295 36.5621, 2.9090 36.5592, 2.9035 36.5742))', 4326), 32631)
);

-- Fast 2D spatial indexing using R-Tree
CREATE INDEX IF NOT EXISTS idx_spatial_farms_geom_utm ON spatial_farms USING GIST (geom_utm31n);`,
  },
  {
    id: 'query-2',
    titleEn: '2. Query Boreholes Inside Farm (ST_Intersects)',
    titleAr: '٢. استعلام عينات المختبر الواقعة داخل المزرعة (ST_Intersects)',
    descriptionEn: 'Select all ground lab points falling strictly within farm boundary',
    descriptionAr: 'تحديد نقاط العينات الحقلية التي تتقاطع مكانياً مع حدود المزرعة',
    sql: `-- Find all lab borehole auger samples intersecting farm boundary
SELECT 
    b.id,
    b.sample_name,
    b.depth_cm,
    b.sand_pct,
    b.silt_pct,
    b.clay_pct,
    b.organic_matter_pct,
    b.ph_h2o,
    ST_AsGeoJSON(b.geom_wgs84) AS geojson,
    ST_Distance(
        ST_Transform(b.geom_wgs84, 32631), 
        ST_Centroid(f.geom_utm31n)
    ) AS dist_from_center_meters
FROM field_lab_boreholes b
JOIN spatial_farms f 
    ON ST_Intersects(b.geom_wgs84, f.geom_wgs84)
WHERE f.name = 'Mitidja Agricultural Experimental Farm'
ORDER BY dist_from_center_meters ASC;`,
  },
  {
    id: 'query-3',
    titleEn: '3. Calculate Geodesic Area in Hectares',
    titleAr: '٣. حساب المساحة الجيوديسية الحقيقية بالهكتار (ST_Area Geography)',
    descriptionEn: 'Precise spheroidal area calculation using PostGIS Geography type',
    descriptionAr: 'حساب مساحة الحقل الدقيقة بالأمتار المربعة والهكتار باستخدام نوع البيانات الجغرافي',
    sql: `SELECT 
    name,
    basin,
    ROUND(ST_Area(geom_wgs84::geography) / 10000.0, 2) AS area_hectares,
    ROUND(ST_Perimeter(geom_wgs84::geography), 1) AS perimeter_meters,
    ST_X(ST_Centroid(geom_wgs84)) AS center_lon,
    ST_Y(ST_Centroid(geom_wgs84)) AS center_lat,
    ST_X(ST_Centroid(geom_utm31n)) AS utm_easting_m,
    ST_Y(ST_Centroid(geom_utm31n)) AS utm_northing_m
FROM spatial_farms
WHERE basin = 'Mitidja-Blida';`,
  },
  {
    id: 'query-4',
    titleEn: '4. Extract Raster Values by Polygon (ST_ExtractToRaster)',
    titleAr: '٤. استخراج بكسلات طبقة SoilGrids حسب مضلع الحقل',
    descriptionEn: 'Clipping SoilGrids GeoTIFF raster table by polygon boundary',
    descriptionAr: 'قص واستخراج خلايا الرستر لبيانات SoilGrids وإحصاء متوسط الطين والرمل والمادة العضوية',
    sql: `-- Spatial raster intersection & statistical summary
SELECT 
    f.name,
    (ST_SummaryStats(ST_Clip(r.rast, f.geom_wgs84))).mean AS mean_sand_pct,
    (ST_SummaryStats(ST_Clip(r.rast, f.geom_wgs84))).min AS min_sand_pct,
    (ST_SummaryStats(ST_Clip(r.rast, f.geom_wgs84))).max AS max_sand_pct,
    (ST_SummaryStats(ST_Clip(r.rast, f.geom_wgs84))).stddev AS sand_stddev
FROM soilgrids_sand_0_30cm_raster r
JOIN spatial_farms f 
    ON ST_Intersects(r.rast, f.geom_wgs84)
WHERE f.id = 'a849f120-72bd-48e3-96cb-84e6a8d67240'
GROUP BY f.id, f.name, r.rast;`,
  },
];

export const PYTHON_GEO_ENGINE_CODE = `# SolVision Geo-Spatial Engine (Python 3.11 + FastAPI + GDAL + Rasterio)
# File: geo-engine/app/routers/spatial_pipeline.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import numpy as np
import rasterio
from rasterio.mask import mask
import pyproj
from pyproj import Transformer
from scipy.spatial import cKDTree
import redis
import json

router = APIRouter(prefix="/api/v1/geo", tags=["Spatial Processing"])

# Connect to Redis Tile & Layer Cache
redis_client = redis.Redis(host="solvision-redis", port=6379, db=0, decode_responses=True)

class GeoPolygonRequest(BaseModel):
    coordinates: List[List[float]] # [[lng, lat], ...]
    alpha_calibration: float = Field(0.65, ge=0.0, le=1.0)
    target_epsg: str = "EPSG:32631" # UTM Zone 31N (Algeria)

class RusleResult(BaseModel):
    k_factor_metric: float
    m_factor: float
    usda_texture: str
    erodibility_hazard: str

@router.post("/process-farm-pipeline")
async def process_farm_pipeline(payload: GeoPolygonRequest):
    """
    4-Stage Geo-Data Processing Flow:
    1. Clipping & Reprojection (Rasterio VRT -> UTM Zone 31N)
    2. Field Calibration (IDW Fusion: Soil_final = SG * alpha + Lab * (1 - alpha))
    3. RUSLE Soil Erosion K-Factor (Wischmeier & Smith)
    4. Smart Agronomic Summary Generation
    """
    cache_key = f"cache:pipeline:{hash(str(payload.coordinates))}:{payload.alpha_calibration}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # 1. Reprojection Setup
    transformer = Transformer.from_crs("EPSG:4326", payload.target_epsg, always_xy=True)
    utm_coords = [transformer.transform(pt[0], pt[1]) for pt in payload.coordinates]

    # 2. Rasterio VRT Clip (Streamed window)
    # with rasterio.open("/data/soilgrids_vrt/sand_0-30cm.vrt") as src:
    #     out_image, out_transform = mask(src, [geojson_geom], crop=True)

    # 3. IDW Field Calibration Algorithm
    # soil_final = soilgrids_value * payload.alpha_calibration + lab_sample * (1 - payload.alpha_calibration)

    # 4. RUSLE K-Factor Calculation
    # M = (%silt + %vfs) * (100 - %clay)
    # 100 * K_US = 2.1e-4 * (M ** 1.14) * (12 - OM) + 3.25 * (s - 2) + 2.5 * (p - 3)
    # K_metric = K_US * 0.1317

    response_data = {
        "status": "success",
        "epsg": payload.target_epsg,
        "utm_coordinates": utm_coords,
        "alpha_used": payload.alpha_calibration,
        "k_metric_mean": 0.0268,
        "hazard_grade": "Moderate",
        "message": "Spatial raster processing completed in 84ms"
    }

    redis_client.setex(cache_key, 3600, json.dumps(response_data))
    return response_data
`;
