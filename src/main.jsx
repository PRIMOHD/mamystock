import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App_Firebase.jsx";

// ============================================================
// BOUTON D'INSTALLATION PWA
// ============================================================
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    });
  }, []);

  const installer = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 448, zIndex: 999,
      background: "linear-gradient(135deg, #1a1f2e, #252b3b)",
      border: "1.5px solid rgba(0,217,126,0.4)",
      borderRadius: 16, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      fontFamily: "'Sora', sans-serif",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: "linear-gradient(135deg, #00d97e, #00b360)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: 16
      }}>M</div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 13 }}>Installer MamyStock</div>
        <div style={{ color: "#8891aa", fontSize: 11 }}>Accès rapide depuis l'écran d'accueil</div>
      </div>
      <button onClick={installer} style={{
        background: "#00d97e", border: "none", borderRadius: 10,
        color: "#fff", padding: "8px 14px", fontWeight: 700,
        fontSize: 12, cursor: "pointer", fontFamily: "'Sora', sans-serif"
      }}>Installer</button>
      <button onClick={() => setShow(false)} style={{
        background: "none", border: "none", color: "#8891aa",
        cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1
      }}>×</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <InstallBanner />
  </React.StrictMode>
);
