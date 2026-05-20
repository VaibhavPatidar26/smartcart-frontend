import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

const Plot = createPlotlyComponent(Plotly);

const defaultLayout = {
  paper_bgcolor: "#ffffff",
  plot_bgcolor: "#ffffff",
  font: { color: "#1f2937", family: "Inter, Segoe UI, sans-serif" },
  margin: { t: 18, r: 42, b: 88, l: 92 },
  autosize: true,
  hovermode: "closest",
  xaxis: {
    automargin: true,
    rangemode: "tozero",
    showgrid: true,
    gridcolor: "#e4ebe7",
    showline: true,
    linecolor: "#7b8a84",
    linewidth: 2,
    ticks: "outside",
    tickcolor: "#7b8a84",
    ticklen: 6,
    tickwidth: 1.5,
    tickfont: { color: "#33413c", size: 12 },
    title: { font: { color: "#17211f", size: 14 }, standoff: 18 },
    zeroline: true,
    zerolinecolor: "#d6ded9"
  },
  yaxis: {
    automargin: true,
    rangemode: "tozero",
    showgrid: true,
    gridcolor: "#e4ebe7",
    showline: true,
    linecolor: "#7b8a84",
    linewidth: 2,
    ticks: "outside",
    tickcolor: "#7b8a84",
    ticklen: 6,
    tickwidth: 1.5,
    tickfont: { color: "#33413c", size: 12 },
    title: { font: { color: "#17211f", size: 14 }, standoff: 18 },
    zeroline: true,
    zerolinecolor: "#d6ded9"
  }
};

const defaultConfig = {
  displaylogo: false,
  responsive: true
};

function titleConfig(title) {
  if (!title) return {};
  return typeof title === "object" ? title : { text: title };
}

function mergeAxis(defaultAxis, customAxis = {}) {
  const readableAxisColor = customAxis.color && !customAxis.linecolor ? customAxis.color : defaultAxis.linecolor;
  const readableTickColor = customAxis.color && !customAxis.tickcolor ? customAxis.color : defaultAxis.tickcolor;

  return {
    ...defaultAxis,
    linecolor: readableAxisColor,
    tickcolor: readableTickColor,
    ...customAxis,
    tickfont: {
      ...defaultAxis.tickfont,
      ...(customAxis.color ? { color: customAxis.color } : {}),
      ...(customAxis.tickfont || {})
    },
    title: {
      ...titleConfig(defaultAxis.title),
      ...titleConfig(customAxis.title),
      font: {
        ...(titleConfig(defaultAxis.title).font || {}),
        ...(customAxis.color ? { color: customAxis.color } : {}),
        ...(titleConfig(customAxis.title).font || {})
      }
    }
  };
}

function mergedLayout(layout) {
  const height = layout.height || defaultLayout.height;

  return {
    ...defaultLayout,
    ...layout,
    title: "",
    ...(height ? { height } : {}),
    margin: { ...defaultLayout.margin, ...(layout.margin || {}) },
    xaxis: mergeAxis(defaultLayout.xaxis, layout.xaxis),
    yaxis: mergeAxis(defaultLayout.yaxis, layout.yaxis)
  };
}

export function PlotCard({ title, description, data, layout = {}, className = "" }) {
  const chartHeight = layout.height || 430;

  return (
    <section className={`plot-card ${className}`}>
      <div className="plot-card-header">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <Plot
        data={data}
        layout={mergedLayout(layout)}
        config={defaultConfig}
        useResizeHandler
        style={{ width: "100%", height: chartHeight, minHeight: chartHeight }}
      />
    </section>
  );
}
