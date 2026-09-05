# Abjad Analyzer

Plateforme d'analyse et de calcul numérique Abjad : saisir, normaliser, calculer et analyser des textes arabes selon différents systèmes de calcul Abjad, avec OCR arabe par IA (Gemini), historique local, export et interface bilingue Français/Arabe avec support RTL.

> **État actuel :** projet terminé (20/20) — moteur Abjad (pur, 149 tests), interface complète : saisie, dashboard, filtres/profils, i18n FR/AR + RTL, historique local, **OCR Gemini** (image + caméra), **page Méthodologie** (10 sections), accessibilité WCAG et métadonnées SEO localisées.

### Tests & optimisation (étape 20)

- **149 tests Vitest** : moteur (valeurs de référence, méthodes, réduction, normalisation, Unicode/Shadda, alphabet), **historique** (sauvegarde/lecture/MAJ/suppression, données corruptes, quota), **i18n** (parité stricte des clés FR↔AR garantie par le type `Dictionary = typeof fr`, chaînes non vides) et **profils**.
- Métadonnées SEO localisées par page (`generateMetadata` lit le cookie `abjad-lang`) : titres `<title>` FR/AR + description ; template global sous la marque « Abjad Analyzer ».

### Accessibilité & responsive (étape 19)

Skip-link vers `#main-content` (localisé FR/AR), `lang`/`dir` sur `<html>`, `prefers-reduced-motion`, fallback `:focus-visible`, modal OCR avec `dialog`/`aria-modal`/piège Tab + restauration de focus, table de décomposition sémantique (`<table>` + `th scope`), `aria-current` dans la nav, étiquettes `aria-labelledby` sur les switches, contraste AA (placeholders/méta `zinc-500`, boutons principaux texte sombre sur ambre), annonce `aria-live` ciblée sur les totaux. Layout mobile fluide (grilles adaptatives, tables à défilement horizontal).

## Installation

```bash
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=
GEMINI_MODEL=
```

> La clé `GEMINI_API_KEY` reste **exclusivement côté serveur**. Ne jamais utiliser de préfixe `NEXT_PUBLIC_` ni stocker la clé dans le navigateur ou `localStorage`.

## Développement

```bash
npm run dev
```

## Tests

```bash
npm test
# ou
npm run test:watch
```

## Lint

