/*
 * @Author: zlc
 * @Date: 2025-07-16 15:36:42
 * @LastEditTime: 2025-10-09 18:21:42
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\cg\page.tsx
 */
'use client'
import { listCg } from '~/components/GameUi/GameItem/data'
import GameItem from '~/components/GameUi/GameItem/GameItem'
export default function GamePage() {
  return (
    <GameItem list={listCg} />
  )
}





