import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
import { db } from "./firebase";
import {
  collection, doc, setDoc, getDoc, getDocs, addDoc,
  onSnapshot, query, where, orderBy, serverTimestamp, updateDoc
} from "firebase/firestore";

// ============================================================
// CONFIGURATION ADMIN
// ============================================================
const ADMIN_PHONE = "+23562282320";
const ADMIN_PASSWORD = "primogest@admin2026";

// ============================================================
// TRADUCTIONS
// ============================================================
const T = {
  fr: {
    appName: "PrimoGest", boutique: "Boutique",
    bonjour: "Bonjour 👋", accueil: "Accueil", stock: "Stock",
    vendre: "Vendre", dettes: "Dettes", rapports: "Rapports",
    ventesAujourdhui: "Ventes aujourd'hui", beneficeEstime: "Bénéfice estimé",
    dettesClients: "Dettes clients", rupturesStock: "Ruptures de stock",
    dernieresVentes: "Dernières ventes", alertesStock: "Alertes stock",
    monStock: "Mon Stock", ajouter: "Ajouter", chercher: "Chercher un produit...",
    nouvelleVente: "Nouvelle Vente", panier: "Panier", total: "Total",
    continuer: "Continuer → Paiement", modePayment: "Mode de paiement",
    cash: "💵 Cash", mobile: "📱 Mobile Money", credit: "📋 À crédit",
    montantRecu: "Montant reçu", monnaie: "Monnaie à rendre", detteCreee: "Dette créée",
    confirmer: "✅ Confirmer", retour: "← Retour",
    cahierDettes: "Cahier de Dettes", totalDettes: "Total dettes",
    client: "Client", nouveauClient: "+ Nouveau client",
    clientExistant: "-- Client existant --", nomComplet: "Nom complet *",
    telephone: "Téléphone", quartier: "Quartier", ajouterClient: "Ajouter le client",
    enregistrerPaiement: "💰 Enregistrer un paiement", detteTotal: "Dette totale",
    historique: "Historique achats", rapportsTitle: "Rapports",
    aujourdhui: "Aujourd'hui", sept_jours: "7 derniers jours",
    chiffreAffaires: "Chiffre d'affaires", benefice: "Bénéfice",
    encaisse: "Encaissé", nbVentes: "Nb ventes", topProduits: "🏆 Top produits vendus",
    seConnecter: "Se connecter", motDePasse: "Mot de passe",
    numTel: "Numéro de téléphone",
    motDePasseIncorrect: "❌ Numéro ou mot de passe incorrect",
    connectezVous: "Connectez-vous pour continuer",
    unites: "unités", aCredit: "À crédit", solde: "✓ Soldé",
    ruptureTotale: "Rupture totale", seulementRestants: "Seulement", restants: "restants",
    venteEnregistree: "Vente enregistrée !", nomProduit: "Nom du produit",
    categorie: "Catégorie", prixAchat: "Prix d'achat", prixVente: "Prix de vente",
    quantite: "Quantité", alerteStockMin: "Alerte stock (min)",
    margeBeneficiaire: "Marge bénéficiaire", modifierProduit: "Modifier produit",
    nouveauProduit: "Nouveau produit", ajouterAuStock: "Ajouter au stock",
    enregistrer: "Enregistrer", transactions: "transactions",
    dettesCreees: "Dettes créées", aucuneVente: "Aucune vente enregistrée",
    reste: "Reste", enStock: "en stock", chargement: "Chargement...",
    facture: "Facture", genererFacture: "🧾 Générer facture",
    nomBoutique: "Nom de la boutique", adresse: "Adresse",
    inscription: "Créer un compte", deja_compte: "Déjà un compte ? Se connecter",
    pas_compte: "Pas de compte ? S'inscrire", creer_compte: "Créer le compte",
    role_proprietaire: "Propriétaire", role_vendeur: "Vendeur", role_admin: "Admin",
    boutiques: "Boutiques", transactions_globales: "Transactions globales",
    vendeurs: "Mes vendeurs", ajouter_vendeur: "Ajouter vendeur",
    bilan: "Bilan financier", bilan_trimestriel: "Bilan trimestriel",
    localisation: "📍 Localisation enregistrée",
    nom_vendeur: "Nom du vendeur", tel_vendeur: "Téléphone vendeur",
    mdp_vendeur: "Mot de passe vendeur", creer_vendeur: "Créer le vendeur",
  },
  en: {
    appName: "PrimoGest", boutique: "Store",
    bonjour: "Hello 👋", accueil: "Home", stock: "Stock",
    vendre: "Sell", dettes: "Debts", rapports: "Reports",
    ventesAujourdhui: "Today's sales", beneficeEstime: "Estimated profit",
    dettesClients: "Customer debts", rupturesStock: "Out of stock",
    dernieresVentes: "Latest sales", alertesStock: "Stock alerts",
    monStock: "My Stock", ajouter: "Add", chercher: "Search a product...",
    nouvelleVente: "New Sale", panier: "Cart", total: "Total",
    continuer: "Continue → Payment", modePayment: "Payment method",
    cash: "💵 Cash", mobile: "📱 Mobile Money", credit: "📋 Credit",
    montantRecu: "Amount received", monnaie: "Change to give", detteCreee: "Debt created",
    confirmer: "✅ Confirm", retour: "← Back",
    cahierDettes: "Debt Book", totalDettes: "Total debts",
    client: "Customer", nouveauClient: "+ New customer",
    clientExistant: "-- Existing customer --", nomComplet: "Full name *",
    telephone: "Phone", quartier: "District", ajouterClient: "Add customer",
    enregistrerPaiement: "💰 Record payment", detteTotal: "Total debt",
    historique: "Purchase history", rapportsTitle: "Reports",
    aujourdhui: "Today", sept_jours: "Last 7 days",
    chiffreAffaires: "Revenue", benefice: "Profit",
    encaisse: "Collected", nbVentes: "Sales count", topProduits: "🏆 Top products",
    seConnecter: "Log in", motDePasse: "Password",
    numTel: "Phone number",
    motDePasseIncorrect: "❌ Wrong number or password",
    connectezVous: "Log in to continue",
    unites: "units", aCredit: "Credit", solde: "✓ Paid",
    ruptureTotale: "Out of stock", seulementRestants: "Only", restants: "left",
    venteEnregistree: "Sale recorded!", nomProduit: "Product name",
    categorie: "Category", prixAchat: "Purchase price", prixVente: "Sale price",
    quantite: "Quantity", alerteStockMin: "Stock alert (min)",
    margeBeneficiaire: "Profit margin", modifierProduit: "Edit product",
    nouveauProduit: "New product", ajouterAuStock: "Add to stock",
    enregistrer: "Save", transactions: "transactions",
    dettesCreees: "Debts created", aucuneVente: "No sales recorded",
    reste: "Remaining", enStock: "in stock", chargement: "Loading...",
    facture: "Invoice", genererFacture: "🧾 Generate invoice",
    nomBoutique: "Store name", adresse: "Address",
    inscription: "Create account", deja_compte: "Already have account? Log in",
    pas_compte: "No account? Sign up", creer_compte: "Create account",
    role_proprietaire: "Owner", role_vendeur: "Seller", role_admin: "Admin",
    boutiques: "Stores", transactions_globales: "Global transactions",
    vendeurs: "My sellers", ajouter_vendeur: "Add seller",
    bilan: "Financial report", bilan_trimestriel: "Quarterly report",
    localisation: "📍 Location saved",
    nom_vendeur: "Seller name", tel_vendeur: "Seller phone",
    mdp_vendeur: "Seller password", creer_vendeur: "Create seller",
  },
  ar: {
    appName: "PrimoGest", boutique: "المتجر",
    bonjour: "مرحباً 👋", accueil: "الرئيسية", stock: "المخزون",
    vendre: "بيع", dettes: "الديون", rapports: "التقارير",
    ventesAujourdhui: "مبيعات اليوم", beneficeEstime: "الربح المتوقع",
    dettesClients: "ديون العملاء", rupturesStock: "نفاد المخزون",
    dernieresVentes: "آخر المبيعات", alertesStock: "تنبيهات المخزون",
    monStock: "مخزوني", ajouter: "إضافة", chercher: "ابحث عن منتج...",
    nouvelleVente: "بيع جديد", panier: "السلة", total: "المجموع",
    continuer: "متابعة ← الدفع", modePayment: "طريقة الدفع",
    cash: "💵 نقداً", mobile: "📱 موبايل موني", credit: "📋 دين",
    montantRecu: "المبلغ المستلم", monnaie: "الباقي", detteCreee: "الدين المسجل",
    confirmer: "✅ تأكيد", retour: "رجوع →",
    cahierDettes: "دفتر الديون", totalDettes: "إجمالي الديون",
    client: "العميل", nouveauClient: "+ عميل جديد",
    clientExistant: "-- عميل موجود --", nomComplet: "الاسم الكامل *",
    telephone: "الهاتف", quartier: "الحي", ajouterClient: "إضافة العميل",
    enregistrerPaiement: "💰 تسجيل الدفع", detteTotal: "إجمالي الدين",
    historique: "سجل المشتريات", rapportsTitle: "التقارير",
    aujourdhui: "اليوم", sept_jours: "آخر 7 أيام",
    chiffreAffaires: "رقم الأعمال", benefice: "الربح",
    encaisse: "المحصل", nbVentes: "عدد المبيعات", topProduits: "🏆 أكثر المنتجات مبيعاً",
    seConnecter: "تسجيل الدخول", motDePasse: "كلمة المرور",
    numTel: "رقم الهاتف",
    motDePasseIncorrect: "❌ رقم أو كلمة مرور خاطئة",
    connectezVous: "سجل دخولك للمتابعة",
    unites: "وحدات", aCredit: "دين", solde: "✓ مسدد",
    ruptureTotale: "نفد تماماً", seulementRestants: "فقط", restants: "متبقي",
    venteEnregistree: "تم تسجيل البيع!", nomProduit: "اسم المنتج",
    categorie: "الفئة", prixAchat: "سعر الشراء", prixVente: "سعر البيع",
    quantite: "الكمية", alerteStockMin: "تنبيه المخزون",
    margeBeneficiaire: "هامش الربح", modifierProduit: "تعديل المنتج",
    nouveauProduit: "منتج جديد", ajouterAuStock: "إضافة للمخزون",
    enregistrer: "حفظ", transactions: "معاملات",
    dettesCreees: "ديون مسجلة", aucuneVente: "لا توجد مبيعات",
    reste: "المتبقي", enStock: "في المخزون", chargement: "جاري التحميل...",
    facture: "فاتورة", genererFacture: "🧾 إنشاء فاتورة",
    nomBoutique: "اسم المتجر", adresse: "العنوان",
    inscription: "إنشاء حساب", deja_compte: "لديك حساب؟ تسجيل الدخول",
    pas_compte: "ليس لديك حساب؟ إنشاء حساب", creer_compte: "إنشاء الحساب",
    role_proprietaire: "مالك", role_vendeur: "بائع", role_admin: "مدير",
    boutiques: "المتاجر", transactions_globales: "المعاملات العامة",
    vendeurs: "البائعون", ajouter_vendeur: "إضافة بائع",
    bilan: "التقرير المالي", bilan_trimestriel: "التقرير الفصلي",
    localisation: "📍 تم حفظ الموقع",
    nom_vendeur: "اسم البائع", tel_vendeur: "هاتف البائع",
    mdp_vendeur: "كلمة مرور البائع", creer_vendeur: "إنشاء البائع",
  }
};

