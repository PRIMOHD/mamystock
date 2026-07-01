# Audit Sécuritaire - L'Apiagest (lapiagest.vercel.app)
*Date: 26 juin 2026*

---

## 🔴 VULNÉRABILITÉS CRITIQUES

### 1. Clé API Firebase exposée dans le code source
**Fichier:** `src/firebase.js:5-12`

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCRe0hwUE1_aaNnQuvEAc38UX-o4QAISOA",
  authDomain: "primogest-2926e.firebaseapp.com",
  projectId: "primogest-2926e",
  // ...
};
```

La clé API est visible en clair dans le code source client. Tout le monde peut l'exfiltrer via l'inspecteur ou le code source de l'application.

### 2. Absence de règles de sécurité Firestore
**Analyse:** Aucun fichier `firestore.rules` trouvé dans le dépôt

L'application accède aux collections Firestore (`users`, `produits`, `ventes`, `clients`) directement depuis le client sans authentification serveur. Sans règles de sécurité strictes, quiconque possède la clé API peut :
- Lire toutes les données utilisateur
- Modifier les mots de passe
- Supprimer des enregistrements
- Créer des comptes administrateurs

### 3. Rôles et permissions gérés côté client
**Fichier:** `src/App_Firebase.jsx:567, 569`

```javascript
await addDoc(collection(db,"users"),{
  // ...
  role:"proprietaire",  // Attribution du rôle côté client
  plan:"essai",
});
```

Un utilisateur malveillant peut modifier son rôle en `admin` directement depuis le navigateur et accéder au dashboard administrateur.

---

## 🔴 VULNÉRABILITÉS ÉLEVÉES

### 4. Mots de passe stockés avec hash SHA-256 non sécurisé
**Fichier:** `src/App_Firebase.jsx:70-89`

```javascript
const hashPwd = async (pwd, salt) => {
  const data = new TextEncoder().encode(pwd + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  // ...
};
```

Problèmes:
- SHA-256 sans facteur d'itération = vulnérabilité aux rainbow tables
- Coût de calcul trop faible pour résister aux attaques GPU

### 5. Sel statique et hardcodé (backdoor)
**Fichier:** `src/App_Firebase.jsx:6`

```javascript
const LEGACY_SALT = "primogest_salt_2026";
```

Un sel statique est utilisé pour la compatibilité avec les anciens comptes. Si les comptes anciens existent toujours, un attaquant peut :
- Utiliser ce sel connu pour craquer les mots de passe
- Créer des comptes avec ce sel pour contourner le nouveau système

### 6. Injection XSS potentielle via données utilisateur
**Fichier:** `src/App_Firebase.jsx:826-840`

Les données de boutique (nomBoutique, telephone, position) sont affichées dans des popups Leaflet sans sanitization. Si un utilisateur enregistre du HTML/JavaScript comme nom de boutique, il pourrait être exécuté.

### 7. Endpoint API Claude sans authentification
**Fichier:** `src/App_Firebase.jsx:27-35`

```javascript
const resp = await fetch("https://api.anthropic.com/v1/messages", {
  // Aucune clé API Anthropic fournie
});
```

L'endpoint échouera mais révèle une tentative d'intégration IA non implémentée correctement.

---

## 🟡 VULNÉRABILITÉS MOYENNES

### 8. Collecte de géolocalisation sans consentement explicite
**Fichier:** `src/App_Firebase.jsx:557-558`

```javascript
navigator.geolocation.getCurrentPosition(r,j,{timeout:8000,enableHighAccuracy:true})
```

La position GPS est captée automatiquement lors de l'inscription sans:
- Demande de consentement claire
- Option de refus visible
- Information sur l'utilisation des données

### 9. Données sensibles persistantes en localStorage
**Fichier:** `src/App_Firebase.jsx:2582-2585`

```javascript
localStorage.setItem("lapia_user", JSON.stringify(ud));
localStorage.setItem("pg_known_users", JSON.stringify(cached));
```

Le profil utilisateur complet est stocké en localStorage sans chiffrement, accessible via:
- JavaScript malveillant (XSS)
- Accès physique à l'appareil

### 10. Violation de confidentialité administrateur
**Fichier:** `src/App_Firebase.jsx:790-802`

L'admin dashboard charge TOUTES les données de toutes les boutiques:
- Tous les utilisateurs (nom, téléphone, adresse)
- Toutes les ventes
- Toutes les localisations GPS

Cela contrevient au principe de moindre privilège et crée un risque d'accès non autorisé à des données sensibles.

---

## 🔵 ASPECTS POSITIFS

- Rate limiting sur tentatives de connexion (5 tentatives, blocage 5 min)
- Service worker avec stratégie cache appropriée
- Chiffement des mots de passe côté client (meilleure que du texte en clair)

---

## 📋 RECOMMANDATIONS PRIORITAIRES

### Priorité 1 - Critique
1. **Déplacer la clé Firebase vers les variables d'environnement** (`VITE_FIREBASE_API_KEY` dans `.env.local`)
2. **Mettre en place des règles Firestore strictes** avec authentification Firebase
3. **Supprimer le sel LEGACY_SALT** hardcodé et forcer la migration des anciens comptes

### Priorité 2 - Élevée
4. **Utiliser bcrypt/argon2** pour le hashage des mots de passe (backend)
5. **Valider les rôles côté serveur** via Firebase Functions
6. **Sanitiser toutes les entrées** avant affichage dans l'UI

### Priorité 3 - Moyenne
7. **Ajouter consentement explicite pour la géolocalisation**
8. **Chiffrer les données sensibles** stockées localement
9. **Restreindre l'accès admin** aux seules données nécessaires
10. **Implémenter la vraie authentification** avec Firebase Auth