```bash
npm run lint
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Architecture

```text
src/
├── app/                # pages (/, /history, /methodology) + routes API (App Router)
├── components/         # composants UI (ui/, calculator/, results/, history/, layout/, methodology/)
├── core/               # logique métier PUR, indépendante de React/Next.js
│   ├── abjad/          # moteur Abjad (alphabet, normalizer, calculator, reducer, shadda)
│   ├── ocr/            # types + client OCR
│   └── storage/        # types + abstraction persistance (HistoryStorage, localStorage)
├── contexts/           # LanguageProvider (FR/AR)
├── hooks/              # use-abjad (calcul temps réel + debounce), use-history
├── i18n/               # dictionnaires fr.ts / ar.ts (typés)
├── lib/                # gemini.ts (serveur), utils (cn, isArabicText, formatNumber)
├── types/              # types partagés
└── tests/              # tests Vitest
```

## Interface (étapes 10-14)

- **Saisie** : zone de texte à direction automatique (RTL si texte arabe), boutons Effacer/Insérer, barre d'outils avec **OCR** (importer une image) et **caméra** (photographier), panneau Options.
- **OCR (étapes 15-17)** : upload par glisser-déposer ou parcours de fichiers (JPEG/PNG/WebP/GIF, ≤ 5 Mo) ou capture caméra (`getUserMedia`, canvas ≤ 1600 px). Extraction par Gemini (`POST /api/ocr`, clé serveur uniquement), aperçu, gestion d'erreurs avec relance, puis **correction du texte extrait avant application** au calculateur. Les analyses sont enregistrées avec la source OCR/Caméra.
- **Résultats** : valeur Grand/Small Abjad (Grand Abjad), réduction théosophique, total brute/pertinente, statistiques (mots, lettres, caractères ignorés), décomposition lettre par lettre (tableau), comparatif original↔normalisé, classification élémentaire (Feu/Terre/Air/Eau).
- **Filtres** : panneau de configuration — méthode (classique/réduite), profils (standard/strict/phonétique), normalisation par règle, Shadda phonétique, mode réduction.
- **i18n** : bilingue FR/AR, bascule depuis le header, `dir`/`lang` sur `<html>` (cookie `abjad-lang`), propriétés logiques pour un RTL impeccable.
- **Historique** (LocalStorage) : les analyses sont sauvegardées, listées, searchables, filtrables (tous/favoris/OCR/manuel/caméra), favorites, supprimables et réouvrables dans l'éditeur.
- **Méthodologie** (/methodology) : 10 sections — principe général, table des 28 lettres (valeurs, Petit Abjad, éléments), Grand/Petit Abjad, réduction, normalisation, Shadda, caractères ignorés, éléments, limites. Sommaire avec ancres ; exemples numériques et table **calculés par le moteur** (pas de valeurs codées en dur).

## Moteur Abjad

Le moteur est `src/core/abjad/`, **pur et déterministe**, sans dépendance à React/Next.js. Il implémente :

- La **table Grand Abjad** des 28 lettres (`ABJAD_VALUES`).
- La **normalisation** configurable (Hamza, Tā' Marbūṭa, Alif Maqṣūrah, Tashkeel, Tatweel), chaque règle étant activable individuellement.
- Le **parsing Unicode / grapheme clusters** (traitement des séquences combinées lettre + diacritiques).
- Le **calcul** Grand Abjad (somme brute) et Petit Abjad (valeurs ramenées 1-9).
- La **réduction théosophique** (ex. 786 → 3).
- La **Shadda / mode phonétique** (une lettre avec Shadda comptée deux fois).
- La **classification élémentaire** (Feu/Terre/Air/Eau), présentée comme un système traditionnel, non comme une validation scientifique.

Point d'entrée : `calculateAbjad({ text, config })`.

Valeurs de référence testées : `الله = 66`, `بسم الله الرحمن الرحيم = 786` (réduction `3`).

## Règles de normalisation

| Règle | Transformation | Activable |
|---|---|---|
| Hamza | `أ إ آ ء ئ ؤ` → `ا` | `convertHamza` |
| Tā' Marbūṭa | `ة` → `ه` | `convertTamarbuta` |
| Alif Maqṣūrah | `ى` → `ي` | `convertAlifMaqsura` |
| Tashkeel | suppression `َّ َ ُ ِ ً ٌ ٍ ْ ٰ` | `removeTashkeel` |
| Tatweel | suppression U+0640 | `removeTatweel` |
| Phonétique | Shadda ×2 | `phoneticMode` |

## OCR (IA)

L'OCR utilise Google Gemini via `@google/genai`, avec la clé **côté serveur** uniquement :
- `src/lib/gemini.ts` : client Gemini (`performOcr`), modèle par défaut `gemini-3.6-flash` (surchargé par `GEMINI_MODEL`).
- `src/app/api/ocr/route.ts` : `POST /api/ocr` — validation MIME (JPEG/PNG/WebP/GIF) et taille (≤ 5 Mo), codes d'erreur typés.
- L'utilisateur doit toujours valider/corriger le texte extrait avant calcul.
- Caméra : `getUserMedia` + capture canvas (max 1600 px, JPEG).

## Sécurité

- La clé Gemini n'est jamais exposée au bundle client.
- Validation des fichiers uploadés (types MIME, taille).
- Aucune injection de HTML utilisateur sans sanitation.
- Aucune clé stockée dans `localStorage`.

## Tests

Tests Vitest dans `src/tests/` : alphabet, normalisation, diacritiques, tatweel, shadda, réduction, texte mixte, Unicode, texte vide, valeurs de référence, helpers (`isArabicText`, `cn`), logique OCR (MIME, retry, limites), **historique localStorage**, **parité i18n FR/AR** et **profils**. Actuellement **149 tests** passent.

## Limites connues

- Classification élémentaire selon système traditionnel, pas une preuve scientifique.
- L'historique utilise `localStorage` (abstrait derrière l'interface `HistoryStorage` pour migration future vers IndexedDB/backend).
- Le calcul est effectué sur les caractères normalisés ; certaines distinctions orthographiques fines peuvent être perdues selon la configuration des filtres.

## Documents de référence

- `AGENTS.md` : guide des instructions pour l'agent (règles d'architecture et d'implémentation).
- `ABJAD-ANALYZER-CAHIER-DES-CHARGES-NEXTJS.md` : cahier des charges complet.
