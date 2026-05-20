import { useState } from "react";
import { Download, Save, Trash2 } from "lucide-react";

import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Reveal } from "../components/Reveal.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function totalSpending(customer) {
  return ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds"].reduce(
    (total, key) => total + Number(customer?.[key] || 0),
    0
  );
}

export function SavedCustomers() {
  const { data, error, loading, setData } = useApi(api.predictions);
  const [deletingId, setDeletingId] = useState(null);

  async function deleteSavedPrediction(id) {
    const confirmed = window.confirm("Delete this saved prediction from MongoDB?");
    if (!confirmed) return;

    setDeletingId(id);

    try {
      await api.deletePrediction(id);
      setData((current) => current.filter((item) => item._id !== id));
    } catch (requestError) {
      window.alert(requestError.message || "Could not delete saved prediction.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <LoadingState label="Loading saved customers" />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="page-stack saved-page">
      <PageHeader
        eyebrow="MongoDB predictions"
        title="Saved customer predictions."
        description="A focused table of profiles submitted through the prediction form and persisted by the Express API."
        actions={
          <a className="icon-button" href={api.predictionExportUrl}>
            <Download size={18} aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      <Reveal>
        <section className="content-band editorial-band saved-intro">
          <Save size={22} aria-hidden="true" />
          <div>
            <h2>{data.length ? `${data.length} saved prediction${data.length === 1 ? "" : "s"}` : "No saved predictions yet"}</h2>
            <p>These records are separate from the original CSV dataset, so new predictions do not alter the model training data.</p>
          </div>
        </section>
      </Reveal>

      {!data.length ? <EmptyState label="No saved customer predictions found." /> : null}

      {data.length ? (
        <Reveal>
          <div className="table-wrap refined-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Income</th>
                  <th>Age</th>
                  <th>Education</th>
                  <th>Living With</th>
                  <th>Total Spending</th>
                  <th>Cluster</th>
                  <th>Cluster Name</th>
                  <th>Saved At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item._id}>
                    <td>${Number(item.customerData?.Income || 0).toLocaleString()}</td>
                    <td>{item.customerData?.Age}</td>
                    <td>{item.customerData?.Education}</td>
                    <td>{item.customerData?.Living_With}</td>
                    <td>${totalSpending(item.customerData).toLocaleString()}</td>
                    <td>{item.prediction?.clusterId}</td>
                    <td>{item.prediction?.clusterName}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="table-action danger-action"
                        type="button"
                        disabled={deletingId === item._id}
                        onClick={() => deleteSavedPrediction(item._id)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        {deletingId === item._id ? "Deleting" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
