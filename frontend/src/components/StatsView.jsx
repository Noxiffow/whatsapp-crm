import React from 'react';

const STATUS_LABELS = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  cualificado: 'Cualificado',
  perdido: 'Perdido',
};

function StatsView({ stats, onBack }) {
  const maxCount = Math.max(
    stats.total,
    stats.nuevo,
    stats.contactado,
    stats.cualificado,
    stats.perdido,
    1
  );

  const bars = [
    { key: 'nuevo', label: STATUS_LABELS.nuevo, count: stats.nuevo, tone: 'nuevo' },
    { key: 'contactado', label: STATUS_LABELS.contactado, count: stats.contactado, tone: 'contactado' },
    { key: 'cualificado', label: STATUS_LABELS.cualificado, count: stats.cualificado, tone: 'cualificado' },
    { key: 'perdido', label: STATUS_LABELS.perdido, count: stats.perdido, tone: 'perdido' },
  ];

  return (
    <section className="stats-view">
      <div className="stats-view-header">
        <div>
          <h2>Estadisticas</h2>
          <p className="stats-view-subtitle">Resumen de contactos creados durante los ultimos 30 dias.</p>
        </div>
        <button type="button" className="stats-nav-btn" onClick={onBack}>
          Volver al CRM
        </button>
      </div>

      <div className="stats-summary-grid">
        <article className="stats-card stats-card-total">
          <span className="stats-card-label">Total de contactos</span>
          <strong className="stats-card-value">{stats.total}</strong>
          <span className="stats-card-helper">Creados en los ultimos 30 dias</span>
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

      <div className="stats-chart-card">
        <h3>Grafico por estado</h3>
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
    </section>
  );
}

export default StatsView;
