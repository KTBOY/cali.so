import { type Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { Projects } from '~/app/(main)/projects/Projects'
import { Container } from '~/components/ui/Container'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projects')
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
    },
  }
}

export default function ProjectsPage() {
  const t = useTranslations('projects')
  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          {t('heading')}
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          {t.rich('introRich', {
            b: (chunks) => <b>{chunks}</b>,
          })}
        </p>
      </header>
      <div className="mt-16 sm:mt-20">
        <Projects />
      </div>
    </Container>
  )
}

export const revalidate = 3600
