import { useState, useEffect, useCallback } from "react";

// ============================================================
// DONNÉES INITIALES (simulées localStorage en mémoire)
// ============================================================
const INITIAL_PRODUCTS = [
  { id: 1, nom: "Riz 25kg", categorie: "Alimentation", prixAchat: 12000, prixVente: 15000, quantite: 15, alerte: 5 },
  { id: 2, nom: "Huile 5L", categorie: "Alimentation", prixAchat: 4500, prixVente: 6000, quantite: 3, alerte: 5 },
  { id: 3, nom: "Sucre 1kg", categorie: "Alimentation", prixAchat: 500, prixVente: 700, quantite: 40, alerte: 10 },
  { id: 4, nom: "Farine 5kg", categorie: "Alimentation", prixAchat: 2200, prixVente: 3000, quantite: 8, alerte: 5 },
  { id: 5, nom: "Savon Omo 1kg", categorie: "Ménager", prixAchat: 1200, prixVente: 1600, quantite: 0, alerte: 3 },
  { id: 6, nom: "Lait en poudre", categorie: "Alimentation", prixAchat: 3800, prixVente: 5000, quantite: 12, alerte: 4 },
];

const INITIAL_CLIENTS = [
  { id: 1, nom: "Fatou Diallo", telephone: "77 432 1234", quartier: "Médina", dette: 30000 },
  { id: 2, nom: "Amadou Koné", telephone: "70 891 5678", quartier: "HLM", dette: 85000 },
  { id: 3, nom: "Mariam Traoré", telephone: "76 234 9012", quartier: "Liberté 6", dette: 0 },
];

const INITIAL_VENTES = [
  { id: 1, date: new Date().toISOString(), produit: "Riz 25kg", quantite: 2, montant: 30000, paye: 30000, mode: "cash", clientId: null },
  { id: 2, date: new Date().toISOString(), produit: "Huile 5L", quantite: 1, montant: 6000, paye: 6000, mode: "cash", clientId: null },
  { id: 3, date: new Date(Date.now() - 86400000).toISOString(), produit: "Sucre 1kg", quantite: 5, montant: 3500, paye: 3500, mode: "mobile", clientId: null },
  { id: 4, date: new Date().toISOString(), produit: "Farine 5kg", quantite: 1, montant: 3000, paye: 0, mode: "credit", clientId: 1 },
];

// ============================================================
// UTILITAIRES
// ============================================================
const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const today = () => new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

