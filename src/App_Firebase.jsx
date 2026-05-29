import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import {
  collection, doc, setDoc, getDoc, getDocs, addDoc,
  onSnapshot, query, where, orderBy, serverTimestamp, updateDoc
} from "firebase/firestore";
const PLANS = {
  essai:    { label: "ESSAI", color: "#7b8cff", produits: 50, ventes: 100, vendeurs: false, bilan: false },
  gratuit:  { label: "GRATUIT", color: "#ff9f43", produits: 50, ventes: 100, vendeurs: false, bilan: false },
  pro:      { label: "PRO ⭐", color: "#00d97e", produits: Infinity, ventes: Infinity, vendeurs: true, bilan: true },
  business: { label: "BUSINESS 🚀", color: "#ffd93d", produits: Infinity, ventes: Infinity, vendeurs: true, bilan: true },
};
// ============================================================
// CONFIGURATION
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
    seConnecter: "Se connecter", motDePasse: "Mot de passe", numTel: "Numéro de téléphone",
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
    nom_vendeur: "Nom du vendeur", tel_vendeur: "Téléphone vendeur",
    mdp_vendeur: "Mot de passe vendeur", creer_vendeur: "Créer le vendeur",
    vendu_par: "Vendu par", toutes_ventes: "Toutes les ventes",
    par_vendeur: "Par vendeur", online: "🟢 En ligne", offline: "🔴 Hors ligne",
    sync_en_cours: "🔄 Synchronisation...", premiere_connexion: "Connectez-vous une première fois avec internet",
    filtre_vendeur: "Filtrer par vendeur", tous_vendeurs: "Tous les vendeurs",
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
    seConnecter: "Log in", motDePasse: "Password", numTel: "Phone number",
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
    nom_vendeur: "Seller name", tel_vendeur: "Seller phone",
    mdp_vendeur: "Seller password", creer_vendeur: "Create seller",
    vendu_par: "Sold by", toutes_ventes: "All sales",
    par_vendeur: "By seller", online: "🟢 Online", offline: "🔴 Offline",
    sync_en_cours: "🔄 Syncing...", premiere_connexion: "Connect once with internet first",
    filtre_vendeur: "Filter by seller", tous_vendeurs: "All sellers",
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
    seConnecter: "تسجيل الدخول", motDePasse: "كلمة المرور", numTel: "رقم الهاتف",
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
    nom_vendeur: "اسم البائع", tel_vendeur: "هاتف البائع",
    mdp_vendeur: "كلمة مرور البائع", creer_vendeur: "إنشاء البائع",
    vendu_par: "باعه", toutes_ventes: "كل المبيعات",
    par_vendeur: "حسب البائع", online: "🟢 متصل", offline: "🔴 غير متصل",
    sync_en_cours: "🔄 جاري المزامنة...", premiere_connexion: "اتصل بالإنترنت أولاً",
    filtre_vendeur: "تصفية حسب البائع", tous_vendeurs: "كل البائعين",
  }
};

