/*
 * @Author: zlc
 * @Date: 2024-03-26 19:40:33
 * @LastEditTime: 2024-07-01 11:25:23
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\admin\layout.tsx
 */
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { Container } from '~/components/ui/Container'

import { Sidebar } from './Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user || !user.publicMetadata.siteOwner) {
    redirect('/')
  }
  // currentUser().then((user) => {
  //   if (!user || !user.publicMetadata.siteOwner) {
  //     redirect('/')
  //   }

  // }).catch(() => {
  //   redirect('/')
  // },

  return (
    <div>
      <Sidebar />

      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">
          <Container className="py-12">{children}</Container>
        </div>
      </main>
    </div>
  )
}
