/*
 * @Author: zlc
 * @Date: 2025-07-16 15:36:42
 * @LastEditTime: 2025-10-10 11:21:06
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\components\GameUi\GameItem\GameItem.tsx
 */
'use client'
import "./serach.css"
import "./backBtn.css"

import React from 'react'

import { eventBus } from '~/app/(main)/serach/FunctionBus'
import { CardItem } from '~/components/GameUi/Card/Card'
import Pagecomponent from '~/components/GameUi/Page/Pagecomponent'
import { Container } from '~/components/ui/Container'

// import { list } from "./data"
import gameItem from './gameItem.module.css';


interface GameList {
  name?: string;
  urlK?: string;
  urlB?: string;
  passWord?: string | number;
}



const BackButton = ({ back }) => {

  return (
    <div className="btn-conteiner" onClick={back}>
      <a className="btn-content" href="#">
        <span className="icon-arrow">
          <svg width="50px" height="23px" viewBox="0 0 66 43" version="1.1" className="icon-tran">
            <g id="arrow" stroke="none" fill="none">
              <path id="arrow-icon-one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path>
              <path id="arrow-icon-two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path>
              <path id="arrow-icon-three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path>
            </g>
          </svg>
        </span>
        <span className="btn-title">返回</span>
      </a>

    </div>
  );
};

const GameItem = ({ item }) => {
  return (
    <div className={gameItem.box}>
      <div className={gameItem.itemTitle}>{item.name}</div>
      <div className={gameItem.url}>
        {item.urlB ?
          (
            <div className="mt-2 mb-2">
              <div>百度</div>
              <div><a className={gameItem.aHref} href={item.urlB}> {item.urlB}</a></div>
              <div>解压密码：{item.passWord}</div>

            </div>
          ) : ''}

        {item.urlK ? (<div>夸克：<a className={gameItem.aHref} href={item.urlK}>{item.urlK}</a></div>) : ''}
      </div>
    </div>
  )
}



export default function GamePage({ list }: { list: GameList[] }) {
  const groupedGameList: GameList[][] = [];
  const listLength = list.filter(item => item.name)
  for (let i = 0; i < listLength.length; i += 21) {

    groupedGameList.push(listLength.slice(i, i + 21));

  }

  groupedGameList.unshift([])



  const [currenItem, setCount] = React.useState<GameList | undefined>(undefined);
  const [currenList, setList] = React.useState(groupedGameList[0]);
  const [currenIndex, setIndex] = React.useState(1);
  const [pageConfig, setPageConfig] = React.useState({
    totalPage: groupedGameList.length - 1,
    currentPage: 1
  });

  //点击某个游戏
  const handelClick = (item: GameList) => {
    setCount(item)
  }

  // 返回游戏页
  const handleBack = () => {
    setCount(undefined)

    setList(groupedGameList[1])
    setPageConfig({
      ...pageConfig,
      currentPage: 1,
      totalPage: groupedGameList.length - 1

    })

    console.log(groupedGameList[1]);
      console.log(groupedGameList);
  }


  // 分页
  const pageIndex = (index: number) => {
    setList(groupedGameList[index])
    setIndex(index)
    setPageConfig({
      ...pageConfig,
      currentPage: index
    })
  }

  const handleSearch = (v: string) => {
    if (!v) {
      setList(groupedGameList[currenIndex])
      return
    }
    const searchTerm = v.trim().toLowerCase()

    // 在当前分组的所有数据中搜索，而不仅仅是在当前页面的数据中搜索
    const allGames = groupedGameList.flat()
    const filteredData = allGames.filter((item) =>
      item.name && item.name.toLowerCase().includes(searchTerm)
    )

    // 将搜索结果重新分组
    const groupedSearchResults: GameList[][] = [];
    for (let i = 0; i < filteredData.length; i += 21) {
      groupedSearchResults.push(filteredData.slice(i, i + 21));
    }

    // 如果有搜索结果，显示第一页
    if (groupedSearchResults.length > 0) {
      setList(groupedSearchResults[0])
      setIndex(0)
      setPageConfig({
        totalPage: groupedSearchResults.length,
        currentPage: 1
      })
    } else {
      // 如果没有搜索结果，显示空数组
      setList([])
      setPageConfig({
        totalPage: 1,
        currentPage: 1
      })
    }


  }

  React.useEffect(() => {
    eventBus.on('callBFunction', handleSearch);
    return () => {
      eventBus.off('callBFunction', handleSearch);
    };
  });



  return (
    <Container>
      <div className="pc-game_page">
        {currenItem && Object.keys(currenItem).length > 0 ? (
          <div>
            <BackButton back={handleBack} />
            <GameItem item={currenItem} />
          </div>
        ) : (
          <>
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 mt-5"
            >
              {currenList
                .filter((item) => item.name) // 过滤掉没有名称的项目
                .map((item, index) => (
                  <li key={index} onClick={() => handelClick(item)}>
                    <CardItem project={item} />
                  </li>
                ))}
            </ul>
            <Pagecomponent pageConfig={pageConfig} pageCallbackFn={pageIndex} />
          </>
        )


        }
      </div>

    </Container>
  )
}





