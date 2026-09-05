<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Abjad Analyzer — Guide de l'agent

> **Document central des instructions** pour tout agent travaillant sur ce projet.
> Il synthétise le cahier des charges `ABJAD-ANALYZER-CAHIER-DES-CHARGES-NEXTJS.md` et les règles d'architecture.

## Vue d'ensemble

Plateforme d'analyse et de calcul numérique Abjad : saisie, normalisation, calcul et analyse de textes arabes (Grand Abjad, Petit Abjad, réduction théosophique, Shadda phonétique), avec OCR arabe par IA (Gemini), historique local, export et interface bilingue Français/Arabe avec support RTL.

## Règles générales

- **Next.js App Router** (pas React/Vite) comme framework principal.
- **TypeScript strict** — ne jamais utiliser `any`.
- **Tailwind CSS** pour le style, **Lucide React** pour les icônes.
- **Server Components par défaut** ; `"use client"` uniquement pour l'interactivité, `localStorage`, `navigator.mediaDevices`, `canvas`, `FileReader`, drag & drop.
- **Ne jamais exposer la clé Gemini au navigateur** : pas de préfixe `NEXT_PUBLIC_`. Clé uniquement côté serveur (variables d'env `GEMINI_API_KEY`, modèle `GEMINI_MODEL`).
- Séparer nettement : logique métier (`src/core`), interface (`src/app`, `src/components`), services externes (`src/lib`), persistance (`src/core/storage`), types (`src/types`), hooks (`src/hooks`), i18n (`src/i18n`).
- **Le moteur Abjad est pur, déterministe, testable et 100% indépendant de React/Next.js.**
- Les règles Abjad ne doivent JAMAIS être placées dans des composants React.
- Suivre l'ordre : **CORRECTNESS → TESTS → ARCHITECTURE → UX → PERFORMANCE**.
- D'abord le moteur, puis les tests, puis l'UI.

## Structure du projet

```text
src/
├── app/                    # pages + routes API (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── api/ocr/route.ts    # POST /api/ocr (côté serveur, secret Gemini)
│   ├── methodology/page.tsx
│   └── history/page.tsx
├── components/             # ui/, calculator/, results/, ocr/, history/, layout/
├── core/                   # logique métier PUR (aucune dépendance React)
│   ├── abjad/
│   │   ├── alphabet.ts     # table ABJAD_VALUES (28 lettres) + éléments
│   │   ├── normalizer.ts   # règles de normalisation configurables
│   │   ├── grapheme-parser.ts  # parsing Unicode / grapheme clusters
│   │   ├── calculator.ts   # calculateur Grand/Petit Abjad
│   │   ├── reducer.ts      # réduction théosophique
│   │   ├── shadda.ts       # traitement mode phonétique (×2)
│   │   ├── config.ts       # config par défaut + profils
│   │   └── index.ts
│   ├── ocr/                # types + client OCR
│   └── storage/            # types + abstraction persistance
├── contexts/               # language-context
├── hooks/                  # use-abjad, use-history, use-ocr
├── i18n/                   # fr.ts, ar.ts
├── lib/                    # gemini.ts (serveur), utils.ts
├── types/index.ts          # types partagés
└── tests/                  # tests Vitest
```

## Moteur Abjad (fait — ne pas dupliquer)

Le moteur est dans `src/core/abjad/`, entièrement construit et testé. **Ne pas le réécrire.** S'y référer et l'étendre si nécessaire.

### Table Grand Abjad (28 lettres)

```
ا=1 ب=2 ج=3 د=4 ه=5 و=6 ز=7 ح=8 ط=9 ي=10
ك=20 ل=30 م=40 ن=50 س=60 ع=70 ف=80 ص=90 ق=100
ر=200 ش=300 ت=400 ث=500 خ=600 ذ=700 ض=800 ظ=900 غ=1000
```

### API du moteur (`src/core/abjad/index.ts`)

- `calculateAbjad({ text, config }): AbjadResult` — point d'entrée principal.
- `normalizeText(input, options): NormalizationResult` — normalisation configurable (`options.config`, `options.preserveShadda`).
- `parseGraphemes(input): GraphemeToken[]` — découpage en séquences combinées.
- `reduceValue(n): number` — réduction théosophique (786 → 3).
- `toSmallAbjad(n): number` — Petit Abjad (100 → 1).
- `shaddaMultiplier(method, baseValue): number`, `expandShadda(token): string[]`, etc.
- `ABJAD_VALUES`, `getAbjadValue`, `isAbjadLetter`, `getElement` (classification élémentaire).
- `DEFAULT_CALCULATION_CONFIG`, `PROFILES` (standard/strict/phonetic/custom).

### Types principaux (`src/types/index.ts`)

`NormalizationConfig`, `CalculationConfig`, `LetterBreakdown`, `ElementType`, `ElementDistribution`, `MethodDetails`, `AbjadResult`, `HistoryRecord`, `HistorySource`.

### Règles du moteur à respecter

- **Normalisation** (configurable individuellement) : Hamza (أإآءئؤ→ا), Tā' Marbūṭa (ة→ه), Alif Maqṣūrah (ى→ي), suppression Tashkeel (`ّ َ ُ ِ ً ٌ ٍ ْ ٰ`), suppression Tatweel (U+0640).
- **Shadda** : gérée via `phoneticMode`. En mode phonétique, les séquences combinées (lettre + U+0651) sont comptées deux fois ; la Shadda est préservée dans le texte normalisé.
- **Méthodes** : `classic` (Grand Abjad, somme brute), `reduced` (Petit Abjad, valeurs ramenées 1-9). `reduction` calcule la réduction théosophique du total.
- **Caractères non-Abjad** (chiffres, ponctuation, latin, emojis, espaces) : jamais d'erreur, marqués `ignored: true` avec explication.
- **Texte vide** : résultat cohérent, `totalValue = 0`, sans erreur.
- **Valeurs de référence** : `الله = 66`, `بسم الله الرحمن الرحيم = 786` (réduction → 3). Ne jamais coder de valeurs "magiques" pour forcer ces résultats — ils doivent provenir des règles du moteur.
- **Classification élémentaire** (Feu/Terre/Air/Eau) : présentée comme un système traditionnel, JAMAIS comme une validation scientifique.

## Tests

- Framework : **Vitest** (`vitest.config.mts`, alias `@` → `./src`).
- Commandes : `npm test` (run), `npm run test:watch`.
- Les tests vivent dans `src/tests/*.test.ts`.
- Toute modification du moteur doit conserver les tests au vert (actuellement 149 tests passent).

## Commandes

```bash
npm install       # installation
npm run dev       # développement
npm run build     # build de production
npm start         # production
npm run lint      # ESLint
npm test          # tests Vitest (run)
npm run test:watch# tests en mode watch
```

## Environnement

```env
GEMINI_API_KEY=       # obligatoire côté serveur pour l'OCR
GEMINI_MODEL=         # optionnel, modèle Gemini
```

Ne jamais créer de variable `NEXT_PUBLIC_GEMINI_API_KEY`. Ne jamais stocker de clé dans `localStorage`.

## État d'avancement

- [x] Étape 1 : Init Next.js + TS + Tailwind (App Router, `src/`, alias `@/*`)
- [x] Étape 2 : Types
- [x] Étape 3 : Table Abjad
- [x] Étape 4 : Normalizer
- [x] Étape 5 : Parser Unicode / grapheme
- [x] Étape 6 : Calculateur
- [x] Étape 7 : Réduction
- [x] Étape 8 : Shadda
- [x] Étape 9 : Tests du moteur
- [x] Étape 10 : Interface de saisie (textarea RTL auto, header, workbench)
- [x] Étape 11 : Dashboard des résultats (valeur, réduction, méthode, stats, décomposition, comparaison, éléments)
- [x] Étape 12 : Filtres (panneau de normalisation, méthode, profils, Shadda)
- [x] Étape 13 : i18n FR/AR + RTL (cookie `abjad-lang`, `<html lang dir>`, propriétés logiques)
- [x] Étape 14 : Historique LocalStorage (abstraction `HistoryStorage`, recherche, filtres, favoris, ouvrir)
- [x] Étape 15 : API OCR (Gemini, `POST /api/ocr`, `src/lib/gemini.ts`, `@google/genai`)
- [x] Étape 16 : Upload + validation OCR (drag & drop, états OCR, correction)
- [x] Étape 17 : Caméra (`getUserMedia`, capture canvas)
- [x] Étape 18 : Méthodologie (page complète, 10 sections)
- [x] Étape 19 : Responsive + accessibilité (WCAG : skip-link + cibles `#main-content`, focus géré dans le modal OCR, `prefers-reduced-motion`, table de décomposition sémantique, contrastes AA renforcés, `aria-current`)
- [x] Étape 20 : Tests et optimisation finale (tests historiques/i18n/profils — 149 tests, métadonnées SEO localisées, titre par page)

## Composants UI (étapes 10-14)

- `src/components/layout/header.tsx` — header (nav, switch langue FR/AR)
- `src/components/calculator/` — `abjad-workbench` (orchestrateur), `text-input`, `toolbar`, `config-panel`
- `src/components/results/` — `result-dashboard`, `breakdown-table`, `text-comparison`, `element-distribution`
- `src/components/history/` — `history-view`, `history-item`, `history-filters`
- `src/components/methodology/methodology-view.tsx` — stub (étape 18)
- `src/components/ui/` — `card`, `toggle`
- `src/hooks/` — `use-abjad` (calcul temps réel + debounce 150 ms > 10k chars), `use-history`, `use-ocr`
- `src/contexts/language-context.tsx` — contexte langue + `useLanguage()` (retourne `t`)
- `src/i18n/fr.ts` / `ar.ts` / `index.ts` — dictionnaires typés, `Dictionary = typeof fr`
- `src/core/storage/` — `types.ts` (interface `HistoryStorage` + `StorageError`), `history-storage.ts` (`LocalStorageHistoryStorage`, `createRecord`)
- `src/core/ocr/` — `types.ts` (MIME autorisés, limites 5 Mo, codes erreur) + `index.ts`
- `src/lib/gemini.ts` — client serveur `@google/genai` (`performOcr`), modèle défaut `gemini-3.6-flash` (surchargé par `GEMINI_MODEL`)
- `src/app/api/ocr/route.ts` — `POST /api/ocr` (validation MIME/size → 415/413, erreurs → 502/503)
- `src/components/ocr/` — `ocr-panel` (modal onglets Image/Caméra, drag & drop, aperçu, correction), `camera-capture` (`getUserMedia` + canvas, capture ≤ 1600 px en JPEG)
- `src/components/methodology/methodology-view.tsx` — **page Méthodologie complète** (10 sections, sommaire + ancres, table des 28 lettres et exemples **calculés par le moteur**, avertissement non-scientifique)
- `src/lib/utils.ts` — `cn`, `isArabicText`, `formatNumber`

### Règles UI/i18n

- **Zéro chaîne écrite en dur dans les composants** : tout passe par `useLanguage().t`.
- **RTL** : uniquement des propriétés logiques Tailwind (`ms-`, `ps-`, `text-start`, `translate-x … rtl:-translate-x-…`). Le `dir` global est géré par `<html>` via cookie + effet client.
- Texte arabe : class `font-arabic` (variable `--font-noto-naskh`). UI : `--font-inter`.

## OCR (étapes 15-17)

- **Flux** : Toolbar → `OcrPanel` (modal) → upload fichier ou capture caméra → `useOcr` :
  1. validation côté client (MIME, taille ≤ 5 Mo) ;
  2. lecture `FileReader` → base64 ;
  3. `POST /api/ocr` (route serveur, `runtime = 'nodejs'`) ;
  4. retour `{ text }` affiché dans une zone de correction (toujours relire avant de calculer) ;
  5. « Appliquer au calculateur » → `abjad.setText` + source `ocr`/`camera`.
- **Caméra** : `getUserMedia({ video: { facingMode: 'environment' } })`, capture via canvas redimensionné (max 1600 px) en `image/jpeg`, arrêt du flux au démontage. Gestion des erreurs `NotAllowedError`/`NotFoundError`.
- **Codes erreur** (`OcrErrorCode`) : `invalid_request` (400), `invalid_type` (415), `file_too_large` (413), `empty_result` (422-502), `provider_unavailable` (503), `provider_error` (502). Le client localise via `t.ocr.errors[code]` et propose `retry` si `isRetryableOcrError(code)`.
- **Modèle** : `GEMINI_MODEL` (défaut `gemini-3.6-flash` — `gemini-2.5-flash` n'est plus disponible pour les nouveaux comptes). La clé reste serveur (`process.env.GEMINI_API_KEY` dans `src/lib/gemini.ts` uniquement).
- Le workbench garde `source` (`manual`/`ocr`/`camera`) pour l'enregistrement dans l'historique ; retombée sur `manual` dès qu'on tape.

## Prochaines étapes

Projet terminé (20/20). Idées d'évolution possibles : export PDF/CSV, profils utilisateur, comparaison entre textes, page « À propos ».

Principes à garder : UX simple ("Écrire → Calculer → Comprendre"), modes simple/expert, profils de calcul (via `CalculationConfig`), RTL impeccable (propriétés logiques CSS : `margin-inline`, `padding-inline`, `inset-inline`, etc.), i18n sans chaînes françaises en dur dans les composants.

## Accessibilité / Responsive (étape 19 — appliqué)

- **Skip-link** : premier élément du `<body>` (layout serveur, localisé `t.common.skipToContent`), cible `#main-content` présent sur les 3 `<main>`.
- **`globals.css`** : fallback global `:focus-visible` (outline ambre) + bloc `@media (prefers-reduced-motion: reduce)` (coupe animations/transitions).
- **Modal OCR** : `role="dialog"` + `aria-modal` + `aria-labelledby` sur la carte ; mise au point à l'ouverture, **piège Tab**, restauration du focus à la fermeture (Échap ou clic arrière-plan gérés).
- **Tables** : `breakdown-table` convertie en `<table>` sémantique (`th scope=col`, th sticky, 3 colonnes, badge Shadda intégré au statut).
- **Contraste** : placeholders/métadonnées `zinc-400` → `zinc-500` ; boutons principaux `bg-amber-500 text-amber-950` (ratio ≥ ~6:1 au lieu de ~2:1) ; état « sauvegardé » `emerald-600 text-emerald-50`.
- **Toggle** : `useId` + `aria-labelledby` (+ `aria-describedby` pour la description).
- **Divers** : `aria-current="page"` nav, `role="note"` bandeau méthodo, `role="status"`/`role="alert"` caméra, focus-visible ajouté aux ancres méthodo, dashboard : `aria-live` déplacé sur un annonceur `<p class="sr-only">` (résultat total/réduction) au lieu du bloc entier.
