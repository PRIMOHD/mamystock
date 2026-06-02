import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, doc, getDocs, addDoc, query, where, serverTimestamp, updateDoc } from "firebase/firestore";

const ADMIN_PHONE = "+23562282320";
const ADMIN_PASSWORD = "primogest@admin2026";
const WHATSAPP = "23562282320";

const hashPwd = async (pwd) => {
  const data = new TextEncoder().encode(pwd + "primogest_salt_2026");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const PLANS = {
  essai:    { label:"ESSAI", color:"#7b8cff", produits:50, ventes:100, vendeurs:false, bilan:false },
  pro:      { label:"PRO ⭐", color:"#00d97e", produits:Infinity, ventes:Infinity, vendeurs:true, bilan:true },
  business: { label:"BUSINESS 🚀", color:"#ffd93d", produits:Infinity, ventes:Infinity, vendeurs:true, bilan:true },
};

const T = {
  fr: {
    appName:"Lapia", bonjour:"Bonjour 👋", accueil:"Accueil", stock:"Stock",
    vendre:"Vendre", dettes:"Dettes", rapports:"Rapports",
    ventesAujourdhui:"Ventes aujourd'hui", beneficeEstime:"Bénéfice estimé",
    dettesClients:"Dettes clients", rupturesStock:"Ruptures de stock",
    dernieresVentes:"Dernières ventes", alertesStock:"Alertes stock",
    monStock:"Mon Stock", ajouter:"Ajouter", chercher:"Chercher un produit...",
    nouvelleVente:"Nouvelle Vente", panier:"Panier", total:"Total",
    continuer:"Continuer → Paiement", modePayment:"Mode de paiement",
    cash:"💵 Cash", mobile:"📱 Mobile Money", credit:"📋 À crédit", cheque:"🏦 Chèque",
    numeroCheque:"Numéro de chèque",
    montantRecu:"Montant reçu", monnaie:"Monnaie à rendre", detteCreee:"Dette créée",
    confirmer:"✅ Confirmer", retour:"← Retour",
    cahierDettes:"Cahier de Dettes", totalDettes:"Total dettes",
    client:"Client", nouveauClient:"+ Nouveau client",
    clientExistant:"-- Client existant --", nomComplet:"Nom complet *",
    telephone:"Téléphone", quartier:"Quartier", ajouterClient:"Ajouter le client",
    enregistrerPaiement:"💰 Enregistrer un paiement", detteTotal:"Dette totale",
    historique:"Historique achats", rapportsTitle:"Rapports",
    aujourdhui:"Aujourd'hui", sept_jours:"7 derniers jours",
    chiffreAffaires:"Chiffre d'affaires", benefice:"Bénéfice",
    encaisse:"Encaissé", nbVentes:"Nb ventes",
    topProduits:"🏆 Top produits vendus", topClients:"🏆 Meilleurs clients",
    seConnecter:"Se connecter", motDePasse:"Mot de passe",
    motDePasseIncorrect:"❌ Numéro ou mot de passe incorrect",
    connectezVous:"Connectez-vous pour continuer",
    unites:"unités", aCredit:"À crédit", solde:"✓ Soldé",
    ruptureTotale:"Rupture totale", restants:"restants",
    venteEnregistree:"Vente enregistrée !", nomProduit:"Nom du produit",
    categorie:"Catégorie", prixAchat:"Prix d'achat", prixVente:"Prix de vente",
    quantite:"Quantité", alerteStockMin:"Alerte stock (min)",
    margeBeneficiaire:"Marge bénéficiaire", modifierProduit:"Modifier produit",
    nouveauProduit:"Nouveau produit", ajouterAuStock:"Ajouter au stock",
    enregistrer:"Enregistrer", transactions:"transactions",
    dettesCreees:"Dettes créées", aucuneVente:"Aucune vente enregistrée",
    reste:"Reste", enStock:"en stock", chargement:"Chargement...",
    facture:"Facture", genererFacture:"🧾 Générer facture",
    nomBoutique:"Nom de la boutique", adresse:"Adresse",
    inscription:"Créer un compte", deja_compte:"Déjà un compte ? Se connecter",
    pas_compte:"Pas de compte ? S'inscrire", creer_compte:"Créer le compte",
    role_proprietaire:"Propriétaire", role_vendeur:"Vendeur", role_admin:"Admin",
    boutiques:"Boutiques", transactions_globales:"Transactions globales",
    vendeurs:"Mes vendeurs", bilan_trimestriel:"Bilan trimestriel",
    nom_vendeur:"Nom du vendeur", tel_vendeur:"Téléphone vendeur",
    mdp_vendeur:"Mot de passe vendeur", creer_vendeur:"Créer le vendeur",
    vendu_par:"Vendu par", online:"🟢 En ligne", offline:"🔴 Hors ligne",
    sync_en_cours:"🔄 Sync...", filtre_vendeur:"Filtrer par vendeur",
    tous_vendeurs:"Tous les vendeurs",
    mdp_oublie:"Mot de passe oublié ?",
    changer_mdp:"🔐 Changer mon mot de passe",
    ancien_mdp:"Ancien mot de passe", nouveau_mdp:"Nouveau mot de passe",
    confirmer_changement:"Confirmer le changement",
    premiere_connexion:"Connectez-vous d'abord avec internet",
    rappel_whatsapp:"📲 Rappeler via WhatsApp",
    client_anonyme:"👤 Anonyme", client_existant:"📋 Existant", client_nouveau:"➕ Nouveau",
    achat:"achat(s)",
  },
  en: {
    appName:"Lapia", bonjour:"Hello 👋", accueil:"Home", stock:"Stock",
    vendre:"Sell", dettes:"Debts", rapports:"Reports",
    ventesAujourdhui:"Today's sales", beneficeEstime:"Estimated profit",
    dettesClients:"Customer debts", rupturesStock:"Out of stock",
    dernieresVentes:"Latest sales", alertesStock:"Stock alerts",
    monStock:"My Stock", ajouter:"Add", chercher:"Search a product...",
    nouvelleVente:"New Sale", panier:"Cart", total:"Total",
    continuer:"Continue → Payment", modePayment:"Payment method",
    cash:"💵 Cash", mobile:"📱 Mobile Money", credit:"📋 Credit", cheque:"🏦 Cheque",
    numeroCheque:"Cheque number",
    montantRecu:"Amount received", monnaie:"Change to give", detteCreee:"Debt created",
    confirmer:"✅ Confirm", retour:"← Back",
    cahierDettes:"Debt Book", totalDettes:"Total debts",
    client:"Customer", nouveauClient:"+ New customer",
    clientExistant:"-- Existing customer --", nomComplet:"Full name *",
    telephone:"Phone", quartier:"District", ajouterClient:"Add customer",
    enregistrerPaiement:"💰 Record payment", detteTotal:"Total debt",
    historique:"Purchase history", rapportsTitle:"Reports",
    aujourdhui:"Today", sept_jours:"Last 7 days",
    chiffreAffaires:"Revenue", benefice:"Profit",
    encaisse:"Collected", nbVentes:"Sales count",
    topProduits:"🏆 Top products", topClients:"🏆 Best customers",
    seConnecter:"Log in", motDePasse:"Password",
    motDePasseIncorrect:"❌ Wrong number or password",
    connectezVous:"Log in to continue",
    unites:"units", aCredit:"Credit", solde:"✓ Paid",
    ruptureTotale:"Out of stock", restants:"left",
    venteEnregistree:"Sale recorded!", nomProduit:"Product name",
    categorie:"Category", prixAchat:"Purchase price", prixVente:"Sale price",
    quantite:"Quantity", alerteStockMin:"Stock alert (min)",
    margeBeneficiaire:"Profit margin", modifierProduit:"Edit product",
    nouveauProduit:"New product", ajouterAuStock:"Add to stock",
    enregistrer:"Save", transactions:"transactions",
    dettesCreees:"Debts created", aucuneVente:"No sales recorded",
    reste:"Remaining", enStock:"in stock", chargement:"Loading...",
    facture:"Invoice", genererFacture:"🧾 Generate invoice",
    nomBoutique:"Store name", adresse:"Address",
    inscription:"Create account", deja_compte:"Already have account? Log in",
    pas_compte:"No account? Sign up", creer_compte:"Create account",
    role_proprietaire:"Owner", role_vendeur:"Seller", role_admin:"Admin",
    boutiques:"Stores", transactions_globales:"Global transactions",
    vendeurs:"My sellers", bilan_trimestriel:"Quarterly report",
    nom_vendeur:"Seller name", tel_vendeur:"Seller phone",
    mdp_vendeur:"Seller password", creer_vendeur:"Create seller",
    vendu_par:"Sold by", online:"🟢 Online", offline:"🔴 Offline",
    sync_en_cours:"🔄 Sync...", filtre_vendeur:"Filter by seller",
    tous_vendeurs:"All sellers",
    mdp_oublie:"Forgot password?",
    changer_mdp:"🔐 Change my password",
    ancien_mdp:"Current password", nouveau_mdp:"New password",
    confirmer_changement:"Confirm change",
    premiere_connexion:"Connect with internet first",
    rappel_whatsapp:"📲 Remind via WhatsApp",
    client_anonyme:"👤 Anonymous", client_existant:"📋 Existing", client_nouveau:"➕ New",
    achat:"purchase(s)",
  },
  ar: {
    appName:"Lapia", bonjour:"مرحباً 👋", accueil:"الرئيسية", stock:"المخزون",
    vendre:"بيع", dettes:"الديون", rapports:"التقارير",
    ventesAujourdhui:"مبيعات اليوم", beneficeEstime:"الربح المتوقع",
    dettesClients:"ديون العملاء", rupturesStock:"نفاد المخزون",
    dernieresVentes:"آخر المبيعات", alertesStock:"تنبيهات المخزون",
    monStock:"مخزوني", ajouter:"إضافة", chercher:"ابحث عن منتج...",
    nouvelleVente:"بيع جديد", panier:"السلة", total:"المجموع",
    continuer:"متابعة ← الدفع", modePayment:"طريقة الدفع",
    cash:"💵 نقداً", mobile:"📱 موبايل موني", credit:"📋 دين", cheque:"🏦 شيك",
    numeroCheque:"رقم الشيك",
    montantRecu:"المبلغ المستلم", monnaie:"الباقي", detteCreee:"الدين المسجل",
    confirmer:"✅ تأكيد", retour:"رجوع →",
    cahierDettes:"دفتر الديون", totalDettes:"إجمالي الديون",
    client:"العميل", nouveauClient:"+ عميل جديد",
    clientExistant:"-- عميل موجود --", nomComplet:"الاسم الكامل *",
    telephone:"الهاتف", quartier:"الحي", ajouterClient:"إضافة العميل",
    enregistrerPaiement:"💰 تسجيل الدفع", detteTotal:"إجمالي الدين",
    historique:"سجل المشتريات", rapportsTitle:"التقارير",
    aujourdhui:"اليوم", sept_jours:"آخر 7 أيام",
    chiffreAffaires:"رقم الأعمال", benefice:"الربح",
    encaisse:"المحصل", nbVentes:"عدد المبيعات",
    topProduits:"🏆 أكثر المنتجات", topClients:"🏆 أفضل العملاء",
    seConnecter:"تسجيل الدخول", motDePasse:"كلمة المرور",
    motDePasseIncorrect:"❌ رقم أو كلمة مرور خاطئة",
    connectezVous:"سجل دخولك للمتابعة",
    unites:"وحدات", aCredit:"دين", solde:"✓ مسدد",
    ruptureTotale:"نفد تماماً", restants:"متبقي",
    venteEnregistree:"تم تسجيل البيع!", nomProduit:"اسم المنتج",
    categorie:"الفئة", prixAchat:"سعر الشراء", prixVente:"سعر البيع",
    quantite:"الكمية", alerteStockMin:"تنبيه المخزون",
    margeBeneficiaire:"هامش الربح", modifierProduit:"تعديل المنتج",
    nouveauProduit:"منتج جديد", ajouterAuStock:"إضافة للمخزون",
    enregistrer:"حفظ", transactions:"معاملات",
    dettesCreees:"ديون مسجلة", aucuneVente:"لا توجد مبيعات",
    reste:"المتبقي", enStock:"في المخزون", chargement:"جاري التحميل...",
    facture:"فاتورة", genererFacture:"🧾 إنشاء فاتورة",
    nomBoutique:"اسم المتجر", adresse:"العنوان",
    inscription:"إنشاء حساب", deja_compte:"لديك حساب؟ تسجيل الدخول",
    pas_compte:"ليس لديك حساب؟ إنشاء حساب", creer_compte:"إنشاء الحساب",
    role_proprietaire:"مالك", role_vendeur:"بائع", role_admin:"مدير",
    boutiques:"المتاجر", transactions_globales:"المعاملات العامة",
    vendeurs:"البائعون", bilan_trimestriel:"التقرير الفصلي",
    nom_vendeur:"اسم البائع", tel_vendeur:"هاتف البائع",
    mdp_vendeur:"كلمة مرور البائع", creer_vendeur:"إنشاء البائع",
    vendu_par:"باعه", online:"🟢 متصل", offline:"🔴 غير متصل",
    sync_en_cours:"🔄 مزامنة...", filtre_vendeur:"تصفية حسب البائع",
    tous_vendeurs:"كل البائعين",
    mdp_oublie:"نسيت كلمة المرور؟",
    changer_mdp:"🔐 تغيير كلمة المرور",
    ancien_mdp:"كلمة المرور الحالية", nouveau_mdp:"كلمة المرور الجديدة",
    confirmer_changement:"تأكيد التغيير",
    premiere_connexion:"اتصل بالإنترنت أولاً",
    rappel_whatsapp:"📲 تذكير عبر واتساب",
    client_anonyme:"👤 مجهول", client_existant:"📋 موجود", client_nouveau:"➕ جديد",
    achat:"شراء",
  }
};

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n||0) + " FCFA";
const genId = () => `PG-${new Date().getFullYear()}-${Math.floor(Math.random()*90000)+10000}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"});
const fmtHeure = (d) => new Date(d).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const getDate = (v) => v?.date?.toDate ? v.date.toDate() : new Date(v?.date||Date.now());

const IS = {
  width:"100%", background:"#252b3b", border:"1.5px solid #2d3448",
  borderRadius:12, color:"#f0f4ff", padding:"13px 15px", fontSize:16,
  outline:"none", boxSizing:"border-box", fontFamily:"'Sora',sans-serif"
};

const Icon = ({name,size=20,color="currentColor"}) => {
  const P = {
    dashboard:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    stock:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    vente:"M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    dette:"M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    rapport:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    alert:"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    close:"M6 18L18 6M6 6l12 12", check:"M5 13l4 4L19 7", arrow:"M9 5l7 7-7 7",
    user:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    money:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    logout:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    invoice:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    store:"M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a1 1 0 01-1 1H8a1 1 0 01-1-1v-6",
    chart:"M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
    lock:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  };
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} style={{flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={P[name]||""}/></svg>;
};

const Modal = ({titre,onClose,children}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
    <div style={{background:"#1a1f2e",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:600,maxHeight:"92vh",overflow:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.5)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{margin:0,color:"#f0f4ff",fontSize:20,fontFamily:"'Sora',sans-serif",fontWeight:700}}>{titre}</h3>
        <button onClick={onClose} style={{background:"#2a3040",border:"none",borderRadius:10,padding:8,cursor:"pointer",display:"flex"}}><Icon name="close" size={20} color="#8891aa"/></button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({label,type="text",value,onChange,placeholder,options}) => (
  <div style={{marginBottom:16}}>
    <label style={{display:"block",color:"#8891aa",fontSize:13,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>
    {options
      ? <select value={value} onChange={e=>onChange(e.target.value)} style={IS}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={IS}/>
    }
  </div>
);

const Btn = ({children,onClick,color="#00d97e",outlined,small,full,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background:disabled?"#2a3040":outlined?"transparent":color,
    border:outlined?`1.5px solid ${color}`:"none",
    color:disabled?"#555":outlined?color:"#fff",
    borderRadius:12, padding:small?"10px 18px":"14px 20px",
    fontSize:small?14:16, fontWeight:700, cursor:disabled?"not-allowed":"pointer",
    width:full?"100%":"auto", fontFamily:"'Sora',sans-serif", marginTop:small?0:4,
  }}>{children}</button>
);

const EssaiExpire = ({user,onLogout}) => (
  <div style={{minHeight:"100vh",background:"#111520",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Sora',sans-serif",textAlign:"center"}}>
    <div style={{fontSize:64,marginBottom:20}}>⏰</div>
    <div style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:20,padding:32,maxWidth:400,width:"100%"}}>
      <div style={{color:"#ff6b6b",fontWeight:800,fontSize:24,marginBottom:12}}>Période d'essai terminée</div>
      <div style={{color:"#8891aa",fontSize:16,lineHeight:1.7,marginBottom:20}}>Votre période d'essai gratuite de 30 jours est terminée.<br/>Contactez-nous pour continuer avec Lapia Pro.</div>
      <div style={{background:"#1a1f2e",borderRadius:12,padding:14,marginBottom:20}}>
        <div style={{color:"#f0f4ff",fontWeight:700,fontSize:16}}>{user.nomBoutique}</div>
        <div style={{color:"#8891aa",fontSize:14}}>📞 {user.telephone}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour David 👋,\nMon essai Lapia est terminé.\nBoutique : ${user.nomBoutique}\nTéléphone : ${user.telephone}\nJe voudrais activer le plan Pro ⭐ (5 000 FCFA/mois)`)}`} target="_blank"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"#25D366",borderRadius:12,color:"#fff",padding:"14px 20px",fontSize:16,fontWeight:700,textDecoration:"none"}}>
          📲 Activer Pro — 5 000 FCFA/mois
        </a>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#8891aa",padding:"10px 20px",fontSize:14,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Se déconnecter</button>
      </div>
    </div>
  </div>
);

const Facture = ({vente,boutique,onClose,t}) => {
  const fid = vente.factureId||genId();
  const date = getDate(vente);
  const print = () => {
    const w = window.open("","_blank");
    w.document.write(`<html><head><title>Facture ${fid}</title><style>
      body{font-family:Arial,sans-serif;padding:30px;max-width:400px;margin:0 auto}
      .header{text-align:center;border-bottom:2px solid #00d97e;padding-bottom:15px;margin-bottom:20px}
      .logo{font-size:28px;font-weight:800;color:#00d97e}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}
      .total{display:flex;justify-content:space-between;font-weight:800;font-size:16px;margin-top:15px;padding-top:10px;border-top:2px solid #333}
      .info{background:#f5f5f5;padding:8px;border-radius:6px;margin:6px 0;font-size:12px}
      .footer{text-align:center;margin-top:25px;color:#999;font-size:11px}
    </style></head><body>
    <div class="header">
      <div class="logo">Lapia</div>
      <div style="font-size:16px;font-weight:700">${boutique?.nom}</div>
      ${boutique?.adresse?`<div style="font-size:12px;color:#666">${boutique.adresse}</div>`:""}
      <div style="color:#666;font-size:13px">N° ${fid}</div>
    </div>
    <div style="display:flex;justify-content:space-between;margin:12px 0;font-size:13px"><span>📅 ${fmtDate(date)}</span><span>🕐 ${fmtHeure(date)}</span></div>
    ${vente.clientNom?`<div class="info">👤 Client: <strong>${vente.clientNom}</strong>${vente.clientTel?` | ${vente.clientTel}`:""}</div>`:""}
    ${vente.vendeurNom?`<div class="info">🧑‍💼 Vendeur: <strong>${vente.vendeurNom}</strong>${vente.vendeurTel?` | ${vente.vendeurTel}`:""}</div>`:""}
    ${(vente.items||[{nom:vente.produit,qte:vente.quantite,prixVente:vente.montant/(vente.quantite||1)}]).map(i=>`<div class="row"><span>${i.nom} x${i.qte}</span><span>${fmt(i.prixVente*i.qte)}</span></div>`).join("")}
    <div class="total"><span>TOTAL</span><span>${fmt(vente.montant)}</span></div>
    ${vente.paye<vente.montant?`<div style="margin-top:10px;font-size:13px"><div style="display:flex;justify-content:space-between"><span>Payé:</span><span style="color:green">${fmt(vente.paye)}</span></div><div style="display:flex;justify-content:space-between"><span>Reste:</span><span style="color:red">${fmt(vente.montant-vente.paye)}</span></div></div>`:""}
    <div style="text-align:center;margin-top:10px;color:#666;font-size:12px">${vente.mode==="cash"?"💵 Cash":vente.mode==="mobile"?"📱 Mobile Money":vente.mode==="cheque"?"🏦 Chèque":"📋 À crédit"}${vente.numeroCheque?` (N° ${vente.numeroCheque})`:""}</div>
    <div class="footer">Merci pour votre confiance !<br/>Lapia - Le cahier de boutique intelligent</div>
    </body></html>`);
    w.document.close(); w.print();
  };
  return (
    <Modal titre={`${t.facture} — ${fid}`} onClose={onClose}>
      <div style={{background:"#252b3b",borderRadius:14,padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{color:"#00d97e",fontWeight:800,fontSize:18}}>Lapia</span>
          <span style={{color:"#8891aa",fontSize:14}}>N° {fid}</span>
        </div>
        <div style={{color:"#f0f4ff",fontWeight:700,fontSize:16}}>{boutique?.nom}</div>
        <div style={{color:"#8891aa",fontSize:14,marginBottom:10}}>{boutique?.adresse}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <span style={{color:"#8891aa",fontSize:14}}>📅 {fmtDate(date)}</span>
          <span style={{color:"#8891aa",fontSize:14}}>🕐 {fmtHeure(date)}</span>
        </div>
        {vente.clientNom&&<div style={{background:"rgba(255,159,67,0.1)",border:"1px solid rgba(255,159,67,0.3)",borderRadius:8,padding:"9px 13px",marginBottom:10}}>
          <span style={{color:"#ff9f43",fontSize:14}}>👤 Client: </span>
          <strong style={{color:"#f0f4ff",fontSize:14}}>{vente.clientNom}</strong>
          {vente.clientTel&&<span style={{color:"#8891aa",fontSize:13}}> | {vente.clientTel}</span>}
        </div>}
        {(vente.vendeurNom||vente.vendeurTel)&&<div style={{background:"rgba(123,140,255,0.1)",border:"1px solid rgba(123,140,255,0.3)",borderRadius:8,padding:"9px 13px",marginBottom:10}}>
          <span style={{color:"#7b8cff",fontSize:14}}>🧑‍💼 {t.vendu_par}: </span>
          <strong style={{color:"#f0f4ff",fontSize:14}}>{vente.vendeurNom}</strong>
          {vente.vendeurTel&&<span style={{color:"#8891aa",fontSize:13}}> | {vente.vendeurTel}</span>}
        </div>}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:12}}>
          {(vente.items||[{nom:vente.produit,qte:vente.quantite,prixVente:vente.montant/(vente.quantite||1)}]).map((it,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{color:"#f0f4ff",fontSize:15}}>{it.nom} x{it.qte}</span>
              <span style={{color:"#00d97e",fontSize:15,fontWeight:700}}>{fmt(it.prixVente*it.qte)}</span>
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:12,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:"#f0f4ff",fontWeight:800,fontSize:18}}>TOTAL</span>
          <span style={{color:"#00d97e",fontWeight:800,fontSize:18}}>{fmt(vente.montant)}</span>
        </div>
        {vente.paye<vente.montant&&<div style={{marginTop:10,padding:10,background:"rgba(255,107,107,0.1)",borderRadius:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{color:"#8891aa",fontSize:14}}>Payé:</span>
            <span style={{color:"#00d97e",fontWeight:700,fontSize:14}}>{fmt(vente.paye)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#8891aa",fontSize:14}}>Reste:</span>
            <span style={{color:"#ff6b6b",fontWeight:700,fontSize:14}}>{fmt(vente.montant-vente.paye)}</span>
          </div>
        </div>}
        {vente.numeroCheque&&<div style={{color:"#8891aa",fontSize:14,marginTop:8}}>🏦 Chèque N° {vente.numeroCheque}</div>}
      </div>
      <Btn onClick={print} full>🖨️ Imprimer la facture</Btn>
    </Modal>
  );
};

const Login = ({onLogin,t}) => {
  const [isInscription,setIsInscription]=useState(false);
  const [tel,setTel]=useState(""); const [pwd,setPwd]=useState("");
  const [nom,setNom]=useState(""); const [adr,setAdr]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [tentatives,setTentatives]=useState(0); const [bloque,setBloque]=useState(false);

  const connect = async () => {
    if(!tel||!pwd||bloque) return;
    setLoading(true); setErr("");
    try {
      if(tel===ADMIN_PHONE&&pwd===ADMIN_PASSWORD){onLogin({telephone:tel,role:"admin",nom:"Admin Lapia",id:"admin"});return;}
      if(!navigator.onLine){
        const cached=JSON.parse(localStorage.getItem("pg_known_users")||"[]");
        const found=cached.find(u=>u.telephone===tel);
        if(found){const h=await hashPwd(pwd);if(found.password===h||found.password===pwd){onLogin(found);return;}}
        setErr("Hors ligne — connectez-vous d'abord avec internet");setLoading(false);return;
      }
      const snap=await getDocs(query(collection(db,"users"),where("telephone","==",tel)));
      if(snap.empty){handleEchec();return;}
      const ud={id:snap.docs[0].id,...snap.docs[0].data()};
      const h=await hashPwd(pwd);
      if(ud.password!==h&&ud.password!==pwd){handleEchec();return;}
      onLogin(ud);
    } catch(e){setErr("Erreur de connexion.");setLoading(false);}
  };

  const handleEchec = () => {
    const n=tentatives+1; setTentatives(n);
    if(n>=5){setBloque(true);setErr("❌ Trop de tentatives. Réessayez dans 5 min.");setTimeout(()=>{setBloque(false);setTentatives(0);},300000);}
    else setErr(`${t.motDePasseIncorrect} (${5-n} tentatives)`);
    setLoading(false);
  };

  const inscrire = async () => {
    if(!tel||!pwd||!nom) return;
    setLoading(true); setErr("");
    try {
      const snap=await getDocs(query(collection(db,"users"),where("telephone","==",tel)));
      if(!snap.empty){setErr("Ce numéro est déjà enregistré");setLoading(false);return;}
      let loc=null;
      if(navigator.geolocation){try{const p=await new Promise((r,j)=>navigator.geolocation.getCurrentPosition(r,j,{timeout:5000}));loc={lat:p.coords.latitude,lng:p.coords.longitude};}catch(e){}}
      const hashedPwd=await hashPwd(pwd);
      const fin=new Date(Date.now()+30*24*60*60*1000).toISOString();
      const ref=await addDoc(collection(db,"users"),{telephone:tel,password:hashedPwd,nomBoutique:nom,adresse:adr,role:"proprietaire",localisation:loc,plan:"essai",essaiDebut:new Date().toISOString(),essaiFin:fin,createdAt:serverTimestamp(),actif:true});
      onLogin({id:ref.id,telephone:tel,nomBoutique:nom,adresse:adr,role:"proprietaire",localisation:loc,plan:"essai",essaiFin:fin});
    } catch(e){setErr("Erreur: "+e.message);setLoading(false);}
  };

  const mdpOublie = () => {
    if(!tel){setErr("Entrez d'abord votre numéro de téléphone");return;}
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour David 👋,\nJ'ai oublié mon mot de passe Lapia.\nMon numéro : ${tel}\nMerci de réinitialiser mon mot de passe.`)}`, "_blank");
  };

  return (
    <div style={{minHeight:"100vh",background:"#111520",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Sora',sans-serif"}}>
      <img src="/logo.png" style={{width:72,height:72,borderRadius:20,marginBottom:20,objectFit:"contain"}} alt="Lapia"/>
      <div style={{color:"#f0f4ff",fontWeight:800,fontSize:28,marginBottom:6}}>Lapia</div>
      <div style={{color:"#8891aa",fontSize:16,marginBottom:36}}>{t.connectezVous}</div>
      <div style={{width:"100%",maxWidth:380}}>
        <input type="tel" value={tel} onChange={e=>setTel(e.target.value)} placeholder="+235 XX XX XX XX" style={{...IS,marginBottom:12}}/>
        <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(isInscription?inscrire():connect())} placeholder={t.motDePasse} style={{...IS,marginBottom:12}}/>
        {isInscription&&<>
          <input value={nom} onChange={e=>setNom(e.target.value)} placeholder={`${t.nomBoutique} *`} style={{...IS,marginBottom:12}}/>
          <input value={adr} onChange={e=>setAdr(e.target.value)} placeholder={t.adresse} style={{...IS,marginBottom:12}}/>
          <div style={{background:"rgba(0,217,126,0.08)",border:"1px solid rgba(0,217,126,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:14,color:"#8891aa"}}>
            🎁 <strong style={{color:"#00d97e"}}>30 jours d'essai gratuit</strong> — Aucune carte bancaire requise
          </div>
        </>}
        {err&&<div style={{color:"#ff4757",fontSize:14,marginBottom:12,textAlign:"center",background:"rgba(255,71,87,0.1)",borderRadius:8,padding:"8px 12px"}}>{err}</div>}
        <button onClick={isInscription?inscrire:connect} disabled={loading||bloque}
          style={{width:"100%",background:loading||bloque?"#555":"linear-gradient(135deg,#00d97e,#00b360)",border:"none",borderRadius:12,color:"#fff",padding:16,fontSize:18,fontWeight:700,cursor:loading||bloque?"not-allowed":"pointer",fontFamily:"'Sora',sans-serif",marginBottom:12}}>
          {loading?t.chargement:isInscription?t.creer_compte:t.seConnecter}
        </button>
        {!isInscription&&<button onClick={mdpOublie} style={{width:"100%",background:"none",border:"none",color:"#7b8cff",fontSize:14,cursor:"pointer",fontFamily:"'Sora',sans-serif",marginBottom:8}}>🔐 {t.mdp_oublie}</button>}
        <button onClick={()=>{setIsInscription(!isInscription);setErr("");}} style={{width:"100%",background:"none",border:"none",color:"#00d97e",fontSize:15,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
          {isInscription?t.deja_compte:t.pas_compte}
        </button>
      </div>
    </div>
  );
};

// ── ADMIN DASHBOARD PC ──
// À coller dans App_Firebase.jsx, remplacer le composant AdminDashboard existant

// ── ADMIN DASHBOARD PC v2 — 3 langues FR/EN/AR ──
// Remplace AdminDashboardPC dans App_Firebase.jsx

const AdminDashboardPC = ({user, onLogout, t, langue, setLangue}) => {

  // Traductions Admin
  const TA = {
    fr: {
      titre:"Lapia Admin", superAdmin:"👑 SUPER ADMIN",
      boutique:"Boutique", periode:"Période",
      mensuel:"📅 Mensuel", trimestriel:"📊 Trimestriel", annuel:"📈 Annuel",
      annee:"Année", mois_label:"Mois", trimestre_label:"Trimestre",
      deconnexion:"Déconnexion", imprimer:"🖨️ Imprimer le bilan",
      bilan:"Bilan", select_boutique:"← Sélectionne une boutique dans le menu",
      ca:"Chiffre d'affaires", encaisse:"Encaissé", dettes:"Dettes en cours",
      nb_ventes:"Nombre de ventes", modes:"💳 Modes de paiement",
      cash:"💵 Cash", mobile:"📱 Mobile Money", cheque:"🏦 Chèque", credit:"📋 Crédit",
      du_ca:"du CA", evolution:"📈 Évolution",
      mensuelle:"mensuelle", trimestrielle:"trimestrielle",
      top_produits:"🏆 Top Produits", top_clients:"👥 Meilleurs Clients",
      perf_vendeurs:"🧑‍💼 Performance Vendeurs",
      vendeur:"Vendeur", nb_ventes_col:"Nb Ventes", part_ca:"Part du CA",
      dernieres_ventes:"📋 Dernières ventes de la période",
      aucune_vente:"Aucune vente sur cette période",
      aucun_client:"Aucun client enregistré",
      facture:"Facture", date:"Date", produit:"Produit",
      client:"Client", montant:"Montant", paye:"Payé", mode:"Mode",
      unites:"unités", achats:"achat(s)",
      mois: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
      trimestres: ["T1 (Jan-Mar)","T2 (Avr-Jun)","T3 (Jul-Sep)","T4 (Oct-Déc)"],
      genere_le:"Généré le", periode_label:"Période",
      resume:"💰 Résumé Financier",
    },
    en: {
      titre:"Lapia Admin", superAdmin:"👑 SUPER ADMIN",
      boutique:"Store", periode:"Period",
      mensuel:"📅 Monthly", trimestriel:"📊 Quarterly", annuel:"📈 Annual",
      annee:"Year", mois_label:"Month", trimestre_label:"Quarter",
      deconnexion:"Log out", imprimer:"🖨️ Print report",
      bilan:"Report", select_boutique:"← Select a store from the menu",
      ca:"Revenue", encaisse:"Collected", dettes:"Outstanding debts",
      nb_ventes:"Number of sales", modes:"💳 Payment methods",
      cash:"💵 Cash", mobile:"📱 Mobile Money", cheque:"🏦 Cheque", credit:"📋 Credit",
      du_ca:"of revenue", evolution:"📈 Evolution",
      mensuelle:"monthly", trimestrielle:"quarterly",
      top_produits:"🏆 Top Products", top_clients:"👥 Best Customers",
      perf_vendeurs:"🧑‍💼 Seller Performance",
      vendeur:"Seller", nb_ventes_col:"Sales", part_ca:"Revenue share",
      dernieres_ventes:"📋 Latest sales of the period",
      aucune_vente:"No sales in this period",
      aucun_client:"No registered customers",
      facture:"Invoice", date:"Date", produit:"Product",
      client:"Customer", montant:"Amount", paye:"Paid", mode:"Method",
      unites:"units", achats:"purchase(s)",
      mois: ["January","February","March","April","May","June","July","August","September","October","November","December"],
      trimestres: ["Q1 (Jan-Mar)","Q2 (Apr-Jun)","Q3 (Jul-Sep)","Q4 (Oct-Dec)"],
      genere_le:"Generated on", periode_label:"Period",
      resume:"💰 Financial Summary",
    },
    ar: {
      titre:"Lapia Admin", superAdmin:"👑 مدير عام",
      boutique:"المتجر", periode:"الفترة",
      mensuel:"📅 شهري", trimestriel:"📊 فصلي", annuel:"📈 سنوي",
      annee:"السنة", mois_label:"الشهر", trimestre_label:"الفصل",
      deconnexion:"تسجيل الخروج", imprimer:"🖨️ طباعة التقرير",
      bilan:"تقرير", select_boutique:"← اختر متجراً من القائمة",
      ca:"رقم الأعمال", encaisse:"المحصل", dettes:"الديون الجارية",
      nb_ventes:"عدد المبيعات", modes:"💳 طرق الدفع",
      cash:"💵 نقداً", mobile:"📱 موبايل موني", cheque:"🏦 شيك", credit:"📋 دين",
      du_ca:"من رقم الأعمال", evolution:"📈 التطور",
      mensuelle:"الشهري", trimestrielle:"الفصلي",
      top_produits:"🏆 أفضل المنتجات", top_clients:"👥 أفضل العملاء",
      perf_vendeurs:"🧑‍💼 أداء البائعين",
      vendeur:"البائع", nb_ventes_col:"المبيعات", part_ca:"حصة رقم الأعمال",
      dernieres_ventes:"📋 آخر مبيعات الفترة",
      aucune_vente:"لا توجد مبيعات في هذه الفترة",
      aucun_client:"لا يوجد عملاء مسجلون",
      facture:"فاتورة", date:"التاريخ", produit:"المنتج",
      client:"العميل", montant:"المبلغ", paye:"المدفوع", mode:"الطريقة",
      unites:"وحدات", achats:"شراء",
      mois: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
      trimestres: ["ف1 (يناير-مارس)","ف2 (أبريل-يونيو)","ف3 (يوليو-سبتمبر)","ف4 (أكتوبر-ديسمبر)"],
      genere_le:"تم الإنشاء في", periode_label:"الفترة",
      resume:"💰 ملخص مالي",
    }
  };

  const ta = TA[langue] || TA.fr;
  const isRTL = langue === "ar";

  const [boutiques, setBoutiques] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoutique, setSelectedBoutique] = useState(null);
  const [periodType, setPeriodType] = useState("mensuel");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth()/3));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    (async () => {
      try {
        const [us, vs] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "ventes"))
        ]);
        const b = us.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role==="proprietaire");
        const v = vs.docs.map(d=>({id:d.id,...d.data()}));
        setBoutiques(b);
        setVentes(v);
        if (b.length > 0) setSelectedBoutique(b[0]);
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const getVentesBoutique = () => selectedBoutique ? ventes.filter(v => v.boutiqueId === selectedBoutique.id) : [];

  const getVentesPeriode = () => {
    const vb = getVentesBoutique();
    if (periodType === "mensuel") {
      return vb.filter(v => { const d=getDate(v); return d.getMonth()===selectedMonth && d.getFullYear()===selectedYear; });
    } else if (periodType === "trimestriel") {
      const debut = selectedQuarter * 3;
      return vb.filter(v => { const d=getDate(v); return d.getMonth()>=debut && d.getMonth()<debut+3 && d.getFullYear()===selectedYear; });
    } else {
      return vb.filter(v => getDate(v).getFullYear()===selectedYear);
    }
  };

  const calcStats = (vs) => ({
    ca: vs.reduce((s,v)=>s+(v.montant||0),0),
    enc: vs.reduce((s,v)=>s+(v.paye||0),0),
    det: vs.reduce((s,v)=>s+((v.montant||0)-(v.paye||0)),0),
    nb: vs.length,
    cash: vs.filter(v=>v.mode==="cash").reduce((s,v)=>s+(v.paye||0),0),
    mobile: vs.filter(v=>v.mode==="mobile").reduce((s,v)=>s+(v.paye||0),0),
    cheque: vs.filter(v=>v.mode==="cheque").reduce((s,v)=>s+(v.paye||0),0),
    credit: vs.filter(v=>v.mode==="credit").reduce((s,v)=>s+(v.montant||0),0),
  });

  const getDataMensuelle = () => {
    const vb = getVentesBoutique();
    return ta.mois.map((m, i) => {
      const vm = vb.filter(v => { const d=getDate(v); return d.getMonth()===i && d.getFullYear()===selectedYear; });
      return { mois:m.substring(0,3), ca:vm.reduce((s,v)=>s+(v.montant||0),0), encaisse:vm.reduce((s,v)=>s+(v.paye||0),0), nb:vm.length };
    });
  };

  const getDataTrimestrielle = () => {
    const vb = getVentesBoutique();
    return [0,1,2,3].map(i => {
      const debut = i * 3;
      const vm = vb.filter(v => { const d=getDate(v); return d.getMonth()>=debut && d.getMonth()<debut+3 && d.getFullYear()===selectedYear; });
      return { trimestre:`T${i+1}`, ca:vm.reduce((s,v)=>s+(v.montant||0),0), encaisse:vm.reduce((s,v)=>s+(v.paye||0),0), nb:vm.length };
    });
  };

  const vp = getVentesPeriode();
  const stats = calcStats(vp);
  const dataMensuelle = getDataMensuelle();
  const dataTrimestrielle = getDataTrimestrielle();

  const pm = {}; vp.forEach(v=>{ pm[v.produit]=(pm[v.produit]||0)+(v.quantite||0); });
  const topProduits = Object.entries(pm).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const cm = {}; vp.forEach(v=>{ if(v.clientNom){ const k=v.clientId||v.clientNom; if(!cm[k])cm[k]={nom:v.clientNom,tel:v.clientTel||"",total:0,nb:0}; cm[k].total+=v.montant||0; cm[k].nb+=1; } });
  const topClients = Object.values(cm).sort((a,b)=>b.total-a.total).slice(0,5);

  const vm2 = {}; vp.forEach(v=>{ if(v.vendeurId){ if(!vm2[v.vendeurId])vm2[v.vendeurId]={nom:v.vendeurNom||"Vendeur",nb:0,ca:0}; vm2[v.vendeurId].nb+=1; vm2[v.vendeurId].ca+=v.montant||0; } });
  const vendeurs = Object.values(vm2).sort((a,b)=>b.ca-a.ca);

  const getPeriodeLabel = () => {
    if(periodType==="mensuel") return `${ta.mois[selectedMonth]} ${selectedYear}`;
    if(periodType==="trimestriel") return `${ta.trimestres[selectedQuarter]} ${selectedYear}`;
    return `${ta.annee} ${selectedYear}`;
  };

  const imprimer = () => {
    const w = window.open("","_blank");
    const boutNom = selectedBoutique?.nomBoutique || "Boutique";
    const periode = getPeriodeLabel();
    w.document.write(`<!DOCTYPE html><html dir="${isRTL?'rtl':'ltr'}"><head><title>${ta.bilan} ${boutNom} — ${periode}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:800px;margin:0 auto;direction:${isRTL?'rtl':'ltr'}}
      h1{color:#00a85f;border-bottom:3px solid #00a85f;padding-bottom:10px}
      h2{color:#555;margin-top:30px;border-left:4px solid #00a85f;padding-left:10px}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0}
      .card{background:#f9f9f9;border:1px solid #ddd;border-radius:8px;padding:15px;text-align:center}
      .card-val{font-size:22px;font-weight:800;color:#00a85f;margin:8px 0}
      .card-label{font-size:12px;color:#888;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;margin-top:15px}
      th{background:#00a85f;color:white;padding:10px;text-align:left;font-size:13px}
      td{padding:10px;border-bottom:1px solid #eee;font-size:13px}
      tr:nth-child(even){background:#f9f9f9}
      .footer{margin-top:40px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:20px}
    </style></head><body>
    <h1>📊 ${ta.bilan} — ${boutNom}</h1>
    <p style="color:#666">${ta.periode_label} : <strong>${periode}</strong> | ${ta.genere_le} : <strong>${new Date().toLocaleDateString("fr-FR")}</strong></p>
    <h2>${ta.resume}</h2>
    <div class="grid">
      <div class="card"><div class="card-label">${ta.ca}</div><div class="card-val">${fmt(stats.ca)}</div></div>
      <div class="card"><div class="card-label">${ta.encaisse}</div><div class="card-val" style="color:#00a85f">${fmt(stats.enc)}</div></div>
      <div class="card"><div class="card-label">${ta.dettes}</div><div class="card-val" style="color:#e53935">${fmt(stats.det)}</div></div>
      <div class="card"><div class="card-label">${ta.nb_ventes}</div><div class="card-val" style="color:#1565c0">${stats.nb}</div></div>
    </div>
    <h2>${ta.modes}</h2>
    <div class="grid">
      <div class="card"><div class="card-label">${ta.cash}</div><div class="card-val">${fmt(stats.cash)}</div></div>
      <div class="card"><div class="card-label">${ta.mobile}</div><div class="card-val">${fmt(stats.mobile)}</div></div>
      <div class="card"><div class="card-label">${ta.cheque}</div><div class="card-val">${fmt(stats.cheque)}</div></div>
      <div class="card"><div class="card-label">${ta.credit}</div><div class="card-val" style="color:#e53935">${fmt(stats.credit)}</div></div>
    </div>
    ${topProduits.length>0?`<h2>${ta.top_produits}</h2><table><tr><th>#</th><th>${ta.produit}</th><th>${ta.unites}</th></tr>${topProduits.map(([n,q],i)=>`<tr><td>${i+1}</td><td>${n}</td><td>${q}</td></tr>`).join("")}</table>`:""}
    ${topClients.length>0?`<h2>${ta.top_clients}</h2><table><tr><th>#</th><th>${ta.client}</th><th>📞</th><th>${ta.achats}</th><th>${ta.montant}</th></tr>${topClients.map((c,i)=>`<tr><td>${i+1}</td><td>${c.nom}</td><td>${c.tel||"-"}</td><td>${c.nb}</td><td>${fmt(c.total)}</td></tr>`).join("")}</table>`:""}
    ${vendeurs.length>0?`<h2>${ta.perf_vendeurs}</h2><table><tr><th>${ta.vendeur}</th><th>${ta.nb_ventes_col}</th><th>${ta.ca}</th></tr>${vendeurs.map(v=>`<tr><td>${v.nom}</td><td>${v.nb}</td><td>${fmt(v.ca)}</td></tr>`).join("")}</table>`:""}
    <div class="footer">Lapia — lapiagest.vercel.app</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  if(loading) return <div style={{minHeight:"100vh",background:"#111520",display:"flex",alignItems:"center",justifyContent:"center",color:"#f0f4ff",fontSize:18,fontFamily:"'Sora',sans-serif"}}>{t.chargement}</div>;

  const SIDEBAR_W = 260;

  return (
    <div style={{minHeight:"100vh",background:"#111520",fontFamily:"'Sora',sans-serif",display:"flex",direction:isRTL?"rtl":"ltr"}}>

      {/* SIDEBAR */}
      <div style={{width:SIDEBAR_W,background:"#1a1f2e",borderRight:isRTL?"none":"1px solid rgba(255,255,255,0.06)",borderLeft:isRTL?"1px solid rgba(255,255,255,0.06)":"none",display:"flex",flexDirection:"column",position:"fixed",[isRTL?"right":"left"]:0,top:0,bottom:0,padding:"20px 0",zIndex:100}}>
        <div style={{padding:"0 20px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#00d97e,#00b360)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#fff",fontSize:18}}>L</div>
            <div>
              <div style={{color:"#f0f4ff",fontWeight:800,fontSize:17}}>{ta.titre}</div>
              <div style={{color:"#00d97e",fontSize:11,fontWeight:700}}>{ta.superAdmin}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {["fr","en","ar"].map(l=><button key={l} onClick={()=>{setLangue(l);localStorage.setItem("primogest_langue",l);}} style={{background:langue===l?"#00d97e":"#252b3b",border:"none",borderRadius:4,padding:"3px 8px",color:langue===l?"#fff":"#8891aa",fontSize:11,fontWeight:700,cursor:"pointer"}}>{l.toUpperCase()}</button>)}
          </div>
        </div>

        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{color:"#8891aa",fontSize:11,fontWeight:600,textTransform:"uppercase",marginBottom:10}}>{ta.boutique}</div>
          {boutiques.map(b=>(
            <button key={b.id} onClick={()=>setSelectedBoutique(b)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:selectedBoutique?.id===b.id?"rgba(0,217,126,0.1)":"transparent",cursor:"pointer",width:"100%",textAlign:"left",marginBottom:4}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:selectedBoutique?.id===b.id?"#00d97e":"#555",flexShrink:0}}/>
              <div>
                <div style={{color:selectedBoutique?.id===b.id?"#00d97e":"#f0f4ff",fontWeight:600,fontSize:13}}>{b.nomBoutique}</div>
                <div style={{color:"#8891aa",fontSize:11}}>📞 {b.telephone}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{padding:"16px 20px",flex:1,overflowY:"auto"}}>
          <div style={{color:"#8891aa",fontSize:11,fontWeight:600,textTransform:"uppercase",marginBottom:10}}>{ta.periode}</div>
          {[{val:"mensuel",label:ta.mensuel},{val:"trimestriel",label:ta.trimestriel},{val:"annuel",label:ta.annuel}].map(p=>(
            <button key={p.val} onClick={()=>setPeriodType(p.val)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:periodType===p.val?"rgba(123,140,255,0.1)":"transparent",cursor:"pointer",width:"100%",textAlign:"left",marginBottom:4}}>
              <span style={{color:periodType===p.val?"#7b8cff":"#8891aa",fontWeight:600,fontSize:14,fontFamily:"'Sora',sans-serif"}}>{p.label}</span>
            </button>
          ))}
          <div style={{marginTop:16}}>
            <div style={{color:"#8891aa",fontSize:11,fontWeight:600,textTransform:"uppercase",marginBottom:8}}>{ta.annee}</div>
            <select value={selectedYear} onChange={e=>setSelectedYear(+e.target.value)} style={{...IS,fontSize:14}}>
              {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {periodType==="mensuel"&&<div style={{marginTop:12}}>
            <div style={{color:"#8891aa",fontSize:11,fontWeight:600,textTransform:"uppercase",marginBottom:8}}>{ta.mois_label}</div>
            <select value={selectedMonth} onChange={e=>setSelectedMonth(+e.target.value)} style={{...IS,fontSize:14}}>
              {ta.mois.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>
          </div>}
          {periodType==="trimestriel"&&<div style={{marginTop:12}}>
            <div style={{color:"#8891aa",fontSize:11,fontWeight:600,textTransform:"uppercase",marginBottom:8}}>{ta.trimestre_label}</div>
            <select value={selectedQuarter} onChange={e=>setSelectedQuarter(+e.target.value)} style={{...IS,fontSize:14}}>
              {ta.trimestres.map((tr,i)=><option key={i} value={i}>{tr}</option>)}
            </select>
          </div>}
        </div>

        <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <button onClick={onLogout} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:8,padding:"10px",color:"#ff6b6b",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",width:"100%"}}>
            <Icon name="logout" size={16} color="#ff6b6b"/> {ta.deconnexion}
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{marginLeft:isRTL?0:SIDEBAR_W,marginRight:isRTL?SIDEBAR_W:0,flex:1,padding:"30px",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:30}}>
          <div>
            <h1 style={{margin:0,color:"#f0f4ff",fontSize:26,fontWeight:800}}>{selectedBoutique?.nomBoutique||""}</h1>
            <div style={{color:"#8891aa",fontSize:15,marginTop:4}}>📊 {ta.bilan} — {getPeriodeLabel()}</div>
            {selectedBoutique&&<div style={{color:"#8891aa",fontSize:13,marginTop:2}}>📞 {selectedBoutique.telephone}{selectedBoutique.adresse?` | 📍 ${selectedBoutique.adresse}`:""}</div>}
          </div>
          <button onClick={imprimer}
            style={{background:"linear-gradient(135deg,#00d97e,#00b360)",border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,217,126,0.3)"}}>
            {ta.imprimer}
          </button>
        </div>

        {!selectedBoutique ? (
          <div style={{textAlign:"center",padding:80,color:"#8891aa",fontSize:18}}>{ta.select_boutique}</div>
        ) : (
          <>
            {/* STATS */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              {[
                {label:ta.ca,value:fmt(stats.ca),color:"#f0f4ff",bg:"rgba(255,255,255,0.05)"},
                {label:ta.encaisse,value:fmt(stats.enc),color:"#00d97e",bg:"rgba(0,217,126,0.1)"},
                {label:ta.dettes,value:fmt(stats.det),color:"#ff6b6b",bg:"rgba(255,107,107,0.1)"},
                {label:ta.nb_ventes,value:stats.nb,color:"#7b8cff",bg:"rgba(123,140,255,0.1)"},
              ].map(c=>(
                <div key={c.label} style={{background:c.bg,border:`1px solid ${c.color}22`,borderRadius:16,padding:20}}>
                  <div style={{color:"#8891aa",fontSize:12,fontWeight:600,textTransform:"uppercase",marginBottom:8}}>{c.label}</div>
                  <div style={{color:c.color,fontWeight:800,fontSize:22}}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* MODES PAIEMENT */}
            <div style={{background:"#1a1f2e",borderRadius:16,padding:20,marginBottom:24}}>
              <div style={{color:"#f0f4ff",fontWeight:700,fontSize:17,marginBottom:16}}>{ta.modes}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[
                  {label:ta.cash,value:stats.cash,color:"#00d97e"},
                  {label:ta.mobile,value:stats.mobile,color:"#7b8cff"},
                  {label:ta.cheque,value:stats.cheque,color:"#ffd93d"},
                  {label:ta.credit,value:stats.credit,color:"#ff6b6b"},
                ].map(m=>(
                  <div key={m.label} style={{background:"#252b3b",borderRadius:12,padding:16,textAlign:"center"}}>
                    <div style={{color:"#8891aa",fontSize:13,marginBottom:8}}>{m.label}</div>
                    <div style={{color:m.color,fontWeight:800,fontSize:18}}>{fmt(m.value)}</div>
                    <div style={{color:"#8891aa",fontSize:11,marginTop:4}}>{stats.ca>0?Math.round((m.value/stats.ca)*100):0}% {ta.du_ca}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* GRAPHIQUE */}
            <div style={{background:"#1a1f2e",borderRadius:16,padding:20,marginBottom:24}}>
              <div style={{color:"#f0f4ff",fontWeight:700,fontSize:17,marginBottom:16}}>
                {ta.evolution} {periodType==="annuel"?ta.mensuelle:periodType==="trimestriel"?ta.trimestrielle:""} {selectedYear}
              </div>
              <div style={{overflowX:"auto"}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:8,minWidth:600,height:200,padding:"0 10px"}}>
                  {(periodType==="trimestriel"?dataTrimestrielle:dataMensuelle).map((d,i)=>{
                    const maxCA=Math.max(...(periodType==="trimestriel"?dataTrimestrielle:dataMensuelle).map(x=>x.ca),1);
                    const hCA=Math.round((d.ca/maxCA)*160);
                    const hEnc=Math.round((d.encaisse/maxCA)*160);
                    const isActive=(periodType==="mensuel"&&i===selectedMonth)||(periodType==="trimestriel"&&i===selectedQuarter);
                    return(
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div style={{fontSize:10,color:"#00d97e",fontWeight:700}}>{d.ca>0?`${Math.round(d.ca/1000)}k`:""}</div>
                        <div style={{display:"flex",gap:2,alignItems:"flex-end",height:160}}>
                          <div style={{width:14,height:hCA||2,background:isActive?"#00d97e":"#2a3a4a",borderRadius:"3px 3px 0 0"}}/>
                          <div style={{width:14,height:hEnc||2,background:isActive?"rgba(0,217,126,0.4)":"rgba(123,140,255,0.4)",borderRadius:"3px 3px 0 0"}}/>
                        </div>
                        <div style={{fontSize:10,color:isActive?"#00d97e":"#8891aa",fontWeight:isActive?700:400}}>{d.mois||d.trimestre}</div>
                        <div style={{fontSize:9,color:"#8891aa"}}>{d.nb}v</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:20,marginTop:12,justifyContent:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:14,height:14,background:"#2a3a4a",borderRadius:3}}/><span style={{color:"#8891aa",fontSize:12}}>{ta.ca}</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:14,height:14,background:"rgba(123,140,255,0.4)",borderRadius:3}}/><span style={{color:"#8891aa",fontSize:12}}>{ta.encaisse}</span></div>
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
              {/* TOP PRODUITS */}
              <div style={{background:"#1a1f2e",borderRadius:16,padding:20}}>
                <div style={{color:"#f0f4ff",fontWeight:700,fontSize:17,marginBottom:16}}>{ta.top_produits}</div>
                {topProduits.length===0
                  ?<div style={{color:"#8891aa",fontSize:14,textAlign:"center",padding:20}}>{ta.aucune_vente}</div>
                  :topProduits.map(([n,q],i)=>(
                  <div key={n} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{color:"#f0f4ff",fontSize:14,fontWeight:600}}>#{i+1} {n}</span>
                      <span style={{color:"#8891aa",fontSize:13}}>{q} {ta.unites}</span>
                    </div>
                    <div style={{height:6,background:"#252b3b",borderRadius:99}}>
                      <div style={{height:"100%",width:`${(q/topProduits[0][1])*100}%`,background:["#00d97e","#7b8cff","#ffd93d","#ff9f43","#ff6b6b"][i],borderRadius:99}}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* TOP CLIENTS */}
              <div style={{background:"#1a1f2e",borderRadius:16,padding:20}}>
                <div style={{color:"#f0f4ff",fontWeight:700,fontSize:17,marginBottom:16}}>{ta.top_clients}</div>
                {topClients.length===0
                  ?<div style={{color:"#8891aa",fontSize:14,textAlign:"center",padding:20}}>{ta.aucun_client}</div>
                  :topClients.map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:`${["#ffd93d","#8891aa","#ff9f43","#7b8cff","#00d97e"][i]}22`,display:"flex",alignItems:"center",justifyContent:"center",color:["#ffd93d","#8891aa","#ff9f43","#7b8cff","#00d97e"][i],fontWeight:800,fontSize:13}}>#{i+1}</div>
                      <div>
                        <div style={{color:"#f0f4ff",fontSize:14,fontWeight:600}}>{c.nom}</div>
                        {c.tel&&<div style={{color:"#8891aa",fontSize:12}}>📞 {c.tel}</div>}
                        <div style={{color:"#8891aa",fontSize:12}}>{c.nb} {ta.achats}</div>
                      </div>
                    </div>
                    <div style={{color:"#00d97e",fontWeight:800,fontSize:15}}>{fmt(c.total)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* VENDEURS */}
            {vendeurs.length>0&&<div style={{background:"#1a1f2e",borderRadius:16,padding:20,marginBottom:24}}>
              <div style={{color:"#f0f4ff",fontWeight:700,fontSize:17,marginBottom:16}}>{ta.perf_vendeurs}</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                    {[ta.vendeur,ta.nb_ventes_col,ta.ca,ta.part_ca].map(h=>(
                      <th key={h} style={{color:"#8891aa",fontSize:13,fontWeight:600,textAlign:"left",padding:"8px 12px",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendeurs.map((v,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                      <td style={{color:"#f0f4ff",fontSize:14,fontWeight:600,padding:"12px"}}>{v.nom}</td>
                      <td style={{color:"#7b8cff",fontSize:14,padding:"12px"}}>{v.nb}</td>
                      <td style={{color:"#00d97e",fontSize:14,fontWeight:700,padding:"12px"}}>{fmt(v.ca)}</td>
                      <td style={{padding:"12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,height:6,background:"#252b3b",borderRadius:99}}>
                            <div style={{height:"100%",width:`${stats.ca>0?Math.round((v.ca/stats.ca)*100):0}%`,background:"#00d97e",borderRadius:99}}/>
                          </div>
                          <span style={{color:"#8891aa",fontSize:12,minWidth:35}}>{stats.ca>0?Math.round((v.ca/stats.ca)*100):0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}

            {/* DERNIÈRES VENTES */}
            <div style={{background:"#1a1f2e",borderRadius:16,padding:20}}>
              <div style={{color:"#f0f4ff",fontWeight:700,fontSize:17,marginBottom:16}}>{ta.dernieres_ventes} ({vp.length})</div>
              {vp.length===0
                ?<div style={{color:"#8891aa",fontSize:14,textAlign:"center",padding:20}}>{ta.aucune_vente}</div>
                :<div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                        {[ta.facture,ta.date,ta.produit,ta.client,ta.vendeur,ta.montant,ta.paye,ta.mode].map(h=>(
                          <th key={h} style={{color:"#8891aa",fontSize:12,fontWeight:600,textAlign:"left",padding:"8px 12px",textTransform:"uppercase"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vp.slice(-20).reverse().map((v,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                          <td style={{color:"#7b8cff",fontSize:12,padding:"10px 12px"}}>{v.factureId}</td>
                          <td style={{color:"#8891aa",fontSize:12,padding:"10px 12px"}}>{fmtDate(getDate(v))}</td>
                          <td style={{color:"#f0f4ff",fontSize:13,fontWeight:600,padding:"10px 12px"}}>{v.produit}</td>
                          <td style={{color:"#ff9f43",fontSize:12,padding:"10px 12px"}}>{v.clientNom||"-"}</td>
                          <td style={{color:"#7b8cff",fontSize:12,padding:"10px 12px"}}>{v.vendeurNom||"-"}</td>
                          <td style={{color:"#f0f4ff",fontSize:13,fontWeight:700,padding:"10px 12px"}}>{fmt(v.montant)}</td>
                          <td style={{color:v.paye>=v.montant?"#00d97e":"#ff9f43",fontSize:13,fontWeight:700,padding:"10px 12px"}}>{fmt(v.paye)}</td>
                          <td style={{padding:"10px 12px"}}>
                            <span style={{background:v.mode==="cash"?"rgba(0,217,126,0.15)":v.mode==="mobile"?"rgba(123,140,255,0.15)":v.mode==="cheque"?"rgba(255,217,61,0.15)":"rgba(255,107,107,0.15)",color:v.mode==="cash"?"#00d97e":v.mode==="mobile"?"#7b8cff":v.mode==="cheque"?"#ffd93d":"#ff6b6b",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>
                              {v.mode==="cash"?ta.cash:v.mode==="mobile"?ta.mobile:v.mode==="cheque"?ta.cheque:ta.credit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AppBoutique = ({user,onLogout,t,langue,setLangue}) => {
  const [isPC,setIsPC]=useState(window.innerWidth>=900);
  useEffect(()=>{const h=()=>setIsPC(window.innerWidth>=900);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const [page,setPage]=useState(user.role==="vendeur"?"ventes":"dashboard");
  const [produits,setProduits]=useState([]);
  const [ventes,setVentes]=useState([]);
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);
  const [isOnline,setIsOnline]=useState(navigator.onLine);
  const [syncing,setSyncing]=useState(false);
  const [notif,setNotif]=useState(0);
  const [showFacture,setShowFacture]=useState(null);
  const [showVendeurs,setShowVendeurs]=useState(false);
  const [showChangePwd,setShowChangePwd]=useState(false);
  const [nv,setNv]=useState({nom:"",telephone:"",password:""});
  const [oldPwd,setOldPwd]=useState(""); const [newPwd,setNewPwd]=useState(""); const [pwdMsg,setPwdMsg]=useState("");

  const bid=user.boutiqueId||user.id;
  const isProp=user.role==="proprietaire";
  const boutique={nom:user.nomBoutique||"Ma Boutique",adresse:user.adresse||""};
  const plan=user.plan||"essai";
  const lim=PLANS[plan]||PLANS.essai;
  const essaiFin=user.essaiFin?new Date(user.essaiFin):new Date(Date.now()+30*24*60*60*1000);
  const expire=plan==="essai"&&new Date()>essaiFin;
  const jr=Math.max(0,Math.ceil((essaiFin-new Date())/(1000*60*60*24)));
  const KP=`pg_produits_${bid}`,KV=`pg_ventes_${bid}`,KC=`pg_clients_${bid}`;

  useEffect(()=>{const on=()=>{setIsOnline(true);sync();};const off=()=>setIsOnline(false);window.addEventListener("online",on);window.addEventListener("offline",off);return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};},[]);

  const sync=async()=>{setSyncing(true);try{const lv=JSON.parse(localStorage.getItem(KV)||"[]");const ns=lv.filter(v=>!v.synced);for(const v of ns){const{id,synced,...d}=v;await addDoc(collection(db,"ventes"),{...d,boutiqueId:bid,createdAt:serverTimestamp()});}if(ns.length>0){localStorage.setItem(KV,JSON.stringify(lv.map(v=>({...v,synced:true}))));await loadFB();}}catch(e){console.error(e);}setSyncing(false);};

  const loadFB=async()=>{try{const [ps,vs,cs]=await Promise.all([getDocs(query(collection(db,"produits"),where("boutiqueId","==",bid))),getDocs(query(collection(db,"ventes"),where("boutiqueId","==",bid))),getDocs(query(collection(db,"clients"),where("boutiqueId","==",bid)))]);const p=ps.docs.map(d=>({id:d.id,...d.data()}));const v=vs.docs.map(d=>({id:d.id,...d.data()}));const c=cs.docs.map(d=>({id:d.id,...d.data()}));setProduits(p);setVentes(v);setClients(c);localStorage.setItem(KP,JSON.stringify(p));localStorage.setItem(KV,JSON.stringify(v.map(x=>({...x,synced:true}))));localStorage.setItem(KC,JSON.stringify(c));}catch(e){console.error(e);}};

  useEffect(()=>{(async()=>{setProduits(JSON.parse(localStorage.getItem(KP)||"[]"));setVentes(JSON.parse(localStorage.getItem(KV)||"[]"));setClients(JSON.parse(localStorage.getItem(KC)||"[]"));setLoading(false);if(navigator.onLine)await loadFB();})();},[bid]);
  useEffect(()=>setNotif(produits.filter(p=>!p.deleted&&p.quantite<=p.alerte).length),[produits]);

  if(expire)return<EssaiExpire user={user} onLogout={onLogout}/>;

  const saveProduit=async(prod)=>{const{id,...d}=prod;if(!id&&produits.filter(p=>!p.deleted).length>=lim.produits){alert(`⚠️ Maximum ${lim.produits} produits avec le plan Essai.`);return;}if(isOnline){try{if(id&&id.length>5){await updateDoc(doc(db,"produits",id),{...prod,boutiqueId:bid});const up=produits.map(p=>p.id===id?prod:p);setProduits(up);localStorage.setItem(KP,JSON.stringify(up));}else{const r=await addDoc(collection(db,"produits"),{...d,boutiqueId:bid,createdAt:serverTimestamp()});const np={...prod,id:r.id};const up=[...produits,np];setProduits(up);localStorage.setItem(KP,JSON.stringify(up));}}catch(e){alert("Erreur: "+e.message);}}else{const np={...prod,id:id||Date.now().toString()};const up=id?produits.map(p=>p.id===id?np:p):[...produits,np];setProduits(up);localStorage.setItem(KP,JSON.stringify(up));}};

  const delProduit=async(id)=>{if(!window.confirm("Supprimer ?"))return;const up=produits.filter(p=>p.id!==id);setProduits(up);localStorage.setItem(KP,JSON.stringify(up));if(isOnline&&id.length>5)try{await updateDoc(doc(db,"produits",id),{deleted:true});}catch(e){}};

  const saveVente=async(vd)=>{if(lim.ventes!==Infinity){const dm=new Date();dm.setDate(1);dm.setHours(0,0,0,0);const vm=ventes.filter(v=>getDate(v)>=dm).length;if(vm>=lim.ventes){alert(`⚠️ Maximum ${lim.ventes} ventes/mois avec le plan Essai.`);return null;}}const fid=genId();const nvi={...vd,boutiqueId:bid,factureId:fid,date:new Date().toISOString(),vendeurId:user.id,vendeurNom:user.nom||"",vendeurTel:user.telephone||"",clientNom:vd.clientNom||"",clientTel:vd.clientTel||"",synced:false};const upP=produits.map(p=>{const it=(vd.items||[]).find(x=>x.id===p.id);return it?{...p,quantite:p.quantite-it.qte}:p;});setProduits(upP);localStorage.setItem(KP,JSON.stringify(upP));const nv2={...nvi,id:Date.now().toString()};const upV=[...ventes,nv2];setVentes(upV);localStorage.setItem(KV,JSON.stringify(upV));if(isOnline){try{const{id:_i,synced:_s,...data}=nv2;const r=await addDoc(collection(db,"ventes"),{...data,createdAt:serverTimestamp()});const sv=upV.map(v=>v.id===nv2.id?{...v,id:r.id,synced:true}:v);setVentes(sv);localStorage.setItem(KV,JSON.stringify(sv));for(const it of vd.items||[]){const p=produits.find(p=>p.id===it.id);if(p&&p.id.length>5)try{await updateDoc(doc(db,"produits",p.id),{quantite:p.quantite-it.qte});}catch(e){}}return{...nv2,id:r.id};}catch(e){console.error(e);}}return nv2;};

  const saveClient=async(c)=>{const{id,...d}=c;if(isOnline){try{if(id&&id.length>5){await updateDoc(doc(db,"clients",id),{...c,boutiqueId:bid});const up=clients.map(x=>x.id===id?c:x);setClients(up);localStorage.setItem(KC,JSON.stringify(up));}else{const r=await addDoc(collection(db,"clients"),{...d,boutiqueId:bid,dette:c.dette||0,createdAt:serverTimestamp()});const nc={...c,id:r.id};const up=[...clients,nc];setClients(up);localStorage.setItem(KC,JSON.stringify(up));return r.id;}}catch(e){console.error(e);}}else{const nc={...c,id:id||Date.now().toString()};const up=id?clients.map(x=>x.id===id?nc:x):[...clients,nc];setClients(up);localStorage.setItem(KC,JSON.stringify(up));return nc.id;}};

  const addVendeur=async()=>{if(!nv.nom||!nv.telephone||!nv.password)return;if(!lim.vendeurs){alert("⚠️ Les vendeurs sont disponibles en plan Pro.");setShowVendeurs(false);return;}try{const h=await hashPwd(nv.password);await addDoc(collection(db,"users"),{...nv,password:h,role:"vendeur",boutiqueId:bid,nomBoutique:boutique.nom,actif:true,createdAt:serverTimestamp()});setNv({nom:"",telephone:"",password:""});setShowVendeurs(false);alert("✅ Vendeur créé !");}catch(e){alert("Erreur: "+e.message);}};

  const changerMdp=async()=>{if(!oldPwd||!newPwd)return;setPwdMsg("");try{const snap=await getDocs(query(collection(db,"users"),where("telephone","==",user.telephone)));if(snap.empty){setPwdMsg("❌ Compte introuvable");return;}const ud=snap.docs[0].data();const oldHash=await hashPwd(oldPwd);if(ud.password!==oldHash&&ud.password!==oldPwd){setPwdMsg("❌ Ancien mot de passe incorrect");return;}const newHash=await hashPwd(newPwd);await updateDoc(doc(db,"users",snap.docs[0].id),{password:newHash});setPwdMsg("✅ Mot de passe changé avec succès !");setTimeout(()=>{setShowChangePwd(false);setOldPwd("");setNewPwd("");setPwdMsg("");},2000);}catch(e){setPwdMsg("❌ Erreur: "+e.message);}};

  if(loading)return(<div style={{minHeight:"100vh",background:"#111520",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif"}}><div style={{fontSize:40,marginBottom:16}}>{isOnline?"⏳":"📡"}</div><div style={{color:"#f0f4ff",fontWeight:700,fontSize:20,marginBottom:8}}>{isOnline?t.chargement:t.offline}</div>{!isOnline&&<div style={{color:"#8891aa",fontSize:16,textAlign:"center",padding:"0 20px"}}>{t.premiere_connexion}</div>}</div>);

  const pages=isProp?[{id:"dashboard",label:t.accueil,icon:"dashboard"},{id:"stock",label:t.stock,icon:"stock"},{id:"ventes",label:t.vendre,icon:"vente"},{id:"dettes",label:t.dettes,icon:"dette"},{id:"rapports",label:t.rapports,icon:"rapport"}]:[{id:"ventes",label:t.vendre,icon:"vente"},{id:"dashboard",label:t.accueil,icon:"dashboard"}];
  const planInfo=PLANS[plan]||PLANS.essai;
  const nbProduits=produits.filter(p=>!p.deleted).length;

  return(
    <div style={{maxWidth:isPC?"100%":"480px",margin:"0 auto",minHeight:"100vh",background:"#111520",fontFamily:"'Sora',sans-serif",direction:langue==="ar"?"rtl":"ltr",display:isPC?"flex":"block"}}>

      {/* HEADER MOBILE */}
      <div style={{background:"#1a1f2e",padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:isPC?"none":"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00d97e,#00b360)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#fff",fontSize:15}}>L</div>
          <div>
            <div style={{color:"#f0f4ff",fontWeight:800,fontSize:16}}>{boutique.nom}</div>
            <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
              <span style={{color:"#8891aa",fontSize:11}}>{isProp?t.role_proprietaire:`${t.role_vendeur}: ${user.nom||user.telephone}`}</span>
              {isProp&&<span style={{background:`${planInfo.color}22`,border:`1px solid ${planInfo.color}44`,color:planInfo.color,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{planInfo.label}</span>}
              {isProp&&plan==="essai"&&jr<=7&&jr>0&&<span style={{background:"rgba(255,159,67,0.15)",border:"1px solid rgba(255,159,67,0.3)",color:"#ff9f43",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>⏰{jr}j</span>}
            </div>
            <div style={{display:"flex",gap:3,marginTop:2}}>
              {["fr","en","ar"].map(l=><button key={l} onClick={()=>{setLangue(l);localStorage.setItem("lapia_langue",l);}} style={{background:langue===l?"#00d97e":"#252b3b",border:"none",borderRadius:4,padding:"2px 6px",color:langue===l?"#fff":"#8891aa",fontSize:10,fontWeight:700,cursor:"pointer"}}>{l.toUpperCase()}</button>)}
              <div style={{background:isOnline?"rgba(0,217,126,0.15)":"rgba(255,71,87,0.15)",border:`1px solid ${isOnline?"#00d97e":"#ff4757"}44`,borderRadius:4,padding:"2px 6px",color:isOnline?"#00d97e":"#ff4757",fontSize:10,fontWeight:700,marginLeft:2}}>
                {syncing?t.sync_en_cours:isOnline?t.online:t.offline}
              </div>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:5}}>
          {isProp&&plan==="essai"&&<a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour David, je veux upgrader.\nBoutique: ${boutique.nom}`)}`} target="_blank" style={{background:"rgba(0,217,126,0.15)",border:"1px solid rgba(0,217,126,0.3)",borderRadius:9,padding:"6px 10px",display:"flex",alignItems:"center",textDecoration:"none"}}><span style={{color:"#00d97e",fontSize:11,fontWeight:700}}>↑PRO</span></a>}
          {isProp&&<button onClick={()=>setShowVendeurs(true)} style={{background:"#252b3b",border:"none",borderRadius:9,padding:7,cursor:"pointer",display:"flex"}}><Icon name="user" size={16} color="#7b8cff"/></button>}
          <div style={{position:"relative"}}>
            <div style={{background:"#252b3b",borderRadius:9,padding:7,display:"flex"}}><Icon name="alert" size={16} color="#8891aa"/></div>
            {notif>0&&<div style={{position:"absolute",top:-3,right:-3,width:15,height:15,background:"#ff4757",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:800,border:"2px solid #1a1f2e"}}>{notif}</div>}
          </div>
          <button onClick={onLogout} style={{background:"#252b3b",border:"none",borderRadius:9,padding:7,cursor:"pointer",display:"flex"}}><Icon name="logout" size={16} color="#ff6b6b"/></button>
        </div>
      </div>

      {/* BANNIÈRE ESSAI MOBILE */}
      {!isPC&&isProp&&plan==="essai"&&jr<=10&&jr>0&&(
        <div style={{background:"rgba(255,159,67,0.1)",borderBottom:"1px solid rgba(255,159,67,0.2)",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#ff9f43",fontSize:13,fontWeight:600}}>⏰ {jr} jours d'essai restants</span>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour, je veux passer au plan Pro.\nBoutique: ${boutique.nom}`)}`} target="_blank" style={{background:"#ff9f43",borderRadius:8,padding:"5px 12px",color:"#fff",fontSize:12,fontWeight:700,textDecoration:"none"}}>Upgrader →</a>
        </div>
      )}

      {/* SIDEBAR PC */}
      {isPC&&(
        <div style={{width:240,background:"#1a1f2e",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,bottom:0,padding:"20px 0",zIndex:100}}>
          <div style={{padding:"0 20px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#00d97e,#00b360)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#fff",fontSize:16}}>L</div>
              <div><div style={{color:"#f0f4ff",fontWeight:800,fontSize:16}}>Lapia</div><div style={{color:planInfo.color,fontSize:11,fontWeight:700}}>{planInfo.label}</div></div>
            </div>
            <div style={{color:"#f0f4ff",fontWeight:700,fontSize:15}}>{boutique.nom}</div>
            <div style={{color:"#8891aa",fontSize:13,marginBottom:12}}>{isProp?t.role_proprietaire:`${t.role_vendeur}: ${user.nom||user.telephone}`}</div>
            <div style={{display:"flex",gap:4,marginBottom:8}}>
              {["fr","en","ar"].map(l=><button key={l} onClick={()=>{setLangue(l);localStorage.setItem("lapia_langue",l);}} style={{background:langue===l?"#00d97e":"#252b3b",border:"none",borderRadius:4,padding:"3px 8px",color:langue===l?"#fff":"#8891aa",fontSize:11,fontWeight:700,cursor:"pointer"}}>{l.toUpperCase()}</button>)}
            </div>
            <div style={{background:isOnline?"rgba(0,217,126,0.1)":"rgba(255,71,87,0.1)",border:`1px solid ${isOnline?"#00d97e":"#ff4757"}33`,borderRadius:8,padding:"5px 10px",fontSize:12,color:isOnline?"#00d97e":"#ff4757",fontWeight:600,textAlign:"center"}}>
              {syncing?t.sync_en_cours:isOnline?t.online:t.offline}
            </div>
            {isProp&&plan==="essai"&&jr<=10&&jr>0&&<div style={{background:"rgba(255,159,67,0.1)",border:"1px solid rgba(255,159,67,0.2)",borderRadius:8,padding:"5px 10px",fontSize:12,color:"#ff9f43",fontWeight:600,textAlign:"center",marginTop:6}}>⏰ {jr} jours restants</div>}
          </div>
          <div style={{flex:1,padding:"16px 12px",display:"flex",flexDirection:"column",gap:4,overflowY:"auto"}}>
            {isProp&&<button onClick={()=>setShowVendeurs(true)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",width:"100%",textAlign:"left"}}><Icon name="user" size={20} color="#7b8cff"/><span style={{color:"#8891aa",fontWeight:600,fontSize:15,fontFamily:"'Sora',sans-serif"}}>{t.vendeurs}</span></button>}
            {pages.map(p=>(
              <button key={p.id} onClick={()=>setPage(p.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:"none",background:page===p.id?"rgba(0,217,126,0.1)":"transparent",cursor:"pointer",width:"100%",textAlign:"left",transition:"all 0.2s"}}>
                <Icon name={p.icon} size={20} color={page===p.id?"#00d97e":"#555e7a"}/>
                <span style={{color:page===p.id?"#00d97e":"#8891aa",fontWeight:600,fontSize:15,fontFamily:"'Sora',sans-serif"}}>{p.label}</span>
              </button>
            ))}
          </div>
          <div style={{padding:"16px 12px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",gap:8}}>
            {isProp&&plan==="essai"&&<a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour David, je veux le plan Pro.\nBoutique: ${boutique.nom}`)}`} target="_blank" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(0,217,126,0.15)",border:"1px solid rgba(0,217,126,0.3)",borderRadius:8,padding:"10px",color:"#00d97e",fontSize:13,fontWeight:700,textDecoration:"none"}}>↑ Upgrader en Pro</a>}
            <button onClick={onLogout} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:8,padding:"10px",color:"#ff6b6b",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}><Icon name="logout" size={16} color="#ff6b6b"/> Déconnexion</button>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div style={{padding:isPC?"30px":"14px",paddingBottom:isPC?30:100,marginLeft:isPC?240:0,flex:isPC?1:undefined}}>
        {page==="dashboard"&&<DashBoutique ventes={ventes} produits={produits} clients={clients} t={t} langue={langue}/>}
        {page==="stock"&&isProp&&<StockPage produits={produits} saveProduit={saveProduit} delProduit={delProduit} t={t} nbProduits={nbProduits} lim={lim}/>}
        {page==="ventes"&&<VentesPage produits={produits} ventes={ventes} clients={clients} saveVente={saveVente} saveClient={saveClient} t={t} isProp={isProp} boutique={boutique} setShowFacture={setShowFacture} user={user} lim={lim}/>}
        {page==="dettes"&&isProp&&<DettesPage clients={clients} saveClient={saveClient} ventes={ventes} t={t} boutique={boutique}/>}
        {page==="rapports"&&isProp&&<RapportsPage ventes={ventes} produits={produits} t={t} setShowFacture={setShowFacture} lim={lim}/>}
      </div>

      {/* NAVBAR MOBILE */}
      {!isPC&&<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#1a1f2e",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",padding:"8px 0 12px",boxShadow:"0 -8px 32px rgba(0,0,0,0.4)"}}>
        {pages.map(p=>(
          <button key={p.id} onClick={()=>setPage(p.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"5px 0"}}>
            {p.id==="ventes"?<div style={{width:48,height:48,borderRadius:"50%",background:page===p.id?"linear-gradient(135deg,#00d97e,#00b360)":"#252b3b",display:"flex",alignItems:"center",justifyContent:"center",marginTop:-18,boxShadow:page===p.id?"0 4px 20px rgba(0,217,126,0.5)":"0 4px 12px rgba(0,0,0,0.3)",border:"3px solid #1a1f2e"}}><Icon name={p.icon} size={20} color="#fff"/></div>:<Icon name={p.icon} size={20} color={page===p.id?"#00d97e":"#555e7a"}/>}
            <span style={{fontSize:10,fontWeight:700,color:page===p.id?"#00d97e":"#555e7a"}}>{p.label}</span>
          </button>
        ))}
      </div>}

      {/* MODAL VENDEURS */}
      {showVendeurs&&<Modal titre={t.vendeurs} onClose={()=>setShowVendeurs(false)}>
        {!lim.vendeurs?<div style={{textAlign:"center",padding:20}}>
          <div style={{fontSize:40,marginBottom:12}}>🔒</div>
          <div style={{color:"#f0f4ff",fontWeight:700,fontSize:18,marginBottom:8}}>Fonctionnalité Pro</div>
          <div style={{color:"#8891aa",fontSize:16,marginBottom:20}}>Les vendeurs sont disponibles avec le plan Pro — 5 000 FCFA/mois.</div>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour, je veux le plan Pro.\nBoutique: ${boutique.nom}`)}`} target="_blank" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"#25D366",borderRadius:12,color:"#fff",padding:"14px 20px",fontSize:16,fontWeight:700,textDecoration:"none",marginBottom:16}}>📲 Contacter sur WhatsApp</a>
        </div>:<>
          <Field label={t.nom_vendeur} value={nv.nom} onChange={v=>setNv({...nv,nom:v})} placeholder="Ex: Amadou"/>
          <Field label={t.tel_vendeur} type="tel" value={nv.telephone} onChange={v=>setNv({...nv,telephone:v})} placeholder="+235 XX XX XX XX"/>
          <Field label={t.mdp_vendeur} type="password" value={nv.password} onChange={v=>setNv({...nv,password:v})} placeholder="Mot de passe"/>
          <Btn onClick={addVendeur} full>{t.creer_vendeur}</Btn>
        </>}
        <div style={{marginTop:16,borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:16}}>
          <button onClick={()=>{setShowVendeurs(false);setShowChangePwd(true);}} style={{width:"100%",background:"rgba(123,140,255,0.1)",border:"1px solid rgba(123,140,255,0.3)",borderRadius:12,padding:"14px 16px",color:"#7b8cff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {t.changer_mdp}
          </button>
        </div>
      </Modal>}

      {/* MODAL CHANGER MDP */}
      {showChangePwd&&<Modal titre={t.changer_mdp} onClose={()=>{setShowChangePwd(false);setOldPwd("");setNewPwd("");setPwdMsg("");}}>
        <Field label={t.ancien_mdp} type="password" value={oldPwd} onChange={setOldPwd} placeholder="Votre mot de passe actuel"/>
        <Field label={t.nouveau_mdp} type="password" value={newPwd} onChange={setNewPwd} placeholder="Nouveau mot de passe"/>
        {pwdMsg&&<div style={{background:pwdMsg.includes("✅")?"rgba(0,217,126,0.1)":"rgba(255,71,87,0.1)",border:`1px solid ${pwdMsg.includes("✅")?"rgba(0,217,126,0.3)":"rgba(255,71,87,0.3)"}`,borderRadius:10,padding:"10px 14px",marginBottom:14,color:pwdMsg.includes("✅")?"#00d97e":"#ff4757",fontSize:15,textAlign:"center"}}>{pwdMsg}</div>}
        <Btn onClick={changerMdp} full>{t.confirmer_changement}</Btn>
      </Modal>}

      {showFacture&&<Facture vente={showFacture} boutique={boutique} onClose={()=>setShowFacture(null)} t={t}/>}
    </div>
  );
};

const DashBoutique = ({ventes,produits,clients,t,langue}) => {
  const auj=ventes.filter(v=>getDate(v).toDateString()===new Date().toDateString());
  const tv=auj.reduce((s,v)=>s+(v.paye||0),0);
  const td=clients.reduce((s,c)=>s+(c.dette||0),0);
  const rup=produits.filter(p=>!p.deleted&&p.quantite===0).length;
  const al=produits.filter(p=>!p.deleted&&p.quantite>0&&p.quantite<=p.alerte).length;
  const ben=auj.reduce((s,v)=>{const p=produits.find(p=>p.nom===v.produit);return p?s+(p.prixVente-p.prixAchat)*(v.quantite||0):s;},0);
  return(
    <div>
      <div style={{marginBottom:16}}>
        <p style={{color:"#8891aa",margin:0,fontSize:14,textTransform:"capitalize"}}>{new Date().toLocaleDateString(langue==="ar"?"ar-TN":langue==="en"?"en-US":"fr-FR",{weekday:"long",day:"numeric",month:"long"})}</p>
        <h2 style={{margin:"4px 0 0",color:"#f0f4ff",fontSize:22,fontWeight:800}}>{t.bonjour}</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{l:t.ventesAujourdhui,v:fmt(tv),i:"vente",c:"#00d97e"},{l:t.beneficeEstime,v:fmt(ben),i:"money",c:"#ffd93d"},{l:t.dettesClients,v:fmt(td),i:"dette",c:"#ff6b6b"},{l:t.rupturesStock,v:`${rup}(${al})`,i:"alert",c:"#ff9f43"}].map(c=>(
          <div key={c.l} style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${c.c}22`}}>
            <Icon name={c.i} size={18} color={c.c}/>
            <div style={{color:c.c,fontWeight:800,fontSize:16,marginTop:6}}>{c.v}</div>
            <div style={{color:"#8891aa",fontSize:12}}>{c.l}</div>
          </div>
        ))}
      </div>
      {(rup>0||al>0)&&<div style={{background:"rgba(255,159,67,0.1)",border:"1px solid rgba(255,159,67,0.3)",borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{color:"#ff9f43",fontWeight:700,fontSize:15,marginBottom:8}}>{t.alertesStock}</div>
        {produits.filter(p=>!p.deleted&&p.quantite<=p.alerte).map(p=><div key={p.id} style={{color:"#c8cfd8",fontSize:14,padding:"3px 0"}}>{p.quantite===0?"🔴":"🟡"} {p.nom} — {p.quantite===0?t.ruptureTotale:`${p.quantite} ${t.restants}`}</div>)}
      </div>}
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14}}>
        <div style={{color:"#f0f4ff",fontWeight:700,fontSize:16,marginBottom:10}}>{t.dernieresVentes}</div>
        {ventes.length===0?<div style={{color:"#8891aa",fontSize:14,textAlign:"center",padding:16}}>{t.aucuneVente}</div>
          :ventes.slice(-5).reverse().map(v=>(
          <div key={v.id} style={{padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{color:"#f0f4ff",fontSize:15,fontWeight:600}}>{v.produit}</div>
                {v.clientNom&&<div style={{color:"#ff9f43",fontSize:13}}>👤 {v.clientNom}</div>}
                {(v.vendeurNom||v.vendeurTel)&&<div style={{color:"#7b8cff",fontSize:13}}>🧑‍💼 {v.vendeurNom}</div>}
                <div style={{color:"#8891aa",fontSize:12}}>#{v.factureId}</div>
              </div>
              <div style={{color:v.mode==="credit"?"#ff6b6b":"#00d97e",fontWeight:700,fontSize:15}}>{fmt(v.paye||0)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StockPage = ({produits,saveProduit,delProduit,t,nbProduits,lim}) => {
  const [show,setShow]=useState(false); const [edit,setEdit]=useState(null); const [search,setSearch]=useState("");
  const [f,setF]=useState({nom:"",categorie:"Alimentation",prixAchat:"",prixVente:"",quantite:"",alerte:"5"});
  const fil=produits.filter(p=>!p.deleted&&p.nom?.toLowerCase().includes(search.toLowerCase()));
  const sc=p=>p.quantite===0?"#ff4757":p.quantite<=p.alerte?"#ff9f43":"#00d97e";
  const save=()=>{if(!f.nom)return;saveProduit({...f,prixAchat:+f.prixAchat,prixVente:+f.prixVente,quantite:+f.quantite,alerte:+f.alerte,id:edit?.id});setShow(false);};
  const limiteAtteinte=lim.produits!==Infinity&&nbProduits>=lim.produits;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{margin:0,color:"#f0f4ff",fontSize:20,fontWeight:800}}>{t.monStock}</h2>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {lim.produits!==Infinity&&<span style={{color:limiteAtteinte?"#ff4757":"#8891aa",fontSize:14,fontWeight:600}}>{nbProduits}/{lim.produits}</span>}
          <Btn onClick={()=>{setEdit(null);setF({nom:"",categorie:"Alimentation",prixAchat:"",prixVente:"",quantite:"",alerte:"5"});setShow(true);}} small disabled={limiteAtteinte}>+ {t.ajouter}</Btn>
        </div>
      </div>
      {limiteAtteinte&&<div style={{background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
        <div style={{color:"#ff4757",fontSize:14,fontWeight:600}}>⚠️ Maximum {lim.produits} produits avec le plan Essai</div>
        <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Bonjour, je veux passer au plan Pro.")}`} target="_blank" style={{color:"#00d97e",fontSize:13,fontWeight:700,textDecoration:"none"}}>→ Plan Pro — 5 000 FCFA/mois</a>
      </div>}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.chercher} style={{...IS,marginBottom:14,width:"100%",boxSizing:"border-box"}}/>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {fil.map(p=>(
          <div key={p.id} style={{background:"#1a1f2e",borderRadius:12,padding:"13px 15px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:sc(p),boxShadow:`0 0 6px ${sc(p)}`}}/>
            <div style={{flex:1}}>
              <div style={{color:"#f0f4ff",fontWeight:700,fontSize:15}}>{p.nom}</div>
              <div style={{color:"#8891aa",fontSize:13}}>{p.categorie}</div>
              <div style={{display:"flex",gap:10,marginTop:3}}><span style={{color:"#00d97e",fontSize:14,fontWeight:600}}>{fmt(p.prixVente)}</span><span style={{color:"#8891aa",fontSize:13}}>Achat: {fmt(p.prixAchat)}</span></div>
            </div>
            <div style={{textAlign:"right"}}><div style={{color:sc(p),fontWeight:800,fontSize:18}}>{p.quantite}</div><div style={{color:"#8891aa",fontSize:13}}>{t.unites}</div></div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <button onClick={()=>{setEdit(p);setF({...p});setShow(true);}} style={{background:"#252b3b",border:"none",borderRadius:7,padding:7,cursor:"pointer",display:"flex"}}><Icon name="edit" size={14} color="#7b8cff"/></button>
              <button onClick={()=>delProduit(p.id)} style={{background:"#252b3b",border:"none",borderRadius:7,padding:7,cursor:"pointer",display:"flex"}}><Icon name="trash" size={14} color="#ff6b6b"/></button>
            </div>
          </div>
        ))}
        {fil.length===0&&<div style={{color:"#8891aa",textAlign:"center",padding:30,fontSize:16}}>Aucun produit</div>}
      </div>
      {show&&<Modal titre={edit?t.modifierProduit:t.nouveauProduit} onClose={()=>setShow(false)}>
        <Field label={t.nomProduit} value={f.nom} onChange={v=>setF({...f,nom:v})} placeholder="Ex: Riz 25kg"/>
        <Field label={t.categorie} value={f.categorie} onChange={v=>setF({...f,categorie:v})} options={["Alimentation","Boisson","Ménager","Cosmétique","Électronique","Autre"].map(c=>({value:c,label:c}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label={t.prixAchat} type="number" value={f.prixAchat} onChange={v=>setF({...f,prixAchat:v})} placeholder="0"/>
          <Field label={t.prixVente} type="number" value={f.prixVente} onChange={v=>setF({...f,prixVente:v})} placeholder="0"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label={t.quantite} type="number" value={f.quantite} onChange={v=>setF({...f,quantite:v})} placeholder="0"/>
          <Field label={t.alerteStockMin} type="number" value={f.alerte} onChange={v=>setF({...f,alerte:v})} placeholder="5"/>
        </div>
        {+f.prixAchat>0&&+f.prixVente>0&&<div style={{background:"rgba(0,217,126,0.1)",border:"1px solid rgba(0,217,126,0.3)",borderRadius:9,padding:"10px 14px",marginBottom:14}}><span style={{color:"#8891aa",fontSize:14}}>{t.margeBeneficiaire}: </span><span style={{color:"#00d97e",fontWeight:700,fontSize:15}}>{fmt(f.prixVente-f.prixAchat)} ({Math.round(((f.prixVente-f.prixAchat)/f.prixAchat)*100)}%)</span></div>}
        <Btn onClick={save} full>{edit?t.enregistrer:t.ajouterAuStock}</Btn>
      </Modal>}
    </div>
  );
};

const VentesPage = ({produits,ventes,clients,saveVente,saveClient,t,isProp,boutique,setShowFacture,user,lim}) => {
  const [step,setStep]=useState(1);
  const [pan,setPan]=useState([]);
  const [search,setSearch]=useState("");
  const [mode,setMode]=useState("cash");
  const [mpay,setMpay]=useState("");
  const [numeroCheque,setNumeroCheque]=useState("");
  const [modeClient,setModeClient]=useState("anonyme");
  const [selectedClientId,setSelectedClientId]=useState("");
  const [newClientData,setNewClientData]=useState({nom:"",telephone:""});
  const [cid,setCid]=useState("");
  const [nc,setNc]=useState({nom:"",telephone:"",quartier:""});
  const [ok,setOk]=useState(false);
  const [last,setLast]=useState(null);

  const fil=produits.filter(p=>!p.deleted&&p.quantite>0&&p.nom?.toLowerCase().includes(search.toLowerCase()));
  const add=p=>{const e=pan.find(x=>x.id===p.id);if(e)setPan(pan.map(x=>x.id===p.id?{...x,qte:x.qte+1}:x));else setPan([...pan,{...p,qte:1}]);};
  const upd=(id,q)=>{if(q<=0)setPan(pan.filter(x=>x.id!==id));else setPan(pan.map(x=>x.id===id?{...x,qte:q}:x));};
  const tot=pan.reduce((s,x)=>s+x.prixVente*x.qte,0);
  const pay=mode==="credit"?0:mode==="cheque"||mode==="mobile"?tot:(mpay?Math.min(+mpay,tot):tot);
  const det=tot-pay;
  const mon=mpay&&mode==="cash"?Math.max(0,+mpay-tot):0;

  const reset=()=>{setOk(false);setPan([]);setStep(1);setSearch("");setMode("cash");setMpay("");setNumeroCheque("");setModeClient("anonyme");setSelectedClientId("");setNewClientData({nom:"",telephone:""});setCid("");setNc({nom:"",telephone:"",quartier:""});setLast(null);};

  const conf=async()=>{
    if(pan.length===0)return;
    if(lim&&lim.ventes!==Infinity){const dm=new Date();dm.setDate(1);dm.setHours(0,0,0,0);const vm=ventes.filter(v=>getDate(v)>=dm).length;if(vm>=lim.ventes){alert(`⚠️ Maximum ${lim.ventes} ventes/mois avec le plan Essai.`);return;}}
    let cr=null,clientNom="",clientTel="";
    if(modeClient==="existant"&&selectedClientId){
      cr=selectedClientId;const c=clients.find(x=>x.id===selectedClientId);
      if(c){clientNom=c.nom;clientTel=c.telephone||"";if(det>0)await saveClient({...c,dette:(c.dette||0)+det});}
    }else if(modeClient==="nouveau"&&newClientData.nom){
      const newId=await saveClient({...newClientData,quartier:"",dette:det});cr=newId;clientNom=newClientData.nom;clientTel=newClientData.telephone||"";
    }else if(mode==="credit"&&cid){
      cr=cid;const c=clients.find(x=>x.id===cid);
      if(c){clientNom=c.nom;clientTel=c.telephone||"";if(det>0)await saveClient({...c,dette:(c.dette||0)+det});}
    }
    const vd={produit:pan.map(x=>x.nom).join(", "),quantite:pan.reduce((s,x)=>s+x.qte,0),montant:tot,paye:pay,mode,numeroCheque:numeroCheque||"",clientId:cr||null,clientNom:clientNom||"",clientTel:clientTel||"",items:pan.map(x=>({id:x.id,nom:x.nom,qte:x.qte,prixVente:x.prixVente}))};
    const v=await saveVente(vd);
    if(v){setLast(v);setOk(true);}
  };

  if(ok)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,gap:16}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(0,217,126,0.15)",border:"3px solid #00d97e",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="check" size={40} color="#00d97e"/></div>
      <div style={{color:"#00d97e",fontWeight:800,fontSize:22}}>{t.venteEnregistree}</div>
      <div style={{color:"#8891aa",fontSize:14}}>#{last?.factureId}</div>
      {last?.clientNom&&<div style={{background:"rgba(255,159,67,0.1)",border:"1px solid rgba(255,159,67,0.3)",borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
        <div style={{color:"#8891aa",fontSize:14}}>👤 Client</div>
        <div style={{color:"#ff9f43",fontWeight:700,fontSize:16}}>{last.clientNom}</div>
      </div>}
      <div style={{background:"rgba(123,140,255,0.1)",border:"1px solid rgba(123,140,255,0.3)",borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
        <div style={{color:"#8891aa",fontSize:14}}>🧑‍💼 {t.vendu_par}</div>
        <div style={{color:"#7b8cff",fontWeight:700,fontSize:16}}>{user.nom||user.telephone}</div>
      </div>
      <Btn onClick={()=>{if(last)setShowFacture(last);}} color="#7b8cff">{t.genererFacture}</Btn>
      <Btn onClick={reset} outlined>{t.retour}</Btn>
    </div>
  );

  return(
    <div>
      <h2 style={{margin:"0 0 16px",color:"#f0f4ff",fontSize:20,fontWeight:800}}>{t.nouvelleVente}</h2>
      {step===1&&(
        <>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.chercher} style={{...IS,marginBottom:14,width:"100%",boxSizing:"border-box"}}/>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {fil.map(p=>(
              <button key={p.id} onClick={()=>add(p)} style={{background:pan.find(x=>x.id===p.id)?"rgba(0,217,126,0.1)":"#1a1f2e",border:pan.find(x=>x.id===p.id)?"1.5px solid rgba(0,217,126,0.4)":"1.5px solid transparent",borderRadius:12,padding:"13px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{textAlign:"left"}}>
                  <div style={{color:"#f0f4ff",fontWeight:600,fontSize:15}}>{p.nom}</div>
                  <div style={{color:"#8891aa",fontSize:13}}>{p.quantite} {t.enStock}</div>
                </div>
                <div style={{color:"#00d97e",fontWeight:800,fontSize:15}}>{fmt(p.prixVente)}</div>
              </button>
            ))}
            {fil.length===0&&<div style={{color:"#8891aa",textAlign:"center",padding:20,fontSize:15}}>Aucun produit disponible</div>}
          </div>
          {pan.length>0&&<>
            <div style={{background:"#252b3b",borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{color:"#8891aa",fontWeight:700,fontSize:14,marginBottom:12,textTransform:"uppercase"}}>{t.panier} ({pan.length})</div>
              {pan.map(x=>(
                <div key={x.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{flex:1,color:"#f0f4ff",fontSize:15,fontWeight:600}}>{x.nom}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>upd(x.id,x.qte-1)} style={{background:"#1a1f2e",border:"none",color:"#f0f4ff",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:16}}>−</button>
                    <input
  type="number"
  value={x.qte}
  onChange={e=>{const v=parseInt(e.target.value)||1;upd(x.id,v);}}
  style={{background:"#1a1f2e",border:"1px solid #2d3448",color:"#f0f4ff",fontWeight:700,width:40,textAlign:"center",fontSize:16,borderRadius:8,padding:"3px 0",fontFamily:"'Sora',sans-serif",outline:"none"}}
/>
                    <button onClick={()=>upd(x.id,x.qte+1)} style={{background:"#1a1f2e",border:"none",color:"#f0f4ff",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:16}}>+</button>
                  </div>
                  <div style={{color:"#00d97e",fontWeight:700,fontSize:15}}>{fmt(x.prixVente*x.qte)}</div>
                </div>
              ))}
              <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:12,display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"#f0f4ff",fontWeight:700,fontSize:16}}>{t.total}</span>
                <span style={{color:"#00d97e",fontWeight:800,fontSize:18}}>{fmt(tot)}</span>
              </div>
            </div>
            <Btn onClick={()=>setStep(2)} full>{t.continuer}</Btn>
          </>}
        </>
      )}
      {step===2&&(
        <>
          <div style={{background:"#1a1f2e",borderRadius:12,padding:16,marginBottom:16,textAlign:"center"}}>
            <div style={{color:"#8891aa",fontSize:14}}>{t.total}</div>
            <div style={{color:"#f0f4ff",fontWeight:800,fontSize:30}}>{fmt(tot)}</div>
          </div>

          {/* MODE PAIEMENT */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",color:"#8891aa",fontSize:13,fontWeight:600,marginBottom:10,textTransform:"uppercase"}}>{t.modePayment}</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{val:"cash",label:t.cash},{val:"mobile",label:t.mobile},{val:"cheque",label:t.cheque},{val:"credit",label:t.credit}].map(m=>(
                <button key={m.val} onClick={()=>setMode(m.val)} style={{background:mode===m.val?"rgba(0,217,126,0.15)":"#252b3b",border:mode===m.val?"1.5px solid #00d97e":"1.5px solid transparent",borderRadius:12,padding:"12px 8px",cursor:"pointer",color:mode===m.val?"#00d97e":"#8891aa",fontWeight:700,fontSize:14,fontFamily:"'Sora',sans-serif"}}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode==="cash"&&<Field label={t.montantRecu} type="number" value={mpay} onChange={setMpay} placeholder={tot.toString()}/>}
          {mode==="cheque"&&<Field label={t.numeroCheque} value={numeroCheque} onChange={setNumeroCheque} placeholder="Ex: 123456"/>}

          {/* SECTION CLIENT */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",color:"#8891aa",fontSize:13,fontWeight:600,marginBottom:10,textTransform:"uppercase"}}>{t.client}</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[{val:"anonyme",label:t.client_anonyme},{val:"existant",label:t.client_existant},{val:"nouveau",label:t.client_nouveau}].map(m=>(
                <button key={m.val} onClick={()=>setModeClient(m.val)} style={{background:modeClient===m.val?"rgba(0,217,126,0.15)":"#252b3b",border:modeClient===m.val?"1.5px solid #00d97e":"1.5px solid transparent",borderRadius:12,padding:"10px 4px",cursor:"pointer",color:modeClient===m.val?"#00d97e":"#8891aa",fontWeight:700,fontSize:13,fontFamily:"'Sora',sans-serif"}}>
                  {m.label}
                </button>
              ))}
            </div>
            {modeClient==="existant"&&<select value={selectedClientId} onChange={e=>setSelectedClientId(e.target.value)} style={IS}>
              <option value="">-- Sélectionner un client --</option>
              {clients.map(c=><option key={c.id} value={c.id}>{c.nom}{c.telephone?` | ${c.telephone}`:""}{c.dette>0?` | Dette: ${fmt(c.dette)}`:""}</option>)}
            </select>}
            {modeClient==="nouveau"&&<div style={{background:"#252b3b",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:10}}>
              <input placeholder={t.nomComplet} value={newClientData.nom} onChange={e=>setNewClientData({...newClientData,nom:e.target.value})} style={IS}/>
              <input placeholder={t.telephone} type="tel" value={newClientData.telephone} onChange={e=>setNewClientData({...newClientData,telephone:e.target.value})} style={IS}/>
              <div style={{color:"#00d97e",fontSize:13}}>✅ Client sauvegardé dans votre base de données</div>
            </div>}
          </div>

          {/* CREDIT - sélection client */}
          {mode==="credit"&&modeClient==="anonyme"&&<div style={{marginBottom:14}}>
            <label style={{display:"block",color:"#8891aa",fontSize:13,fontWeight:600,marginBottom:8,textTransform:"uppercase"}}>{t.client} (crédit)</label>
            <select value={cid} onChange={e=>setCid(e.target.value)} style={IS}>
              <option value="">{t.clientExistant}</option>
              {clients.map(c=><option key={c.id} value={c.id}>{c.nom} {c.dette>0?`(${fmt(c.dette)})`:""}</option>)}
              <option value="nouveau">{t.nouveauClient}</option>
            </select>
            {cid==="nouveau"&&<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>
              <input placeholder={t.nomComplet} style={IS} onChange={e=>setNc({...nc,nom:e.target.value})}/>
              <input placeholder={t.telephone} style={IS} onChange={e=>setNc({...nc,telephone:e.target.value})}/>
              <input placeholder={t.quartier} style={IS} onChange={e=>setNc({...nc,quartier:e.target.value})}/>
            </div>}
          </div>}

          {mon>0&&<div style={{background:"rgba(255,217,61,0.1)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:10,padding:12,marginBottom:12,textAlign:"center"}}><span style={{color:"#8891aa",fontSize:14}}>{t.monnaie}: </span><span style={{color:"#ffd93d",fontWeight:800,fontSize:18}}>{fmt(mon)}</span></div>}
          {det>0&&<div style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:10,padding:12,marginBottom:12,textAlign:"center"}}><span style={{color:"#8891aa",fontSize:14}}>{t.detteCreee}: </span><span style={{color:"#ff6b6b",fontWeight:800,fontSize:18}}>{fmt(det)}</span></div>}
          <div style={{display:"flex",gap:10}}>
            <Btn onClick={()=>setStep(1)} outlined full>{t.retour}</Btn>
            <Btn onClick={conf} full>{t.confirmer}</Btn>
          </div>
        </>
      )}
    </div>
  );
};

const DettesPage = ({clients,saveClient,ventes,t,boutique}) => {
  const [selected,setSelected]=useState(null); const [showPay,setShowPay]=useState(false); const [montant,setMontant]=useState("");
  const [showAdd,setShowAdd]=useState(false); const [nc,setNc]=useState({nom:"",telephone:"",quartier:""});
  const pay=async()=>{if(!montant||!selected)return;const r=Math.min(+montant,selected.dette);const nouvelleDette = selected.dette - r;
const up={...selected, dette:nouvelleDette, dateSolde: nouvelleDette<=0 ? new Date().toISOString() : null};
await saveClient(up);setMontant("");setShowPay(false);};
  const addClient=async()=>{if(!nc.nom)return;await saveClient({...nc,dette:0});setNc({nom:"",telephone:"",quartier:""});setShowAdd(false);};

  if(selected){
    const cv=ventes.filter(v=>v.clientId===selected.id);
    return(
      <div>
        <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#8891aa",cursor:"pointer",marginBottom:16,padding:0,fontFamily:"'Sora',sans-serif",fontSize:16}}>{t.retour}</button>
        <div style={{background:"#1a1f2e",borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"#252b3b",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="user" size={24} color="#7b8cff"/></div>
            <div><div style={{color:"#f0f4ff",fontWeight:700,fontSize:18}}>{selected.nom}</div><div style={{color:"#8891aa",fontSize:14}}>📍 {selected.quartier} | 📞 {selected.telephone}</div></div>
          </div>
        </div>
        <div style={{background:selected.dette>0?"rgba(255,107,107,0.1)":"rgba(0,217,126,0.1)",border:`1px solid ${selected.dette>0?"rgba(255,107,107,0.3)":"rgba(0,217,126,0.3)"}`,borderRadius:12,padding:20,marginBottom:16,textAlign:"center"}}>
          <div style={{color:"#8891aa",fontSize:14}}>{t.detteTotal}</div>
          <div style={{color:selected.dette>0?"#ff6b6b":"#00d97e",fontWeight:800,fontSize:30}}>{fmt(selected.dette)}</div>
        </div>
        {selected.dette>0&&<div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:18}}>
          <Btn onClick={()=>setShowPay(true)} full>{t.enregistrerPaiement}</Btn>
          <a href={`https://wa.me/${(selected.telephone||"").replace(/\s/g,"").replace(/^00/,"+")}?text=${encodeURIComponent(`Bonjour ${selected.nom} 👋,\n\nNous vous rappelons que vous avez une dette de *${fmt(selected.dette)}* chez *${boutique?.nom||"notre boutique"}*.\n\nMerci de passer nous régler dès que possible 🙏\n\n_Message envoyé via Lapia_`)}`} target="_blank"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"#25D366",borderRadius:12,color:"#fff",padding:"14px 20px",fontSize:16,fontWeight:700,textDecoration:"none"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {t.rappel_whatsapp}
          </a>
        </div>}
        <div><div style={{color:"#f0f4ff",fontWeight:700,fontSize:16,marginBottom:12}}>{t.historique}</div>
          {cv.length===0?<div style={{color:"#8891aa",fontSize:14,textAlign:"center",padding:16}}>{t.aucuneVente}</div>
            :cv.map(v=>(
            <div key={v.id} style={{background:"#1a1f2e",borderRadius:12,padding:"13px 15px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{color:"#f0f4ff",fontSize:15,fontWeight:600}}>{v.produit}</div><div style={{color:"#f0f4ff",fontWeight:700,fontSize:15}}>{fmt(v.montant)}</div></div>
              {(v.vendeurNom||v.vendeurTel)&&<div style={{color:"#7b8cff",fontSize:13}}>🧑‍💼 {v.vendeurNom}{v.vendeurTel?` | ${v.vendeurTel}`:""}</div>}
              <div style={{color:v.paye>=v.montant?"#00d97e":"#ff6b6b",fontSize:13,fontWeight:700}}>
  {v.paye>=v.montant?"✓ Soldé":`${t.reste}: ${fmt(v.montant-v.paye)}`}
            </div>
            </div>
          ))}
        </div>
        {showPay&&<Modal titre={t.enregistrerPaiement} onClose={()=>setShowPay(false)}>
          <div style={{color:"#8891aa",fontSize:15,marginBottom:16}}>{t.detteTotal}: <strong style={{color:"#ff6b6b"}}>{fmt(selected.dette)}</strong></div>
          <Field label={t.montantRecu} type="number" value={montant} onChange={setMontant} placeholder={selected.dette.toString()}/>
          <Btn onClick={pay} full>{t.confirmer}</Btn>
        </Modal>}
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{margin:0,color:"#f0f4ff",fontSize:20,fontWeight:800}}>{t.cahierDettes}</h2>
        <Btn onClick={()=>setShowAdd(true)} small>+ {t.client}</Btn>
      </div>
      <div style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",justifyContent:"space-between"}}>
        <span style={{color:"#8891aa",fontSize:15}}>{t.totalDettes}</span>
        <span style={{color:"#ff6b6b",fontWeight:800,fontSize:16}}>{fmt(clients.reduce((s,c)=>s+(c.dette||0),0))}</span>
      </div>
      {clients.filter(c=>{
  if(c.dette>0) return true;
  if(!c.dateSolde) return true;
  const semaine = 7*24*60*60*1000;
  return (new Date()-new Date(c.dateSolde)) < semaine;
}).map(c=>(
        <button key={c.id} onClick={()=>setSelected(c)} style={{background:"#1a1f2e",border:"none",borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left",width:"100%",marginBottom:10}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:c.dette>0?"rgba(255,107,107,0.15)":"rgba(0,217,126,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="user" size={20} color={c.dette>0?"#ff6b6b":"#00d97e"}/></div>
          <div style={{flex:1}}><div style={{color:"#f0f4ff",fontWeight:700,fontSize:16}}>{c.nom}</div><div style={{color:"#8891aa",fontSize:14}}>📍 {c.quartier}{c.telephone?` | 📞 ${c.telephone}`:""}</div></div>
          <div style={{color:c.dette>0?"#ff6b6b":"#00d97e",fontWeight:800,fontSize:16}}>{c.dette>0?fmt(c.dette):t.solde}</div>
          <Icon name="arrow" size={16} color="#555"/>
        </button>
      ))}
      {clients.length===0&&<div style={{color:"#8891aa",textAlign:"center",padding:30,fontSize:16}}>Aucun client</div>}
      {showAdd&&<Modal titre={t.nouveauClient} onClose={()=>setShowAdd(false)}>
        <Field label={t.nomComplet} value={nc.nom} onChange={v=>setNc({...nc,nom:v})} placeholder="Ex: Fatou Diallo"/>
        <Field label={t.telephone} type="tel" value={nc.telephone} onChange={v=>setNc({...nc,telephone:v})}/>
        <Field label={t.quartier} value={nc.quartier} onChange={v=>setNc({...nc,quartier:v})}/>
        <Btn onClick={addClient} full>{t.ajouterClient}</Btn>
      </Modal>}
    </div>
  );
};

const RapportsPage = ({ventes,produits,t,setShowFacture,lim}) => {
  const [filtre,setFiltre]=useState("tous");
  const vendeurs=[...new Map(ventes.filter(v=>v.vendeurId).map(v=>[v.vendeurId,{id:v.vendeurId,nom:v.vendeurNom||"",tel:v.vendeurTel||""}])).values()];
  const vf=filtre==="tous"?ventes:ventes.filter(v=>v.vendeurId===filtre);
  const auj=vf.filter(v=>getDate(v).toDateString()===new Date().toDateString());
  const s7=vf.filter(v=>getDate(v)>new Date(Date.now()-7*86400000));
  const st=(l)=>({ca:l.reduce((s,v)=>s+(v.montant||0),0),enc:l.reduce((s,v)=>s+(v.paye||0),0),det:l.reduce((s,v)=>s+((v.montant||0)-(v.paye||0)),0),nb:l.length});
  const sa=st(auj),s7s=st(s7);
  const pm={};vf.forEach(v=>{pm[v.produit]=(pm[v.produit]||0)+(v.quantite||0);});
  const top=Object.entries(pm).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const SC=({l,v,c="#f0f4ff"})=>(<div style={{background:"#1a1f2e",borderRadius:12,padding:"14px 16px"}}><div style={{color:"#8891aa",fontSize:12,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>{l}</div><div style={{color:c,fontWeight:800,fontSize:17}}>{v}</div></div>);

  const cm={};
  vf.forEach(v=>{if(v.clientNom){const key=v.clientId||v.clientNom;if(!cm[key])cm[key]={nom:v.clientNom,tel:v.clientTel||"",total:0,nb:0};cm[key].total+=v.montant||0;cm[key].nb+=1;}});
  const topClients=Object.values(cm).sort((a,b)=>b.total-a.total).slice(0,5);

  return(
    <div>
      <h2 style={{margin:"0 0 18px",color:"#f0f4ff",fontSize:20,fontWeight:800}}>{t.rapportsTitle}</h2>
      {vendeurs.length>0&&<div style={{background:"#1a1f2e",borderRadius:12,padding:16,marginBottom:18}}>
        <div style={{color:"#f0f4ff",fontWeight:700,fontSize:16,marginBottom:12}}>🔍 {t.filtre_vendeur}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>setFiltre("tous")} style={{background:filtre==="tous"?"#00d97e":"#252b3b",border:"none",borderRadius:8,padding:"8px 14px",color:filtre==="tous"?"#fff":"#8891aa",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>{t.tous_vendeurs}</button>
          {vendeurs.map(v=><button key={v.id} onClick={()=>setFiltre(v.id)} style={{background:filtre===v.id?"#7b8cff":"#252b3b",border:"none",borderRadius:8,padding:"8px 14px",color:filtre===v.id?"#fff":"#8891aa",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>👤 {v.nom||v.tel}</button>)}
        </div>
      </div>}
      <div style={{marginBottom:18}}>
        <div style={{color:"#00d97e",fontWeight:700,fontSize:15,marginBottom:10}}>● {t.aujourdhui}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <SC l={t.chiffreAffaires} v={fmt(sa.ca)}/><SC l={t.encaisse} v={fmt(sa.enc)} c="#00d97e"/>
          <SC l={t.dettesCreees} v={fmt(sa.det)} c="#ff6b6b"/><SC l={t.nbVentes} v={`${sa.nb} ${t.transactions}`} c="#ffd93d"/>
        </div>
      </div>
      <div style={{marginBottom:18}}>
        <div style={{color:"#7b8cff",fontWeight:700,fontSize:15,marginBottom:10}}>● {t.sept_jours}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <SC l={t.chiffreAffaires} v={fmt(s7s.ca)}/><SC l={t.encaisse} v={fmt(s7s.enc)} c="#00d97e"/>
          <SC l={t.dettesCreees} v={fmt(s7s.det)} c="#ff6b6b"/><SC l={t.nbVentes} v={s7s.nb.toString()} c="#7b8cff"/>
        </div>
      </div>
      {!lim.bilan&&<div style={{background:"rgba(255,159,67,0.1)",border:"1px solid rgba(255,159,67,0.2)",borderRadius:12,padding:16,marginBottom:18,textAlign:"center"}}>
        <div style={{color:"#ff9f43",fontWeight:700,fontSize:15,marginBottom:8}}>🔒 {t.bilan_trimestriel} — Plan Pro</div>
        <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Bonjour, je veux passer au plan Pro pour le bilan trimestriel.")}`} target="_blank" style={{color:"#00d97e",fontSize:14,fontWeight:700,textDecoration:"none"}}>→ Plan Pro — 5 000 FCFA/mois</a>
      </div>}
      {top.length>0&&<div style={{background:"#1a1f2e",borderRadius:14,padding:16,marginBottom:18}}>
        <div style={{color:"#f0f4ff",fontWeight:700,fontSize:16,marginBottom:14}}>{t.topProduits}</div>
        {top.map(([n,q],i)=>(
          <div key={n} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#f0f4ff",fontSize:15,fontWeight:600}}>#{i+1} {n}</span><span style={{color:"#8891aa",fontSize:14}}>{q} {t.unites}</span></div>
            <div style={{height:6,background:"#252b3b",borderRadius:99}}><div style={{height:"100%",width:`${(q/top[0][1])*100}%`,background:["#00d97e","#7b8cff","#ffd93d","#ff9f43","#ff6b6b"][i],borderRadius:99}}/></div>
          </div>
        ))}
      </div>}
      <div style={{background:"#1a1f2e",borderRadius:14,padding:16,marginBottom:18}}>
        <div style={{color:"#f0f4ff",fontWeight:700,fontSize:16,marginBottom:14}}>{t.topClients}</div>
        {topClients.length===0?<div style={{color:"#8891aa",fontSize:14,textAlign:"center",padding:16}}>Aucun client enregistré dans les ventes</div>
          :topClients.map((c,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${["#ffd93d","#8891aa","#ff9f43","#7b8cff","#00d97e"][i]}22`,display:"flex",alignItems:"center",justifyContent:"center",color:["#ffd93d","#8891aa","#ff9f43","#7b8cff","#00d97e"][i],fontWeight:800,fontSize:14}}>#{i+1}</div>
              <div>
                <div style={{color:"#f0f4ff",fontSize:15,fontWeight:600}}>{c.nom}</div>
                {c.tel&&<div style={{color:"#8891aa",fontSize:13}}>📞 {c.tel}</div>}
                <div style={{color:"#8891aa",fontSize:13}}>{c.nb} {t.achat}</div>
              </div>
            </div>
            <div style={{color:"#00d97e",fontWeight:800,fontSize:15}}>{fmt(c.total)}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:16}}>
        <div style={{color:"#f0f4ff",fontWeight:700,fontSize:16,marginBottom:12}}>{t.dernieresVentes}</div>
        {vf.length===0?<div style={{color:"#8891aa",fontSize:14,textAlign:"center",padding:16}}>{t.aucuneVente}</div>
          :vf.slice(-10).reverse().map(v=>(
          <div key={v.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{color:"#f0f4ff",fontSize:15,fontWeight:600}}>{v.produit}</div>
                {v.clientNom&&<div style={{color:"#ff9f43",fontSize:13}}>👤 {v.clientNom}</div>}
                {(v.vendeurNom||v.vendeurTel)&&<div style={{color:"#7b8cff",fontSize:13}}>🧑‍💼 {v.vendeurNom}{v.vendeurTel?` | ${v.vendeurTel}`:""}</div>}
                <div style={{color:"#8891aa",fontSize:12}}>#{v.factureId}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{color:v.mode==="credit"?"#ff6b6b":"#00d97e",fontWeight:700,fontSize:15}}>{fmt(v.montant||0)}</div>
                <button onClick={()=>setShowFacture(v)} style={{background:"#252b3b",border:"none",borderRadius:8,padding:6,cursor:"pointer",display:"flex"}}><Icon name="invoice" size={15} color="#7b8cff"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [langue,setLangue]=useState(()=>localStorage.getItem("lapia_langue")||"fr");
  const [user,setUser]=useState(()=>{try{const s=localStorage.getItem("lapia_user");return s?JSON.parse(s):null;}catch{return null;}});
  const t=T[langue];
  const handleLogin=(ud)=>{localStorage.setItem("lapia_user",JSON.stringify(ud));const cached=JSON.parse(localStorage.getItem("pg_known_users")||"[]");const exists=cached.find(u=>u.telephone===ud.telephone);if(!exists){cached.push(ud);localStorage.setItem("pg_known_users",JSON.stringify(cached));}setUser(ud);};
  const handleLogout=()=>{localStorage.removeItem("lapia_user");setUser(null);};
  if(!user)return<Login onLogin={handleLogin} t={t}/>;
  if(user.role==="admin")return<AdminDashboardPC user={user} onLogout={handleLogout} t={t} langue={langue} setLangue={setLangue}/>;
  return<AppBoutique user={user} onLogout={handleLogout} t={t} langue={langue} setLangue={setLangue}/>;
}