// ============================================================
// UTILITAIRES
// ============================================================
const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0) + " FCFA";
const genFactureId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `PG-${year}-${rand}`;
};
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const formatHeure = (date) => {
  return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

// ============================================================
// STYLES
// ============================================================
const inputStyle = {
  width: "100%", background: "#252b3b", border: "1.5px solid #2d3448",
  borderRadius: 12, color: "#f0f4ff", padding: "12px 14px", fontSize: 15,
  outline: "none", boxSizing: "border-box", fontFamily: "'Sora', sans-serif",
};

// ============================================================
// COMPOSANTS UI
// ============================================================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    stock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    vente: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
    dette: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
    rapport: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    money: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    map: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />,
    store: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a1 1 0 01-1 1H8a1 1 0 01-1-1v-6" />,
    invoice: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  };
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} style={{ flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
};

const Modal = ({ titre, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000 }}>
    <div style={{ background: "#1a1f2e", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, maxHeight: "92vh", overflow: "auto", padding: "24px 20px 40px", boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: "#f0f4ff", fontSize: 18, fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>{titre}</h3>
        <button onClick={onClose} style={{ background: "#2a3040", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
          <Icon name="close" size={18} color="#8891aa" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, type = "text", value, onChange, placeholder, options }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", color: "#8891aa", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    )}
  </div>
);

const Btn = ({ children, onClick, color = "#00d97e", outlined, small, full, disabled, danger }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? "#2a3040" : outlined ? "transparent" : danger ? "#ff4757" : color,
    border: outlined ? `1.5px solid ${color}` : "none",
    color: disabled ? "#555" : outlined ? color : "#fff",
    borderRadius: 12, padding: small ? "8px 16px" : "14px 20px",
    fontSize: small ? 13 : 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    width: full ? "100%" : "auto", fontFamily: "'Sora', sans-serif", marginTop: small ? 0 : 4,
  }}>{children}</button>
);

// ============================================================
// FACTURE
// ============================================================
const Facture = ({ vente, boutique, onClose, t }) => {
  const factureId = vente.factureId || genFactureId();
  const date = vente.date ? new Date(vente.date) : new Date();

  const printFacture = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Facture ${factureId}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #00d97e; padding-bottom: 15px; }
        .logo { font-size: 28px; font-weight: 800; color: #00d97e; }
        .facture-id { font-size: 14px; color: #666; margin-top: 5px; }
        .info { display: flex; justify-content: space-between; margin: 15px 0; font-size: 13px; }
        .produit { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
        .total { display: flex; justify-content: space-between; font-weight: 800; font-size: 16px; margin-top: 15px; padding-top: 10px; border-top: 2px solid #333; }
        .mode { text-align: center; margin-top: 15px; color: #666; font-size: 12px; }
        .footer { text-align: center; margin-top: 25px; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; }
        .heure { color: #666; font-size: 12px; }
      </style></head><body>
      <div class="header">
        <div class="logo">PrimoGest</div>
        <div style="font-size:16px; font-weight:700; margin-top:5px;">${boutique?.nom || "Boutique"}</div>
        ${boutique?.adresse ? `<div style="font-size:12px; color:#666;">${boutique.adresse}</div>` : ""}
        <div class="facture-id">Facture N° ${factureId}</div>
      </div>
      <div class="info">
        <span>📅 ${formatDate(date)}</span>
        <span class="heure">🕐 ${formatHeure(date)}</span>
      </div>
      <div>
        ${vente.items ? vente.items.map(item => `
          <div class="produit">
            <span>${item.nom} x${item.qte}</span>
            <span>${fmt(item.prixVente * item.qte)}</span>
          </div>
        `).join("") : `
          <div class="produit">
            <span>${vente.produit} x${vente.quantite}</span>
            <span>${fmt(vente.montant)}</span>
          </div>
        `}
      </div>
      <div class="total">
        <span>TOTAL</span>
        <span>${fmt(vente.montant)}</span>
      </div>
      ${vente.montant > vente.paye ? `<div style="color:#ff4757; text-align:center; margin-top:10px; font-size:13px;">Reste à payer: ${fmt(vente.montant - vente.paye)}</div>` : ""}
      <div class="mode">Mode: ${vente.mode === "cash" ? "💵 Cash" : vente.mode === "mobile" ? "📱 Mobile Money" : "📋 À crédit"}</div>
      <div class="footer">
        Merci pour votre confiance !<br/>
        PrimoGest - Le cahier de boutique intelligent
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <Modal titre={`${t.facture} — ${factureId}`} onClose={onClose}>
      <div style={{ background: "#252b3b", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 16 }}>PrimoGest</div>
          <div style={{ color: "#8891aa", fontSize: 12 }}>N° {factureId}</div>
        </div>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{boutique?.nom}</div>
        <div style={{ color: "#8891aa", fontSize: 12, marginBottom: 12 }}>{boutique?.adresse}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ color: "#8891aa", fontSize: 12 }}>📅 {formatDate(date)}</span>
          <span style={{ color: "#8891aa", fontSize: 12 }}>🕐 {formatHeure(date)}</span>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
          {vente.items ? vente.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#f0f4ff", fontSize: 13 }}>{item.nom} x{item.qte}</span>
              <span style={{ color: "#00d97e", fontSize: 13, fontWeight: 700 }}>{fmt(item.prixVente * item.qte)}</span>
            </div>
          )) : (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#f0f4ff", fontSize: 13 }}>{vente.produit} x{vente.quantite}</span>
              <span style={{ color: "#00d97e", fontSize: 13, fontWeight: 700 }}>{fmt(vente.montant)}</span>
            </div>
          )}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 16 }}>TOTAL</span>
          <span style={{ color: "#00d97e", fontWeight: 800, fontSize: 16 }}>{fmt(vente.montant)}</span>
        </div>
        {vente.mode === "credit" && (
          <div style={{ color: "#ff6b6b", textAlign: "center", marginTop: 8, fontSize: 12 }}>
            Reste: {fmt(vente.montant - vente.paye)}
          </div>
        )}
      </div>
      <Btn onClick={printFacture} full>🖨️ Imprimer la facture</Btn>
    </Modal>
  );
};