// ============================================================
// UTILITAIRES
// ============================================================
const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0) + " FCFA";
const genFactureId = () => `PG-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatHeure = (date) => new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const getDate = (v) => v?.date?.toDate ? v.date.toDate() : new Date(v?.date || Date.now());

// ============================================================
// STYLES
// ============================================================
const inputStyle = {
  width: "100%", background: "#252b3b", border: "1.5px solid #2d3448",
  borderRadius: 12, color: "#f0f4ff", padding: "12px 14px", fontSize: 15,
  outline: "none", boxSizing: "border-box", fontFamily: "'Sora', sans-serif",
};

// ============================================================
// ICÔNES
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
    invoice: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    store: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a1 1 0 01-1 1H8a1 1 0 01-1-1v-6" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />,
    filter: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
  };
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} style={{ flexShrink: 0 }}>
      {icons[name] || null}
    </svg>
  );
};

// ============================================================
// COMPOSANTS UI
// ============================================================
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

const Badge = ({ text, color }) => (
  <span style={{ background: `${color}22`, border: `1px solid ${color}44`, color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{text}</span>
);

// ============================================================
// FACTURE
// ============================================================
const Facture = ({ vente, boutique, onClose, t }) => {
  const factureId = vente.factureId || genFactureId();
  const date = getDate(vente);

  const printFacture = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Facture ${factureId}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #00d97e; padding-bottom: 15px; }
        .logo { font-size: 28px; font-weight: 800; color: #00d97e; }
        .produit { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
        .total { display: flex; justify-content: space-between; font-weight: 800; font-size: 16px; margin-top: 15px; padding-top: 10px; border-top: 2px solid #333; }
        .footer { text-align: center; margin-top: 25px; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; }
        .vendeur { background: #f5f5f5; padding: 8px; border-radius: 6px; margin: 10px 0; font-size: 12px; }
      </style></head><body>
      <div class="header">
        <div class="logo">PrimoGest</div>
        <div style="font-size:16px; font-weight:700; margin-top:5px;">${boutique?.nom || "Boutique"}</div>
        ${boutique?.adresse ? `<div style="font-size:12px; color:#666;">${boutique.adresse}</div>` : ""}
        <div style="font-size:13px; color:#666; margin-top:5px;">Facture N° ${factureId}</div>
      </div>
      <div style="display:flex; justify-content:space-between; margin:15px 0; font-size:13px;">
        <span>📅 ${formatDate(date)}</span>
        <span>🕐 ${formatHeure(date)}</span>
      </div>
      ${vente.vendeurNom || vente.vendeurTel ? `
        <div class="vendeur">
          👤 Vendu par: <strong>${vente.vendeurNom || ""}</strong>${vente.vendeurTel ? ` | ${vente.vendeurTel}` : ""}
        </div>
      ` : ""}
      <div>
        ${(vente.items || [{ nom: vente.produit, qte: vente.quantite, prixVente: vente.montant / (vente.quantite || 1) }]).map(item => `
          <div class="produit">
            <span>${item.nom} x${item.qte}</span>
            <span>${fmt(item.prixVente * item.qte)}</span>
          </div>
        `).join("")}
      </div>
      <div class="total">
        <span>TOTAL</span>
        <span>${fmt(vente.montant)}</span>
      </div>
      ${vente.montant > vente.paye ? `<div style="color:#ff4757; text-align:center; margin-top:10px; font-size:13px;">Reste à payer: ${fmt(vente.montant - vente.paye)}</div>` : ""}
      <div style="text-align:center; margin-top:10px; color:#666; font-size:12px;">
        Mode: ${vente.mode === "cash" ? "💵 Cash" : vente.mode === "mobile" ? "📱 Mobile Money" : "📋 À crédit"}
      </div>
      <div class="footer">Merci pour votre confiance !<br/>PrimoGest - Le cahier de boutique intelligent</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <Modal titre={`${t.facture} — ${factureId}`} onClose={onClose}>
      <div style={{ background: "#252b3b", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 16 }}>PrimoGest</div>
          <div style={{ color: "#8891aa", fontSize: 12 }}>N° {factureId}</div>
        </div>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15 }}>{boutique?.nom}</div>
        <div style={{ color: "#8891aa", fontSize: 12, marginBottom: 12 }}>{boutique?.adresse}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ color: "#8891aa", fontSize: 12 }}>📅 {formatDate(date)}</span>
          <span style={{ color: "#8891aa", fontSize: 12 }}>🕐 {formatHeure(date)}</span>
        </div>
        {(vente.vendeurNom || vente.vendeurTel) && (
          <div style={{ background: "rgba(123,140,255,0.1)", border: "1px solid rgba(123,140,255,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
            <span style={{ color: "#7b8cff", fontSize: 12 }}>👤 {t.vendu_par}: </span>
            <span style={{ color: "#f0f4ff", fontSize: 12, fontWeight: 700 }}>{vente.vendeurNom}</span>
            {vente.vendeurTel && <span style={{ color: "#8891aa", fontSize: 11 }}> | {vente.vendeurTel}</span>}
          </div>
        )}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
          {(vente.items || [{ nom: vente.produit, qte: vente.quantite, prixVente: vente.montant / (vente.quantite || 1) }]).map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#f0f4ff", fontSize: 13 }}>{item.nom} x{item.qte}</span>
              <span style={{ color: "#00d97e", fontSize: 13, fontWeight: 700 }}>{fmt(item.prixVente * item.qte)}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 16 }}>TOTAL</span>
          <span style={{ color: "#00d97e", fontWeight: 800, fontSize: 16 }}>{fmt(vente.montant)}</span>
        </div>
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
    setLoading(true); setError("");
    // Mode hors ligne — vérifier les identifiants en cache
if (!navigator.onLine) {
  const cachedUsers = JSON.parse(localStorage.getItem("pg_known_users") || "[]");
  const found = cachedUsers.find(u => u.telephone === telephone && u.password === password);
  if (found) { onLogin(found); return; }
  setError("Hors ligne — connectez-vous d'abord avec internet");
  setLoading(false); return;
}
    try {
      if (telephone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
        onLogin({ telephone, role: "admin", nom: "Admin PrimoGest", id: "admin" });
        return;
      }
      const q = query(collection(db, "users"), where("telephone", "==", telephone));
      const snap = await getDocs(q);
      if (snap.empty) { setError(t.motDePasseIncorrect); setLoading(false); return; }
      const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };
      if (userData.password !== password) { setError(t.motDePasseIncorrect); setLoading(false); return; }
      onLogin(userData);
    } catch (e) { setError("Erreur de connexion. Vérifiez internet."); setLoading(false); }
  };

  const inscription = async () => {
    if (!telephone || !password || !nomBoutique) return;
    setLoading(true); setError("");
    try {
      const q = query(collection(db, "users"), where("telephone", "==", telephone));
      const snap = await getDocs(q);
      if (!snap.empty) { setError("Ce numéro est déjà enregistré"); setLoading(false); return; }
      let localisation = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          localisation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {}
      }
      const ref = await addDoc(collection(db, "users"), {
  telephone, password: hashedPwd, nomBoutique, adresse, role: "proprietaire", localisation,
plan: "essai",
essaiDebut: new Date().toISOString(),
essaiFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
createdAt: serverTimestamp(), actif: true,
  plan: "essai",
  essaiDebut: new Date().toISOString(),
  essaiFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});
      onLogin({ id: ref.id, telephone, nomBoutique, adresse, role: "proprietaire", localisation });
    } catch (e) { setError("Erreur: " + e.message); setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111520", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Sora', sans-serif" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #00d97e, #00b360)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 30, marginBottom: 20 }}>P</div>
      <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 26, marginBottom: 6 }}>PrimoGest</div>
      <div style={{ color: "#8891aa", fontSize: 14, marginBottom: 36 }}>{t.connectezVous}</div>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+235 XX XX XX XX" style={{ ...inputStyle, marginBottom: 12 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && (isInscription ? inscription() : connexion())} placeholder={t.motDePasse} style={{ ...inputStyle, marginBottom: 12 }} />
        {isInscription && <>
          <input value={nomBoutique} onChange={e => setNomBoutique(e.target.value)} placeholder={t.nomBoutique + " *"} style={{ ...inputStyle, marginBottom: 12 }} />
          <input value={adresse} onChange={e => setAdresse(e.target.value)} placeholder={t.adresse} style={{ ...inputStyle, marginBottom: 12 }} />
        </>}
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
// ADMIN DASHBOARD
// ============================================================
const AdminDashboard = ({ user, onLogout, t, langue, setLangue }) => {
  const [boutiques, setBoutiques] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoutique, setSelectedBoutique] = useState(null);
  const [showBilan, setShowBilan] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersSnap, ventesSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "ventes")),
        ]);
        setBoutiques(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "proprietaire"));
        setVentes(ventesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const totalCA = ventes.reduce((s, v) => s + (v.montant || 0), 0);
  const totalDettes = ventes.reduce((s, v) => s + ((v.montant || 0) - (v.paye || 0)), 0);

  const prodMap = {};
  ventes.forEach(v => { prodMap[v.produit] = (prodMap[v.produit] || 0) + (v.quantite || 0); });
  const topProduits = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const genererBilan = (b) => {
    const now = new Date();
    const trim = Math.floor(now.getMonth() / 3) + 1;
    const debut = new Date(now.getFullYear(), (trim - 1) * 3, 1);
    const vB = ventes.filter(v => v.boutiqueId === b.id && getDate(v) >= debut);
    return {
      trimestre: trim,
      ca: vB.reduce((s, v) => s + (v.montant || 0), 0),
      encaisse: vB.reduce((s, v) => s + (v.paye || 0), 0),
      dettes: vB.reduce((s, v) => s + ((v.montant || 0) - (v.paye || 0)), 0),
      nb: vB.length,
    };
  };

  if (loading) return <div style={{ color: "#f0f4ff", textAlign: "center", padding: 40, minHeight: "100vh", background: "#111520", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif" }}>{t.chargement}</div>;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#111520", fontFamily: "'Sora', sans-serif", paddingBottom: 40 }}>
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
          <button onClick={onLogout} style={{ background: "#252b3b", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex", marginLeft: 4 }}>
            <Icon name="logout" size={16} color="#ff6b6b" />
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: t.boutiques, value: boutiques.length, color: "#7b8cff", icon: "store" },
            { label: t.transactions_globales, value: ventes.length, color: "#ffd93d", icon: "chart" },
            { label: "Chiffre d'affaires", value: fmt(totalCA), color: "#00d97e", icon: "money" },
            { label: "Dettes totales", value: fmt(totalDettes), color: "#ff6b6b", icon: "dette" },
          ].map(c => (
            <div key={c.label} style={{ background: "#1a1f2e", borderRadius: 16, padding: 14, border: `1px solid ${c.color}22` }}>
              <Icon name={c.icon} size={18} color={c.color} />
              <div style={{ color: c.color, fontWeight: 800, fontSize: 15, marginTop: 8 }}>{c.value}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>{c.label}</div>
            </div>
          ))}
        </div>

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

        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>🏪 {t.boutiques} ({boutiques.length})</div>
        {boutiques.map(b => {
          const vB = ventes.filter(v => v.boutiqueId === b.id);
          const caB = vB.reduce((s, v) => s + (v.montant || 0), 0);
          const vendeurIds = [...new Set(vB.map(v => v.vendeurId))];
          return (
            <div key={b.id} style={{ background: "#1a1f2e", borderRadius: 14, padding: 16, marginBottom: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 15 }}>{b.nomBoutique}</div>
                  <div style={{ color: "#8891aa", fontSize: 12 }}>📞 {b.telephone}</div>
                  {b.adresse && <div style={{ color: "#8891aa", fontSize: 12 }}>📍 {b.adresse}</div>}
                  {b.localisation && <div style={{ color: "#00d97e", fontSize: 11 }}>🗺️ GPS: {b.localisation.lat?.toFixed(4)}, {b.localisation.lng?.toFixed(4)}</div>}
                  <div style={{ color: "#8891aa", fontSize: 11, marginTop: 4 }}>👥 {vendeurIds.length} vendeur(s)</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 14 }}>{fmt(caB)}</div>
                  <div style={{ color: "#8891aa", fontSize: 11 }}>{vB.length} ventes</div>
                </div>
              </div>
              <button onClick={() => { setSelectedBoutique(b); setShowBilan(true); }} style={{ background: "rgba(123,140,255,0.15)", border: "1px solid rgba(123,140,255,0.3)", borderRadius: 10, padding: "8px 14px", color: "#7b8cff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", width: "100%" }}>
                📊 {t.bilan_trimestriel}
              </button>
            </div>
          );
        })}
        {boutiques.length === 0 && <div style={{ color: "#8891aa", textAlign: "center", padding: 40 }}>Aucune boutique enregistrée</div>}
      </div>

      {showBilan && selectedBoutique && (() => {
        const bilan = genererBilan(selectedBoutique);
        return (
          <Modal titre={`📊 Bilan T${bilan.trimestre} — ${selectedBoutique.nomBoutique}`} onClose={() => setShowBilan(false)}>
            <div style={{ background: "#252b3b", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ color: "#8891aa", fontSize: 13, marginBottom: 16 }}>Trimestre {bilan.trimestre} — {new Date().getFullYear()}</div>
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
// APP BOUTIQUE
// ============================================================
const AppBoutique = ({ user, onLogout, t, langue, setLangue }) => {
  const [page, setPage] = useState(user.role === "vendeur" ? "ventes" : "dashboard");
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [showFacture, setShowFacture] = useState(null);
  const [showVendeurs, setShowVendeurs] = useState(false);
  const [newVendeur, setNewVendeur] = useState({ nom: "", telephone: "", password: "" });

  const boutiqueId = user.boutiqueId || user.id;
  const isProprietaire = user.role === "proprietaire";
  const plan = user.plan || "essai";
const lim = PLANS[plan] || PLANS.essai;
  // Vérification période d'essai
const essaiFin = user.essaiFin ? new Date(user.essaiFin) : null;
const essaiExpire = essaiFin ? new Date() > essaiFin : false;
const joursRestants = essaiFin ? Math.max(0, Math.ceil((essaiFin - new Date()) / (1000 * 60 * 60 * 24))) : 30;
const boutique = { nom: user.nomBoutique || "Ma Boutique", adresse: user.adresse || "" };

  // Clés localStorage
  const KEY_P = `pg_produits_${boutiqueId}`;
  const KEY_V = `pg_ventes_${boutiqueId}`;
  const KEY_C = `pg_clients_${boutiqueId}`;

  // Détection connexion
  useEffect(() => {
    const onOnline = () => { setIsOnline(true); syncToFirebase(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  // Sync ventes hors ligne vers Firebase
  const syncToFirebase = async () => {
    setSyncing(true);
    try {
      const localV = JSON.parse(localStorage.getItem(KEY_V) || "[]");
      const nonSynced = localV.filter(v => !v.synced);
      for (const v of nonSynced) {
        const { id, synced, ...data } = v;
        await addDoc(collection(db, "ventes"), { ...data, boutiqueId, createdAt: serverTimestamp() });
      }
      if (nonSynced.length > 0) {
        const updated = localV.map(v => ({ ...v, synced: true }));
        localStorage.setItem(KEY_V, JSON.stringify(updated));
        await loadFromFirebase();
      }
    } catch (e) { console.error(e); }
    setSyncing(false);
  };

  // Chargement depuis Firebase
  const loadFromFirebase = async () => {
    try {
      const [pSnap, vSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db, "produits"), where("boutiqueId", "==", boutiqueId))),
        getDocs(query(collection(db, "ventes"), where("boutiqueId", "==", boutiqueId))),
        getDocs(query(collection(db, "clients"), where("boutiqueId", "==", boutiqueId))),
      ]);
      const p = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const v = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const c = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProduits(p); setVentes(v); setClients(c);
      localStorage.setItem(KEY_P, JSON.stringify(p));
      localStorage.setItem(KEY_V, JSON.stringify(v.map(x => ({ ...x, synced: true }))));
      localStorage.setItem(KEY_C, JSON.stringify(c));
    } catch (e) { console.error(e); }
  };

  // Chargement initial
  useEffect(() => {
    const load = async () => {
      // D'abord charge depuis localStorage (instantané)
      const localP = JSON.parse(localStorage.getItem(KEY_P) || "[]");
      const localV = JSON.parse(localStorage.getItem(KEY_V) || "[]");
      const localC = JSON.parse(localStorage.getItem(KEY_C) || "[]");
      setProduits(localP); setVentes(localV); setClients(localC);
      setLoading(false);
      // Si en ligne, met à jour depuis Firebase
      if (navigator.onLine) await loadFromFirebase();
    };
    load();
  }, [boutiqueId]);

  useEffect(() => { setNotifCount(produits.filter(p => p.quantite <= p.alerte).length); }, [produits]);

  // SAVE PRODUIT
  const saveProduit = async (produit) => {
    if (!produit.id && produits.filter(p => !p.deleted).length >= lim.produits) {
  alert(`⚠️ Maximum ${lim.produits} produits avec votre plan.\nContactez-nous: wa.me/23562282320`);
  return;
}
    const { id, ...data } = produit;
    if (isOnline) {
      try {
        if (id && id.length > 5) {
          await updateDoc(doc(db, "produits", id), { ...produit, boutiqueId });
          const updated = produits.map(p => p.id === id ? produit : p);
          setProduits(updated);
          localStorage.setItem(KEY_P, JSON.stringify(updated));
        } else {
          const ref = await addDoc(collection(db, "produits"), { ...data, boutiqueId, createdAt: serverTimestamp() });
          const newP = { ...produit, id: ref.id };
          const updated = [...produits, newP];
          setProduits(updated);
          localStorage.setItem(KEY_P, JSON.stringify(updated));
        }
      } catch (e) { console.error(e); alert("Erreur: " + e.message); }
    } else {
      const newP = { ...produit, id: id || Date.now().toString() };
      const updated = id ? produits.map(p => p.id === id ? newP : p) : [...produits, newP];
      setProduits(updated);
      localStorage.setItem(KEY_P, JSON.stringify(updated));
    }
  };

  const deleteProduit = async (id) => {
    if (!window.confirm("Supprimer ?")) return;
    const updated = produits.filter(p => p.id !== id);
    setProduits(updated);
    localStorage.setItem(KEY_P, JSON.stringify(updated));
    if (isOnline) { try { await updateDoc(doc(db, "produits", id), { deleted: true }); } catch (e) {} }
  };

  // SAVE VENTE
  const saveVente = async (venteData) => {
    const factureId = genFactureId();
    const newVente = {
      ...venteData,
      boutiqueId,
      factureId,
      date: new Date().toISOString(),
      vendeurId: user.id,
      vendeurNom: user.nom || "",
      vendeurTel: user.telephone || "",
      synced: false,
    };

    // Mise à jour stock
    const updatedProduits = produits.map(p => {
      const item = (venteData.items || []).find(x => x.id === p.id);
      return item ? { ...p, quantite: p.quantite - item.qte } : p;
    });
    setProduits(updatedProduits);
    localStorage.setItem(KEY_P, JSON.stringify(updatedProduits));

    // Sauvegarde vente localement
    const venteAvecId = { ...newVente, id: Date.now().toString() };
    const updatedVentes = [...ventes, venteAvecId];
    setVentes(updatedVentes);
    localStorage.setItem(KEY_V, JSON.stringify(updatedVentes));

    // Si en ligne → sync Firebase
    if (isOnline) {
      try {
        const { id: _id, synced: _s, ...data } = venteAvecId;
        const ref = await addDoc(collection(db, "ventes"), { ...data, createdAt: serverTimestamp() });
        const syncedVentes = updatedVentes.map(v => v.id === venteAvecId.id ? { ...v, id: ref.id, synced: true } : v);
        setVentes(syncedVentes);
        localStorage.setItem(KEY_V, JSON.stringify(syncedVentes));
        // Sync stock Firebase
        for (const item of venteData.items || []) {
          const p = produits.find(p => p.id === item.id);
          if (p && p.id.length > 5) {
            try { await updateDoc(doc(db, "produits", p.id), { quantite: p.quantite - item.qte }); } catch (e) {}
          }
        }
        return { ...venteAvecId, id: ref.id };
      } catch (e) { console.error(e); }
    }
    return venteAvecId;
  };

  // SAVE CLIENT
  const saveClient = async (client) => {
    const { id, ...data } = client;
    if (isOnline) {
      try {
        if (id && id.length > 5) {
          await updateDoc(doc(db, "clients", id), { ...client, boutiqueId });
          const updated = clients.map(c => c.id === id ? client : c);
          setClients(updated);
          localStorage.setItem(KEY_C, JSON.stringify(updated));
        } else {
          const ref = await addDoc(collection(db, "clients"), { ...data, boutiqueId, dette: client.dette || 0, createdAt: serverTimestamp() });
          const newC = { ...client, id: ref.id };
          const updated = [...clients, newC];
          setClients(updated);
          localStorage.setItem(KEY_C, JSON.stringify(updated));
          return ref.id;
        }
      } catch (e) { console.error(e); }
    } else {
      const newC = { ...client, id: id || Date.now().toString() };
      const updated = id ? clients.map(c => c.id === id ? newC : c) : [...clients, newC];
      setClients(updated);
      localStorage.setItem(KEY_C, JSON.stringify(updated));
      return newC.id;
    }
  };

  // AJOUTER VENDEUR
  const ajouterVendeur = async () => {
    if (!newVendeur.nom || !newVendeur.telephone || !newVendeur.password) return;
    if (!lim.vendeurs) {
  alert("⚠️ Les vendeurs sont disponibles en plan Pro.\nContactez-nous: wa.me/23562282320");
  setShowVendeurs(false); return;
}
    try {
      await addDoc(collection(db, "users"), {
        ...newVendeur, role: "vendeur", boutiqueId,
        nomBoutique: boutique.nom, actif: true, createdAt: serverTimestamp()
      });
      setNewVendeur({ nom: "", telephone: "", password: "" });
      setShowVendeurs(false);
    } catch (e) { alert("Erreur: " + e.message); }
  };
if (essaiExpire && user.plan !== "pro" && user.plan !== "business") return (
  <div style={{
    minHeight: "100vh", background: "#111520",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: 24, fontFamily: "'Sora', sans-serif",
    textAlign: "center"
  }}>
    <div style={{ fontSize: 60, marginBottom: 20 }}>⏰</div>
    <div style={{
      background: "rgba(255,107,107,0.1)",
      border: "1px solid rgba(255,107,107,0.3)",
      borderRadius: 20, padding: 32, maxWidth: 360
    }}>
      <div style={{ color: "#ff6b6b", fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
        Période d'essai terminée
      </div>
      <div style={{ color: "#8891aa", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
        Votre période d'essai gratuite de 30 jours est terminée.{"\n"}
        Contactez-nous sur WhatsApp pour continuer à utiliser PrimoGest.
      </div>
      <div style={{ color: "#f0f4ff", fontSize: 13, marginBottom: 8 }}>
        📞 +235 62 28 23 20
      </div>
      <div style={{ color: "#8891aa", fontSize: 12, marginBottom: 24 }}>
        Boutique : <strong style={{ color: "#f0f4ff" }}>{user.nomBoutique}</strong>
      </div>
      <a
        href={`https://wa.me/23562282320?text=${encodeURIComponent(
          `Bonjour David 👋,\n\nMon essai PrimoGest est terminé.\n\nBoutique : ${user.nomBoutique}\nTéléphone : ${user.telephone}\n\nJe voudrais continuer à utiliser l'application.`
        )}`}
        target="_blank"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          background: "#25D366", border: "none", borderRadius: 12,
          color: "#fff", padding: "14px 20px", fontSize: 15, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Sora', sans-serif",
          textDecoration: "none", marginBottom: 12,
        }}
      >
        📲 Contacter sur WhatsApp
      </a>
      <button onClick={onLogout} style={{
        background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, color: "#8891aa", padding: "10px 20px",
        fontSize: 13, cursor: "pointer", fontFamily: "'Sora', sans-serif",
        width: "100%"
      }}>
        Se déconnecter
      </button>
    </div>
  </div>
);
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#111520", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>{isOnline ? "⏳" : "📡"}</div>
      <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{isOnline ? t.chargement : t.offline}</div>
      <div style={{ color: "#8891aa", fontSize: 13, textAlign: "center", padding: "0 20px" }}>
        {!isOnline && t.premiere_connexion}
      </div>
    </div>
  );

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
      <div style={{ background: "#1a1f2e", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #00d97e, #00b360)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 13 }}>P</div>
          <div>
            <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 14 }}>{boutique.nom}</div>
            <div style={{ color: "#8891aa", fontSize: 10 }}>{isProprietaire ? t.role_proprietaire : `${t.role_vendeur}: ${user.nom || user.telephone}`}
{isProprietaire && (
  <span style={{ marginLeft:4, background:`${PLANS[plan]?.color}22`, border:`1px solid ${PLANS[plan]?.color}44`, color:PLANS[plan]?.color, borderRadius:4, padding:"1px 5px", fontSize:8, fontWeight:700 }}>
    {PLANS[plan]?.label || "ESSAI"}
  </span>
)}
{isProprietaire && (plan === "essai" || plan === "gratuit") && joursRestants <= 7 && joursRestants > 0 && (
  <span style={{ marginLeft:4, background:"rgba(255,159,67,0.15)", border:"1px solid rgba(255,159,67,0.3)", color:"#ff9f43", borderRadius:4, padding:"1px 5px", fontSize:8, fontWeight:700 }}>
    ⏰ {joursRestants}j
  </span>
)}</div>
            <div style={{ display: "flex", gap: 3, marginTop: 2, alignItems: "center" }}>
              {["fr", "en", "ar"].map(l => (
                <button key={l} onClick={() => { setLangue(l); localStorage.setItem("primogest_langue", l); }} style={{ background: langue === l ? "#00d97e" : "#252b3b", border: "none", borderRadius: 5, padding: "2px 5px", color: langue === l ? "#fff" : "#8891aa", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>{l.toUpperCase()}</button>
              ))}
              <div style={{ background: isOnline ? "rgba(0,217,126,0.15)" : "rgba(255,71,87,0.15)", border: `1px solid ${isOnline ? "#00d97e" : "#ff4757"}44`, borderRadius: 5, padding: "2px 6px", color: isOnline ? "#00d97e" : "#ff4757", fontSize: 9, fontWeight: 700, marginLeft: 2 }}>
                {syncing ? t.sync_en_cours : isOnline ? t.online : t.offline}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {isProprietaire && (plan === "essai" || plan === "gratuit") && (
  <a href={`https://wa.me/23562282320?text=${encodeURIComponent(`Bonjour David 👋,\nJe veux upgrader.\nBoutique : ${boutique.nom}\nTél : ${user.telephone}`)}`}
    target="_blank"
    style={{ background:"rgba(0,217,126,0.15)", border:"1px solid rgba(0,217,126,0.3)", borderRadius:9, padding:"5px 8px", display:"flex", alignItems:"center", gap:3, textDecoration:"none" }}>
    <span style={{ color:"#00d97e", fontSize:8, fontWeight:700 }}>↑ PRO</span>
  </a>
)}
<button style={{ background: "#252b3b", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
              <Icon name="user" size={16} color="#7b8cff" />
            </button>
          <div style={{ position: "relative" }}>
            <div style={{ background: "#252b3b", borderRadius: 10, padding: 8, display: "flex" }}>
              <Icon name="alert" size={16} color="#8891aa" />
            </div>
            {notifCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: "#ff4757", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800, border: "2px solid #1a1f2e" }}>{notifCount}</div>}
          </div>
          <button onClick={onLogout} style={{ background: "#252b3b", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
            <Icon name="logout" size={16} color="#ff6b6b" />
          </button>
        </div>
      </div>
{isProprietaire && (plan === "essai" || plan === "gratuit") && joursRestants <= 10 && joursRestants > 0 && (
  <div style={{ background:"rgba(255,159,67,0.1)", borderBottom:"1px solid rgba(255,159,67,0.2)", padding:"7px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
    <span style={{ color:"#ff9f43", fontSize:11, fontWeight:600 }}>⏰ {joursRestants} jours d'essai restants</span>
    <a href={`https://wa.me/23562282320?text=${encodeURIComponent(`Bonjour, je veux passer au plan Pro.\nBoutique: ${boutique.nom}`)}`}
      target="_blank"
      style={{ background:"#ff9f43", borderRadius:8, padding:"4px 10px", color:"#fff", fontSize:10, fontWeight:700, textDecoration:"none" }}>
      Upgrader →
    </a>
  </div>
)}
      {/* CONTENU */}
      <div style={{ padding: "16px 16px", paddingBottom: 100 }}>
        {page === "dashboard" && <DashboardBoutique ventes={ventes} produits={produits} clients={clients} t={t} langue={langue} isProprietaire={isProprietaire} />}
        {page === "stock" && isProprietaire && <StockPage produits={produits} saveProduit={saveProduit} deleteProduit={deleteProduit} t={t} />}
        {page === "ventes" && <VentesPage produits={produits} ventes={ventes} clients={clients} saveVente={saveVente} saveClient={saveClient} t={t} isProprietaire={isProprietaire} boutique={boutique} setShowFacture={setShowFacture} user={user} />}
        {page === "dettes" && isProprietaire && <DettesPage clients={clients} saveClient={saveClient} ventes={ventes} t={t} boutique={boutique} />}
        {page === "rapports" && isProprietaire && <RapportsPage ventes={ventes} produits={produits} t={t} setShowFacture={setShowFacture} />}
      </div>

      {/* NAVBAR */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#1a1f2e", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", padding: "8px 0 12px", boxShadow: "0 -8px 32px rgba(0,0,0,0.4)" }}>
        {pages.map(p => (
          <button key={p.id} onClick={() => setPage(p.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0" }}>
            {p.id === "ventes" ? (
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: page === p.id ? "linear-gradient(135deg, #00d97e, #00b360)" : "#252b3b", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -18, boxShadow: page === p.id ? "0 4px 20px rgba(0,217,126,0.5)" : "0 4px 12px rgba(0,0,0,0.3)", border: "3px solid #1a1f2e" }}>
                <Icon name={p.icon} size={20} color="#fff" />
              </div>
            ) : (
              <Icon name={p.icon} size={20} color={page === p.id ? "#00d97e" : "#555e7a"} />
            )}
            <span style={{ fontSize: 9, fontWeight: 700, color: page === p.id ? "#00d97e" : "#555e7a" }}>{p.label}</span>
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
  const aujourd = ventes.filter(v => getDate(v).toDateString() === new Date().toDateString());
  const totalVentes = aujourd.reduce((s, v) => s + (v.paye || 0), 0);
  const totalDettes = clients.reduce((s, c) => s + (c.dette || 0), 0);
  const ruptures = produits.filter(p => p.quantite === 0).length;
  const alertes = produits.filter(p => p.quantite > 0 && p.quantite <= p.alerte).length;
  const benefice = aujourd.reduce((s, v) => {
    const p = produits.find(p => p.nom === v.produit);
    return p ? s + (p.prixVente - p.prixAchat) * (v.quantite || 0) : s;
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: "#8891aa", margin: 0, fontSize: 12, textTransform: "capitalize" }}>
          {new Date().toLocaleDateString(langue === "ar" ? "ar-TN" : langue === "en" ? "en-US" : "fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h2 style={{ margin: "4px 0 0", color: "#f0f4ff", fontSize: 20, fontWeight: 800 }}>{t.bonjour}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: t.ventesAujourdhui, value: fmt(totalVentes), icon: "vente", color: "#00d97e" },
          { label: t.beneficeEstime, value: fmt(benefice), icon: "money", color: "#ffd93d" },
          { label: t.dettesClients, value: fmt(totalDettes), icon: "dette", color: "#ff6b6b" },
          { label: t.rupturesStock, value: `${ruptures} (${alertes})`, icon: "alert", color: "#ff9f43" },
        ].map(c => (
          <div key={c.label} style={{ background: "#1a1f2e", borderRadius: 14, padding: 12, border: `1px solid ${c.color}22` }}>
            <Icon name={c.icon} size={16} color={c.color} />
            <div style={{ color: c.color, fontWeight: 800, fontSize: 14, marginTop: 6 }}>{c.value}</div>
            <div style={{ color: "#8891aa", fontSize: 10 }}>{c.label}</div>
          </div>
        ))}
      </div>
      {(ruptures > 0 || alertes > 0) && (
        <div style={{ background: "rgba(255,159,67,0.1)", border: "1px solid rgba(255,159,67,0.3)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ color: "#ff9f43", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{t.alertesStock}</div>
          {produits.filter(p => p.quantite <= p.alerte).map(p => (
            <div key={p.id} style={{ color: "#c8cfd8", fontSize: 12, padding: "3px 0" }}>
              {p.quantite === 0 ? "🔴" : "🟡"} {p.nom} — {p.quantite === 0 ? t.ruptureTotale : `${p.quantite} ${t.restants}`}
            </div>
          ))}
        </div>
      )}
      <div style={{ background: "#1a1f2e", borderRadius: 14, padding: 14 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{t.dernieresVentes}</div>
        {ventes.length === 0 ? <div style={{ color: "#8891aa", fontSize: 12, textAlign: "center", padding: 16 }}>{t.aucuneVente}</div>
          : ventes.slice(-5).reverse().map(v => (
            <div key={v.id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "#f0f4ff", fontSize: 13, fontWeight: 600 }}>{v.produit}</div>
                  {(v.vendeurNom || v.vendeurTel) && (
                    <div style={{ color: "#7b8cff", fontSize: 10 }}>
                      👤 {v.vendeurNom || ""}{v.vendeurTel ? ` | ${v.vendeurTel}` : ""}
                    </div>
                  )}
                  <div style={{ color: "#8891aa", fontSize: 10 }}>#{v.factureId}</div>
                </div>
                <div style={{ color: v.mode === "credit" ? "#ff6b6b" : "#00d97e", fontWeight: 700, fontSize: 13 }}>{fmt(v.paye || 0)}</div>
              </div>
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

  const filtered = produits.filter(p => !p.deleted && p.nom?.toLowerCase().includes(search.toLowerCase()));
  const statusColor = (p) => p.quantite === 0 ? "#ff4757" : p.quantite <= p.alerte ? "#ff9f43" : "#00d97e";

  const openAdd = () => { setEditProduit(null); setForm({ nom: "", categorie: "Alimentation", prixAchat: "", prixVente: "", quantite: "", alerte: "5" }); setShowModal(true); };
  const openEdit = (p) => { setEditProduit(p); setForm({ ...p, prixAchat: p.prixAchat || "", prixVente: p.prixVente || "", quantite: p.quantite || "", alerte: p.alerte || "5" }); setShowModal(true); };
  const save = () => {
    if (!form.nom) return;
    saveProduit({ ...form, prixAchat: +form.prixAchat, prixVente: +form.prixVente, quantite: +form.quantite, alerte: +form.alerte, id: editProduit?.id });
    setShowModal(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, color: "#f0f4ff", fontSize: 18, fontWeight: 800 }}>{t.monStock}</h2>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
  {lim.produits !== Infinity && (
    <span style={{ color: produits.filter(p=>!p.deleted).length >= lim.produits ? "#ff4757" : "#8891aa", fontSize:11, fontWeight:600 }}>
      {produits.filter(p=>!p.deleted).length}/{lim.produits}
    </span>
  )}
  <Btn onClick={openAdd} small disabled={produits.filter(p=>!p.deleted).length >= lim.produits}>+ {t.ajouter}</Btn>
</div>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.chercher} style={{ ...inputStyle, marginBottom: 14, width: "100%", boxSizing: "border-box" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: "#1a1f2e", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(p), boxShadow: `0 0 6px ${statusColor(p)}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 13 }}>{p.nom}</div>
              <div style={{ color: "#8891aa", fontSize: 11 }}>{p.categorie}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                <span style={{ color: "#00d97e", fontSize: 11, fontWeight: 600 }}>{fmt(p.prixVente)}</span>
                <span style={{ color: "#8891aa", fontSize: 11 }}>Achat: {fmt(p.prixAchat)}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: statusColor(p), fontWeight: 800, fontSize: 16 }}>{p.quantite}</div>
              <div style={{ color: "#8891aa", fontSize: 10 }}>{t.unites}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <button onClick={() => openEdit(p)} style={{ background: "#252b3b", border: "none", borderRadius: 7, padding: 6, cursor: "pointer", display: "flex" }}><Icon name="edit" size={13} color="#7b8cff" /></button>
              <button onClick={() => deleteProduit(p.id)} style={{ background: "#252b3b", border: "none", borderRadius: 7, padding: 6, cursor: "pointer", display: "flex" }}><Icon name="trash" size={13} color="#ff6b6b" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: "#8891aa", textAlign: "center", padding: 30 }}>Aucun produit</div>}
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
          {+form.prixAchat > 0 && +form.prixVente > 0 && (
            <div style={{ background: "rgba(0,217,126,0.1)", border: "1px solid rgba(0,217,126,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
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
const VentesPage = ({ produits, ventes, clients, saveVente, saveClient, t, isProprietaire, boutique, setShowFacture, user }) => {
  const [step, setStep] = useState(1);
  const [panier, setPanier] = useState([]);
  const [search, setSearch] = useState("");
  const [modePaiement, setModePaiement] = useState("cash");
  const [montantPaye, setMontantPaye] = useState("");
  const [clientId, setClientId] = useState("");
  const [nouveauClient, setNouveauClient] = useState({ nom: "", telephone: "", quartier: "" });
  const [success, setSuccess] = useState(false);
  const [derniereVente, setDerniereVente] = useState(null);

  const filtered = produits.filter(p => !p.deleted && p.quantite > 0 && p.nom?.toLowerCase().includes(search.toLowerCase()));
  const addPanier = (p) => { const e = panier.find(x => x.id === p.id); if (e) setPanier(panier.map(x => x.id === p.id ? { ...x, qte: x.qte + 1 } : x)); else setPanier([...panier, { ...p, qte: 1 }]); };
  const updateQte = (id, qte) => { if (qte <= 0) setPanier(panier.filter(x => x.id !== id)); else setPanier(panier.map(x => x.id === id ? { ...x, qte } : x)); };

  const total = panier.reduce((s, x) => s + x.prixVente * x.qte, 0);
  const paye = modePaiement === "credit" ? 0 : modePaiement === "mobile" ? total : (montantPaye ? Math.min(+montantPaye, total) : total);
  const dette = total - paye;
  const monnaie = montantPaye && modePaiement === "cash" ? Math.max(0, +montantPaye - total) : 0;

  const reset = () => { setSuccess(false); setPanier([]); setStep(1); setSearch(""); setModePaiement("cash"); setMontantPaye(""); setClientId(""); setNouveauClient({ nom: "", telephone: "", quartier: "" }); setDerniereVente(null); };

  const confirmer = async () => {
    if (panier.length === 0) return;
    if (lim.ventes !== Infinity) {
  const debut = new Date(); debut.setDate(1); debut.setHours(0,0,0,0);
  const vm = ventes.filter(v => getDate(v) >= debut).length;
  if (vm >= lim.ventes) {
    alert(`⚠️ Maximum ${lim.ventes} ventes/mois avec votre plan.\nContactez-nous: wa.me/23562282320`);
    return;
  }
}
    let clientRef = clientId;
    if (clientId === "nouveau" && nouveauClient.nom) {
      clientRef = await saveClient({ ...nouveauClient, dette });
    } else if (clientId && dette > 0) {
      const c = clients.find(x => x.id === clientId);
      if (c) await saveClient({ ...c, dette: (c.dette || 0) + dette });
    }
    const venteData = {
      produit: panier.map(x => x.nom).join(", "),
      quantite: panier.reduce((s, x) => s + x.qte, 0),
      montant: total, paye, mode: modePaiement,
      clientId: clientRef || null,
      items: panier.map(x => ({ id: x.id, nom: x.nom, qte: x.qte, prixVente: x.prixVente })),
    };
    const vente = await saveVente(venteData);
    setDerniereVente(vente);
    setSuccess(true);
  };

  if (success) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 14 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,217,126,0.15)", border: "3px solid #00d97e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" size={36} color="#00d97e" />
      </div>
      <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 20 }}>{t.venteEnregistree}</div>
      <div style={{ color: "#8891aa", fontSize: 12 }}>#{derniereVente?.factureId}</div>
      <div style={{ background: "rgba(123,140,255,0.1)", border: "1px solid rgba(123,140,255,0.3)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
        <div style={{ color: "#8891aa", fontSize: 11 }}>👤 {t.vendu_par}</div>
        <div style={{ color: "#7b8cff", fontWeight: 700, fontSize: 13 }}>{user.nom || user.telephone}</div>
      </div>
      <Btn onClick={() => { if (derniereVente) setShowFacture(derniereVente); }} color="#7b8cff">{t.genererFacture}</Btn>
      <Btn onClick={reset} outlined>{t.retour}</Btn>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 14px", color: "#f0f4ff", fontSize: 18, fontWeight: 800 }}>{t.nouvelleVente}</h2>
      {step === 1 && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.chercher} style={{ ...inputStyle, marginBottom: 12, width: "100%", boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {filtered.map(p => (
              <button key={p.id} onClick={() => addPanier(p)} style={{ background: panier.find(x => x.id === p.id) ? "rgba(0,217,126,0.1)" : "#1a1f2e", border: panier.find(x => x.id === p.id) ? "1.5px solid rgba(0,217,126,0.4)" : "1.5px solid transparent", borderRadius: 12, padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#f0f4ff", fontWeight: 600, fontSize: 13 }}>{p.nom}</div>
                  <div style={{ color: "#8891aa", fontSize: 11 }}>{p.quantite} {t.enStock}</div>
                </div>
                <div style={{ color: "#00d97e", fontWeight: 800, fontSize: 13 }}>{fmt(p.prixVente)}</div>
              </button>
            ))}
            {filtered.length === 0 && <div style={{ color: "#8891aa", textAlign: "center", padding: 20 }}>Aucun produit disponible</div>}
          </div>
          {panier.length > 0 && (
            <>
              <div style={{ background: "#252b3b", borderRadius: 14, padding: 14, marginBottom: 12 }}>
                <div style={{ color: "#8891aa", fontWeight: 700, fontSize: 11, marginBottom: 10, textTransform: "uppercase" }}>{t.panier} ({panier.length})</div>
                {panier.map(x => (
                  <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, color: "#f0f4ff", fontSize: 12, fontWeight: 600 }}>{x.nom}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => updateQte(x.id, x.qte - 1)} style={{ background: "#1a1f2e", border: "none", color: "#f0f4ff", width: 26, height: 26, borderRadius: 7, cursor: "pointer", fontSize: 15 }}>−</button>
                      <span style={{ color: "#f0f4ff", fontWeight: 700, minWidth: 18, textAlign: "center", fontSize: 13 }}>{x.qte}</span>
                      <button onClick={() => updateQte(x.id, x.qte + 1)} style={{ background: "#1a1f2e", border: "none", color: "#f0f4ff", width: 26, height: 26, borderRadius: 7, cursor: "pointer", fontSize: 15 }}>+</button>
                    </div>
                    <div style={{ color: "#00d97e", fontWeight: 700, fontSize: 12 }}>{fmt(x.prixVente * x.qte)}</div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#f0f4ff", fontWeight: 700 }}>{t.total}</span>
                  <span style={{ color: "#00d97e", fontWeight: 800, fontSize: 16 }}>{fmt(total)}</span>
                </div>
              </div>
              <Btn onClick={() => setStep(2)} full>{t.continuer}</Btn>
            </>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 14, marginBottom: 14, textAlign: "center" }}>
            <div style={{ color: "#8891aa", fontSize: 12 }}>{t.total}</div>
            <div style={{ color: "#f0f4ff", fontWeight: 800, fontSize: 26 }}>{fmt(total)}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "#8891aa", fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{t.modePayment}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[{ val: "cash", label: t.cash }, { val: "mobile", label: t.mobile }, { val: "credit", label: t.credit }].map(m => (
                <button key={m.val} onClick={() => setModePaiement(m.val)} style={{ background: modePaiement === m.val ? "rgba(0,217,126,0.15)" : "#252b3b", border: modePaiement === m.val ? "1.5px solid #00d97e" : "1.5px solid transparent", borderRadius: 10, padding: "10px 4px", cursor: "pointer", color: modePaiement === m.val ? "#00d97e" : "#8891aa", fontWeight: 700, fontSize: 11, fontFamily: "'Sora', sans-serif" }}>{m.label}</button>
              ))}
            </div>
          </div>
          {modePaiement === "cash" && <Field label={t.montantRecu} type="number" value={montantPaye} onChange={setMontantPaye} placeholder={total.toString()} />}
          {(modePaiement === "credit" || (modePaiement === "cash" && montantPaye && +montantPaye < total)) && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: "#8891aa", fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{t.client}</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }}>
                <option value="">{t.clientExistant}</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.dette > 0 ? `(${fmt(c.dette)})` : ""}</option>)}
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
          {monnaie > 0 && <div style={{ background: "rgba(255,217,61,0.1)", border: "1px solid rgba(255,217,61,0.3)", borderRadius: 10, padding: 10, marginBottom: 10, textAlign: "center" }}><span style={{ color: "#8891aa", fontSize: 12 }}>{t.monnaie}: </span><span style={{ color: "#ffd93d", fontWeight: 800, fontSize: 16 }}>{fmt(monnaie)}</span></div>}
          {dette > 0 && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, padding: 10, marginBottom: 10, textAlign: "center" }}><span style={{ color: "#8891aa", fontSize: 12 }}>{t.detteCreee}: </span><span style={{ color: "#ff6b6b", fontWeight: 800, fontSize: 16 }}>{fmt(dette)}</span></div>}
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
const DettesPage = ({ clients, saveClient, ventes, t, boutique }) => {
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
    setSelected(updated);
    setMontant(""); setShowPaiement(false);
  };

  const ajouterClient = async () => {
    if (!newClient.nom) return;
    await saveClient({ ...newClient, dette: 0 });
    setNewClient({ nom: "", telephone: "", quartier: "" });
    setShowAddClient(false);
  };

  if (selected) {
    const clientVentes = ventes.filter(v => v.clientId === selected.id);
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#8891aa", cursor: "pointer", marginBottom: 14, padding: 0, fontFamily: "'Sora', sans-serif", fontSize: 13 }}>{t.retour}</button>
        <div style={{ background: "#1a1f2e", borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#252b3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="user" size={22} color="#7b8cff" />
            </div>
            <div>
              <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 16 }}>{selected.nom}</div>
              <div style={{ color: "#8891aa", fontSize: 12 }}>📍 {selected.quartier} | 📞 {selected.telephone}</div>
            </div>
          </div>
        </div>
        <div style={{ background: selected.dette > 0 ? "rgba(255,107,107,0.1)" : "rgba(0,217,126,0.1)", border: `1px solid ${selected.dette > 0 ? "rgba(255,107,107,0.3)" : "rgba(0,217,126,0.3)"}`, borderRadius: 12, padding: 18, marginBottom: 14, textAlign: "center" }}>
          <div style={{ color: "#8891aa", fontSize: 12 }}>{t.detteTotal}</div>
          <div style={{ color: selected.dette > 0 ? "#ff6b6b" : "#00d97e", fontWeight: 800, fontSize: 26 }}>{fmt(selected.dette)}</div>
        </div>
        {selected.dette > 0 && (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <Btn onClick={() => setShowPaiement(true)} full>{t.enregistrerPaiement}</Btn>
    <a
      href={`https://wa.me/${(selected.telephone || "").replace(/\s/g, "").replace(/^00/, "+")}?text=${encodeURIComponent(
        `Bonjour ${selected.nom} 👋,\n\nNous vous rappelons que vous avez une dette de *${fmt(selected.dette)}* chez *${boutique?.nom || "notre boutique"}*.\n\nMerci de passer nous régler dès que possible 🙏\n\n_Message envoyé via PrimoGest_`
      )}`}
      target="_blank"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: "#25D366", border: "none", borderRadius: 12,
        color: "#fff", padding: "14px 20px", fontSize: 15, fontWeight: 700,
        cursor: "pointer", fontFamily: "'Sora', sans-serif",
        textDecoration: "none", marginTop: 4,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      📲 Rappeler via WhatsApp
    </a>
  </div>
)}
        <div style={{ marginTop: 18 }}>
          <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{t.historique}</div>
          {clientVentes.length === 0 ? <div style={{ color: "#8891aa", fontSize: 12, textAlign: "center", padding: 16 }}>{t.aucuneVente}</div>
            : clientVentes.map(v => (
              <div key={v.id} style={{ background: "#1a1f2e", borderRadius: 10, padding: "11px 13px", marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ color: "#f0f4ff", fontSize: 12, fontWeight: 600 }}>{v.produit}</div>
                  <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 12 }}>{fmt(v.montant)}</div>
                </div>
                {(v.vendeurNom || v.vendeurTel) && (
                  <div style={{ color: "#7b8cff", fontSize: 10 }}>
                    👤 {v.vendeurNom || ""}{v.vendeurTel ? ` | ${v.vendeurTel}` : ""}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ color: "#8891aa", fontSize: 10 }}>#{v.factureId} | {formatDate(getDate(v))}</div>
                  {v.montant > v.paye && <div style={{ color: "#ff6b6b", fontSize: 10 }}>{t.reste}: {fmt(v.montant - v.paye)}</div>}
                </div>
              </div>
            ))}
        </div>
        {showPaiement && (
          <Modal titre={t.enregistrerPaiement} onClose={() => setShowPaiement(false)}>
            <div style={{ color: "#8891aa", fontSize: 13, marginBottom: 14 }}>{t.detteTotal}: <strong style={{ color: "#ff6b6b" }}>{fmt(selected.dette)}</strong></div>
            <Field label={t.montantRecu} type="number" value={montant} onChange={setMontant} placeholder={selected.dette.toString()} />
            <Btn onClick={enregistrerPaiement} full>{t.confirmer}</Btn>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, color: "#f0f4ff", fontSize: 18, fontWeight: 800 }}>{t.cahierDettes}</h2>
        <Btn onClick={() => setShowAddClient(true)} small>+ {t.client}</Btn>
      </div>
      <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#8891aa", fontSize: 12 }}>{t.totalDettes}</span>
        <span style={{ color: "#ff6b6b", fontWeight: 800 }}>{fmt(clients.reduce((s, c) => s + (c.dette || 0), 0))}</span>
      </div>
      {clients.map(c => (
        <button key={c.id} onClick={() => setSelected(c)} style={{ background: "#1a1f2e", border: "none", borderRadius: 12, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left", width: "100%", marginBottom: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.dette > 0 ? "rgba(255,107,107,0.15)" : "rgba(0,217,126,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={18} color={c.dette > 0 ? "#ff6b6b" : "#00d97e"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 13 }}>{c.nom}</div>
            <div style={{ color: "#8891aa", fontSize: 11 }}>📍 {c.quartier}</div>
          </div>
          <div style={{ color: c.dette > 0 ? "#ff6b6b" : "#00d97e", fontWeight: 800, fontSize: 14 }}>{c.dette > 0 ? fmt(c.dette) : t.solde}</div>
          <Icon name="arrow" size={14} color="#555" />
        </button>
      ))}
      {clients.length === 0 && <div style={{ color: "#8891aa", textAlign: "center", padding: 30 }}>Aucun client</div>}
      {showAddClient && (
        <Modal titre={t.nouveauClient} onClose={() => setShowAddClient(false)}>
          <Field label={t.nomComplet} value={newClient.nom} onChange={v => setNewClient({ ...newClient, nom: v })} placeholder="Ex: Fatou Diallo" />
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
  const [filtreVendeur, setFiltreVendeur] = useState("tous");

  // Liste des vendeurs uniques
  const vendeurs = [...new Map(ventes.filter(v => v.vendeurId).map(v => [v.vendeurId, { id: v.vendeurId, nom: v.vendeurNom || "", tel: v.vendeurTel || "" }])).values()];

  const ventesFiltrees = filtreVendeur === "tous" ? ventes : ventes.filter(v => v.vendeurId === filtreVendeur);

  const aujourd = ventesFiltrees.filter(v => getDate(v).toDateString() === new Date().toDateString());
  const total7j = ventesFiltrees.filter(v => getDate(v) > new Date(Date.now() - 7 * 86400000));

  const calcStats = (list) => ({
    chiffre: list.reduce((s, v) => s + (v.montant || 0), 0),
    encaisse: list.reduce((s, v) => s + (v.paye || 0), 0),
    dettes: list.reduce((s, v) => s + ((v.montant || 0) - (v.paye || 0)), 0),
    nb: list.length,
  });

  const statsJ = calcStats(aujourd);
  const stats7 = calcStats(total7j);

  const prodMap = {};
  ventesFiltrees.forEach(v => { prodMap[v.produit] = (prodMap[v.produit] || 0) + (v.quantite || 0); });
  const topProduits = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const StatCard = ({ label, value, color = "#f0f4ff" }) => (
    <div style={{ background: "#1a1f2e", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ color: "#8891aa", fontSize: 10, fontWeight: 600, textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 15 }}>{value}</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 16px", color: "#f0f4ff", fontSize: 18, fontWeight: 800 }}>{t.rapportsTitle}</h2>

      {/* FILTRE PAR VENDEUR */}
      {vendeurs.length > 0 && (
        <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="filter" size={14} color="#7b8cff" /> {t.filtre_vendeur}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setFiltreVendeur("tous")} style={{ background: filtreVendeur === "tous" ? "#00d97e" : "#252b3b", border: "none", borderRadius: 8, padding: "6px 12px", color: filtreVendeur === "tous" ? "#fff" : "#8891aa", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
              {t.tous_vendeurs}
            </button>
            {vendeurs.map(v => (
              <button key={v.id} onClick={() => setFiltreVendeur(v.id)} style={{ background: filtreVendeur === v.id ? "#7b8cff" : "#252b3b", border: "none", borderRadius: 8, padding: "6px 12px", color: filtreVendeur === v.id ? "#fff" : "#8891aa", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                👤 {v.nom || v.tel}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#00d97e", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>● {t.aujourdhui}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <StatCard label={t.chiffreAffaires} value={fmt(statsJ.chiffre)} />
          <StatCard label={t.encaisse} value={fmt(statsJ.encaisse)} color="#00d97e" />
          <StatCard label={t.dettesCreees} value={fmt(statsJ.dettes)} color="#ff6b6b" />
          <StatCard label={t.nbVentes} value={`${statsJ.nb} ${t.transactions}`} color="#ffd93d" />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#7b8cff", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>● {t.sept_jours}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <StatCard label={t.chiffreAffaires} value={fmt(stats7.chiffre)} />
          <StatCard label={t.encaisse} value={fmt(stats7.encaisse)} color="#00d97e" />
          <StatCard label={t.dettesCreees} value={fmt(stats7.dettes)} color="#ff6b6b" />
          <StatCard label={t.nbVentes} value={stats7.nb.toString()} color="#7b8cff" />
        </div>
      </div>

      {topProduits.length > 0 && (
        <div style={{ background: "#1a1f2e", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{t.topProduits}</div>
          {topProduits.map(([nom, qte], i) => (
            <div key={nom} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#f0f4ff", fontSize: 12, fontWeight: 600 }}>#{i + 1} {nom}</span>
                <span style={{ color: "#8891aa", fontSize: 11 }}>{qte} {t.unites}</span>
              </div>
              <div style={{ height: 5, background: "#252b3b", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${(qte / topProduits[0][1]) * 100}%`, background: ["#00d97e", "#7b8cff", "#ffd93d", "#ff9f43", "#ff6b6b"][i], borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DERNIÈRES VENTES AVEC VENDEUR */}
      <div style={{ background: "#1a1f2e", borderRadius: 14, padding: 14 }}>
        <div style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{t.dernieresVentes}</div>
        {ventesFiltrees.length === 0 ? (
          <div style={{ color: "#8891aa", fontSize: 12, textAlign: "center", padding: 16 }}>{t.aucuneVente}</div>
        ) : ventesFiltrees.slice(-10).reverse().map(v => (
          <div key={v.id} style={{ padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f0f4ff", fontSize: 12, fontWeight: 600 }}>{v.produit}</div>
                {(v.vendeurNom || v.vendeurTel) && (
                  <div style={{ color: "#7b8cff", fontSize: 10 }}>
                    👤 {v.vendeurNom || ""}{v.vendeurTel ? ` | ${v.vendeurTel}` : ""}
                  </div>
                )}
                <div style={{ color: "#8891aa", fontSize: 10 }}>#{v.factureId}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ color: v.mode === "credit" ? "#ff6b6b" : "#00d97e", fontWeight: 700, fontSize: 12 }}>{fmt(v.montant || 0)}</div>
                <button onClick={() => setShowFacture(v)} style={{ background: "#252b3b", border: "none", borderRadius: 7, padding: 5, cursor: "pointer", display: "flex" }}>
                  <Icon name="invoice" size={13} color="#7b8cff" />
                </button>
              </div>
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
    try { const s = localStorage.getItem("primogest_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const t = T[langue];

 const handleLogin = (userData) => {
  localStorage.setItem("primogest_user", JSON.stringify(userData));
  const cached = JSON.parse(localStorage.getItem("pg_known_users") || "[]");
  const exists = cached.find(u => u.telephone === userData.telephone);
  if (!exists) { cached.push(userData); localStorage.setItem("pg_known_users", JSON.stringify(cached)); }
  // Mémorise les identifiants pour connexion hors ligne
  const cachedUsers = JSON.parse(localStorage.getItem("pg_known_users") || "[]");
  let existsUser = cachedUsers.find(u => u.telephone === userData.telephone);
  if (!exists) {
    cachedUsers.push(userData);
    localStorage.setItem("pg_known_users", JSON.stringify(cachedUsers));
  }
  setUser(userData);
};

 const handleLogout = () => {
  // Garde les données en cache mais efface la session
  localStorage.removeItem("primogest_user");
  setUser(null);
};
  if (!user) return <Login onLogin={handleLogin} t={t} />;
  if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} t={t} langue={langue} setLangue={setLangue} />;
  return <AppBoutique user={user} onLogout={handleLogout} t={t} langue={langue} setLangue={setLangue} />;
}
