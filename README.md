# Abjad Analyzer

> Analysez les textes arabes selon les systèmes Abjad, comprenez chaque étape du calcul et conservez vos analyses dans un espace bilingue français/arabe.

Abjad Analyzer est une application web Next.js dédiée au calcul numérique de textes arabes. Elle combine un moteur Abjad pur et déterministe avec une interface RTL accessible, la normalisation Unicode, le Grand/Petit Abjad, la réduction théosophique, le traitement phonétique de la Shadda, l’OCR d’images par Gemini et un historique local.

> **Important :** la classification élémentaire (Feu, Terre, Air, Eau) est présentée comme un système traditionnel et non comme une validation scientifique.

## Fonctionnalités

- **Calcul Abjad en temps réel** à partir d’un texte arabe saisi ou importé.
- **Grand Abjad** avec somme des valeurs traditionnelles des 28 lettres.
- **Petit Abjad** avec valeurs réduites de 1 à 9.
- **Réduction théosophique** du total, par exemple `786 → 3`.
- **Normalisation configurable** :
  - conversion des variantes de Hamza vers `ا` ;
  - conversion de `ة` vers `ه` ;
  - conversion de `ى` vers `ي` ;
  - suppression du Tashkeel et du Tatweel ;
  - conservation et traitement phonétique de la Shadda.
- **Décomposition lettre par lettre**, avec valeur, position et indication des caractères ignorés.
- **OCR arabe par IA** via Google Gemini : import d’images, glisser-déposer et capture caméra.
- **Historique local** : sauvegarde, recherche, favoris, filtres, suppression et réouverture des analyses.
- **Interface bilingue français/arabe**, avec direction `ltr`/`rtl` adaptée et cookie `abjad-lang`.
- **Page Méthodologie** expliquant les règles de calcul et les conventions utilisées.
- **Accessibilité et responsive design** : skip-link, focus visible, modal OCR avec gestion du focus, support de `prefers-reduced-motion` et tables sémantiques.

## Exemples de référence

Le moteur vérifie notamment les résultats suivants :

| Texte | Grand Abjad | Réduction théosophique |
| --- | ---: | ---: |
| `الله` | `66` | `3` |
| `بسم الله الرحمن الرحيم` | `786` | `3` |

Les chiffres, espaces, signes de ponctuation, caractères latins et emojis sont conservés dans la décomposition mais ignorés dans le calcul sans provoquer d’erreur.

## Stack technique

- **TypeScript** en mode strict
- **Next.js 16** avec App Router et React 19
- **Tailwind CSS 4** pour le style
- **Vitest** pour les tests unitaires
- **Lucide React** pour les icônes
- **Tesseract.js** présent dans les dépendances du projet
- **Google Gemini via `@google/genai`** pour le service OCR côté serveur

## Architecture

