import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";

import TopLayout from "layouts/TopLayout";
import nav from "constants/nav";

const Home = lazy(() => import("pages/Home"));
const History = lazy(() => import("pages/History"));
const ApplicationConfirmation = lazy(() => import("pages/ApplicationConfirmation"));
const NoMatch = lazy(() => import("pages/NoMatch"));

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopLayout />}>
          <Route
            index
            element={
              <Suspense>
                <Home />
              </Suspense>
            }
          />
          <Route
            path={nav.HISTORY.path}
            element={
              <Suspense>
                <History />
              </Suspense>
            }
          />
          <Route
            path={nav.APPLICATION_CONFIRMATION.path}
            element={
              <Suspense>
                <ApplicationConfirmation />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense>
                <NoMatch />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;