import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, Database, Sparkles } from "lucide-react";

import { api } from "../api.js";
import { Reveal } from "../components/Reveal.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function Home() {
  const { data: metrics, error, loading } = useApi(api.metrics);
  const { data: segmentNames } = useApi(api.clusterNames);
  const names = segmentNames?.map((segment) => segment.name).filter(Boolean) || [];

  return (
    <>
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">Retail intelligence studio</p>
          <h1>Customer segmentation with a calmer, clearer interface.</h1>
          <p className="hero-text">
            SmartCart turns customer behavior, spend patterns, and model predictions into focused dashboards for better marketing decisions.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/dashboard">
              Open Dashboard
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="secondary-button" to="/predict">Predict Customer</Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="SmartCart analytics preview">
          <div className="visual-topline">
            <span>Live segment workspace</span>
            <strong>{names.length ? `${names.length} named segments` : "Named customer segments"}</strong>
          </div>
          <div className="segment-name-list">
            {(names.length ? names : ["Premium Customers", "High Value Customers", "Family Shoppers", "Low Engagement Customers"]).map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
          <div className="visual-grid">
            <div>
              <small>Clustering</small>
              <strong>Agglomerative + PCA</strong>
            </div>
            <div>
              <small>Source</small>
              <strong>Customer CSV</strong>
            </div>
          </div>
        </div>
      </section>

      {loading ? <LoadingState label="Loading overview" /> : null}
      {error ? <ErrorState error={error} /> : null}
      {metrics ? (
        <Reveal>
          <section className="stat-grid landing-stats">
            <StatCard label="Customers" value={metrics.totalCustomers.toLocaleString()} helper="Source dataset" />
            <StatCard label="Average Income" value={formatCurrency(metrics.avgIncome)} helper="Customer baseline" />
            <StatCard label="Average Spending" value={formatCurrency(metrics.avgSpending)} helper="Category total" />
            <StatCard label="Response Rate" value={`${metrics.responseRate}%`} helper="Campaign history" />
          </section>
        </Reveal>
      ) : null}

      <section className="landing-section">
        <Reveal>
          <div className="section-kicker">
            <span>Workflow</span>
            <h2>From raw customer data to useful segments.</h2>
          </div>
        </Reveal>

        <div className="feature-grid refined-grid">
          <Reveal delay={80}>
            <article>
              <Database size={22} aria-hidden="true" />
              <h2>Structured customer data</h2>
              <p>Purchasing channels, spend categories, response behavior, and household signals become the base analytics layer.</p>
            </article>
          </Reveal>
          <Reveal delay={140}>
            <article>
              <Brain size={22} aria-hidden="true" />
              <h2>Agglomerative segmentation</h2>
              <p>The dashboard now explains the four-segment choice using agglomerative clustering curves and 3D PCA visualization.</p>
            </article>
          </Reveal>
          <Reveal delay={200}>
            <article>
              <BarChart3 size={22} aria-hidden="true" />
              <h2>Readable business views</h2>
              <p>Segment summaries, outliers, saved predictions, and marketing recommendations are surfaced in a cleaner MERN interface.</p>
            </article>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <section className="quiet-cta">
          <Sparkles size={22} aria-hidden="true" />
          <div>
            <h2>Ready for a new customer?</h2>
            <p>Run a prediction, save the result, and review it later from the MongoDB-backed saved customers page.</p>
          </div>
          <Link className="secondary-button" to="/predict">Start Prediction</Link>
        </section>
      </Reveal>
    </>
  );
}