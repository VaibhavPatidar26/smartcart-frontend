function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";
  const stringValue = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function predictionsToCsv(predictions) {
  const headers = [
    "Income",
    "Age",
    "Education",
    "Living_With",
    "Total Spending",
    "Predicted Cluster",
    "Cluster Name",
    "Saved At"
  ];

  const rows = predictions.map((item) => {
    const customer = item.customerData || {};
    const prediction = item.prediction || {};
    const totalSpending = [
      "MntWines",
      "MntFruits",
      "MntMeatProducts",
      "MntFishProducts",
      "MntSweetProducts",
      "MntGoldProds"
    ].reduce((total, key) => total + Number(customer[key] || 0), 0);

    return [
      customer.Income,
      customer.Age,
      customer.Education,
      customer.Living_With,
      totalSpending,
      prediction.clusterId,
      prediction.clusterName,
      item.createdAt
    ];
  });

  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}
