'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, ArrowUp } from 'lucide-react';
import {
  ABJAD_VALUES,
  calculateAbjad,
  DEFAULT_CALCULATION_CONFIG,
  getElement,
  reduceValue,
  toSmallAbjad,
} from '@/core/abjad';
import { useLanguage } from '@/contexts/language-context';
import { Card } from '@/components/ui/card';
import type { ElementType } from '@/types';

const BISM = 'بسم الله الرحمن الرحيم';
const SHADDA_SAMPLE = 'بِّب';

const ELEMENT_LABEL_KEYS: Record<ElementType, 'fire' | 'earth' | 'air' | 'water'> = {
  fire: 'fire',
  earth: 'earth',
  air: 'air',
  water: 'water',
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-28 p-6 sm:p-7">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600">
        {children}
      </div>
    </Card>
  );
}

function Summary({ children }: { children: ReactNode }) {
  return (
    <div className="font-arabic rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-900">
      {children}
    </div>
  );
}

function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">
      {children}
    </span>
  );
}

export function MethodologyView() {
  const { t } = useLanguage();

  const grandConfig = { ...DEFAULT_CALCULATION_CONFIG };
  const petitConfig = { ...DEFAULT_CALCULATION_CONFIG, method: 'reduced' as const };
  const phoneticConfig = { ...DEFAULT_CALCULATION_CONFIG, phoneticMode: true };

  const grandTotal = calculateAbjad({ text: BISM, config: grandConfig }).totalValue;
  const petitTotal = calculateAbjad({ text: BISM, config: petitConfig }).totalValue;
  const reducedGrand = reduceValue(grandTotal);
  const shaddaTotal = calculateAbjad({ text: SHADDA_SAMPLE, config: phoneticConfig }).totalValue;

  const sections = [
    { id: 'intro', title: t.methodology.intro.title },
    { id: 'table', title: t.methodology.table.title },
    { id: 'grand', title: t.methodology.grand.title },
    { id: 'petit', title: t.methodology.petit.title },
    { id: 'reduction', title: t.methodology.reduction.title },
    { id: 'normalization', title: t.methodology.normalization.title },
    { id: 'shadda', title: t.methodology.shadda.title },
    { id: 'ignored', title: t.methodology.ignored.title },
    { id: 'elements', title: t.methodology.elements.title },
    { id: 'limits', title: t.methodology.limits.title },
  ];

  const letterRows = Object.entries(ABJAD_VALUES).map(([letter, value]) => ({
    letter,
    value,
    small: toSmallAbjad(value),
    element: getElement(letter),
  }));

  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.methodology.title}
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-sm text-zinc-500">
          {t.methodology.lead}
        </p>
      </div>

      <div
        role="note"
        className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      >
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <p>{t.methodology.notice}</p>
      </div>

      <nav aria-label={t.methodology.toc} className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="inline-block rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-5">
        <Section id="intro" title={t.methodology.intro.title}>
          <p>{t.methodology.intro.body1}</p>
          <ul className="ms-5 list-disc space-y-1">
            {t.methodology.intro.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          <p className="font-medium text-zinc-700">{t.methodology.intro.body2}</p>
        </Section>

        <Section id="table" title={t.methodology.table.title}>
          <p>{t.methodology.table.body}</p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 text-start text-zinc-500">
                  <th scope="col" className="px-4 py-2 font-medium">
                    {t.methodology.table.colLetter}
                  </th>
                  <th scope="col" className="px-4 py-2 text-end font-medium">
                    {t.methodology.table.colValue}
                  </th>
                  <th scope="col" className="px-4 py-2 text-end font-medium">
                    {t.methodology.table.colSmall}
                  </th>
                  <th scope="col" className="px-4 py-2 text-end font-medium">
                    {t.methodology.table.colElement}
                  </th>
                </tr>
              </thead>
              <tbody>
                {letterRows.map((row) => (
                  <tr
                    key={row.letter}
                    className="border-t border-zinc-100 text-zinc-700"
                  >
                    <td className="font-arabic px-4 py-2 text-xl">{row.letter}</td>
                    <td className="px-4 py-2 text-end tabular-nums">{row.value}</td>
                    <td className="px-4 py-2 text-end tabular-nums">{row.small}</td>
                    <td className="px-4 py-2 text-end">
                      {row.element
                        ? t.results[ELEMENT_LABEL_KEYS[row.element]]
                        : t.methodology.table.none}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-400">{t.methodology.table.alifNote}</p>
        </Section>

        <Section id="grand" title={t.methodology.grand.title}>
          <p>{t.methodology.grand.body}</p>
          <Summary>
            {t.methodology.grand.exampleLead.replace('{text}', 'بسم الله الرحمن الرحيم')}
          </Summary>
          <p className="text-sm text-zinc-700">
            {t.methodology.grand.equals.replace('{value}', String(grandTotal))}
          </p>
        </Section>

        <Section id="petit" title={t.methodology.petit.title}>
          <p>{t.methodology.petit.body}</p>
          <Summary>
            {t.methodology.petit.exampleLead.replace('{text}', 'بسم الله الرحمن الرحيم')}
          </Summary>
          <p className="text-sm text-zinc-700">
            {t.methodology.petit.equals.replace('{value}', String(petitTotal))}
          </p>
        </Section>

        <Section id="reduction" title={t.methodology.reduction.title}>
          <p>{t.methodology.reduction.body}</p>
          <p className="text-sm text-zinc-700">
            {t.methodology.reduction.exampleLead}{' '}
            <Highlight>{reducedGrand}</Highlight>
          </p>
        </Section>

        <Section id="normalization" title={t.methodology.normalization.title}>
          <p>{t.methodology.normalization.body}</p>
          <p className="font-medium text-zinc-700">
            {t.methodology.normalization.filterTitle}
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 text-start text-zinc-500">
                  <th scope="col" className="px-4 py-2 font-medium">
                    {t.methodology.normalization.colRule}
                  </th>
                  <th scope="col" className="px-4 py-2 text-end font-medium">
                    {t.methodology.normalization.colEffect}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.methodology.normalization.filters.map((filter) => (
                  <tr
                    key={filter.name}
                    className="border-t border-zinc-100 text-zinc-700"
                  >
                    <td className="px-4 py-2">{filter.name}</td>
                    <td dir="rtl" className="font-arabic px-4 py-2 text-end">
                      {filter.effect}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="shadda" title={t.methodology.shadda.title}>
          <p>{t.methodology.shadda.body}</p>
          <Summary>
            {t.methodology.shadda.exampleLead.replace('{text}', SHADDA_SAMPLE)}
          </Summary>
          <p className="text-sm text-zinc-700">
            {t.methodology.shadda.equals.replace('{value}', String(shaddaTotal))}
          </p>
        </Section>

        <Section id="ignored" title={t.methodology.ignored.title}>
          <p>{t.methodology.ignored.body}</p>
          <ul className="ms-5 list-disc space-y-1">
            {t.methodology.ignored.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section id="elements" title={t.methodology.elements.title}>
          <p>{t.methodology.elements.body}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.methodology.elements.items.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <p className="text-sm font-semibold text-zinc-800">{item.name}</p>
                <p dir="rtl" className="font-arabic mt-1 text-lg text-zinc-600">
                  {item.letters}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-400">{t.methodology.elements.note}</p>
        </Section>

        <Section id="limits" title={t.methodology.limits.title}>
          <p>{t.methodology.limits.body}</p>
          <ul className="ms-5 list-disc space-y-1">
            {t.methodology.limits.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="mt-8 text-center">
        <a
          href="#main-content"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          <ArrowUp aria-hidden="true" className="h-4 w-4" />
          {t.methodology.backToTop}
        </a>
      </div>
    </main>
  );
}