import React from "react";
import { createRoot } from "react-dom/client";

/**
 * The stock rpi-web stylesheets, copied verbatim from the preview build so the
 * "native" mode is the real thing rather than a paraphrase. Import order
 * matches frontend/src/main.tsx.
 */
import "./native/a-styles.css";
import "./native/b-workbench.css";
import "./native/c-desktop.css";
import "./native/d-composer-refinement.css";
import "./native/e-markdown.css";
import "./native/f-timeline.css";
import "./native/extra.css";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
