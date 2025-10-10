/*
 * @Author: zlc
 * @Date: 2025-07-16 15:36:42
 * @LastEditTime: 2025-08-25 17:12:17
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\serach\page.tsx
 */
import "./serach.css";

import React from 'react'

import { Tooltip } from '~/components/ui/Tooltip'

import { eventBus } from './FunctionBus';


export default function SerachPage() {

  const [iValue, setValue] = React.useState('');
  const [isShowInput, setShowInput] = React.useState(false);
  const inputRef = React.useRef(null);
  const handelSearch = (v: React.ChangeEvent<HTMLInputElement>) => {
    setValue(v.target.value);
    setTimeout(() => {
      eventBus.emit('callBFunction', v.target.value);
    }, 500);

  }

  const toggleTheme = () => {
    const obj = location.href.lastIndexOf("/");
    if (location.href.substring(obj) != '/game' && location.href.substring(obj) != '/cg') {
      window.location.href = '/game'
    }
    setTimeout(() => {
      setValue('');
      eventBus.emit('callBFunction', '');

      setShowInput(!isShowInput)

      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }, 500);


  }

  return (
    <>
      <Tooltip.Provider disableHoverableContent>
        {<button
          type="button"
          aria-label="切换颜色主题"
          className="group rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:from-zinc-900/50 dark:to-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
          onClick={toggleTheme}
        >
          <div className="pointer-events-auto relative z-50 hidden md:block">
            🔍搜索游戏
          </div>

          <div className="pointer-events-auto relative z-50 md:hidden">🔍</div>

        </button>}



      </Tooltip.Provider>
      {isShowInput && (
        <div className="app-main-serach-page" >
          <input ref={inputRef} name="search" type="text" placeholder="请输入游戏名称" value={iValue} onChange={handelSearch} onBlur={() => setShowInput(false)} />
        </div>
      )}

    </>
  )
}





