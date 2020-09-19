import React, { lazy, Suspense } from "react";
import "./App.css";
const renderLoader = () => <p>Loading</p>;
const TunerComponent = lazy(() => import("./components/TunerComponent"));

function App() {
  return (
    <div className="App">
      <Suspense fallback={renderLoader()}>
        <TunerComponent />
      </Suspense>
    </div>
  );
}

export default App;
