import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { dictionaries, isLanguage, LANGUAGE_COOKIE } from '@/i18n';
import { MethodologyView } from '@/components/methodology/methodology-view';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const langValue = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const lang = isLanguage(langValue) ? langValue : 'fr';
  const meta = dictionaries[lang].meta;
  return {
    title: meta.methodologyTitle,
    description: meta.methodologyDescription,
  };
}

export default function MethodologyPage() {
  return <MethodologyView />;
}