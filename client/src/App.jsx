import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout.jsx";
import { ClusterAnalysis } from "./pages/ClusterAnalysis.jsx";
import { ClusterSummary } from "./pages/ClusterSummary.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Home } from "./pages/Home.jsx";
import { KAnalysis } from "./pages/KAnalysis.jsx";
import { PredictCustomer } from "./pages/PredictCustomer.jsx";
import { SavedCustomers } from "./pages/SavedCustomers.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="k-analysis" element={<KAnalysis />} />
          <Route path="clusters" element={<ClusterAnalysis />} />
          <Route path="summary" element={<ClusterSummary />} />
          <Route path="predict" element={<PredictCustomer />} />
          <Route path="saved" element={<SavedCustomers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
