import { Container } from '~/components/ui/Container'
import { FireLoading } from '~/components/ui/FireLoading'

// 路由级加载态：页面数据准备期间立即渲染，避免白屏
export default function Loading() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="flex flex-col items-center justify-center py-24">
        <FireLoading />
      </div>
    </Container>
  )
}
