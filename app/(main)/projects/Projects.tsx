/*
 * @Author: zlc
 * @Date: 2024-03-26 19:40:33
 * @LastEditTime: 2024-04-29 17:10:54
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\projects\Projects.tsx
 */
import { ProjectCard } from '~/app/(main)/projects/ProjectCard'
import { getSettings } from '~/sanity/queries'

export async function Projects() {
  const projects = (await getSettings()).projects || []

  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
    >
      {
        projects.map((project) => (
          <ProjectCard project={project} key={project._id} />
        ))
      }
    </ul>
  )
}