```text
.
├── public/                         # ressources statiques
├── src/
│   ├── app/                        # routes et pages Next.js App Router
│   │   ├── page.tsx                # calculateur principal
│   │   ├── layout.tsx              # métadonnées, langues, direction RTL/LTR
│   │   ├── history/                # page historique
│   │   ├── methodology/            # page méthodologique
│   │   └── api/ocr/                # endpoint serveur POST /api/ocr
│   ├── components/
│   │   ├── calculator/             # saisie, toolbar, configuration, workbench
│   │   ├── results/                # dashboard, décomposition, comparaisons
│   │   ├── ocr/                    # upload, aperçu et capture caméra
│   │   ├── history/                # liste, filtres et éléments d’historique
│   │   ├── methodology/            # présentation de la méthodologie
│   │   ├── layout/                 # header et navigation
│   │   └── ui/                     # composants d’interface réutilisables
│   ├── core/
│   │   ├── abjad/                  # moteur de calcul indépendant de React
│   │   │   ├── alphabet.ts         # tables Grand/Maghribi et classification
│   │   │   ├── normalizer.ts       # normalisation et journal des changements
│   │   │   ├── grapheme-parser.ts  # parsing Unicode et séquences combinées
│   │   │   ├── calculator.ts       # calcul et décomposition du résultat
│   │   │   ├── reducer.ts          # réduction théosophique
│   │   │   ├── shadda.ts            # analyse du mode phonétique
│   │   │   └── config.ts            # configurations et profils
│   │   ├── ocr/                    # types, limites et erreurs OCR
│   │   └── storage/                # abstraction et implémentation LocalStorage
│   ├── contexts/                   # contexte de langue
│   ├── hooks/                      # calcul, historique et OCR côté client
│   ├── i18n/                       # dictionnaires français/arabe typés
│   ├── lib/                       # utilitaires et client Gemini serveur
│   ├── types/                     # types partagés de l’application
│   └── tests/                     # tests Vitest du moteur et des services
├── package.json                    # scripts et dépendances
├── vitest.config.mts               # configuration Vitest et alias `@/*`
├── tsconfig.json                   # TypeScript strict et alias de sources
└── AGENTS.md                       # règles d’architecture et de contribution
```

### Flux principal

La page d’accueil rend `AbjadWorkbench`, qui orchestre `useAbjad`, `useHistory`, `TextInput`, `ConfigPanel` et `ResultDashboard`. À chaque modification, le texte passe par `normalizeText`, puis `parseGraphemes` et `calculateAbjad` dans `src/core/abjad`; le résultat est ensuite présenté par les composants React sans dupliquer les règles métier.

Pour l’OCR, `OcrPanel` valide l’image côté client puis appelle `POST /api/ocr`. La route serveur utilise `src/lib/gemini.ts`, garde la clé Gemini hors du navigateur et renvoie le texte extrait afin que l’utilisateur puisse le corriger avant de le calculer. Les analyses sauvegardées passent par l’interface `HistoryStorage` et sont stockées dans `localStorage` sous la clé `abjad:history`.

## Prérequis

- Node.js compatible avec Next.js 16
- npm
- Une clé Google Gemini uniquement si la fonctionnalité OCR est utilisée

## Installation

```bash
npm install
```

Créez ensuite un fichier `.env.local` à la racine :

```env
GEMINI_API_KEY=votre_cle_gemini
# Optionnel : surcharge le modèle utilisé par l’OCR
GEMINI_MODEL=gemini-3.6-flash
```

La variable `GEMINI_API_KEY` est lue côté serveur. Ne créez jamais de variable `NEXT_PUBLIC_GEMINI_API_KEY` et ne stockez jamais cette clé dans `localStorage`.

## Développement

Lancer le serveur de développement :

```bash
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev          # serveur Next.js en développement
npm run build        # build de production
npm start            # serveur Next.js de production
npm run lint         # vérification ESLint
npm test             # exécution des tests Vitest
npm run test:watch   # tests Vitest en mode watch
```

## OCR : limites et sécurité

- Formats acceptés : JPEG, PNG, WebP et GIF.
- Taille maximale : **5 Mo**.
- Les captures caméra sont redimensionnées à **1600 px maximum** et converties en JPEG.
- La route `/api/ocr` valide le type MIME et la taille avant d’appeler Gemini.
- Le texte OCR doit être relu et corrigé par l’utilisateur avant le calcul.
- Les erreurs sont typées (`invalid_type`, `file_too_large`, `provider_error`, etc.) pour permettre un affichage adapté et les nouvelles tentatives.

## Tests

Les tests situés dans `src/tests/` couvrent notamment :

- les valeurs de référence et les méthodes Abjad ;
- l’alphabet et la table Maghribi ;
- la normalisation, le Tashkeel, le Tatweel et la Shadda ;
- le parsing Unicode et les textes mixtes ;
- la réduction théosophique ;
- l’historique LocalStorage et les données invalides ;
- les dictionnaires i18n et les utilitaires ;
- les types et limites du flux OCR.

Exécuter la suite avec :

```bash
npm test
```

Toute modification de `src/core/abjad/` doit conserver un moteur pur, déterministe, indépendant de React/Next.js et accompagné de tests.

## API du moteur

Le point d’entrée public se trouve dans `src/core/abjad/index.ts` :

```ts
import {
  calculateAbjad,
  DEFAULT_CALCULATION_CONFIG,
} from '@/core/abjad';

const result = calculateAbjad({
  text: 'بسم الله الرحمن الرحيم',
  config: DEFAULT_CALCULATION_CONFIG,
});

console.log(result.totalValue); // 786
```

Les fonctions principales comprennent `normalizeText`, `parseGraphemes`, `reduceValue`, `getAbjadValue`, `getElement` et `calculateAbjad`. Les profils de calcul sont exposés par `PROFILES`.

## Limites connues

- L’historique est local au navigateur ; l’abstraction `HistoryStorage` facilite une future migration vers IndexedDB ou un backend.
- La normalisation peut supprimer certaines distinctions orthographiques selon les options choisies.
- L’OCR dépend de la disponibilité et de la configuration du fournisseur Gemini.
- La classification élémentaire est traditionnelle et ne constitue pas une affirmation scientifique.

## Contribution

1. Créer une branche dédiée.
2. Préserver la séparation entre `src/core`, l’interface dans `src/components`/`src/app` et les services externes dans `src/lib`.
3. Ne pas utiliser `any` et conserver le mode TypeScript strict.
4. Ajouter ou mettre à jour les tests avant de modifier le comportement du moteur.
5. Vérifier les contrôles avant de proposer une modification :

```bash
npm run lint
npm test
npm run build
```

Les conventions détaillées d’architecture et de sécurité sont documentées dans [`AGENTS.md`](./AGENTS.md).
