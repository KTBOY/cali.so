/*
 * @Author: zlc
 * @Date: 2025-07-17 20:26:33
 * @LastEditTime: 2025-10-09 17:04:42
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\page.tsx
 */

import React from 'react'

import { BlogPosts } from '~/app/(main)/blog/BlogPosts'
// import { Headline } from '~/app/(main)/Headline'
import { Newsletter } from '~/app/(main)/Newsletter'
// import { Photos } from '~/app/(main)/Photos'
import { Resume } from '~/app/(main)/Resume'
import { PencilSwooshIcon } from '~/assets'
import { Container } from '~/components/ui/Container'
import { getSettings } from '~/sanity/queries'


export default async function BlogHomePage() {
  const settings = await getSettings()
  return (
    <>
      <Container>
        {/* { <Headline /> }mt-6 grid grid-cols-1 justify-center gap-6 md:grid-cols-[repeat(auto-fit,75%)] lg:grid-cols-[repeat(auto-fit,45%)] lg:gap-8 */}
      </Container>

      {/* {settings?.heroPhotos && <Photos photos={settings.heroPhotos} />} */}

      <Container className="mt-24 md:mt-28">
        <h2 className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <PencilSwooshIcon className="h-5 w-5 flex-none" />
          <span className="ml-2">近期游戏</span>
        </h2>
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-1">

          {/* <div className="flex flex-col gap-6 pt-6 ">
            <div>xx</div>
            <div>xx</div>
            <div>xx</div>
            {<BlogPosts />}
            <div id="container-1e191f62a88d88bb29c51ea9d39ac0d7"></div>
          </div> */}
          <div className="mt-6 grid grid-cols-1 justify-center gap-6 md:grid-cols-[repeat(auto-fit,75%)] lg:grid-cols-[repeat(auto-fit,45%)] lg:gap-8">
            {<BlogPosts />}
            {/* <div id="container-1e191f62a88d88bb29c51ea9d39ac0d7"></div> */}
          </div>
          <aside className="space-y-10 lg:sticky lg:top-8 lg:h-fit lg:pl-16 xl:pl-20" style={{ 'display': 'none' }} >
            <Newsletter />
            {settings?.resume && <Resume resume={settings.resume} />}
          </aside>
        </div>
      </Container >
    </>
  )
}

export const revalidate = 60
