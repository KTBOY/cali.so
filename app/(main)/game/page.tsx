/*
 * @Author: zlc
 * @Date: 2025-07-16 15:36:42
 * @LastEditTime: 2025-07-18 20:25:00
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\game\page.tsx
 */
import "./serach.css"

import { CardItem } from '~/components/GameUi/Card/Card'
import { Container } from '~/components/ui/Container'


export default function GamePage() {




  const gameList = [
    {
      name: '侠盗飞车'
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
  const groupedGameList = [];
  for (let i = 0; i < gameList.length; i += 10) {
    groupedGameList.push(gameList.slice(i, i + 10));
  }

  console.log(groupedGameList)
  return (
    <Container>
      <div className="pc-game_page">
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 mt-5"
        >
          {groupedGameList.map((item) => (
            item.map((project, index) => (
                <CardItem project={project} key={index} />
            ))
          
          ))}
        </ul>
      </div>
    </Container>
  )
}





