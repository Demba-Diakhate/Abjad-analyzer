# Abjad Analyzer

Abjad Analyzer est une application web pour calculer, comparer et comprendre les valeurs des textes arabes selon les systèmes Abjad traditionnels.

Que vous soyez étudiant, chercheur, enseignant ou passionné de langue arabe, l’outil vous aide à :

- calculer le Grand Abjad et le Petit Abjad
- appliquer des règles de normalisation avancées
- analyser la réduction théosophique
- traiter la Shadda en mode phonétique
- importer du texte via OCR ou caméra
- garder un historique de vos analyses

## Ce que vous pouvez faire

- Saisir un texte arabe et obtenir son score instantané
- Explorer la décomposition lettre par lettre
- Comparer les méthodes de calcul et les profils
- Utiliser une interface bilingue FR/AR avec support RTL
- Extraire du texte depuis une image grâce à l’OCR Gemini

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vitest
- Gemini OCR

## Démarrage rapide

```bash
npm install
npm run dev
```

Puis ouvrez : http://localhost:3000

Pour l’OCR, ajoutez une clé Gemini dans votre fichier `.env.local` :

```env
GEMINI_API_KEY=votre_cle
GEMINI_MODEL=gemini-3.6-flash
```

## Pourquoi ce projet ?

Abjad Analyzer combine l’exactitude du moteur de calcul avec une expérience moderne et lisible. Il est pensé pour rendre l’analyse abjad accessible, testable et agréable à utiliser, sans perdre la rigueur des règles traditionnelles.

## Mission

Faciliter l’étude des textes arabes et leur calcul numérique, tout en rendant l’outil simple, fiable et visuellement clair.

## Status

Projet prêt à être utilisé localement et extensible pour de nouvelles fonctionnalités : méthodologie, historique, OCR, profils de calcul et analyse plus poussée.
