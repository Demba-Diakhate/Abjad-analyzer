import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { dictionaries, isLanguage, LANGUAGE_COOKIE } from '@/i18n';
import { HistoryView } from '@/components/history/history-view';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const langValue = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const lang = isLanguage(langValue) ? langValue : 'fr';
  const meta = dictionaries[lang].meta;
  return {
    title: meta.historyTitle,
    description: meta.historyDescription,
  };
}

export default function HistoryPage() {
  return <HistoryView />;
}