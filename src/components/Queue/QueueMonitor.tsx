import React, { useState } from 'react';
import { 
  Zap, 
  Server, 
  Clock, 
  CheckCircle2, 
  Play, 
  RotateCw, 
  Database, 
  HardDrive, 
  Terminal,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { QueueJob, Language } from '../../types';
import { INITIAL_QUEUE_JOBS } from '../../data/microservicesData';

interface QueueMonitorProps {
  lang: Language;
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [jobs, setJobs] = useState<QueueJob[]>(INITIAL_QUEUE_JOBS);
  const [selectedJob, setSelectedJob] = useState<QueueJob>(INITIAL_QUEUE_JOBS[0]);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDispatchNewJob = () => {
    setIsDispatching(true);
    const newId = `job-rusle-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJob: QueueJob = {
      id: newId,
      name: 'Recompute RUSLE K-Factor with Modified OM (+1.5%)',
      service: 'solvision-geo-engine',
      status: 'processing',
      progress: 35,
      queuedAt: new Date().toLocaleTimeString(),
      durationMs: 0,
      payloadSummary: 'Asynchronous watershed erodibility worker batch',
      logs: [
        `[${new Date().toLocaleTimeString()}] Task ${newId} dispatched to BullMQ queue: "geo_pipeline"`,
        `[${new Date().toLocaleTimeString()}] Celery Worker #3 picked up task`,
        `[${new Date().toLocaleTimeString()}] Reading cached SoilGrids layer from Redis 6379`,
      ],
    };

    setJobs([newJob, ...jobs]);
    setSelectedJob(newJob);

    setTimeout(() => {
      newJob.progress = 75;
      newJob.logs.push(`[${new Date().toLocaleTimeString()}] Performing Wischmeier nomograph matrix calculation across grid cells`);
      setJobs((prev) => [newJob, ...prev.slice(1)]);
    }, 600);

    setTimeout(() => {
      newJob.status = 'completed';
      newJob.progress = 100;
      newJob.durationMs = 980;
      newJob.completedAt = new Date().toLocaleTimeString();
      newJob.logs.push(`[${new Date().toLocaleTimeString()}] Output saved to PostGIS spatial_farms cache key: "rusle:k:${newId}"`);
      newJob.logs.push(`[${new Date().toLocaleTimeString()}] Job completed successfully in 980ms`);
      setJobs((prev) => [newJob, ...prev.slice(1)]);
      setIsDispatching(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  {isAr ? 'إدارة الكاش والطوابير' : 'Cache & Queue Infrastructure'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Redis 7 + Celery / BullMQ</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'التخزين المؤقت لطبقات SoilGrids وإدارة الحسابات غير المتزامنة'
                  : 'Redis SoilGrids Layer Cache & Asynchronous Task Pipeline'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {isAr
                  ? 'تخزين كاش مسبق لطبقات الرستر للمناطق المتكررة لتفادي استنزاف خوادم ISRIC، وتشغيل الحسابات المائية والانجراف (RUSLE) في الخلفية دون تجميد الواجهة.'
                  : 'Near-instant cached GeoTIFF/VRT retrieval and non-blocking background calculations for complex spatial erosion modeling.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDispatchNewJob}
            disabled={isDispatching}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 self-start md:self-auto"
          >
            <Play className={`w-3.5 h-3.5 ${isDispatching ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'إرسال مهمة خلفية جديدة' : 'Dispatch Worker Task'}</span>
          </button>
        </div>
      </div>

      {/* Redis Cache Key Performance Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{isAr ? 'نسبة نجاح الكاش (Hit Ratio)' : 'ISRIC Cache Hit Rate'}</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">92.4%</div>
          <div className="text-[10px] text-slate-400">{isAr ? 'تفادي طلبات ISRIC الخارجية' : 'Avoided 1,840 redundant calls'}</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'الذاكرة المستهلكة (Redis RAM)' : 'Allocated Cache Memory'}
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">118 MB</div>
          <div className="text-[10px] text-slate-400 font-mono">Max: 512 MB (allkeys-lru)</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'عمال Celery النشطين' : 'Active Worker Pool'}
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">4 Workers</div>
          <div className="text-[10px] text-slate-400 font-mono">Concurrency: 8 threads</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <div className="text-slate-400 text-xs font-medium">
            {isAr ? 'متوسط وقت المعالجة' : 'Avg Task Execution'}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">840 ms</div>
          <div className="text-[10px] text-slate-400">{isAr ? 'معالجة متوازية سريعة' : 'Non-blocking I/O'}</div>
        </div>
      </div>

      {/* Jobs Stream & Worker Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Jobs List */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
            {isAr ? 'طابور المهام النشط (BullMQ / Celery Stream):' : 'Task Queue Stream:'}
          </h3>

          <div className="space-y-2">
            {jobs.map((job) => {
              const isSelected = selectedJob.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/50 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{job.id}</span>
                      <span className="text-xs text-slate-200 font-medium">{job.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        job.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-2">{job.payloadSummary}</div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 transition-all duration-300 ${
                        job.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1.5">
                    <span>Queued: {job.queuedAt}</span>
                    <span>Duration: {job.durationMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Worker Live Logs */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center justify-between">
            <span>{isAr ? 'سجل تشغيل المهمة (Worker Log)' : 'Worker Stdout / Logs'}</span>
            <span className="text-amber-400 font-normal">{selectedJob.id}</span>
          </h3>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 h-[340px] overflow-y-auto">
            <div className="text-slate-500 text-[10px] pb-2 border-b border-slate-800">
              # Target Worker: {selectedJob.service}
            </div>

            {selectedJob.logs.map((logLine, idx) => (
              <div key={idx} className="text-slate-300 text-[11px] leading-relaxed">
                {logLine}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
