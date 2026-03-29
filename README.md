# QuizzBox - Backend d'Évaluation Flexible (Pur HTML/JS)

QuizzBox est un moteur d'évaluation robuste conçu pour créer, gérer et valider des sessions de télé-évaluation de manière sécurisée. Le backend expose une API REST performante intégrant SQLite (pour débuter), Prisma et des capacités de génération par IA via DeepSeek.

## 🚀 Installation & Démarrage

### 1. Prérequis
- **Node.js** (v18+)
- **npm** ou **yarn**

### 2. Configuration & Lancement
1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Configurez le fichier `.env` à la racine (voir section [Configuration API](#configuration-api)).
3. Initialisez la base de données avec Prisma :
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
   Le serveur sera accessible sur le port **3000** (par défaut).

## 🌐 Lancement du site en local

Après avoir démarré le backend, ouvrez une nouvelle fenêtre de terminal et lancez un serveur de fichiers statiques pour le frontend (ou accédez directement aux fichiers HTML). Exemple avec `npm` :

1. Depuis la racine du projet, installez `serve` si ce n'est pas déjà fait :
   ```bash
   npm install -g serve
   ```

2. Démarrez le serveur statique dans le dossier `frontend` :
   ```bash
   cd frontend
   serve -l 8080 .
   ```

3. Ouvrez votre navigateur à :
   - `http://localhost:8080/index.html` pour l’accueil
   - `http://localhost:8080/login.html` pour se connecter

4. Vérifiez que l’API backend est en route sur :
   - `http://localhost:3000`

> Astuce : si vous utilisez `live-server`, `http-server` ou un autre outil, remplacez la commande `serve` par l’outil de votre choix.

---

## 🗄️ Configuration de la base de données (SQLite pour débuter, PostgreSQL plus tard)

### SQLite (recommandé pour démarrage local rapide)

1. Créez/éditez la racine `.env` :
   ```env
   # URL de connexion pour SQLite
   DATABASE_URL="file:./dev.db"

   JWT_SECRET="votre_secret_jwt"
   DEEPSEEK_API_KEY="votre_cle_api_ici"
   ```
2. Vérifiez `prisma/schema.prisma` :
   - `datasource db { provider = "sqlite" }`
   - dans Prisma 7+ on évite `url` ici, car la configuration est dans `prisma.config.ts`
3. Vérifiez `prisma.config.ts` :
   - `datasource: { url: process.env["DATABASE_URL"] }`
4. Exécutez les migrations :
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Lancez le backend :
   ```bash
   npm run dev
   ```


## � Exécution des tests (vérification du fonctionnement)

### 1. Tests unitaires / de route

Si tu as déjà un framework de test (Jest/Mocha) installé, lance :
```bash
npm test
```

Sinon, fais un test rapide en utilisant `curl` pour vérifier que le backend répond :

```bash
curl -X GET http://localhost:3000/health
```

ou, si `/health` n’existe pas, teste la route d’auth :

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 2. Tester l’API avec Postman / Insomnia

1. Run backend (`npm run dev`) et frontend (`serve -l 8080 .`).
2. Crée un utilisateur via `/auth/register` (requête POST). Exemple :

```json
{
  "email": "test@example.com",
  "password": "test123",
  "fullName": "Test User"
}
```

3. Connecte-toi via `/auth/login` et récupère le token.
4. Utilise le token dans `Authorization: Bearer <token>` pour appeler :
   - `GET /evaluations`
   - `POST /evaluation` pour créer un quiz
   - `POST /session` pour commencer une session

### 3. Créer des évaluations manuelles

#### Via l'interface web (recommandé)

1. **Connectez-vous** sur `http://localhost:8080/login.html`
2. **Allez sur "Create"** - la page s'ouvre en mode "Manual" par défaut
3. **Configurez votre évaluation** :
   - Titre de l'évaluation
   - Visibilité : "Private" (vous seul) ou "Shared" (avec code d'accès)
   - Temps par question (30s, 45s, 60s)

#### Option 1 : Ajouter des questions manuellement
- Cliquez sur "+ Add Question" pour ajouter des questions une par une
- Remplissez le texte de la question et les réponses
- Cochez la bonne réponse pour chaque question

#### Option 2 : Import JSON (rapide pour plusieurs questions)
- Cliquez sur "📄 Import JSON"
- Collez vos questions dans ce format :

```json
[
  {
    "text": "Quelle est la capitale de la France ?",
    "answers": [
      {"text": "Paris", "isCorrect": true},
      {"text": "Londres", "isCorrect": false},
      {"text": "Berlin", "isCorrect": false}
    ]
  },
  {
    "text": "Combien fait 2 + 2 ?",
    "answers": [
      {"text": "3", "isCorrect": false},
      {"text": "4", "isCorrect": true},
      {"text": "5", "isCorrect": false}
    ]
  }
]
```

- Cliquez sur "Import Questions" - validation automatique
- Sauvegardez l'évaluation

> **💡 Conseil** : Chaque question doit avoir au moins 2 réponses, dont une correcte (`"isCorrect": true`)

#### Partager votre évaluation
- Choisissez "Shared (access code)" lors de la création
- Après sauvegarde, vous recevrez un code d'accès de 6 caractères
- Partagez ce code avec vos participants
- Ils pourront rejoindre via `http://localhost:8080/join.html`

### 4. Vérification de la base SQLite

- Fichier `dev.db` créé à la racine.
- `.env` : `DATABASE_URL="file:./dev.db"`
- Prisma Migrations créées dans `prisma/migrations`

> Si tout passe, le stack est opérationnel pour le développement local.

---

## �🤖 Configuration API (DeepSeek)

Pour activer la génération automatique de questions par IA, vous devez configurer votre clé API :

1. Ouvrez ou créez le fichier `.env` à la racine.
2. Ajoutez votre clé :
   ```env
   DEEPSEEK_API_KEY="votre_cle_api_ici"
   JWT_SECRET="votre_secret_jwt"
   ```

---

## 🛠 Structure Technique
- `/src` : Source code (Express controllers, services, routes).
- `/prisma` : Schémas de données et modèles relationnels.
- `/accueil_landingpage` : Frontend statique (HTML/CSS).
- `index.ts` : Point d'entrée du serveur.


