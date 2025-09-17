import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import "./App.css";
import "./styles/markdown.css";
import { router } from "./App";
import { SITE, SITE_TITLE } from "./config/site";
import { SiteConfigProvider } from "./contexts/SiteConfigContext";

const ensureMetaTag = (property: string, content: string) => {
  const selector = `meta[property="${property}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

document.title = SITE_TITLE;
ensureMetaTag("og:site_name", SITE.nameJa);
ensureMetaTag("og:title", SITE_TITLE);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
createRoot(rootElement).render(
  <StrictMode>
    <SiteConfigProvider>
      <RouterProvider router={router} />
    </SiteConfigProvider>
  </StrictMode>
);
