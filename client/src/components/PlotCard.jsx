import Plot from "react-plotly.js";

const defaultLayout = {
  paper_bgcolor: "#ffffff",
  plot_bgcolor: "#ffffff",
  font: { color: "#1f2937", family: "Inter, Segoe UI, sans-serif" },
  margin: { t: 48, r: 24, b: 56, l: 56 },
  autosize: true,
  hovermode: "closest"
};

const defaultConfig = {
  displaylogo: false,
  responsive: true
};

export function PlotCard({ title, data, layout = {}, className = "" }) {
  return (
    <section className={`plot-card ${className}`}>
      <Plot
        data={data}
        layout={{ ...defaultLayout, title, ...layout }}
        config={defaultConfig}
        useResizeHandler
        style={{ width: "100%", height: "100%", minHeight: layout.height || 360 }}
      />
    </section>
  );
}
