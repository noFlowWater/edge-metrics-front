import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { api } from '~/lib/api';
import type { DeviceState } from '~/types/device';
import { StatusBadge } from '~/components/StatusBadge';

export function meta() {
  return [
    { title: 'Device Detail - Edge Metrics' },
    { name: 'description', content: 'Device configuration' },
  ];
}

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [configJson, setConfigJson] = useState('');
  const [status, setStatus] = useState<DeviceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const [configData, statusData] = await Promise.all([
          api.getConfig(id),
          api.getDeviceStatus(id).catch(() => null),
        ]);
        setConfigJson(JSON.stringify(configData, null, 2));
        setStatus(statusData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load device');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function handleJsonChange(value: string) {
    setConfigJson(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || jsonError) return;

    setSaving(true);
    try {
      const config = JSON.parse(configJson);
      await api.updateConfig(id, config);
      const updatedConfig = await api.getConfig(id);
      setConfigJson(JSON.stringify(updatedConfig, null, 2));
      alert('Configuration saved');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Are you sure you want to delete this device?')) return;

    try {
      await api.deleteConfig(id);
      navigate('/devices');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function handleReload() {
    if (!id) return;
    try {
      await api.reloadDevice(id);
      alert('Reload triggered');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Reload failed');
    }
  }

  if (loading) {
    return <div className="text-center py-8" style={{ color: 'var(--color-pastel-text-light)' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-pastel-danger-bg)', border: '1px solid var(--color-pastel-danger-light)' }}>
        <p style={{ color: 'var(--color-pastel-danger)' }}>{error}</p>
        <Link to="/devices" className="text-sm hover:opacity-80 mt-2 inline-block" style={{ color: 'var(--color-pastel-primary)' }}>
          Back to devices
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div>
          <Link to="/devices" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--color-pastel-text-muted)' }}>
            ← Back to devices
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold mt-3" style={{ color: 'var(--color-pastel-text)' }}>{id}</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleReload}
            className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
            style={{
              backgroundColor: 'var(--color-pastel-card)',
              border: '1px solid var(--color-pastel-border)',
              color: 'var(--color-pastel-text-light)'
            }}
          >
            Reload
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
            style={{
              backgroundColor: 'var(--color-pastel-danger)',
              color: 'white'
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="rounded-xl shadow-sm p-6 sm:p-8" style={{ backgroundColor: 'var(--color-pastel-card)', border: '1px solid var(--color-pastel-border)' }}>
          <h2 className="text-lg sm:text-xl font-semibold mb-6" style={{ color: 'var(--color-pastel-text)' }}>Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--color-pastel-text-muted)' }}>Status</p>
              <StatusBadge status={status.status} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--color-pastel-text-muted)' }}>IP Address</p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-pastel-text)' }}>{status.ip_address}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--color-pastel-text-muted)' }}>Port</p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-pastel-text)' }}>{status.port}</p>
            </div>
            {status.last_seen && (
              <div>
                <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--color-pastel-text-muted)' }}>Last Seen</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-pastel-text)' }}>
                  {new Date(status.last_seen).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config JSON Editor */}
      <form onSubmit={handleSubmit} className="rounded-xl shadow-sm p-6 sm:p-8 space-y-6" style={{ backgroundColor: 'var(--color-pastel-card)', border: '1px solid var(--color-pastel-border)' }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--color-pastel-text)' }}>Configuration</h2>
          {jsonError && (
            <span className="text-sm font-medium" style={{ color: 'var(--color-pastel-danger)' }}>{jsonError}</span>
          )}
        </div>

        <textarea
          value={configJson}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="block w-full h-80 sm:h-96 rounded-lg px-4 sm:px-5 py-3 sm:py-4 font-mono text-sm focus:outline-none resize-y"
          style={{
            backgroundColor: '#f8f9fc',
            border: '1px solid var(--color-pastel-border)',
            color: 'var(--color-pastel-text)'
          }}
          spellCheck={false}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !!jsonError}
            className="w-full sm:w-auto px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
            style={{
              backgroundColor: 'var(--color-pastel-primary)',
              color: 'white'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
