/*
 * @Author: zlc
 * @Date: 2025-07-28 19:34:46
 * @LastEditTime: 2025-09-23 10:56:01
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\blog\BlogPosts.tsx
 */
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { redis } from '~/lib/redis'
import { getLatestBlogPosts } from '~/sanity/queries'

import { BlogPostCard } from './BlogPostCard'
export async function BlogPosts({ limit = 5 }) {


  const posts = env.VERCEL_ENV === 'development' ? [] : await getLatestBlogPosts({ limit, forDisplay: true }) || []
  const postIdKeys = posts.map(({ _id }) => kvKeys.postViews(_id))

  let views: number[] = []
  if (env.VERCEL_ENV === 'development') {
    views = posts.map(() => Math.floor(Math.random() * 1000))
  } else {
    if (postIdKeys.length > 0) {
      views = await redis.mget<number[]>(...postIdKeys)
    }
  }


  // let views: number[] = []
  // let posts: BlogPost[] = []


  // if (env.VERCEL_ENV !== 'development') {

  //   posts = await getLatestBlogPosts({ limit, forDisplay: true }) || []
  //   const postIdKeys = posts.map(({ _id }) => kvKeys.postViews(_id))
  //   if (postIdKeys.length > 0) {
  //     views = await redis.mget<number[]>(...postIdKeys)
  //   }
  // }



  return (
    <>
      {posts.map((post, idx) => (
        <BlogPostCard post={post} views={views[idx] ?? 0} key={post._id} />
      ))}
    </>
  )
}
