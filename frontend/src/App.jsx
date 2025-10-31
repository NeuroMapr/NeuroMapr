// src/App.jsx
import React, { useEffect, useState } from "react";
import "./App.css";
import LandingPage from "./pages/LandingPage.jsx"; // adjust path if needed

function App() {
  const [currentPage, setCurrentPage] = useState("LandingPage");

  const navigate = (page) => {
    setCurrentPage(page);
    window.history.pushState({ page }, "", `#${page}`);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.page) {
        setCurrentPage(event.state.page);
      } else {
        const hash = window.location.hash.replace("#", "");
        setCurrentPage(hash || "LandingPage");
      }
    };

    window.addEventListener("popstate", handlePopState);

    // initial hash (or default)
    const initialHash = window.location.hash.replace("#", "");
    setCurrentPage(initialHash || "LandingPage");

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return <div className="app"><LandingPage onNavigate={navigate} /></div>;
}

export default App;