// ============================================================
// ICÔNES SVG
// ============================================================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    stock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    vente: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
    dette: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
    rapport: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    money: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />,
  };
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} style={{ flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
};

// ============================================================
// COMPOSANT MODAL
// ============================================================
const Modal = ({ titre, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000, padding: "0"
  }}>
    <div style={{
      background: "#1a1f2e", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480,
      maxHeight: "90vh", overflow: "auto", padding: "24px 20px 32px",
      boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
      animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: "#f0f4ff", fontSize: 18, fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>{titre}</h3>
        <button onClick={onClose} style={{ background: "#2a3040", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "#8891aa", display: "flex" }}>
          <Icon name="close" size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ============================================================
// CHAMP DE FORMULAIRE
// ============================================================
const Field = ({ label, type = "text", value, onChange, placeholder, options, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", color: "#8891aa", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        required={required} style={inputStyle} />
    )}
  </div>
);

const inputStyle = {
  width: "100%", background: "#252b3b", border: "1.5px solid #2d3448", borderRadius: 12,
  color: "#f0f4ff", padding: "12px 14px", fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: "'Sora', sans-serif",
};

const Btn = ({ children, onClick, color = "#00d97e", outlined, small, danger, full, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? "#2a3040" : outlined ? "transparent" : danger ? "#ff4757" : color,
    border: outlined ? `1.5px solid ${color}` : "none",
    color: disabled ? "#555" : outlined ? color : "#fff",
    borderRadius: 12, padding: small ? "8px 16px" : "14px 20px",
    fontSize: small ? 13 : 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    width: full ? "100%" : "auto", fontFamily: "'Sora', sans-serif",
    letterSpacing: "0.02em", transition: "all 0.15s",
  }}>{children}</button>
);

// ============================================================
// PAGE TABLEAU DE BORD
// ============================================================
const Dashboard = ({ ventes, produits, clients }) => {
  const ventesAujourdhui = ventes.filter(v => new Date(v.date).toDateString() === new Date().toDateString());
  const totalVentes = ventesAujourdhui.reduce((s, v) => s + v.paye, 0);
  const totalDettes = clients.reduce((s, c) => s + c.dette, 0);
  const ruptures = produits.filter(p => p.quantite === 0).length;
  const alertes = produits.filter(p => p.quantite > 0 && p.quantite <= p.alerte).length;
  const benefice = ventesAujourdhui.reduce((s, v) => {
    const p = produits.find(p => p.nom === v.produit);
    if (!p) return s;
    return s + (p.prixVente - p.prixAchat) * v.quantite;
  }, 0);

  const cards = [
    { label: "Ventes aujourd'hui", value: fmt(totalVentes), icon: "vente", color: "#00d97e", bg: "rgba(0,217,126,0.12)" },
    { label: "Bénéfice estimé", value: fmt(benefice), icon: "money", color: "#ffd93d", bg: "rgba(255,217,61,0.12)" },
    { label: "Dettes clients", value: fmt(totalDettes), icon: "dette", color: "#ff6b6b", bg: "rgba(255,107,107,0.12)" },
    { label: "Ruptures de stock", value: ruptures + (alertes > 0 ? ` (${alertes} faibles)` : ""), icon: "alert", color: "#ff9f43", bg: "rgba(255,159,67,0.12)" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#8891aa", margin: 0, fontSize: 13, textTransform: "capitalize" }}>{today()}</p>
        <h2 style={{ margin: "4px 0 0", color: "#f0f4ff", fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Bonjour 👋</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#1a1f2e", borderRadius: 16, padding: "16px 14px", border: `1px solid ${c.color}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ background: c.bg, borderRadius: 10, padding: 8, display: "flex" }}>
                <Icon name={c.icon} size={18} color={c.color} />
              </div>
            </div>
            <div style={{ color: c.color, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{c.value}</div>
            <div style={{ color: "#8891aa", fontSize: 11, fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {(ruptures > 0 || alertes > 0) && (
        <div style={{ background: "rgba(255,159,67,0.1)", border: "1px solid rgba(255,159,67,0.3)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ color: "#ff9f43", fontWeight: 700, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="alert" size={16} color="#ff9f43" /> Alertes stock
          </div>
          {produits.filter(p => p.quantite <= p.alerte).map(p => (
            <div key={p.id} style={{ color: "#c8cfd8", fontSize: 13, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {p.quantite === 0 ? "🔴" : "🟡"} <b>{p.nom}</b> — {p.quantite === 0 ? "Rupture totale" : `Seulement ${p.quantite} restants`}
            </div>
          ))}
        </div>
      )}

      {/* Dernières ventes */}
      <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Dernières ventes</div>
        {ventes.slice(-5).reverse().map(v => (
          <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{v.produit}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>{new Date(v.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: v.mode === "credit" ? "#ff6b6b" : "#00d97e", fontWeight: 700, fontSize: 13 }}>{fmt(v.paye)}</div>
              {v.mode === "credit" && <div style={{ color: "#ff6b6b", fontSize: 10 }}>À crédit</div>}
              {v.mode === "mobile" && <div style={{ color: "#7b8cff", fontSize: 10 }}>Mobile Money</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// PAGE STOCK
// ============================================================
const Stock = ({ produits, setProduits }) => {
  const [showModal, setShowModal] = useState(false);
  const [editProduit, setEditProduit] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nom: "", categorie: "Alimentation", prixAchat: "", prixVente: "", quantite: "", alerte: "5" });

  const filtered = produits.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditProduit(null);
    setForm({ nom: "", categorie: "Alimentation", prixAchat: "", prixVente: "", quantite: "", alerte: "5" });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduit(p);
    setForm({ nom: p.nom, categorie: p.categorie, prixAchat: p.prixAchat, prixVente: p.prixVente, quantite: p.quantite, alerte: p.alerte });
    setShowModal(true);
  };

  const save = () => {
    if (!form.nom || !form.prixVente) return;
    if (editProduit) {
      setProduits(prev => prev.map(p => p.id === editProduit.id ? { ...p, ...form, prixAchat: +form.prixAchat, prixVente: +form.prixVente, quantite: +form.quantite, alerte: +form.alerte } : p));
    } else {
      setProduits(prev => [...prev, { ...form, id: Date.now(), prixAchat: +form.prixAchat, prixVente: +form.prixVente, quantite: +form.quantite, alerte: +form.alerte }]);
    }
    setShowModal(false);
  };

  const supprimer = (id) => {
    if (window.confirm("Supprimer ce produit ?")) setProduits(prev => prev.filter(p => p.id !== id));
  };

  const statusColor = (p) => p.quantite === 0 ? "#ff4757" : p.quantite <= p.alerte ? "#ff9f43" : "#00d97e";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#f0f4ff", fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Mon Stock</h2>
        <Btn onClick={openAdd} small><span style={{ marginRight: 4 }}>+</span> Ajouter</Btn>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Chercher un produit…"
        style={{ ...inputStyle, marginBottom: 16, width: "100%", boxSizing: "border-box" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: "#1a1f2e", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(p), flexShrink: 0, boxShadow: `0 0 8px ${statusColor(p)}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{p.nom}</div>
              <div style={{ color: "#8891aa", fontSize: 12 }}>{p.categorie}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <span style={{ color: "#00d97e", fontSize: 12, fontWeight: 600 }}>{fmt(p.prixVente)}</span>
                <span style={{ color: "#8891aa", fontSize: 12 }}>Achat: {fmt(p.prixAchat)}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: statusColor(p), fontWeight: 800, fontSize: 18 }}>{p.quantite}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>unités</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => openEdit(p)} style={{ background: "#252b3b", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "#7b8cff", display: "flex" }}>
                <Icon name="edit" size={14} color="#7b8cff" />
              </button>
              <button onClick={() => supprimer(p.id)} style={{ background: "#252b3b", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
                <Icon name="trash" size={14} color="#ff6b6b" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal titre={editProduit ? "Modifier produit" : "Nouveau produit"} onClose={() => setShowModal(false)}>
          <Field label="Nom du produit" value={form.nom} onChange={v => setForm({ ...form, nom: v })} placeholder="Ex: Riz 25kg" required />
          <Field label="Catégorie" value={form.categorie} onChange={v => setForm({ ...form, categorie: v })}
            options={["Alimentation", "Boisson", "Ménager", "Cosmétique", "Électronique", "Autre"].map(c => ({ value: c, label: c }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Prix d'achat" type="number" value={form.prixAchat} onChange={v => setForm({ ...form, prixAchat: v })} placeholder="12000" />
            <Field label="Prix de vente" type="number" value={form.prixVente} onChange={v => setForm({ ...form, prixVente: v })} placeholder="15000" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Quantité" type="number" value={form.quantite} onChange={v => setForm({ ...form, quantite: v })} placeholder="0" />
            <Field label="Alerte stock (min)" type="number" value={form.alerte} onChange={v => setForm({ ...form, alerte: v })} placeholder="5" />
          </div>
          {form.prixAchat && form.prixVente && (
            <div style={{ background: "rgba(0,217,126,0.1)", border: "1px solid rgba(0,217,126,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <span style={{ color: "#8891aa", fontSize: 12 }}>Marge bénéficiaire: </span>
              <span style={{ color: "#00d97e", fontWeight: 700, fontSize: 14 }}>
                {fmt(form.prixVente - form.prixAchat)} ({Math.round(((form.prixVente - form.prixAchat) / form.prixAchat) * 100)}%)
              </span>
            </div>
          )}
          <Btn onClick={save} full>{editProduit ? "Enregistrer" : "Ajouter au stock"}</Btn>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// PAGE VENTES
// ============================================================
const Ventes = ({ produits, setProduits, ventes, setVentes, clients, setClients }) => {
  const [step, setStep] = useState(1);
  const [panier, setPanier] = useState([]);
  const [search, setSearch] = useState("");
  const [modePaiement, setModePaiement] = useState("cash");
  const [montantPaye, setMontantPaye] = useState("");
  const [clientId, setClientId] = useState("");
  const [success, setSuccess] = useState(false);

  const filtered = produits.filter(p => p.quantite > 0 && p.nom.toLowerCase().includes(search.toLowerCase()));

  const addPanier = (p) => {
    const exist = panier.find(x => x.id === p.id);
    if (exist) {
      setPanier(panier.map(x => x.id === p.id ? { ...x, qte: x.qte + 1 } : x));
    } else {
      setPanier([...panier, { ...p, qte: 1 }]);
    }
  };

  const removeFromPanier = (id) => setPanier(panier.filter(x => x.id !== id));
  const updateQte = (id, qte) => {
    if (qte <= 0) return removeFromPanier(id);
    setPanier(panier.map(x => x.id === id ? { ...x, qte } : x));
  };

  const total = panier.reduce((s, x) => s + x.prixVente * x.qte, 0);
  const paye = modePaiement === "credit" ? 0 : (modePaiement === "cash" && montantPaye ? Math.min(+montantPaye, total) : total);
  const dette = total - paye;
  const monnaie = montantPaye && modePaiement === "cash" ? Math.max(0, +montantPaye - total) : 0;

  const confirmerVente = () => {
    if (panier.length === 0) return;
    // Mise à jour du stock
    setProduits(prev => prev.map(p => {
      const item = panier.find(x => x.id === p.id);
      return item ? { ...p, quantite: p.quantite - item.qte } : p;
    }));
    // Enregistrer la vente
    panier.forEach(item => {
      const v = {
        id: Date.now() + Math.random(),
        date: new Date().toISOString(),
        produit: item.nom,
        quantite: item.qte,
        montant: item.prixVente * item.qte,
        paye: modePaiement === "mobile" ? item.prixVente * item.qte : modePaiement === "credit" ? 0 : Math.min(+montantPaye || item.prixVente * item.qte, item.prixVente * item.qte),
        mode: modePaiement,
        clientId: clientId ? +clientId : null,
      };
      setVentes(prev => [...prev, v]);
    });
    // Mise à jour dette client
    if (dette > 0 && clientId) {
      setClients(prev => prev.map(c => c.id === +clientId ? { ...c, dette: c.dette + dette } : c));
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setPanier([]);
      setStep(1);
      setSearch("");
      setModePaiement("cash");
      setMontantPaye("");
      setClientId("");
    }, 2000);
  };

  if (success) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,217,126,0.15)", border: "3px solid #00d97e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" size={40} color="#00d97e" />
      </div>
      <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 22, fontFamily: "'Sora', sans-serif" }}>Vente enregistrée !</div>
      <div style={{ color: "#8891aa", fontSize: 15 }}>Total: {fmt(total)}</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 16px", color: "#f0f4ff", fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Nouvelle Vente</h2>

      {/* Étape 1 : choisir produits */}
      {step === 1 && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Chercher un produit…"
            style={{ ...inputStyle, marginBottom: 14, width: "100%", boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {filtered.map(p => (
              <button key={p.id} onClick={() => addPanier(p)} style={{
                background: panier.find(x => x.id === p.id) ? "rgba(0,217,126,0.1)" : "#1a1f2e",
                border: panier.find(x => x.id === p.id) ? "1.5px solid rgba(0,217,126,0.4)" : "1.5px solid transparent",
                borderRadius: 14, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left"
              }}>
                <div>
                  <div style={{ color: "#f0f4ff", fontWeight: 600, fontSize: 14 }}>{p.nom}</div>
                  <div style={{ color: "#8891aa", fontSize: 12 }}>{p.quantite} en stock</div>
                </div>
                <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 14 }}>{fmt(p.prixVente)}</div>
              </button>
            ))}
          </div>

          {panier.length > 0 && (
            <>
              <div style={{ background: "#252b3b", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ color: "#8891aa", fontWeight: 700, fontSize: 12, marginBottom: 12, textTransform: "uppercase" }}>Panier ({panier.length})</div>
                {panier.map(x => (
                  <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{x.nom}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => updateQte(x.id, x.qte - 1)} style={{ background: "#1a1f2e", border: "none", color: "#f0f4ff", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>−</button>
                      <span style={{ color: "#f0f4ff", fontWeight: 700, minWidth: 20, textAlign: "center" }}>{x.qte}</span>
                      <button onClick={() => updateQte(x.id, x.qte + 1)} disabled={x.qte >= x.quantite} style={{ background: "#1a1f2e", border: "none", color: "#f0f4ff", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>+</button>
                    </div>
                    <div style={{ color: "#00d97e", fontWeight: 700, fontSize: 13, minWidth: 80, textAlign: "right" }}>{fmt(x.prixVente * x.qte)}</div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#f0f4ff", fontWeight: 700 }}>Total</span>
                  <span style={{ color: "#00d97e", fontWeight: 800, fontSize: 17 }}>{fmt(total)}</span>
                </div>
              </div>
              <Btn onClick={() => setStep(2)} full>Continuer → Paiement</Btn>
            </>
          )}
        </>
      )}

      {/* Étape 2 : paiement */}
      {step === 2 && (
        <>
          <div style={{ background: "#1a1f2e", borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "center" }}>
            <div style={{ color: "#8891aa", fontSize: 13 }}>Total à payer</div>
            <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 28, fontFamily: "'Sora', sans-serif" }}>{fmt(total)}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#8891aa", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Mode de paiement</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { val: "cash", label: "💵 Cash" },
                { val: "mobile", label: "📱 Mobile Money" },
                { val: "credit", label: "📋 À crédit" },
              ].map(m => (
                <button key={m.val} onClick={() => setModePaiement(m.val)} style={{
                  background: modePaiement === m.val ? "rgba(0,217,126,0.15)" : "#252b3b",
                  border: modePaiement === m.val ? "1.5px solid #00d97e" : "1.5px solid transparent",
                  borderRadius: 12, padding: "12px 8px", cursor: "pointer",
                  color: modePaiement === m.val ? "#00d97e" : "#8891aa", fontWeight: 700, fontSize: 12, fontFamily: "'Sora', sans-serif"
                }}>{m.label}</button>
              ))}
            </div>
          </div>

          {modePaiement === "cash" && (
            <Field label="Montant reçu" type="number" value={montantPaye} onChange={setMontantPaye} placeholder={total.toString()} />
          )}

          {(modePaiement === "credit" || (modePaiement === "cash" && montantPaye && +montantPaye < total)) && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#8891aa", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Client (pour la dette)</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={inputStyle}>
                <option value="">-- Sélectionner un client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          )}

          {monnaie > 0 && (
            <div style={{ background: "rgba(255,217,61,0.1)", border: "1px solid rgba(255,217,61,0.3)", borderRadius: 12, padding: 12, marginBottom: 16, textAlign: "center" }}>
              <span style={{ color: "#8891aa", fontSize: 13 }}>Monnaie à rendre: </span>
              <span style={{ color: "#ffd93d", fontWeight: 800, fontSize: 18 }}>{fmt(monnaie)}</span>
            </div>
          )}

          {dette > 0 && (
            <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: 12, marginBottom: 16, textAlign: "center" }}>
              <span style={{ color: "#8891aa", fontSize: 13 }}>Dette créée: </span>
              <span style={{ color: "#ff6b6b", fontWeight: 800, fontSize: 18 }}>{fmt(dette)}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setStep(1)} outlined full>← Retour</Btn>
            <Btn onClick={confirmerVente} full>✅ Confirmer</Btn>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// PAGE DETTES
// ============================================================
const Dettes = ({ clients, setClients, ventes }) => {
  const [selected, setSelected] = useState(null);
  const [showPaiement, setShowPaiement] = useState(false);
  const [montant, setMontant] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ nom: "", telephone: "", quartier: "" });

  const clientVentes = selected ? ventes.filter(v => v.clientId === selected.id) : [];

  const enregistrerPaiement = () => {
    if (!montant || !selected) return;
    const reduction = Math.min(+montant, selected.dette);
    setClients(prev => prev.map(c => c.id === selected.id ? { ...c, dette: c.dette - reduction } : c));
    setSelected(prev => ({ ...prev, dette: prev.dette - reduction }));
    setMontant("");
    setShowPaiement(false);
  };

  const ajouterClient = () => {
    if (!newClient.nom) return;
    setClients(prev => [...prev, { ...newClient, id: Date.now(), dette: 0 }]);
    setNewClient({ nom: "", telephone: "", quartier: "" });
    setShowAddClient(false);
  };

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#8891aa", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: 0, fontFamily: "'Sora', sans-serif", fontSize: 14 }}>
        ← Retour
      </button>
      <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#252b3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={24} color="#7b8cff" />
          </div>
          <div>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 17 }}>{selected.nom}</div>
            <div style={{ color: "#8891aa", fontSize: 13 }}>📍 {selected.quartier}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="phone" size={14} color="#8891aa" />
          <span style={{ color: "#8891aa", fontSize: 13 }}>{selected.telephone}</span>
        </div>
      </div>

      <div style={{ background: selected.dette > 0 ? "rgba(255,107,107,0.1)" : "rgba(0,217,126,0.1)", border: `1px solid ${selected.dette > 0 ? "rgba(255,107,107,0.3)" : "rgba(0,217,126,0.3)"}`, borderRadius: 14, padding: 20, marginBottom: 16, textAlign: "center" }}>
        <div style={{ color: "#8891aa", fontSize: 13, marginBottom: 4 }}>Dette totale</div>
        <div style={{ color: selected.dette > 0 ? "#ff6b6b" : "#00d97e", fontWeight: 800, fontSize: 28, fontFamily: "'Sora', sans-serif" }}>{fmt(selected.dette)}</div>
      </div>

      {selected.dette > 0 && (
        <Btn onClick={() => setShowPaiement(true)} full color="#00d97e">💰 Enregistrer un paiement</Btn>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Historique achats</div>
        {clientVentes.length === 0 ? (
          <div style={{ color: "#8891aa", fontSize: 13, textAlign: "center", padding: 20 }}>Aucune vente enregistrée</div>
        ) : clientVentes.map(v => (
          <div key={v.id} style={{ background: "#1a1f2e", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{v.produit}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>{new Date(v.date).toLocaleDateString("fr-FR")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 13 }}>{fmt(v.montant)}</div>
              {v.montant > v.paye && <div style={{ color: "#ff6b6b", fontSize: 11 }}>Reste: {fmt(v.montant - v.paye)}</div>}
            </div>
          </div>
        ))}
      </div>

      {showPaiement && (
        <Modal titre="Enregistrer paiement" onClose={() => setShowPaiement(false)}>
          <div style={{ color: "#8891aa", fontSize: 14, marginBottom: 16 }}>Dette restante: <strong style={{ color: "#ff6b6b" }}>{fmt(selected.dette)}</strong></div>
          <Field label="Montant payé" type="number" value={montant} onChange={setMontant} placeholder={selected.dette.toString()} />
          <Btn onClick={enregistrerPaiement} full>Confirmer le paiement</Btn>
        </Modal>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#f0f4ff", fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Cahier de Dettes</h2>
        <Btn onClick={() => setShowAddClient(true)} small>+ Client</Btn>
      </div>

      <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#8891aa", fontSize: 13 }}>Total dettes</span>
        <span style={{ color: "#ff6b6b", fontWeight: 800, fontSize: 17 }}>{fmt(clients.reduce((s, c) => s + c.dette, 0))}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clients.map(c => (
          <button key={c.id} onClick={() => setSelected(c)} style={{
            background: "#1a1f2e", border: "none", borderRadius: 14, padding: "14px 16px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left"
          }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: c.dette > 0 ? "rgba(255,107,107,0.15)" : "rgba(0,217,126,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="user" size={20} color={c.dette > 0 ? "#ff6b6b" : "#00d97e"} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{c.nom}</div>
              <div style={{ color: "#8891aa", fontSize: 12 }}>📍 {c.quartier}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: c.dette > 0 ? "#ff6b6b" : "#00d97e", fontWeight: 800, fontSize: 15 }}>
                {c.dette > 0 ? fmt(c.dette) : "✓ Soldé"}
              </div>
            </div>
            <Icon name="arrow" size={16} color="#555" />
          </button>
        ))}
      </div>

      {showAddClient && (
        <Modal titre="Nouveau client" onClose={() => setShowAddClient(false)}>
          <Field label="Nom complet" value={newClient.nom} onChange={v => setNewClient({ ...newClient, nom: v })} placeholder="Ex: Fatou Diallo" />
          <Field label="Téléphone" type="tel" value={newClient.telephone} onChange={v => setNewClient({ ...newClient, telephone: v })} placeholder="77 xxx xxxx" />
          <Field label="Quartier" value={newClient.quartier} onChange={v => setNewClient({ ...newClient, quartier: v })} placeholder="Ex: Médina" />
          <Btn onClick={ajouterClient} full>Ajouter le client</Btn>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// PAGE RAPPORTS
// ============================================================
const Rapports = ({ ventes, produits }) => {
  const aujourd = ventes.filter(v => new Date(v.date).toDateString() === new Date().toDateString());
  const total7j = ventes.filter(v => new Date(v.date) > new Date(Date.now() - 7 * 86400000));

  const calcStats = (list) => ({
    chiffre: list.reduce((s, v) => s + v.montant, 0),
    encaisse: list.reduce((s, v) => s + v.paye, 0),
    dettes: list.reduce((s, v) => s + (v.montant - v.paye), 0),
    benefice: list.reduce((s, v) => {
      const p = produits.find(p => p.nom === v.produit);
      return p ? s + (p.prixVente - p.prixAchat) * v.quantite : s;
    }, 0),
    nb: list.length,
  });

  const statsJ = calcStats(aujourd);
  const stats7 = calcStats(total7j);

  // Top produits
  const prodMap = {};
  ventes.forEach(v => { prodMap[v.produit] = (prodMap[v.produit] || 0) + v.quantite; });
  const topProduits = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const StatCard = ({ label, value, color = "#f0f4ff", sub }) => (
    <div style={{ background: "#1a1f2e", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ color: "#8891aa", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 17, fontFamily: "'Sora', sans-serif" }}>{value}</div>
      {sub && <div style={{ color: "#8891aa", fontSize: 11, marginTop: 3 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", color: "#f0f4ff", fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Rapports</h2>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#00d97e", fontWeight: 700, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: "#00d97e", borderRadius: "50%", display: "inline-block" }} /> Aujourd'hui
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Chiffre d'affaires" value={fmt(statsJ.chiffre)} color="#f0f4ff" />
          <StatCard label="Bénéfice" value={fmt(statsJ.benefice)} color="#00d97e" />
          <StatCard label="Encaissé" value={fmt(statsJ.encaisse)} color="#7b8cff" />
          <StatCard label="Nb ventes" value={statsJ.nb} color="#ffd93d" sub="transactions" />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#7b8cff", fontWeight: 700, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: "#7b8cff", borderRadius: "50%", display: "inline-block" }} /> 7 derniers jours
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Chiffre d'affaires" value={fmt(stats7.chiffre)} color="#f0f4ff" />
          <StatCard label="Bénéfice" value={fmt(stats7.benefice)} color="#00d97e" />
          <StatCard label="Encaissé" value={fmt(stats7.encaisse)} color="#7b8cff" />
          <StatCard label="Dettes créées" value={fmt(stats7.dettes)} color="#ff6b6b" />
        </div>
      </div>

      <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🏆 Top produits vendus</div>
        {topProduits.map(([nom, qte], i) => {
          const p = produits.find(x => x.nom === nom);
          const ca = p ? p.prixVente * qte : 0;
          const maxQte = topProduits[0][1];
          return (
            <div key={nom} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>#{i + 1} {nom}</span>
                <span style={{ color: "#8891aa", fontSize: 12 }}>{qte} unités · {fmt(ca)}</span>
              </div>
              <div style={{ height: 6, background: "#252b3b", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${(qte / maxQte) * 100}%`, background: ["#00d97e", "#7b8cff", "#ffd93d", "#ff9f43", "#ff6b6b"][i], borderRadius: 99, transition: "width 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// APPLICATION PRINCIPALE
// ============================================================
export default function MamyStock() {
  const [page, setPage] = useState("dashboard");
  const [produits, setProduits] = useState(INITIAL_PRODUCTS);
  const [ventes, setVentes] = useState(INITIAL_VENTES);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    setNotifCount(produits.filter(p => p.quantite <= p.alerte).length);
  }, [produits]);

  const pages = [
    { id: "dashboard", label: "Accueil", icon: "dashboard" },
    { id: "stock", label: "Stock", icon: "stock" },
    { id: "ventes", label: "Vendre", icon: "vente" },
    { id: "dettes", label: "Dettes", icon: "dette" },
    { id: "rapports", label: "Rapports", icon: "rapport" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #111520; }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3448; border-radius: 99px; }
        select option { background: #252b3b; }
        input::placeholder { color: #4a5068 !important; }
        input:focus, select:focus { border-color: #00d97e !important; }
      `}</style>
      <div style={{
        maxWidth: 480, margin: "0 auto", minHeight: "100vh",
        background: "#111520", fontFamily: "'Sora', sans-serif",
        display: "flex", flexDirection: "column", position: "relative"
      }}>
        {/* HEADER */}
        <div style={{
          background: "#1a1f2e", padding: "14px 20px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #00d97e, #00b360)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "#fff", fontSize: 14
            }}>M</div>
            <div>
              <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>MamyStock</div>
              <div style={{ color: "#8891aa", fontSize: 10 }}>Boutique Centrale</div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ background: "#252b3b", borderRadius: 10, padding: 8, display: "flex" }}>
              <Icon name="alert" size={18} color="#8891aa" />
            </div>
            {notifCount > 0 && (
              <div style={{
                position: "absolute", top: -4, right: -4, width: 18, height: 18,
                background: "#ff4757", borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#fff",
                fontSize: 10, fontWeight: 800, border: "2px solid #1a1f2e"
              }}>{notifCount}</div>
            )}
          </div>
        </div>

        {/* CONTENU */}
        <div style={{ flex: 1, padding: "20px 16px", overflow: "auto", paddingBottom: 90 }}>
          {page === "dashboard" && <Dashboard ventes={ventes} produits={produits} clients={clients} />}
          {page === "stock" && <Stock produits={produits} setProduits={setProduits} />}
          {page === "ventes" && <Ventes produits={produits} setProduits={setProduits} ventes={ventes} setVentes={setVentes} clients={clients} setClients={setClients} />}
          {page === "dettes" && <Dettes clients={clients} setClients={setClients} ventes={ventes} />}
          {page === "rapports" && <Rapports ventes={ventes} produits={produits} />}
        </div>

        {/* NAVBAR */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          background: "#1a1f2e", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", padding: "8px 0 12px",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
        }}>
          {pages.map(p => (
            <button key={p.id} onClick={() => setPage(p.id)} style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "6px 0",
            }}>
              {p.id === "ventes" ? (
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: page === p.id ? "linear-gradient(135deg, #00d97e, #00b360)" : "#252b3b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: -20, boxShadow: page === p.id ? "0 4px 20px rgba(0,217,126,0.5)" : "0 4px 12px rgba(0,0,0,0.3)",
                  border: "3px solid #1a1f2e",
                }}>
                  <Icon name={p.icon} size={22} color="#fff" />
                </div>
              ) : (
                <Icon name={p.icon} size={22} color={page === p.id ? "#00d97e" : "#555e7a"} />
              )}
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: page === p.id ? "#00d97e" : "#555e7a",
                letterSpacing: "0.04em"
              }}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
