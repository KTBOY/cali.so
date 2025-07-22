/*
 * @Author: zlc
 * @Date: 2025-07-16 15:36:42
 * @LastEditTime: 2025-07-17 20:53:32
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\cg\page.tsx
 */
import { Container } from '~/components/ui/Container'


const ProjectCard = ({ project }) => {
  return (
    <div>
      {project.name}
    </div>
  )
}

export default function Cg() {




  const gameList = [
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    },
    ,
    {
      name: 'xx'
    }


  ]
  for (let i = 0; i < 500; i++) {

    gameList.push({
      name: i,
    });
  }
  return (
    <Container>
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 mt-5"
      >
        {gameList.map((project, index) => (
          <ProjectCard project={project} key={index} />
        ))}
      </ul>
    </Container>
  )
}





