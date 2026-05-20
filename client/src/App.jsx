import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout.jsx";
import { RouteLoader } from "./components/RouteLoader.jsx";

const Home = lazy(() => import("./pages/Home.jsx").then((module) => ({ default: module.Home })));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx").then((module) => ({ default: module.Dashboard })));
const KAnalysis = lazy(() => import("./pages/KAnalysis.jsx").then((module) => ({ default: module.KAnalysis })));
const ClusterAnalysis = lazy(() =>
  import("./pages/ClusterAnalysis.jsx").then((module) => ({ default: module.ClusterAnalysis }))
);
const ClusterSummary = lazy(() =>
  import("./pages/ClusterSummary.jsx").then((module) => ({ default: module.ClusterSummary }))
);
const PredictCustomer = lazy(() =>
  import("./pages/PredictCustomer.jsx").then((module) => ({ default: module.PredictCustomer }))
);
const SavedCustomers = lazy(() =>
  import("./pages/SavedCustomers.jsx").then((module) => ({ default: module.SavedCustomers }))
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}