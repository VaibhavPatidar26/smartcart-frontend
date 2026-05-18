import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { PlotCard } from "../components/PlotCard.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function clusterTraces(points) {
  const byCluster = points.reduce((groups, point) => {
    const key = point.Cluster;
    groups[key] = groups[key] || [];
    groups[key].push(point);
    return groups;
  }, {});

  return Object.entries(byCluster).map(([cluster, rows]) => ({
    type: "scatter",
    mode: "markers",
    name: `Cluster ${cluster}`,
    x: rows.map((row) => row.PCA1),
    y: rows.map((row) => row.PCA2),
    marker: { size: 8, opacity: 0.78 }
  }));
}

export function ClusterAnalysis() {
  const { data, error, loading } = useApi(api.clusterPoints);

  if (loading) return <LoadingState label="Loading cluster points" />;
  if (error) return <ErrorState error={error} />;

  return (
    <>
      <PageHeader
        eyebrow="Customer segmentation"
        title="Cluster Analysis"
        description="Each point represents a customer projected into PCA space and colored by predicted KMeans segment."
      />

      <PlotCard
        title="Customer Cluster Visualization"
        className="wide-plot"
        data={clusterTraces(data)}
        layout={{ height: 680, xaxis: { title: "PCA1" }, yaxis: { title: "PCA2" } }}
      />
    </>
  );
}
