const GOOGLE_MAPS_CALLBACK = "__realityngGoogleMapsReady";

declare global {
  interface Window {
    [GOOGLE_MAPS_CALLBACK]?: () => void;
    google?: any;
  }
}

let googleMapsPromise: Promise<any> | null = null;

export function getGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}

export function loadGoogleMaps(apiKey = getGoogleMapsApiKey()): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-realityng-google-maps="true"]',
    );

    window[GOOGLE_MAPS_CALLBACK] = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps loaded without the maps namespace."));
      }
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      libraries: "places",
      v: "weekly",
      callback: GOOGLE_MAPS_CALLBACK,
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.dataset.realityngGoogleMaps = "true";
    script.onerror = () => reject(new Error("Google Maps failed to load."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
