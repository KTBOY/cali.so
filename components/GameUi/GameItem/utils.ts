/**
 * 模糊查询函数
 * @param {string} query - 查询字符串
 * @param {Array} data - 数据数组
 * @param {string} key - 对象属性键名
 * @returns {Array} - 匹配结果数组
 */

interface GameList {
  name?: string
  urlK?: string
  urlB?: string
  passWord?: string | number
}

export const fuzzySearch = (query: string, data: GameList[]): GameList[] => {
  // 处理空查询情况
  if (!query) return data

  const searchTerm = query.trim()
  console.log(searchTerm)

  const filteredData = data.filter((item) => {
    console.log(item)

    if (item.name) {
      console.log(item.name.includes(searchTerm))

      return item.name.includes(searchTerm)
    }
  })
  console.log(filteredData)

  return filteredData
}

export function debounce<T extends (...args: unknown[]) => unknown>(  
  func: T,  
  wait: number  
): (...args: Parameters<T>) => void {  
  let timeout: NodeJS.Timeout | null = null;  
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {  
    if (timeout) clearTimeout(timeout);  
    timeout = setTimeout(() => {  
      func.apply(this, args);  
      timeout = null;  
    }, wait);  
  };  
}

