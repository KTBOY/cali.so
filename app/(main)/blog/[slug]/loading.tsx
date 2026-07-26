import { Container } from '~/components/ui/Container'
import { FireLoading } from '~/components/ui/FireLoading'

export default function BlogPostPageSkeleton() {
  return (
    <Container className="relative mt-16 min-h-screen lg:mt-32">
      <div className="absolute inset-0 flex items-center justify-center">
        <FireLoading />
      </div>
    </Container>
  )
}
