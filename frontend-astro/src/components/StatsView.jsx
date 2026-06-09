import React from 'react';

const STATUS_LABELS = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  cualificado: 'Cualificado',
  perdido: 'Perdido',
};

const SOURCE_CONFIG = {
  web: { label: 'Web', icon: '🌐', color: '#0369a1', bg: '#e0f2fe' },
  instagram: { label: 'Instagram', icon: '📷', color: '#be185d', bg: '#fce7f3' },
  recomendacion: { label: 'Recomendación', icon: '💬', color: '#2e7d32', bg: '#e8f5e9' },
  presencial: { label: 'Presencial', icon: '📍', color: '#e65100', bg: '#fff3e0' },
  otro: { label: 'Otro', icon: '📌', color: '#7b1fa2', bg: '#f3e5f5' },
};

function StatsView({ stats, sourceStats, onBack }) {
  const maxCount = Math.max(stats.total, 1);

  const bars = [
    { key: 'nuevo', label: STATUS_LABELS.nuevo, count: stats.nuevo, tone: 'nuevo' },
    { key: 'contactado', label: STATUS_LABELS.contactado, count: stats.contactado, tone: 'contactado' },
    { key: 'cualificado', label: STATUS_LABELS.cualificado, count: stats.cualificado, tone: 'cualificado' },
    { key: 'perdido', label: STATUS_LABELS.perdido, count: stats.perdido, tone: 'perdido' },
  ];

  // Conversion metrics
  const conversionRate = stats.total > 0 ? Math.round((stats.cualificado / stats.total) * 100) : 0;
  const lossRate = stats.total > 0 ? Math.round((stats.perdido / stats.total) * 100) : 0;
  const engagementRate = stats.total > 0 ? Math.round(((stats.contactado + stats.cualificado) / stats.total) * 100) : 0;

  const metricCards = [
    { label: 'Tasa de conversión', value: `${conversionRate}%`, sub: 'Nuevo → Cualificado', color: '#15803d', bg: '#ecfdf3' },
    { label: 'Tasa de contacto', value: `${engagementRate}%`, sub: 'Contactados o más', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Tasa de pérdida', value: `${lossRate}%`, sub: 'Leads perdidos', color: '#dc2626', bg: '#fef2f2' },
  ];

  // Source distribution
  const sourceEntries = Object.entries(sourceStats || {}).sort((a, b) => b[1] - a[1]);
  const maxSource = Math.max(...sourceEntries.map(([, c]) => c), 1);

  return (
    <section className="stats-view">
      <div className="stats-view-header">
        <div>
          <h2>Estadísticas</h2>
          <p className="stats-view-subtitle">Resumen de contactos creados durante los últimos 30 días.</p>
        </div>
        <button type="button" className="stats-nav-btn" onClick={onBack}>
          Volver al CRM
        </button>
      </div>

      <div className="stats-summary-grid">
        <article className="stats-card stats-card-total">
          <span className="stats-card-label">Total de contactos</span>
          <strong className="stats-card-value">{stats.total}</strong>
          <span className="stats-card-helper">Creados en los últimos 30 días</span>
        </article>
        <article className="stats-card stats-card-nuevo">
          <span className="stats-card-label">Nuevo</span>
          <strong className="stats-card-value">{stats.nuevo}</strong>
        </article>
        <article className="stats-card stats-card-contactado">
          <span className="stats-card-label">Contactado</span>
          <strong className="stats-card-value">{stats.contactado}</strong>
        </article>
        <article className="stats-card stats-card-cualificado">
          <span className="stats-card-label">Cualificado</span>
          <strong className="stats-card-value">{stats.cualificado}</strong>
        </article>
        <article className="stats-card stats-card-perdido">
          <span className="stats-card-label">Perdido</span>
          <strong className="stats-card-value">{stats.perdido}</strong>
        </article>
      </div>

      {/* Conversion metrics */}
      <div className="stats-metrics-grid">
        {metricCards.map((card) => (
          <article key={card.label} className="stats-metric-card" style={{ background: card.bg }}>
            <span className="stats-metric-label">{card.label}</span>
            <strong className="stats-metric-value" style={{ color: card.color }}>{card.value}</strong>
            <span className="stats-metric-sub">{card.sub}</span>
          </article>
        ))}
      </div>

      <div className="stats-charts-row">
        <div className="stats-chart-card">
          <h3>Gráfico por estado</h3>
          <div className="stats-bars">
            {bars.map((bar) => (
              <div key={bar.key} className="stats-bar-row">
                <div className="stats-bar-topline">
                  <span className={`stats-bar-label stats-bar-label-${bar.tone}`}>{bar.label}</span>
                  <strong className="stats-bar-count">{bar.count}</strong>
                </div>
                <div className="stats-bar-track">
                  <div
                    className={`stats-bar-fill stats-bar-fill-${bar.tone}`}
                    style={{ width: `${(bar.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-chart-card">
          <h3>Origen de los leads</h3>
          {sourceEntries.length === 0 ? (
            <p className="stats-chart-empty">Sin datos de origen todavía.</p>
          ) : (
            <div className="stats-bars">
              {sourceEntries.map(([src, count]) => {
                const config = SOURCE_CONFIG[src] || SOURCE_CONFIG.web;
                return (
                  <div key={src} className="stats-bar-row">
                    <div className="stats-bar-topline">
                      <span className="stats-bar-label" style={{ color: config.color }}>
                        {config.icon} {config.label}
                      </span>
                      <strong className="stats-bar-count">{count}</strong>
                    </div>
                    <div className="stats-bar-track">
                      <div
                        className="stats-bar-fill"
                        style={{
                          width: `${(count / maxSource) * 100}%`,
                          background: config.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default StatsView;
