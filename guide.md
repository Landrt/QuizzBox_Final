# QuizzBox - Spécification Technique Complète (Blueprint)

Ce document est une spécification technique exhaustive permettant de reconstruire l'intégralité du backend de QuizzBox. Il fait office de contrat d'interface et de guide d'implémentation pour la base de données et la logique métier.

---

## 🛠️ Stack Technique
- **Runtime** : Node.js (v18+)
- **Langage** : TypeScript (v5+)
- **Framework Web** : Express.js
- **ORM** : Prisma
- **Base de données** : SQLite (Développement/Test) ou PostgreSQL (Production)
- **Validation** : Zod (Schémas de données)
- **Sécurité** : JWT (Authentification), Bcrypt (Hachage), Helmet (Headers), Express-Rate-Limit.

---

## 📂 Structure du Projet (Squelette)
Le backend suit une architecture en couches (Controllers -> Services -> Prisma) :
```text
src/
├── config/             # Configuration (Prisma client, etc.)
├── controllers/        # Gestion des requêtes HTTP et réponses
├── dtos/               # Data Transfer Objects (Schémas Zod et Types)
├── middlewares/        # Auth, Logger, Error Handler
├── routes/             # Définition des points d'accès (Endpoints)
├── services/           # Logique métier (Calculs, DB Access)
├── types/              # Types TypeScript globaux
└── index.ts            # Point d'entrée de l'application
```

---

## 🗄️ Modèle de Données (Schema Prisma)
Voici la structure précise de la base de données pour assurer l'intégrité des données :

```prisma
// Modèle Utilisateur
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  fullName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  evaluations        Evaluation[]        @relation("CreatedEvaluations")
  evaluationSessions EvaluationSession[]
}

// Modèle Évaluation (Le Quizz)
model Evaluation {
  id                String               @id @default(uuid())
  title             String
  description       String?
  numQuestions      Int
  timePerQuestion   Int                  // en secondes
  mode              String               // "MANUAL" ou "AI"
  visibility        String               @default("PRIVATE")
  accessCode        String?              @unique
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  creatorId         String
  creator           User                 @relation("CreatedEvaluations", fields: [creatorId], references: [id])
  questions         Question[]
  sessions          EvaluationSession[]
}

// Modèle Question
model Question {
  id             String         @id @default(uuid())
  text           String
  evaluationId   String
  evaluation     Evaluation     @relation(fields: [evaluationId], references: [id], onDelete: Cascade)
  options        AnswerOption[]
  userAnswers    UserAnswer[]
}

// Modèle Option de Réponse
model AnswerOption {
  id          String   @id @default(uuid())
  text        String
  isCorrect   Boolean
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userAnswers UserAnswer[]
}

// Modèle Session (Progression d'un utilisateur sur un quizz)
model EvaluationSession {
  id                    String        @id @default(uuid())
  userId                String
  user                  User          @relation(fields: [userId], references: [id])
  evaluationId          String
  evaluation            Evaluation    @relation(fields: [evaluationId], references: [id])
  status                String        @default("IN_PROGRESS") // "COMPLETED"
  currentQuestionIndex  Int           @default(0)
  currentQuestionStartTime DateTime?
  score                 Int?           // Score final (0-100)
  totalQuestions        Int?
  correctAnswersCount   Int?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  answers               UserAnswer[]
}

// Modèle Réponse Utilisateur
model UserAnswer {
  id          String            @id @default(uuid())
  sessionId   String
  session     EvaluationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  questionId  String
  optionId    String
  startTime   DateTime          @default(now())
  submittedAt DateTime          @default(now())
  isCorrect   Boolean
}
```

---

## 🛰️ Spécification détaillée des API

### 🔐 Authentification (`/api/auth`)
1. **`POST /register`**
   - **Body** : `{ email, password (min 6), fullName }`
   - **Action** : Hacher le mot de passe (Bcrypt), créer l'utilisateur.
2. **`POST /login`**
   - **Body** : `{ email, password }`
   - **Response** : `{ user: {id, email, fullName}, token }`
3. **`GET /profile`** *(Token requis)*
   - **Response** : Profil de l'utilisateur connecté.

### 📝 Évaluations (`/api/evaluation`)
1. **`POST /`** *(Token requis)*
   - **Body** : `{ title, description?, numQuestions, timePerQuestion, mode }`
2. **`GET /user/me`** *(Token requis)*
   - **Action** : Récupère les quizz créés par l'utilisateur.
3. **`POST /:id/generate-code`** *(Token requis)*
   - **Action** : Génère un code aléatoire de 6 caractères alphanumériques uniques pour ce quizz.
4. **`POST /join`** *(Token requis)*
   - **Body** : `{ accessCode }`
   - **Action** : Recherche l'évaluation liée au code.

### ⏱️ Sessions & Quizz Interactif (`/api/session`)
1. **`POST /start`**
   - **Body** : `{ evaluationId }`
   - **Action** : Créer une entrée `EvaluationSession` à l'index 0.
2. **`GET /:id/current-question`**
   - **Action** : Renvoie la question actuelle de la session SANS indiquer `isCorrect` pour les options.
   - **Important** : Enregistre `currentQuestionStartTime` lors du premier appel pour cette question.
3. **`POST /:id/answer`**
   - **Body** : `{ optionId }`
   - **Logique** : 
     - Calculer `elapsedTime`. Si `elapsedTime > timePerQuestion + 2s`, la réponse est refusée.
     - Enregistrer la réponse `isCorrect` dans `UserAnswer`.
     - Incrémenter `currentQuestionIndex`.
     - Si index >= total, passer le statut à `COMPLETED` et calculer le score final.

---

## 🧠 Logique Métier Critique

### 1. Calcul du Score Final
Le score est calculé uniquement lors de la clôture de la session :
- `score = (Nombre de réponses correctes / Nombre total de questions répondues) * 100` (arrondi à l'entier le plus proche).

### 2. Validation du Temps
À chaque soumission de réponse, le backend compare la date actuelle avec `currentQuestionStartTime` :
- Si `Délai > (evaluation.timePerQuestion + marge_grace_2s)`, la réponse est marquée comme invalide ou la session est bloquée pour cette question.

### 3. Protection Anti-Triche
L'API `current-question` **doit** filtrer le champ `isCorrect` des options de réponse avant de les envoyer au client. La vérification de la justesse (`isCorrect`) ne se fait que côté serveur lors de la soumission.

---

## ⚙️ Configuration & Environnement
Variables requises dans le fichier `.env` :
```env
DATABASE_URL="file:./dev.db" # Pour SQLite
JWT_SECRET="votre_secret_tres_long"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="*"
```

---

## 🚀 Guide de lancement
1. Installer les dépendances : `npm install`
2. Initialiser la DB : `npx prisma migrate dev`
3. Lancer le serveur : `npm run dev`