// ============================================================
// LOGIN
// ============================================================
const Login = ({ onLogin, t }) => {
  const [isInscription, setIsInscription] = useState(false);
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [nomBoutique, setNomBoutique] = useState("");
  const [adresse, setAdresse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const connexion = async () => {
    if (!telephone || !password) return;
    setLoading(true);
    setError("");
    try {
      // Vérifier Admin
      if (telephone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
        onLogin({ telephone, role: "admin", nom: "Admin PrimoGest", id: "admin" });
        return;
      }
      // Vérifier dans Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("telephone", "==", telephone));
      const snapshot = await getDocs(q);
      if (snapshot.empty) { setError(t.motDePasseIncorrect); setLoading(false); return; }
      const userData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      if (userData.password !== password) { setError(t.motDePasseIncorrect); setLoading(false); return; }
      onLogin(userData);
    } catch (e) {
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
      setLoading(false);
    }
  };

  const inscription = async () => {
    if (!telephone || !password || !nomBoutique) return;
    setLoading(true);
    setError("");
    try {
      // Vérifier si le numéro existe déjà
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("telephone", "==", telephone));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) { setError("Ce numéro est déjà enregistré"); setLoading(false); return; }

      // Obtenir la géolocalisation
      let localisation = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          localisation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) { localisation = null; }
      }

      // Créer le compte
      const userRef = await addDoc(collection(db, "users"), {
        telephone, password, nomBoutique, adresse, role: "proprietaire",
        localisation, createdAt: serverTimestamp(), actif: true,
      });

      onLogin({ id: userRef.id, telephone, nomBoutique, adresse, role: "proprietaire", localisation });
    } catch (e) {
      setError("Erreur lors de la création du compte.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111520", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Sora', sans-serif" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #00d97e, #00b360)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 30, marginBottom: 20 }}>P</div>
      <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 26, marginBottom: 6 }}>PrimoGest</div>
      <div style={{ color: "#8891aa", fontSize: 14, marginBottom: 36 }}>{t.connectezVous}</div>

      <div style={{ width: "100%", maxWidth: 360 }}>
        <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
          placeholder="+235 XX XX XX XX" style={{ ...inputStyle, marginBottom: 12 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (isInscription ? inscription() : connexion())}
          placeholder={t.motDePasse} style={{ ...inputStyle, marginBottom: 12 }} />

        {isInscription && (
          <>
            <input value={nomBoutique} onChange={e => setNomBoutique(e.target.value)}
              placeholder={t.nomBoutique + " *"} style={{ ...inputStyle, marginBottom: 12 }} />
            <input value={adresse} onChange={e => setAdresse(e.target.value)}
              placeholder={t.adresse} style={{ ...inputStyle, marginBottom: 12 }} />
          </>
        )}

        {error && <div style={{ color: "#ff4757", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</div>}

        <button onClick={isInscription ? inscription : connexion} disabled={loading} style={{ width: "100%", background: loading ? "#555" : "linear-gradient(135deg, #00d97e, #00b360)", border: "none", borderRadius: 12, color: "#fff", padding: 14, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Sora', sans-serif", marginBottom: 16 }}>
          {loading ? t.chargement : isInscription ? t.creer_compte : t.seConnecter}
        </button>

        <button onClick={() => { setIsInscription(!isInscription); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "#00d97e", fontSize: 13, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
          {isInscription ? t.deja_compte : t.pas_compte}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD ADMIN
// ============================================================
const AdminDashboard = ({ user, onLogout, t, langue, setLangue }) => {
  const [boutiques, setBoutiques] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [page, setPage] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [selectedBoutique, setSelectedBoutique] = useState(null);
  const [showBilan, setShowBilan] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const boutiquesData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "proprietaire");
        setBoutiques(boutiquesData);

        const ventesSnap = await getDocs(collection(db, "ventes"));
        const ventesData = ventesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setVentes(ventesData);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadData();
  }, []);

  const totalCA = ventes.reduce((s, v) => s + (v.montant || 0), 0);
  const totalDettes = ventes.reduce((s, v) => s + ((v.montant || 0) - (v.paye || 0)), 0);

  // Bilan trimestriel
  const genererBilan = (boutique) => {
    const now = new Date();
    const trimestre = Math.floor(now.getMonth() / 3) + 1;
    const debutTrimestre = new Date(now.getFullYear(), (trimestre - 1) * 3, 1);
    const ventesBoutique = ventes.filter(v => v.boutiqueId === boutique.id && new Date(v.date?.toDate?.() || v.date) >= debutTrimestre);
    const ca = ventesBoutique.reduce((s, v) => s + (v.montant || 0), 0);
    const encaisse = ventesBoutique.reduce((s, v) => s + (v.paye || 0), 0);
    const dettes = ca - encaisse;
    return { trimestre, ca, encaisse, dettes, nb: ventesBoutique.length, boutique };
  };

  const prodMap = {};
  ventes.forEach(v => { prodMap[v.produit] = (prodMap[v.produit] || 0) + (v.quantite || 0); });
  const topProduits = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (loading) return <div style={{ color: "#f0f4ff", textAlign: "center", padding: 40, fontFamily: "'Sora', sans-serif" }}>{t.chargement}</div>;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#111520", fontFamily: "'Sora', sans-serif", paddingBottom: 90 }}>
      {/* HEADER ADMIN */}
      <div style={{ background: "linear-gradient(135deg, #1a1f2e, #252b3b)", padding: "16px 20px", borderBottom: "1px solid rgba(0,217,126,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00d97e, #00b360)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>P</div>
          <div>
            <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 15 }}>Admin PrimoGest</div>
            <div style={{ color: "#00d97e", fontSize: 10, fontWeight: 700 }}>👑 SUPER ADMIN</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {["fr", "en", "ar"].map(l => (
            <button key={l} onClick={() => { setLangue(l); localStorage.setItem("primogest_langue", l); }} style={{ background: langue === l ? "#00d97e" : "#252b3b", border: "none", borderRadius: 6, padding: "3px 8px", color: langue === l ? "#fff" : "#8891aa", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{l.toUpperCase()}</button>
          ))}
          <button onClick={() => setShowChangePwd(true)} style={{ background: "#252b3b", border: "none", borderRadius: 9, padding: 6, cursor: "pointer", display: "flex" }}>
  <Icon name="edit" size={14} color="#8891aa" />
</button>
          <button onClick={onLogout} style={{ background: "#252b3b", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex", marginLeft: 4 }}>
            <Icon name="logout" size={16} color="#ff6b6b" />
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* STATS GLOBALES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: t.boutiques, value: boutiques.length, color: "#7b8cff", icon: "store" },
            { label: t.transactions_globales, value: ventes.length, color: "#ffd93d", icon: "chart" },
            { label: "Chiffre d'affaires total", value: fmt(totalCA), color: "#00d97e", icon: "money" },
            { label: "Dettes totales", value: fmt(totalDettes), color: "#ff6b6b", icon: "dette" },
          ].map(c => (
            <div key={c.label} style={{ background: "#1a1f2e", borderRadius: 16, padding: "14px", border: `1px solid ${c.color}22` }}>
              <Icon name={c.icon} size={18} color={c.color} />
              <div style={{ color: c.color, fontWeight: 800, fontSize: 15, marginTop: 8 }}>{c.value}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* TOP PRODUITS GLOBAL */}
        {topProduits.length > 0 && (
          <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{t.topProduits}</div>
            {topProduits.map(([nom, qte], i) => (
              <div key={nom} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>#{i + 1} {nom}</span>
                  <span style={{ color: "#8891aa", fontSize: 12 }}>{qte} unités</span>
                </div>
                <div style={{ height: 5, background: "#252b3b", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${(qte / topProduits[0][1]) * 100}%`, background: ["#00d97e", "#7b8cff", "#ffd93d", "#ff9f43", "#ff6b6b"][i], borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LISTE DES BOUTIQUES */}
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>🏪 {t.boutiques} ({boutiques.length})</div>
        {boutiques.map(b => {
          const ventesBoutique = ventes.filter(v => v.boutiqueId === b.id);
          const caBoutique = ventesBoutique.reduce((s, v) => s + (v.montant || 0), 0);
          return (
            <div key={b.id} style={{ background: "#1a1f2e", borderRadius: 14, padding: "16px", marginBottom: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15 }}>{b.nomBoutique}</div>
                  <div style={{ color: "#8891aa", fontSize: 12 }}>📞 {b.telephone}</div>
                  {b.adresse && <div style={{ color: "#8891aa", fontSize: 12 }}>📍 {b.adresse}</div>}
                  {b.localisation && <div style={{ color: "#00d97e", fontSize: 11 }}><div style={{ height: 150, borderRadius: 10, overflow: "hidden", marginTop: 8 }}>
  <MapContainer
    center={[b.localisation.lat, b.localisation.lng]}
    zoom={15}
    style={{ height: "100%", width: "100%" }}
    zoomControl={false}
    scrollWheelZoom={false}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[b.localisation.lat, b.localisation.lng]}>
      <Popup>{b.nomBoutique}</Popup>
    </Marker>
  </MapContainer>
</div>, {b.localisation.lng?.toFixed(4)}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 14 }}>{fmt(caBoutique)}</div>
                  <div style={{ color: "#8891aa", fontSize: 11 }}>{ventesBoutique.length} ventes</div>
                </div>
              </div>
              <button onClick={() => { setSelectedBoutique(b); setShowBilan(true); }} style={{ background: "rgba(123,140,255,0.15)", border: "1px solid rgba(123,140,255,0.3)", borderRadius: 10, padding: "8px 14px", color: "#7b8cff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", width: "100%" }}>
                📊 {t.bilan_trimestriel}
              </button>
            </div>
          );
        })}

        {boutiques.length === 0 && (
          <div style={{ color: "#8891aa", textAlign: "center", padding: 40 }}>Aucune boutique enregistrée</div>
        )}
      </div>

      {/* MODAL BILAN */}
      {showBilan && selectedBoutique && (() => {
        const bilan = genererBilan(selectedBoutique);
        return (
          <Modal titre={`📊 Bilan T${bilan.trimestre} — ${selectedBoutique.nomBoutique}`} onClose={() => setShowBilan(false)}>
            <div style={{ background: "#252b3b", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ color: "#8891aa", fontSize: 13, marginBottom: 16 }}>
                Trimestre {bilan.trimestre} — {new Date().getFullYear()}
              </div>
              {[
                { label: "Chiffre d'affaires", value: fmt(bilan.ca), color: "#f0f4ff" },
                { label: "Montant encaissé", value: fmt(bilan.encaisse), color: "#00d97e" },
                { label: "Dettes en cours", value: fmt(bilan.dettes), color: "#ff6b6b" },
                { label: "Nombre de ventes", value: bilan.nb, color: "#ffd93d" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#8891aa", fontSize: 14 }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 700, fontSize: 14 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <Btn onClick={() => setShowBilan(false)} full outlined>Fermer</Btn>
          </Modal>
        );
      })()}
    </div>
  );
};

// ============================================================
// APP BOUTIQUE (Propriétaire + Vendeur)
// ============================================================
const AppBoutique = ({ user, onLogout, t, langue, setLangue }) => {
  const [page, setPage] = useState("dashboard");
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendeurs, setVendeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [showFacture, setShowFacture] = useState(null);
  const [showVendeurs, setShowVendeurs] = useState(false);
  const [newVendeur, setNewVendeur] = useState({ nom: "", telephone: "", password: "" });

  const boutiqueId = user.boutiqueId || user.id;
  const isProprietaire = user.role === "proprietaire";
  const boutique = { nom: user.nomBoutique || "Ma Boutique", adresse: user.adresse || "" };

  // Charger données depuis Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        const [produitsSnap, ventesSnap, clientsSnap] = await Promise.all([
          getDocs(query(collection(db, "produits"), where("boutiqueId", "==", boutiqueId))),
          getDocs(query(collection(db, "ventes"), where("boutiqueId", "==", boutiqueId))),
          getDocs(query(collection(db, "clients"), where("boutiqueId", "==", boutiqueId))),
        ]);
        setProduits(produitsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setVentes(ventesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadData();
  }, [boutiqueId]);

  useEffect(() => { setNotifCount(produits.filter(p => p.quantite <= p.alerte).length); }, [produits]);

  // Sauvegarder produit
  const saveProduit = async (produit) => {
    try {
      if (produit.id && produit.id.length > 5) {
        await updateDoc(doc(db, "produits", produit.id), { ...produit, boutiqueId });
        setProduits(prev => prev.map(p => p.id === produit.id ? produit : p));
      } else {
        const ref = await addDoc(collection(db, "produits"), { ...produit, boutiqueId, createdAt: serverTimestamp() });
        setProduits(prev => [...prev, { ...produit, id: ref.id }]);
      }
    } catch (e) { console.error(e); }
  };

  const deleteProduit = async (id) => {
    try {
      await updateDoc(doc(db, "produits", id), { deleted: true });
      setProduits(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  };

  // Enregistrer vente
  const saveVente = async (venteData) => {
    try {
      const factureId = genFactureId();
      const ref = await addDoc(collection(db, "ventes"), { ...venteData, boutiqueId, factureId, date: serverTimestamp(), vendeurId: user.id, vendeurNom: user.nom || user.telephone });
      setVentes(prev => [...prev, { ...venteData, id: ref.id, factureId }]);
      // Mettre à jour stock
      for (const item of venteData.items || []) {
        const p = produits.find(p => p.id === item.id);
        if (p) { const newQte = p.quantite - item.qte; await updateDoc(doc(db, "produits", p.id), { quantite: newQte }); setProduits(prev => prev.map(x => x.id === p.id ? { ...x, quantite: newQte } : x)); }
      }
      return { ...venteData, factureId };
    } catch (e) { console.error(e); }
  };

  // Sauvegarder client
  const saveClient = async (client) => {
    try {
      if (client.id && client.id.length > 5) {
        await updateDoc(doc(db, "clients", client.id), { ...client, boutiqueId });
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
      } else {
        const ref = await addDoc(collection(db, "clients"), { ...client, boutiqueId, createdAt: serverTimestamp() });
        setClients(prev => [...prev, { ...client, id: ref.id }]);
        return ref.id;
      }
    } catch (e) { console.error(e); }
  };

  // Ajouter vendeur
  const ajouterVendeur = async () => {
    if (!newVendeur.nom || !newVendeur.telephone || !newVendeur.password) return;
    try {
      await addDoc(collection(db, "users"), { ...newVendeur, role: "vendeur", boutiqueId, nomBoutique: boutique.nom, actif: true, createdAt: serverTimestamp() });
      setNewVendeur({ nom: "", telephone: "", password: "" });
      setShowVendeurs(false);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div style={{ color: "#f0f4ff", textAlign: "center", padding: 40, fontFamily: "'Sora', sans-serif", minHeight: "100vh", background: "#111520", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.chargement}</div>;

  const pages = isProprietaire
    ? [
        { id: "dashboard", label: t.accueil, icon: "dashboard" },
        { id: "stock", label: t.stock, icon: "stock" },
        { id: "ventes", label: t.vendre, icon: "vente" },
        { id: "dettes", label: t.dettes, icon: "dette" },
        { id: "rapports", label: t.rapports, icon: "rapport" },
      ]
    : [
        { id: "ventes", label: t.vendre, icon: "vente" },
        { id: "dashboard", label: t.accueil, icon: "dashboard" },
      ];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#111520", fontFamily: "'Sora', sans-serif", direction: langue === "ar" ? "rtl" : "ltr" }}>
      {/* HEADER */}
      <div style={{ background: "#1a1f2e", padding: "14px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00d97e, #00b360)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>P</div>
          <div>
            <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 15 }}>{boutique.nom}</div>
            <div style={{ color: "#8891aa", fontSize: 10 }}>{isProprietaire ? t.role_proprietaire : t.role_vendeur} — {user.telephone}</div>
            <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
              {["fr", "en", "ar"].map(l => (
                <button key={l} onClick={() => { setLangue(l); localStorage.setItem("primogest_langue", l); }} style={{ background: langue === l ? "#00d97e" : "#252b3b", border: "none", borderRadius: 5, padding: "2px 6px", color: langue === l ? "#fff" : "#8891aa", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {isProprietaire && (
            <button onClick={() => setShowVendeurs(true)} style={{ background: "#252b3b", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
              <Icon name="user" size={18} color="#7b8cff" />
            </button>
          )}
          <div style={{ position: "relative" }}>
            <div style={{ background: "#252b3b", borderRadius: 10, padding: 8, display: "flex" }}>
              <Icon name="alert" size={18} color="#8891aa" />
            </div>
            {notifCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: "#ff4757", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800, border: "2px solid #1a1f2e" }}>{notifCount}</div>}
          </div>
          <button onClick={() => setShowChangePwd(true)} style={{ background: "#252b3b", border: "none", borderRadius: 9, padding: 6, cursor: "pointer", display: "flex" }}>
  <Icon name="edit" size={15} color="#8891aa" />
</button>
          <button onClick={onLogout} style={{ background: "#252b3b", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
            <Icon name="logout" size={18} color="#ff6b6b" />
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ padding: "20px 16px", paddingBottom: 100 }}>
        {page === "dashboard" && <DashboardBoutique ventes={ventes} produits={produits} clients={clients} t={t} langue={langue} isProprietaire={isProprietaire} />}
        {page === "stock" && isProprietaire && <StockPage produits={produits} saveProduit={saveProduit} deleteProduit={deleteProduit} t={t} />}
        {page === "ventes" && <VentesPage produits={produits} ventes={ventes} clients={clients} saveVente={saveVente} saveClient={saveClient} t={t} isProprietaire={isProprietaire} boutique={boutique} setShowFacture={setShowFacture} />}
        {page === "dettes" && isProprietaire && <DettesPage clients={clients} setClients={setClients} saveClient={saveClient} ventes={ventes} t={t} />}
        {page === "rapports" && isProprietaire && <RapportsPage ventes={ventes} produits={produits} t={t} setShowFacture={setShowFacture} />}
      </div>

      {/* NAVBAR */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#1a1f2e", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", padding: "8px 0 12px", boxShadow: "0 -8px 32px rgba(0,0,0,0.4)" }}>
        {pages.map(p => (
          <button key={p.id} onClick={() => setPage(p.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0" }}>
            {p.id === "ventes" ? (
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: page === p.id ? "linear-gradient(135deg, #00d97e, #00b360)" : "#252b3b", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -20, boxShadow: page === p.id ? "0 4px 20px rgba(0,217,126,0.5)" : "0 4px 12px rgba(0,0,0,0.3)", border: "3px solid #1a1f2e" }}>
                <Icon name={p.icon} size={22} color="#fff" />
              </div>
            ) : (
              <Icon name={p.icon} size={22} color={page === p.id ? "#00d97e" : "#555e7a"} />
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: page === p.id ? "#00d97e" : "#555e7a" }}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* MODAL VENDEURS */}
      {showVendeurs && (
        <Modal titre={t.vendeurs} onClose={() => setShowVendeurs(false)}>
          <Field label={t.nom_vendeur} value={newVendeur.nom} onChange={v => setNewVendeur({ ...newVendeur, nom: v })} placeholder="Ex: Amadou" />
          <Field label={t.tel_vendeur} type="tel" value={newVendeur.telephone} onChange={v => setNewVendeur({ ...newVendeur, telephone: v })} placeholder="+235 XX XX XX XX" />
          <Field label={t.mdp_vendeur} type="password" value={newVendeur.password} onChange={v => setNewVendeur({ ...newVendeur, password: v })} placeholder="Mot de passe" />
          <Btn onClick={ajouterVendeur} full>{t.creer_vendeur}</Btn>
          <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
  <button onClick={() => { setShowVendeurs(false); setShowChangePwd(true); }}
    style={{ width:"100%", background:"rgba(123,140,255,0.1)", border:"1px solid rgba(123,140,255,0.3)", borderRadius:12, padding:"12px 16px", color:"#7b8cff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
    🔐 Changer mon mot de passe
  </button>
</div>
        </Modal>
      )}
{showChangePwd && (
  <Modal titre="🔐 Changer mot de passe" onClose={() => { setShowChangePwd(false); setOldPwd(""); setNewPwd(""); setPwdMsg(""); }}>
    <Field label="Ancien mot de passe" type="password" value={oldPwd} onChange={setOldPwd} placeholder="Votre mot de passe actuel" />
    <Field label="Nouveau mot de passe" type="password" value={newPwd} onChange={setNewPwd} placeholder="Nouveau mot de passe" />
    {pwdMsg && (
      <div style={{ background: pwdMsg.includes("✅") ? "rgba(0,217,126,0.1)" : "rgba(255,71,87,0.1)", border: `1px solid ${pwdMsg.includes("✅") ? "rgba(0,217,126,0.3)" : "rgba(255,71,87,0.3)"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: pwdMsg.includes("✅") ? "#00d97e" : "#ff4757", fontSize: 13, textAlign: "center" }}>
        {pwdMsg}
      </div>
    )}
    <Btn onClick={changerMotDePasse} full>🔐 Confirmer le changement</Btn>
    <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
  <button onClick={() => { setShowVendeurs(false); setShowChangePwd(true); }}
    style={{ width:"100%", background:"rgba(123,140,255,0.1)", border:"1px solid rgba(123,140,255,0.3)", borderRadius:12, padding:"12px 16px", color:"#7b8cff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
    🔐 Changer mon mot de passe
  </button>
</div>
  </Modal>
)}
      {/* FACTURE */}
      {showFacture && <Facture vente={showFacture} boutique={boutique} onClose={() => setShowFacture(null)} t={t} />}
    </div>
  );
};

// ============================================================
// DASHBOARD BOUTIQUE
// ============================================================
const DashboardBoutique = ({ ventes, produits, clients, t, langue, isProprietaire }) => {
  const ventesAujourdhui = ventes.filter(v => {
    const d = v.date?.toDate ? v.date.toDate() : new Date(v.date);
    return d.toDateString() === new Date().toDateString();
  });
  const totalVentes = ventesAujourdhui.reduce((s, v) => s + (v.paye || 0), 0);
  const totalDettes = clients.reduce((s, c) => s + (c.dette || 0), 0);
  const ruptures = produits.filter(p => p.quantite === 0).length;
  const alertes = produits.filter(p => p.quantite > 0 && p.quantite <= p.alerte).length;
  const benefice = ventesAujourdhui.reduce((s, v) => {
    const p = produits.find(p => p.nom === v.produit);
    return p ? s + (p.prixVente - p.prixAchat) * (v.quantite || 0) : s;
  }, 0);

  const cards = [
    { label: t.ventesAujourdhui, value: fmt(totalVentes), icon: "vente", color: "#00d97e" },
    { label: t.beneficeEstime, value: fmt(benefice), icon: "money", color: "#ffd93d" },
    { label: t.dettesClients, value: fmt(totalDettes), icon: "dette", color: "#ff6b6b" },
    { label: t.rupturesStock, value: `${ruptures} (${alertes})`, icon: "alert", color: "#ff9f43" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: "#8891aa", margin: 0, fontSize: 13 }}>{new Date().toLocaleDateString(langue === "ar" ? "ar-TN" : langue === "en" ? "en-US" : "fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h2 style={{ margin: "4px 0 0", color: "#f0f4ff", fontSize: 22, fontWeight: 800 }}>{t.bonjour}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#1a1f2e", borderRadius: 16, padding: "14px", border: `1px solid ${c.color}22` }}>
            <Icon name={c.icon} size={18} color={c.color} />
            <div style={{ color: c.color, fontWeight: 800, fontSize: 15, marginTop: 8 }}>{c.value}</div>
            <div style={{ color: "#8891aa", fontSize: 11 }}>{c.label}</div>
          </div>
        ))}
      </div>
      {(ruptures > 0 || alertes > 0) && (
        <div style={{ background: "rgba(255,159,67,0.1)", border: "1px solid rgba(255,159,67,0.3)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ color: "#ff9f43", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{t.alertesStock}</div>
          {produits.filter(p => p.quantite <= p.alerte).map(p => (
            <div key={p.id} style={{ color: "#c8cfd8", fontSize: 13, padding: "4px 0" }}>
              {p.quantite === 0 ? "🔴" : "🟡"} {p.nom} — {p.quantite === 0 ? t.ruptureTotale : `${p.quantite} ${t.restants}`}
            </div>
          ))}
        </div>
      )}
      <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{t.dernieresVentes}</div>
        {ventes.length === 0 ? <div style={{ color: "#8891aa", fontSize: 13, textAlign: "center", padding: 20 }}>{t.aucuneVente}</div>
          : ventes.slice(-5).reverse().map(v => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{v.produit}</div>
                <div style={{ color: "#8891aa", fontSize: 11 }}>#{v.factureId}</div>
              </div>
              <div style={{ color: v.mode === "credit" ? "#ff6b6b" : "#00d97e", fontWeight: 700, fontSize: 13 }}>{fmt(v.paye || 0)}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

// ============================================================
// STOCK PAGE
// ============================================================
const StockPage = ({ produits, saveProduit, deleteProduit, t }) => {
  const [showModal, setShowModal] = useState(false);
  const [editProduit, setEditProduit] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nom: "", categorie: "Alimentation", prixAchat: "", prixVente: "", quantite: "", alerte: "5" });

  const filtered = produits.filter(p => p.nom?.toLowerCase().includes(search.toLowerCase()));
  const statusColor = (p) => p.quantite === 0 ? "#ff4757" : p.quantite <= p.alerte ? "#ff9f43" : "#00d97e";

  const openAdd = () => { setEditProduit(null); setForm({ nom: "", categorie: "Alimentation", prixAchat: "", prixVente: "", quantite: "", alerte: "5" }); setShowModal(true); };
  const openEdit = (p) => { setEditProduit(p); setForm(p); setShowModal(true); };
  const save = () => {
    if (!form.nom) return;
    saveProduit({ ...form, prixAchat: +form.prixAchat, prixVente: +form.prixVente, quantite: +form.quantite, alerte: +form.alerte, id: editProduit?.id });
    setShowModal(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#f0f4ff", fontSize: 20, fontWeight: 800 }}>{t.monStock}</h2>
        <Btn onClick={openAdd} small>+ {t.ajouter}</Btn>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.chercher} style={{ ...inputStyle, marginBottom: 16, width: "100%", boxSizing: "border-box" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: "#1a1f2e", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(p), boxShadow: `0 0 8px ${statusColor(p)}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{p.nom}</div>
              <div style={{ color: "#8891aa", fontSize: 12 }}>{p.categorie}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <span style={{ color: "#00d97e", fontSize: 12, fontWeight: 600 }}>{fmt(p.prixVente)}</span>
                <span style={{ color: "#8891aa", fontSize: 12 }}>{t.prixAchat}: {fmt(p.prixAchat)}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: statusColor(p), fontWeight: 800, fontSize: 18 }}>{p.quantite}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>{t.unites}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => openEdit(p)} style={{ background: "#252b3b", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}><Icon name="edit" size={14} color="#7b8cff" /></button>
              <button onClick={() => deleteProduit(p.id)} style={{ background: "#252b3b", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}><Icon name="trash" size={14} color="#ff6b6b" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: "#8891aa", textAlign: "center", padding: 40 }}>{t.monStock}</div>}
      </div>
      {showModal && (
        <Modal titre={editProduit ? t.modifierProduit : t.nouveauProduit} onClose={() => setShowModal(false)}>
          <Field label={t.nomProduit} value={form.nom} onChange={v => setForm({ ...form, nom: v })} placeholder="Ex: Riz 25kg" />
          <Field label={t.categorie} value={form.categorie} onChange={v => setForm({ ...form, categorie: v })}
            options={["Alimentation", "Boisson", "Ménager", "Cosmétique", "Électronique", "Autre"].map(c => ({ value: c, label: c }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={t.prixAchat} type="number" value={form.prixAchat} onChange={v => setForm({ ...form, prixAchat: v })} placeholder="0" />
            <Field label={t.prixVente} type="number" value={form.prixVente} onChange={v => setForm({ ...form, prixVente: v })} placeholder="0" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={t.quantite} type="number" value={form.quantite} onChange={v => setForm({ ...form, quantite: v })} placeholder="0" />
            <Field label={t.alerteStockMin} type="number" value={form.alerte} onChange={v => setForm({ ...form, alerte: v })} placeholder="5" />
          </div>
          {form.prixAchat && form.prixVente && +form.prixAchat > 0 && (
            <div style={{ background: "rgba(0,217,126,0.1)", border: "1px solid rgba(0,217,126,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <span style={{ color: "#8891aa", fontSize: 12 }}>{t.margeBeneficiaire}: </span>
              <span style={{ color: "#00d97e", fontWeight: 700 }}>{fmt(form.prixVente - form.prixAchat)} ({Math.round(((form.prixVente - form.prixAchat) / form.prixAchat) * 100)}%)</span>
            </div>
          )}
          <Btn onClick={save} full>{editProduit ? t.enregistrer : t.ajouterAuStock}</Btn>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// VENTES PAGE
// ============================================================
const VentesPage = ({ produits, ventes, clients, saveVente, saveClient, t, isProprietaire, boutique, setShowFacture }) => {
  const [step, setStep] = useState(1);
  const [panier, setPanier] = useState([]);
  const [search, setSearch] = useState("");
  const [modePaiement, setModePaiement] = useState("cash");
  const [montantPaye, setMontantPaye] = useState("");
  const [clientId, setClientId] = useState("");
  const [nouveauClient, setNouveauClient] = useState({ nom: "", telephone: "", quartier: "" });
  const [success, setSuccess] = useState(false);
  const [derniereVente, setDerniereVente] = useState(null);

  const filtered = produits.filter(p => p.quantite > 0 && p.nom?.toLowerCase().includes(search.toLowerCase()));
  const addPanier = (p) => { const e = panier.find(x => x.id === p.id); if (e) setPanier(panier.map(x => x.id === p.id ? { ...x, qte: x.qte + 1 } : x)); else setPanier([...panier, { ...p, qte: 1 }]); };
  const updateQte = (id, qte) => { if (qte <= 0) setPanier(panier.filter(x => x.id !== id)); else setPanier(panier.map(x => x.id === id ? { ...x, qte } : x)); };

  const total = panier.reduce((s, x) => s + x.prixVente * x.qte, 0);
  const paye = modePaiement === "credit" ? 0 : modePaiement === "mobile" ? total : (montantPaye ? Math.min(+montantPaye, total) : total);
  const dette = total - paye;
  const monnaie = montantPaye && modePaiement === "cash" ? Math.max(0, +montantPaye - total) : 0;

  const confirmer = async () => {
    if (panier.length === 0) return;
    let clientRef = clientId;
    if (clientId === "nouveau" && nouveauClient.nom) {
      const newId = await saveClient({ ...nouveauClient, dette: dette });
      clientRef = newId;
    } else if (clientId && dette > 0) {
      const c = clients.find(x => x.id === clientId);
      if (c) await saveClient({ ...c, dette: (c.dette || 0) + dette });
    }
    const venteData = { produit: panier.map(x => x.nom).join(", "), quantite: panier.reduce((s, x) => s + x.qte, 0), montant: total, paye, mode: modePaiement, clientId: clientRef, items: panier.map(x => ({ id: x.id, nom: x.nom, qte: x.qte, prixVente: x.prixVente })) };
    const vente = await saveVente(venteData);
    setDerniereVente(vente);
    setSuccess(true);
  };

  if (success) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,217,126,0.15)", border: "3px solid #00d97e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" size={40} color="#00d97e" />
      </div>
      <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 22 }}>{t.venteEnregistree}</div>
      <div style={{ color: "#8891aa", fontSize: 13 }}>#{derniereVente?.factureId}</div>
      <Btn onClick={() => { if (derniereVente) setShowFacture(derniereVente); }} color="#7b8cff">{t.genererFacture}</Btn>
      <Btn onClick={() => { setSuccess(false); setPanier([]); setStep(1); setSearch(""); setModePaiement("cash"); setMontantPaye(""); setClientId(""); setNouveauClient({ nom: "", telephone: "", quartier: "" }); setDerniereVente(null); }} outlined>{t.retour}</Btn>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 16px", color: "#f0f4ff", fontSize: 20, fontWeight: 800 }}>{t.nouvelleVente}</h2>
      {step === 1 && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.chercher} style={{ ...inputStyle, marginBottom: 14, width: "100%", boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {filtered.map(p => (
              <button key={p.id} onClick={() => addPanier(p)} style={{ background: panier.find(x => x.id === p.id) ? "rgba(0,217,126,0.1)" : "#1a1f2e", border: panier.find(x => x.id === p.id) ? "1.5px solid rgba(0,217,126,0.4)" : "1.5px solid transparent", borderRadius: 14, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#f0f4ff", fontWeight: 600, fontSize: 14 }}>{p.nom}</div>
                  <div style={{ color: "#8891aa", fontSize: 12 }}>{p.quantite} {t.enStock}</div>
                </div>
                <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 14 }}>{fmt(p.prixVente)}</div>
              </button>
            ))}
          </div>
          {panier.length > 0 && (
            <>
              <div style={{ background: "#252b3b", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ color: "#8891aa", fontWeight: 700, fontSize: 12, marginBottom: 12, textTransform: "uppercase" }}>{t.panier} ({panier.length})</div>
                {panier.map(x => (
                  <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{x.nom}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => updateQte(x.id, x.qte - 1)} style={{ background: "#1a1f2e", border: "none", color: "#f0f4ff", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>−</button>
                      <span style={{ color: "#f0f4ff", fontWeight: 700, minWidth: 20, textAlign: "center" }}>{x.qte}</span>
                      <button onClick={() => updateQte(x.id, x.qte + 1)} style={{ background: "#1a1f2e", border: "none", color: "#f0f4ff", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>+</button>
                    </div>
                    <div style={{ color: "#00d97e", fontWeight: 700, fontSize: 13 }}>{fmt(x.prixVente * x.qte)}</div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#f0f4ff", fontWeight: 700 }}>{t.total}</span>
                  <span style={{ color: "#00d97e", fontWeight: 800, fontSize: 17 }}>{fmt(total)}</span>
                </div>
              </div>
              <Btn onClick={() => setStep(2)} full>{t.continuer}</Btn>
            </>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <div style={{ background: "#1a1f2e", borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "center" }}>
            <div style={{ color: "#8891aa", fontSize: 13 }}>{t.total}</div>
            <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 28 }}>{fmt(total)}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#8891aa", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{t.modePayment}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[{ val: "cash", label: t.cash }, { val: "mobile", label: t.mobile }, { val: "credit", label: t.credit }].map(m => (
                <button key={m.val} onClick={() => setModePaiement(m.val)} style={{ background: modePaiement === m.val ? "rgba(0,217,126,0.15)" : "#252b3b", border: modePaiement === m.val ? "1.5px solid #00d97e" : "1.5px solid transparent", borderRadius: 12, padding: "12px 4px", cursor: "pointer", color: modePaiement === m.val ? "#00d97e" : "#8891aa", fontWeight: 700, fontSize: 11, fontFamily: "'Sora', sans-serif" }}>{m.label}</button>
              ))}
            </div>
          </div>
          {modePaiement === "cash" && <Field label={t.montantRecu} type="number" value={montantPaye} onChange={setMontantPaye} placeholder={total.toString()} />}
          {(modePaiement === "credit" || (modePaiement === "cash" && montantPaye && +montantPaye < total)) && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#8891aa", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{t.client}</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }}>
                <option value="">{t.clientExistant}</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                <option value="nouveau">{t.nouveauClient}</option>
              </select>
              {clientId === "nouveau" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input placeholder={t.nomComplet} style={inputStyle} onChange={e => setNouveauClient({ ...nouveauClient, nom: e.target.value })} />
                  <input placeholder={t.telephone} style={inputStyle} onChange={e => setNouveauClient({ ...nouveauClient, telephone: e.target.value })} />
                  <input placeholder={t.quartier} style={inputStyle} onChange={e => setNouveauClient({ ...nouveauClient, quartier: e.target.value })} />
                </div>
              )}
            </div>
          )}
          {monnaie > 0 && <div style={{ background: "rgba(255,217,61,0.1)", border: "1px solid rgba(255,217,61,0.3)", borderRadius: 12, padding: 12, marginBottom: 12, textAlign: "center" }}><span style={{ color: "#8891aa", fontSize: 13 }}>{t.monnaie}: </span><span style={{ color: "#ffd93d", fontWeight: 800, fontSize: 18 }}>{fmt(monnaie)}</span></div>}
          {dette > 0 && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: 12, marginBottom: 12, textAlign: "center" }}><span style={{ color: "#8891aa", fontSize: 13 }}>{t.detteCreee}: </span><span style={{ color: "#ff6b6b", fontWeight: 800, fontSize: 18 }}>{fmt(dette)}</span></div>}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setStep(1)} outlined full>{t.retour}</Btn>
            <Btn onClick={confirmer} full>{t.confirmer}</Btn>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// DETTES PAGE
// ============================================================
const DettesPage = ({ clients, setClients, saveClient, ventes, t }) => {
  const [selected, setSelected] = useState(null);
  const [showPaiement, setShowPaiement] = useState(false);
  const [montant, setMontant] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ nom: "", telephone: "", quartier: "" });

  const enregistrerPaiement = async () => {
    if (!montant || !selected) return;
    const reduction = Math.min(+montant, selected.dette);
    const updated = { ...selected, dette: selected.dette - reduction };
    await saveClient(updated);
    setClients(prev => prev.map(c => c.id === selected.id ? updated : c));
    setSelected(updated);
    setMontant(""); setShowPaiement(false);
  };

  const ajouterClient = async () => {
    if (!newClient.nom) return;
    await saveClient({ ...newClient, dette: 0 });
    setNewClient({ nom: "", telephone: "", quartier: "" });
    setShowAddClient(false);
  };

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#8891aa", cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: "'Sora', sans-serif", fontSize: 14 }}>{t.retour}</button>
      <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#252b3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={24} color="#7b8cff" />
          </div>
          <div>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 17 }}>{selected.nom}</div>
            <div style={{ color: "#8891aa", fontSize: 13 }}>📍 {selected.quartier}</div>
            <div style={{ color: "#8891aa", fontSize: 13 }}>📞 {selected.telephone}</div>
          </div>
        </div>
      </div>
      <div style={{ background: selected.dette > 0 ? "rgba(255,107,107,0.1)" : "rgba(0,217,126,0.1)", border: `1px solid ${selected.dette > 0 ? "rgba(255,107,107,0.3)" : "rgba(0,217,126,0.3)"}`, borderRadius: 14, padding: 20, marginBottom: 16, textAlign: "center" }}>
        <div style={{ color: "#8891aa", fontSize: 13 }}>{t.detteTotal}</div>
        <div style={{ color: selected.dette > 0 ? "#ff6b6b" : "#00d97e", fontWeight: 800, fontSize: 28 }}>{fmt(selected.dette)}</div>
      </div>
      {selected.dette > 0 && <Btn onClick={() => setShowPaiement(true)} full>{t.enregistrerPaiement}</Btn>}
      {showPaiement && (
        <Modal titre={t.enregistrerPaiement} onClose={() => setShowPaiement(false)}>
          <Field label={t.montantRecu} type="number" value={montant} onChange={setMontant} placeholder={selected.dette.toString()} />
          <Btn onClick={enregistrerPaiement} full>{t.confirmer}</Btn>
        </Modal>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#f0f4ff", fontSize: 20, fontWeight: 800 }}>{t.cahierDettes}</h2>
        <Btn onClick={() => setShowAddClient(true)} small>+ {t.client}</Btn>
      </div>
      <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#8891aa", fontSize: 13 }}>{t.totalDettes}</span>
        <span style={{ color: "#ff6b6b", fontWeight: 800 }}>{fmt(clients.reduce((s, c) => s + (c.dette || 0), 0))}</span>
      </div>
      {clients.map(c => (
        <button key={c.id} onClick={() => setSelected(c)} style={{ background: "#1a1f2e", border: "none", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", marginBottom: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: c.dette > 0 ? "rgba(255,107,107,0.15)" : "rgba(0,217,126,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={20} color={c.dette > 0 ? "#ff6b6b" : "#00d97e"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14 }}>{c.nom}</div>
            <div style={{ color: "#8891aa", fontSize: 12 }}>📍 {c.quartier}</div>
          </div>
          <div style={{ color: c.dette > 0 ? "#ff6b6b" : "#00d97e", fontWeight: 800, fontSize: 15 }}>{c.dette > 0 ? fmt(c.dette) : t.solde}</div>
          <Icon name="arrow" size={16} color="#555" />
        </button>
      ))}
      {showAddClient && (
        <Modal titre={t.nouveauClient} onClose={() => setShowAddClient(false)}>
          <Field label={t.nomComplet} value={newClient.nom} onChange={v => setNewClient({ ...newClient, nom: v })} placeholder="Ex: Fatou" />
          <Field label={t.telephone} type="tel" value={newClient.telephone} onChange={v => setNewClient({ ...newClient, telephone: v })} />
          <Field label={t.quartier} value={newClient.quartier} onChange={v => setNewClient({ ...newClient, quartier: v })} />
          <Btn onClick={ajouterClient} full>{t.ajouterClient}</Btn>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// RAPPORTS PAGE
// ============================================================
const RapportsPage = ({ ventes, produits, t, setShowFacture }) => {
  const aujourd = ventes.filter(v => { const d = v.date?.toDate ? v.date.toDate() : new Date(v.date); return d.toDateString() === new Date().toDateString(); });
  const total7j = ventes.filter(v => { const d = v.date?.toDate ? v.date.toDate() : new Date(v.date); return d > new Date(Date.now() - 7 * 86400000); });

  const calcStats = (list) => ({
    chiffre: list.reduce((s, v) => s + (v.montant || 0), 0),
    encaisse: list.reduce((s, v) => s + (v.paye || 0), 0),
    dettes: list.reduce((s, v) => s + ((v.montant || 0) - (v.paye || 0)), 0),
    nb: list.length,
  });

  const statsJ = calcStats(aujourd);
  const stats7 = calcStats(total7j);

  const prodMap = {};
  ventes.forEach(v => { prodMap[v.produit] = (prodMap[v.produit] || 0) + (v.quantite || 0); });
  const topProduits = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const StatCard = ({ label, value, color = "#f0f4ff" }) => (
    <div style={{ background: "#1a1f2e", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ color: "#8891aa", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 17 }}>{value}</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", color: "#f0f4ff", fontSize: 20, fontWeight: 800 }}>{t.rapportsTitle}</h2>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#00d97e", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>● {t.aujourdhui}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label={t.chiffreAffaires} value={fmt(statsJ.chiffre)} />
          <StatCard label={t.encaisse} value={fmt(statsJ.encaisse)} color="#00d97e" />
          <StatCard label={t.dettesCreees} value={fmt(statsJ.dettes)} color="#ff6b6b" />
          <StatCard label={t.nbVentes} value={`${statsJ.nb} ${t.transactions}`} color="#ffd93d" />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#7b8cff", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>● {t.sept_jours}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label={t.chiffreAffaires} value={fmt(stats7.chiffre)} />
          <StatCard label={t.encaisse} value={fmt(stats7.encaisse)} color="#00d97e" />
          <StatCard label={t.dettesCreees} value={fmt(stats7.dettes)} color="#ff6b6b" />
          <StatCard label={t.nbVentes} value={`${stats7.nb}`} color="#7b8cff" />
        </div>
      </div>
      {topProduits.length > 0 && (
        <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{t.topProduits}</div>
          {topProduits.map(([nom, qte], i) => (
            <div key={nom} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>#{i + 1} {nom}</span>
                <span style={{ color: "#8891aa", fontSize: 12 }}>{qte} {t.unites}</span>
              </div>
              <div style={{ height: 5, background: "#252b3b", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${(qte / topProduits[0][1]) * 100}%`, background: ["#00d97e", "#7b8cff", "#ffd93d", "#ff9f43", "#ff6b6b"][i], borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* DERNIÈRES VENTES AVEC FACTURES */}
      <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{t.dernieresVentes}</div>
        {ventes.slice(-10).reverse().map(v => (
          <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{v.produit}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>#{v.factureId}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ color: v.mode === "credit" ? "#ff6b6b" : "#00d97e", fontWeight: 700, fontSize: 13 }}>{fmt(v.montant || 0)}</div>
              <button onClick={() => setShowFacture(v)} style={{ background: "#252b3b", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                <Icon name="invoice" size={14} color="#7b8cff" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// APPLICATION PRINCIPALE
// ============================================================
export default function PrimoGest() {
  const [langue, setLangue] = useState(() => localStorage.getItem("primogest_langue") || "fr");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("primogest_user");
    return saved ? JSON.parse(saved) : null;
  });
  const t = T[langue];

  const handleLogin = (userData) => {
    localStorage.setItem("primogest_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("primogest_user");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} t={t} />;
  if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} t={t} langue={langue} setLangue={setLangue} />;
  return <AppBoutique user={user} onLogout={handleLogout} t={t} langue={langue} setLangue={setLangue} />;
}
