import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Table as TableIcon, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Language } from '../../types';
import { POSTGIS_SAMPLE_QUERIES } from '../../data/microservicesData';

interface PostGisConsoleProps {
  lang: Language;
}

export const PostGisConsole: React.FC<PostGisConsoleProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [selectedQueryId, setSelectedQueryId] = useState(POSTGIS_SAMPLE_QUERIES[0].id);
  const [activeQuerySql, setActiveQuerySql] = useState(POSTGIS_SAMPLE_QUERIES[0].sql);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>({
    status: 'success',
    executionTimeMs: 14.2,
    rowCount: 1,
    rows: [
      {
        id: 'a849f120-72bd-48e3-96cb-84e6a8d67240',
        name: 'Mitidja Agricultural Experimental Farm',
        basin: 'Mitidja-Blida',
        area_hectares: 142.5,
        srid: '32631 (UTM Zone 31N)',
        geometry_type: 'POLYGON',
        points_count: 5,
      },
    ],
  });

  const handleSelectQuery = (id: string) => {
    const q = POSTGIS_SAMPLE_QUERIES.find((item) => item.id === id);
    if (q) {
      setSelectedQueryId(id);
      setActiveQuerySql(q.sql);
      handleExecuteQuery(q.id);
    }
  };

  const handleExecuteQuery = (queryId: string = selectedQueryId) => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      if (queryId === 'query-1') {
        setExecutionResult({
          status: 'success',
          executionTimeMs: 14.2,
          rowCount: 1,
          rows: [
            {
              id: 'a849f120-72bd-48e3-96cb-84e6a8d67240',
              name: 'Mitidja Agricultural Experimental Farm',
              basin: 'Mitidja-Blida',
              area_hectares: 142.5,
              srid: '32631 (UTM Zone 31N)',
              geometry_type: 'POLYGON',
            },
          ],
        });
      } else if (queryId === 'query-2') {
        setExecutionResult({
          status: 'success',
          executionTimeMs: 8.7,
          rowCount: 4,
          rows: [
            { id: 'BH-MIT-01', sample_name: 'Mitidja Auger BH-01', depth_cm: 30, sand_pct: 24.5, clay_pct: 37.5, dist_m: 142.0 },
            { id: 'BH-MIT-02', sample_name: 'Mitidja Auger BH-02', depth_cm: 30, sand_pct: 22.0, clay_pct: 36.5, dist_m: 215.4 },
            { id: 'BH-MIT-03', sample_name: 'Mitidja Auger BH-03', depth_cm: 30, sand_pct: 31.0, clay_pct: 35.0, dist_m: 380.2 },
            { id: 'BH-MIT-04', sample_name: 'Mitidja Auger BH-04', depth_cm: 30, sand_pct: 26.8, clay_pct: 34.0, dist_m: 412.8 },
          ],
        });
      } else if (queryId === 'query-3') {
        setExecutionResult({
          status: 'success',
          executionTimeMs: 4.1,
          rowCount: 1,
          rows: [
            {
              name: 'Mitidja Experimental Farm',
              basin: 'Mitidja-Blida',
              area_hectares: 142.5,
              perimeter_meters: 5320.4,
              utm_easting_m: 504210.5,
              utm_northing_m: 4047890.2,
            },
          ],
        });
      } else {
        setExecutionResult({
          status: 'success',
          executionTimeMs: 22.8,
          rowCount: 1,
          rows: [
            {
              name: 'Mitidja Experimental Farm',
              mean_sand_pct: 28.4,
              min_sand_pct: 21.0,
              max_sand_pct: 36.5,
              sand_stddev: 2.84,
            },
          ],
        });
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-1">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  {isAr ? 'قاعدة البيانات المكانية' : 'Spatial Database Console'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">PostgreSQL 15 + PostGIS 3.3.4</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'استعلامات PostGIS المكانية: المضلعات، النقاط، وتقاطعات الرستر'
                  : 'PostGIS Spatial Query Engine: Polygons, Points & Raster Intersections'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'تخزين مضلعات المزارع (ST_Polygon)، عينات التربة الحقلية (ST_Point)، وتنفيذ الاستعلامات التقاطعية واستخراج الإحصاءات الرسترية (ST_Intersects, ST_ExtractToRaster).'
                  : 'Native geospatial spatial queries using PostGIS geography, GIST indexes, ST_Intersects, and ST_Transform to UTM Zone 31N.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleExecuteQuery()}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg shadow-cyan-500/20 active:scale-95 self-start md:self-auto"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تنفيذ الاستعلام' : 'Execute Query'}</span>
          </button>
        </div>
      </div>

      {/* Preset Queries Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {POSTGIS_SAMPLE_QUERIES.map((q) => {
          const isSelected = selectedQueryId === q.id;
          return (
            <button
              key={q.id}
              onClick={() => handleSelectQuery(q.id)}
              className={`p-3 text-left rtl:text-right rounded-xl border text-xs transition ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="font-semibold text-slate-200 truncate">
                {isAr ? q.titleAr : q.titleEn}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {isAr ? q.descriptionAr : q.descriptionEn}
              </div>
            </button>
          );
        })}
      </div>

      {/* SQL Editor & Results Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive SQL Editor */}
        <div className="lg:col-span-7 space-y-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-slate-200">psql (solvision_db)</span>
              </div>
              <span className="text-[10px] text-cyan-400">PostGIS 3.3 enabled</span>
            </div>

            <textarea
              aria-label="PostGIS SQL Editor"
              value={activeQuerySql}
              onChange={(e) => setActiveQuerySql(e.target.value)}
              rows={14}
              className="w-full bg-transparent text-slate-200 p-4 focus:outline-none resize-none font-mono text-xs leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Execution Output & Result Grid */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
                  {isAr ? 'نتائج الاستعلام المكاني (Query Result)' : 'Query Result Set'}
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-emerald-400 font-semibold">{executionResult.executionTimeMs} ms</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{executionResult.rowCount} rows</span>
              </div>
            </div>

            {/* Result Table */}
            <div className="overflow-x-auto bg-slate-950 rounded-lg border border-slate-800/80">
              <table className="w-full text-left rtl:text-right text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40">
                    {Object.keys(executionResult.rows[0] || {}).map((colKey) => (
                      <th key={colKey} className="py-2 px-2.5 whitespace-nowrap text-cyan-400">
                        {colKey}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {executionResult.rows.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition">
                      {Object.values(row).map((val: any, j: number) => (
                        <td key={j} className="py-1.5 px-2.5 whitespace-nowrap text-slate-300">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Query plan note */}
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-[10px] font-mono text-slate-400 space-y-1">
              <div className="text-emerald-400 font-semibold">EXPLAIN ANALYZE Summary:</div>
              <div>{"->"} Index Scan using idx_spatial_farms_geom_utm on spatial_farms</div>
              <div>Planning Time: 0.24ms | Execution Time: {executionResult.executionTimeMs}ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
