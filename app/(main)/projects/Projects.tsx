import { ProjectCard } from '~/app/(main)/projects/ProjectCard'
import { env } from '~/env.mjs'
import { getSettings } from '~/sanity/queries'
export async function Projects() {

  const projects = env.VERCEL_ENV === 'development' ? [] : (await getSettings())?.projects
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
    >
      {projects.map((project) => (
        <ProjectCard project={project} key={project._id} />
      ))}
    </ul>
  )
}
