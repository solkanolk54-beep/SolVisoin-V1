import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  Zap, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Activity, 
  CheckCircle2, 
  Play, 
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MicroserviceStatus, Language } from '../../types';
import { STARTER_DOCKER_COMPOSE } from '../../data/microservicesData';

interface ArchitectureTopologyProps {
  services: MicroserviceStatus[];
  lang: Language;
  onRefreshHealth: () => void;
}

export const ArchitectureTopology: React.FC<ArchitectureTopologyProps> = ({
  services,
  lang,
  onRefreshHealth,
}) => {
  const isAr = lang === 'ar';
  const [copiedCompose, setCopiedCompose] = useState(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'compose' | 'network'>('topology');

  const handleCopyCompose = () => {
    navigator.clipboard.writeText(STARTER_DOCKER_COMPOSE);
    setCopiedCompose(true);
    setTimeout(() => setCopiedCompose(false), 2000);
  };

  const handleDownloadCompose = () => {
    const blob = new Blob([STARTER_DOCKER_COMPOSE], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mt-1">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  {isAr ? 'البنية الهندسية' : 'System Architecture'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Event-Driven / Modular Microservices (Docker)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'هيكلية منصة SolVision وإطلاق البنية التحتية المحلية (Starter Stack)'
                  : 'SolVision Microservices Mesh & Starter Docker Stack'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'نمط خدمات مصغرة مستقلة متصلة عبر شبكة Docker الداخلية لضمان أقصى درجات المرونة وسرعة المعالجة المكانية والبيئية.'
                  : 'High-concurrency microservices mesh orchestrated via Docker Compose with dedicated spatial Python worker, PostGIS 15, and Redis ISRIC cache.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onRefreshHealth}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'فحص الحالة الحية' : 'Health Ping'}</span>
            </button>
            <button
              onClick={handleDownloadCompose}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>docker-compose.yml</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'topology'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isAr ? 'مخطط الخدمات المصغرة (Topology)' : 'Service Mesh Topology'}
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'compose'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isAr ? 'ملف docker-compose.yml المعتمد' : 'docker-compose.yml Config'}
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'network'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isAr ? 'المنافذ والبيئة (Ports & Env)' : 'Environment & Networking'}
          </button>
        </div>
      </div>

      {/* Tab 1: Topology & Live Service Cards */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          {/* Visual Mesh Graph */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden">
            <div className="text-xs font-mono uppercase text-slate-400 mb-6 flex items-center justify-between">
              <span>{isAr ? 'مخطط تدفق الاتصالات بين الخدمات (Service Mesh Graph)' : 'Microservices Communication Flow'}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>All 6 Containers Healthy</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Column 1: Client & Ingress */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase font-mono">1. Ingress & Client</div>
                
                <div className="p-4 bg-slate-950/80 border border-emerald-500/40 rounded-xl space-y-2 shadow-lg shadow-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Frontend (Web / Flutter)</span>
                    <span className="text-[10px] font-mono text-slate-400">Port :3000</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr ? 'واجهة المستخدم الموحدة والخرائط التفاعلية' : 'Unified UI & Map Visualizer'}
                  </p>
                </div>

                <div className="flex justify-center text-slate-600">↓ HTTP / REST</div>

                <div className="p-4 bg-slate-950/80 border border-indigo-500/40 rounded-xl space-y-2 shadow-lg shadow-indigo-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">API Gateway (Nginx)</span>
                    <span className="text-[10px] font-mono text-slate-400">Port :80 / :443</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr ? 'توجيه الطلبات وإدارة أمان المسارات' : 'Reverse Proxy & Path Routing'}
                  </p>
                </div>
              </div>

              {/* Column 2: Application Services */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase font-mono">2. Application Core</div>

                <div className="p-4 bg-slate-950/80 border border-blue-500/40 rounded-xl space-y-2 shadow-lg shadow-blue-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">Core API (Node.js/Express)</span>
                    <span className="text-[10px] font-mono text-slate-400">Port :5000</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr ? 'المستخدمين، المزارع، التقارير والتوثيق' : 'Auth, Projects, RBAC & State'}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/80 border border-teal-500/40 rounded-xl space-y-2 shadow-lg shadow-teal-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400">Geo-Spatial Engine (Python)</span>
                    <span className="text-[10px] font-mono text-slate-400">Port :8000</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr ? 'FastAPI + GDAL + Rasterio + RUSLE K' : 'VRT Masking, IDW & Erodibility'}
                  </p>
                </div>
              </div>

              {/* Column 3: Persistence & Async Queues */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase font-mono">3. Data & Queues</div>

                <div className="p-4 bg-slate-950/80 border border-cyan-500/40 rounded-xl space-y-2 shadow-lg shadow-cyan-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">PostgreSQL + PostGIS 15</span>
                    <span className="text-[10px] font-mono text-slate-400">Port :5432</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr ? 'مضلعات المزارع وعينات التربة الحقلية' : 'ST_Polygon, ST_Point, GIST'}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/80 border border-amber-500/40 rounded-xl space-y-2 shadow-lg shadow-amber-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Redis 7 + Celery / BullMQ</span>
                    <span className="text-[10px] font-mono text-slate-400">Port :6379</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr ? 'كاش طبقات SoilGrids وطابور المهام' : 'ISRIC VRT Cache & Background Tasks'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Microservices Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc, i) => (
              <div
                key={i}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-xs font-bold text-slate-100">{svc.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {svc.port}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  {isAr ? svc.roleAr : svc.roleEn}
                </p>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Latency:</span>
                    <span className="text-emerald-400 font-semibold">{svc.latencyMs}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">RAM:</span>
                    <span className="text-slate-200">{svc.memoryUsageMb} MB</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CPU:</span>
                    <span className="text-slate-200">{svc.cpuPercent}%</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate pt-1">
                  Image: {svc.image}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: docker-compose.yml Viewer */}
      {activeTab === 'compose' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">docker-compose.yml (Local Starter Stack)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCompose}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                >
                  {copiedCompose ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCompose ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الملف' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <pre className="text-slate-300 text-xs leading-relaxed overflow-x-auto p-2 bg-slate-900/50 rounded-lg">
              {STARTER_DOCKER_COMPOSE}
            </pre>
          </div>

          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'تعليمات إطلاق البيئة المحلية للمهندسين (خلال ٢٤ ساعة):' : 'Local Deployment Quickstart:'}</span>
            </h4>
            <div className="bg-slate-950 p-3 rounded font-mono text-emerald-400 space-y-1">
              <div># 1. Clone SolVision repo and copy compose file</div>
              <div>git clone git@github.com:solvision/solvision-core.git &amp;&amp; cd solvision-core</div>
              <div className="pt-1"># 2. Launch PostGIS, Redis &amp; Geo-Engine in detached mode</div>
              <div className="text-cyan-300 font-bold">docker compose up -d --build</div>
              <div className="pt-1"># 3. Verify spatial database connection</div>
              <div className="text-amber-300">docker exec -it solvision_postgis psql -U solvision_admin -d solvision_db -c "SELECT PostGIS_Version();"</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Networking & Environment Variables */}
      {activeTab === 'network' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            {isAr ? 'المتغيرات البيئية وشبكة الحاويات' : 'Environment Variables & Network Mesh'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2 px-3">Service</th>
                  <th className="py-2 px-3">Variable</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3">Internal Host</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                <tr>
                  <td className="py-2 px-3 text-cyan-400">solvision-db</td>
                  <td className="py-2 px-3 text-slate-300">POSTGRES_DB</td>
                  <td className="py-2 px-3 text-emerald-400">solvision_db</td>
                  <td className="py-2 px-3 text-slate-400">solvision-db:5432</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-amber-400">solvision-redis</td>
                  <td className="py-2 px-3 text-slate-300">REDIS_URL</td>
                  <td className="py-2 px-3 text-emerald-400">redis://solvision-redis:6379</td>
                  <td className="py-2 px-3 text-slate-400">solvision-redis:6379</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-teal-400">solvision-geo-engine</td>
                  <td className="py-2 px-3 text-slate-300">DATABASE_URL</td>
                  <td className="py-2 px-3 text-emerald-400">postgres://solvision_admin:...@solvision-db:5432/solvision_db</td>
                  <td className="py-2 px-3 text-slate-400">solvision-geo-engine:8000</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-blue-400">solvision-core-api</td>
                  <td className="py-2 px-3 text-slate-300">GEO_ENGINE_URL</td>
                  <td className="py-2 px-3 text-emerald-400">http://solvision-geo-engine:8000</td>
                  <td className="py-2 px-3 text-slate-400">solvision-core-api:5000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
