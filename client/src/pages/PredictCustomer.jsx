import { useState } from "react";
import { CheckCircle2, Send, UserRound } from "lucide-react";

import { api } from "../api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Reveal } from "../components/Reveal.jsx";

const defaultCustomer = {
  Income: 50000,
  Age: 35,
  Recency: 30,
  Customer_Tenure_Days: 1000,
  NumDealsPurchases: 2,
  NumWebPurchases: 4,
  NumCatalogPurchases: 2,
  NumStorePurchases: 5,
  NumWebVisitsMonth: 5,
  Kidhome: 0,
  Teenhome: 0,
  Education: "Graduate",
  Living_With: "Alone",
  Complain: 0,
  Response: 1,
  MntWines: 300,
  MntFruits: 30,
  MntMeatProducts: 200,
  MntFishProducts: 40,
  MntSweetProducts: 20,
  MntGoldProds: 50
};

const numericFields = new Set(Object.keys(defaultCustomer).filter((key) => !["Education", "Living_With"].includes(key)));

function Field({ label, name, value, onChange, min = 0, max }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input type="number" name={name} min={min} max={max} value={value} onChange={onChange} />
    </label>
  );
}

export function PredictCustomer() {
  const [customer, setCustomer] = useState(defaultCustomer);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function updateCustomer(event) {
    const { name, value } = event.target;
    setCustomer((current) => ({
      ...current,
      [name]: numericFields.has(name) ? Number(value) : value
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const savedPrediction = await api.createPrediction(customer);
      setResult(savedPrediction.prediction);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack predict-page">
      <PageHeader
        eyebrow="Live prediction"
        title="Predict a customer segment."
        description="The form keeps model-facing fields intact while presenting them as a cleaner customer profile workflow."
      />

      <Reveal>
        <section className="predict-layout">
          <aside className="predict-aside">
            <UserRound size={24} aria-hidden="true" />
            <h2>Customer profile input</h2>
            <p>Submit a new customer to the Flask model pipeline. Express saves the returned segment to MongoDB.</p>
            {result ? (
              <div className="result-mini-card">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Latest result: Cluster {result.clusterId}</span>
              </div>
            ) : null}
          </aside>

          <form className="prediction-form redesigned-form" onSubmit={submit}>
            <section>
              <h2>Profile</h2>
              <div className="form-grid compact-form-grid">
                <Field label="Income" name="Income" value={customer.Income} onChange={updateCustomer} />
                <Field label="Age" name="Age" min={18} max={100} value={customer.Age} onChange={updateCustomer} />
                <Field label="Recency" name="Recency" value={customer.Recency} onChange={updateCustomer} />
                <Field label="Customer Tenure Days" name="Customer_Tenure_Days" value={customer.Customer_Tenure_Days} onChange={updateCustomer} />
                <label className="form-field">
                  <span>Education</span>
                  <select name="Education" value={customer.Education} onChange={updateCustomer}>
                    <option>Graduate</option>
                    <option>PostGraduate</option>
                    <option>Undergraduate</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Living With</span>
                  <select name="Living_With" value={customer.Living_With} onChange={updateCustomer}>
                    <option>Alone</option>
                    <option>Partner</option>
                  </select>
                </label>
              </div>
            </section>

            <section>
              <h2>Purchases and activity</h2>
              <div className="form-grid compact-form-grid">
                <Field label="Deals Purchases" name="NumDealsPurchases" value={customer.NumDealsPurchases} onChange={updateCustomer} />
                <Field label="Web Purchases" name="NumWebPurchases" value={customer.NumWebPurchases} onChange={updateCustomer} />
                <Field label="Catalog Purchases" name="NumCatalogPurchases" value={customer.NumCatalogPurchases} onChange={updateCustomer} />
                <Field label="Store Purchases" name="NumStorePurchases" value={customer.NumStorePurchases} onChange={updateCustomer} />
                <Field label="Web Visits/Month" name="NumWebVisitsMonth" value={customer.NumWebVisitsMonth} onChange={updateCustomer} />
                <Field label="Kids at Home" name="Kidhome" value={customer.Kidhome} onChange={updateCustomer} />
                <Field label="Teens at Home" name="Teenhome" value={customer.Teenhome} onChange={updateCustomer} />
                <label className="form-field">
                  <span>Complain</span>
                  <select name="Complain" value={customer.Complain} onChange={updateCustomer}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Campaign Response</span>
                  <select name="Response" value={customer.Response} onChange={updateCustomer}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                  </select>
                </label>
              </div>
            </section>

            <section>
              <h2>Product spending</h2>
              <div className="form-grid compact-form-grid">
                <Field label="Wine Spending" name="MntWines" value={customer.MntWines} onChange={updateCustomer} />
                <Field label="Fruit Spending" name="MntFruits" value={customer.MntFruits} onChange={updateCustomer} />
                <Field label="Meat Spending" name="MntMeatProducts" value={customer.MntMeatProducts} onChange={updateCustomer} />
                <Field label="Fish Spending" name="MntFishProducts" value={customer.MntFishProducts} onChange={updateCustomer} />
                <Field label="Sweet Spending" name="MntSweetProducts" value={customer.MntSweetProducts} onChange={updateCustomer} />
                <Field label="Gold Product Spending" name="MntGoldProds" value={customer.MntGoldProds} onChange={updateCustomer} />
              </div>
            </section>

            <button className="primary-button form-submit" type="submit" disabled={saving}>
              {saving ? "Predicting" : "Predict Customer Cluster"}
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
        </section>
      </Reveal>

      {error ? <div className="state-box state-box-error">{error.message}</div> : null}

      {result ? (
        <Reveal>
          <section className="result-panel redesigned-result">
            <span>Predicted Cluster {result.clusterId}</span>
            <h2>{result.clusterName}</h2>
            <p>{result.description}</p>
            <h3>Recommended Marketing Actions</h3>
            <ul>
              {result.recommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </section>
        </Reveal>
      ) : null}
    </div>
  );
}