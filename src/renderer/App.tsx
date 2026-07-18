import { useEffect, useState } from 'react';
import type { DashboardSnapshot } from '../shared/contracts';

export function App() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void window.openRouterDesk.getDashboardSnapshot().then((result) => {
      if (result.ok) setSnapshot(result.value);
      else setError(result.error.message);
    });
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">OpenRouterDesk</div>
        <nav aria-label="Main navigation">
          {['Dashboard', 'Routers', 'Devices', 'Topology', 'Firewall', 'VLANs', 'Backups', 'Firmware', 'Audit'].map(
            (item) => (
              <button key={item} className={item === 'Dashboard' ? 'nav-item active' : 'nav-item'} type="button">
                {item}
              </button>
            ),
          )}
        </nav>
        <div className="security-note">Read-only starter</div>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">LOCAL-FIRST ROUTER MANAGEMENT</p>
            <h1>Dashboard</h1>
          </div>
          <span className="status-chip">Mock mode</span>
        </header>

        {error ? <div className="alert error">{error}</div> : null}
        {!snapshot ? <div className="panel">Loading local dashboard…</div> : null}

        {snapshot ? (
          <>
            {snapshot.warnings.map((warning) => (
              <div className="alert" key={warning}>{warning}</div>
            ))}

            <section className="cards" aria-label="Overview">
              <article className="metric-card">
                <span>Adapter</span>
                <strong>{snapshot.adapter.adapterId}</strong>
                <small>{snapshot.adapter.confidence} confidence</small>
              </article>
              <article className="metric-card">
                <span>Devices</span>
                <strong>{snapshot.devices.length}</strong>
                <small>Normalized inventory</small>
              </article>
              <article className="metric-card">
                <span>Application</span>
                <strong>v{snapshot.appVersion}</strong>
                <small>Electron security scaffold</small>
              </article>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">INVENTORY PREVIEW</p>
                  <h2>Connected devices</h2>
                </div>
                <button type="button" disabled>Scan live router</button>
              </div>
              <div className="device-list">
                {snapshot.devices.map((device) => (
                  <article className="device-row" key={device.id}>
                    <div className="device-icon" aria-hidden="true">◆</div>
                    <div>
                      <strong>{device.displayName}</strong>
                      <span>{device.ipv4 ?? 'No IPv4 address'}</span>
                    </div>
                    <div className="device-meta">
                      <span>{device.connectionType}</span>
                      <small>{device.source}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel next-steps">
              <p className="eyebrow">SAFE IMPLEMENTATION ORDER</p>
              <h2>Next engineering milestones</h2>
              <ol>
                <li>Credential vault and router profiles</li>
                <li>Bounded local HTTP/HTTPS transport</li>
                <li>F6600P probe and authenticated read-only session</li>
                <li>Connected-device parsing and topology</li>
              </ol>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
