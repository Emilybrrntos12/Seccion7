import ReactGA from "react-ga4";

// Reemplaza por tu ID real de medición GA4
const GA_MEASUREMENT_ID = "G-GJ84WLRWLL";

export function initAnalytics() {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

export function trackPageView(path: string) {
  ReactGA.send({ hitType: "pageview", page: path });
}
