import { FireLoading } from '~/components/ui/FireLoading'

// 根级加载态：覆盖 /admin、/studio 等 (main) 之外的路由
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <FireLoading />
    </div>
  )
}
