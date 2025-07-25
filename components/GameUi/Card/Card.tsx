/*
 * @Author: zlc
 * @Date: 2025-07-18 20:08:29
 * @LastEditTime: 2025-07-18 20:09:16
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\components\GameUi\Card\Card.tsx
 */
import "./Card.css"
    
  export  const CardItem = ({ project }) => {
  return (
    <div className="game-ui_card group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {project.name}
    </div>
  )
}
