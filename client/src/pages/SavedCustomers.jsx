import { Download } from "lucide-react";

import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/States.jsx";
import { useApi } from "../components/useApi.js";

function totalSpending(customer) {
  return ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds"].reduce(
    (total, key) => total + Number(customer?.[key] || 0),
    0
  );
}

export function SavedCustomers() {
  const { data, error, loading } = useApi(api.predictions);

  if (loading) return <LoadingState label="Loading saved customers" />;
  if (error) return <ErrorState error={error} />;

  return (
    <>
      <PageHeader
        eyebrow="MongoDB predictions"
        title="Saved Customers"
        description="Review customer profiles that were predicted and persisted through the Express API."
        actions={
          <a className="icon-button" href={api.predictionExportUrl}>
            <Download size={18} aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      {!data.length ? <EmptyState label="No saved customer predictions found." /> : null}

      {data.length ? (
        <div className="table-wrap">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
