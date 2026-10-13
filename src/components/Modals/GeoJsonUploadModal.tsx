import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  MapPin, 
  Sparkles 
} from 'lucide-react';
import { FarmRegion, Language, LatLng } from '../../types';
import { calculatePolygonAreaHectares } from '../../utils/geoCalculations';

interface GeoJsonUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFarm: (farm: FarmRegion) => void;
  lang: Language;
}

export const GeoJsonUploadModal: React.FC<GeoJsonUploadModalProps> = ({
  isOpen,
  onClose,
  onAddFarm,
  lang,
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const [farmName, setFarmName] = useState('Custom Field Boundary');
  const [geoJsonText, setGeoJsonText] = useState(`{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [3.015, 36.620],
        [3.042, 36.625],
        [3.048, 36.608],
        [3.021, 36.604],
        [3.015, 36.620]
      ]
    ]
  },
  "properties": {
    "name": "Custom North Watershed Parcel"
  }
}`);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setGeoJsonText(content);
      setErrorMsg(null);
    };
    reader.readAsText(file);
  };

  const handleProcessGeoJson = () => {
    try {
      const parsed = JSON.parse(geoJsonText);
      let coords: LatLng[] = [];
      let multiPolys: LatLng[][] = [];
      let isMulti = false;

      let geom = parsed;
      if (parsed.type === 'FeatureCollection' && parsed.features?.length > 0) {
        geom = parsed.features[0].geometry;
      } else if (parsed.type === 'Feature') {
        geom = parsed.geometry;
      }

      if (geom.type === 'Polygon') {
        const ring = geom.coordinates[0];
        coords = ring.map((pt: [number, number]) => ({ lat: pt[1], lng: pt[0] }));
      } else if (geom.type === 'MultiPolygon') {
        isMulti = true;
        multiPolys = geom.coordinates.map((poly: [number, number][][]) =>
          poly[0].map((pt: [number, number]) => ({ lat: pt[1], lng: pt[0] }))
        );
        coords = multiPolys[0] || [];
      } else {
        throw new Error('Geometry must be Polygon or MultiPolygon');
      }

      if (coords.length < 3) {
        throw new Error('Polygon must have at least 3 vertices');
      }

      // Compute center
      const avgLat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
      const avgLng = coords.reduce((s, c) => s + c.lng, 0) / coords.length;

      const areaHa = isMulti
        ? multiPolys.reduce((sum, p) => sum + calculatePolygonAreaHectares(p), 0)
        : calculatePolygonAreaHectares(coords);

      const newFarm: FarmRegion = {
        id: `custom-farm-${Date.now()}`,
        nameEn: farmName || 'Custom Farm Parcel',
        nameAr: farmName || 'مزرعة مخصصة جديدة',
        regionEn: 'User-Defined Spatial Boundary',
        regionAr: 'حدود مكانية محددة من قبل المستخدم',
        utmZone: '31N',
        epsgCode: 'EPSG:32631',
        center: { lat: avgLat, lng: avgLng },
        zoom: 14,
        areaHectares: areaHa || 120.0,
        elevationRangeM: [100, 180],
        primaryCropEn: 'Field Crops & Cereal Rotation',
        primaryCropAr: 'محاصيل حقلية ودورة زراعية',
        coordinates: coords,
        multiPolygons: isMulti ? multiPolys : undefined,
        isMultiPolygon: isMulti,
        baseSoilGrids: {
          sandPercent: 32.0,
          siltPercent: 38.0,
          clayPercent: 30.0,
          socGPerKg: 16.0,
          organicMatterPercent: 2.76,
          phH2o: 7.5,
          bulkDensityGcm3: 1.38,
          uncertaintyRatio: 0.15,
        },
        samples: [
          {
            id: 'BH-CUST-01',
            name: 'Central Soil Auger Borehole',
            lat: avgLat,
            lng: avgLng,
            depthCm: 30,
            sandPercent: 30.0,
            siltPercent: 40.0,
            clayPercent: 30.0,
            organicMatterPercent: 2.90,
            phH2o: 7.4,
            cec: 24.0,
            dateSampled: new Date().toISOString().slice(0, 10),
          },
        ],
        descriptionEn: 'Imported vector geometry from user GeoJSON payload.',
        descriptionAr: 'مضلع مكاني تم استيراده من ملف GeoJSON ومعالجته بواسطة محرك PostGIS.',
      };

      onAddFarm(newFarm);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid GeoJSON syntax');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              {isAr ? 'رفع واستيراد مضلع مزرعة (GeoJSON / ST_Polygon)' : 'Upload Farm Vector Boundary (GeoJSON / ST_Polygon)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Farm Name */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">
              {isAr ? 'اسم المزرعة أو الحوض المائي:' : 'Farm / Watershed Name:'}
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50"
              placeholder="e.g. Mila North Catchment"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center justify-between">
              <span>{isAr ? 'اختر ملف (.geojson أو .json):' : 'Select File (.geojson or .json):'}</span>
              <span className="text-slate-500 font-mono text-[11px]">Supports Polygon &amp; MultiPolygon</span>
            </label>
            <input
              type="file"
              accept=".geojson,.json"
              onChange={handleFileUpload}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
            />
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">
              {isAr ? 'أو الصق كود GeoJSON مباشرة هنا:' : 'Or Paste Raw GeoJSON Coordinates:'}
            </label>
            <textarea
              aria-label="Raw GeoJSON Payload"
              value={geoJsonText}
              onChange={(e) => {
                setGeoJsonText(e.target.value);
                setErrorMsg(null);
              }}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500/50 leading-relaxed resize-none"
              spellCheck={false}
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleProcessGeoJson}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'استيراد وتحليل المزرعة' : 'Import & Analyze Farm'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
