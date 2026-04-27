import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Cloud, CheckCircle, AlertCircle, FileText, Users, Clock } from 'lucide-react';
import { useUploadCSV, useDataQuality, useUploadHistory, useAuditLogs } from '@/api/data';
import { useAuthStore } from '@/store/authStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatPctNoSign } from '@/utils/format';
import toast from 'react-hot-toast';

const TABS = ['Data Upload', 'Data Quality', 'Upload History', 'Audit Log'];

export function SettingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('Data Upload');
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [auditPage, setAuditPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: upload, isPending: uploading } = useUploadCSV();
  const { data: quality } = useDataQuality();
  const { data: uploads } = useUploadHistory();
  const { data: auditData } = useAuditLogs(auditPage);

  const isFinance = user?.role === 'finance_team';
  const visibleTabs = isFinance ? TABS : TABS.slice(0, 2);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are accepted');
      return;
    }
    upload(file, {
      onSuccess: (data) => {
        setUploadResult(data);
        toast.success(`Loaded ${data.rows_loaded} rows (quality: ${data.quality_score}%)`);
      },
      onError: () => toast.error('Upload failed. Check file format.'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {visibleTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t ? 'var(--bg-elevated)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              border: tab === t ? '1px solid var(--border-default)' : '1px solid transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Data Upload Tab */}
      {tab === 'Data Upload' && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}
            className="card p-12 flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragOver ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              background: dragOver ? 'var(--brand-dim)' : 'var(--bg-surface)',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {uploading ? (
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-3" />
            ) : (
              <Cloud size={40} className="mb-3" style={{ color: dragOver ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
            )}
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {uploading ? 'Uploading...' : 'Drop your CSV here or click to browse'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Required columns: record_date, product_id, product_name, category, segment, revenue, cost, profit, discount_rate, quantity
            </p>
          </div>

          {/* Upload result */}
          {uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Upload Successful</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Rows Loaded', value: uploadResult.rows_loaded },
                  { label: 'Rows Rejected', value: uploadResult.rows_rejected },
                  { label: 'Quality Score', value: `${uploadResult.quality_score}%` },
                  { label: 'Status', value: uploadResult.status },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  </div>
                ))}
              </div>
              {uploadResult.warnings?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {uploadResult.warnings.map((w: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--warning)' }}>
                      <AlertCircle size={12} />
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Data Quality Tab */}
      {tab === 'Data Quality' && quality && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Quality Score', value: `${quality.quality_score}%`, color: 'var(--success)' },
              { label: 'Total Records', value: quality.total_records?.toLocaleString(), color: 'var(--brand-secondary)' },
              { label: 'Completeness', value: `${quality.completeness_pct}%`, color: 'var(--brand-primary)' },
              { label: 'Last Updated', value: `${quality.last_updated_days_ago}d ago`, color: 'var(--text-secondary)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-5">
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-2xl font-display" style={{ fontFamily: 'var(--font-display)', color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload History Tab */}
      {tab === 'Upload History' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['File', 'Uploaded At', 'Rows', 'Quality', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploads?.length ? uploads.map((u: any, i: number) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{u.filename}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {u.uploaded_at ? new Date(u.uploaded_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{u.row_count}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--success)' }}>{u.quality_score}%</td>
                  <td className="px-4 py-3 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{u.status}</td>
                </tr>
              )) : (
                <tr><td colSpan={5}><EmptyState title="No uploads yet" description="Upload a CSV file to see history here." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Tab */}
      {tab === 'Audit Log' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                  {['User ID', 'Action', 'Resource', 'IP Address', 'Timestamp'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditData?.logs?.map((l: any, i: number) => (
                  <tr key={l.id} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{l.user_id}</td>
                    <td className="px-4 py-3 text-xs capitalize font-medium" style={{ color: 'var(--text-primary)' }}>{l.action}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{l.resource}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{l.ip_address}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {auditData?.total > 50 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: Math.ceil(auditData.total / 50) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAuditPage(i + 1)}
                  className="w-8 h-8 rounded text-xs font-mono transition-all"
                  style={{
                    background: auditPage === i + 1 ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                    color: auditPage === i + 1 ? '#000' : 'var(--text-secondary)',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
