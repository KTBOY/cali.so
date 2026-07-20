export interface SwfGame {
  id: string
  name: string
  category: string
  file: string
  cover: string
  description?: string
}

export interface GameCategory {
  name: string
  games: SwfGame[]
}

export const swfGames: GameCategory[] = [
  {
    name: '僵尸危机',
    games: [
      {
        id: 'zombie-crisis-1',
        name: '僵尸危机 1',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机1.swf',
        cover: '/images/games/zombie-crisis-1.png',
        description: '僵尸危机系列第一作，经典射击生存游戏',
      },
      {
        id: 'zombie-crisis-3',
        name: '僵尸危机 3',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机3.swf',
        cover: '/images/games/zombie-crisis-3.png',
        description: '僵尸危机系列第三作，更多武器和关卡',
      },
      {
        id: 'zombie-crisis-4',
        name: '僵尸危机 4',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机4.swf',
        cover: '/images/games/zombie-crisis-4.png',
        description: '僵尸危机系列第四作，全新地图和挑战',
      },
      {
        id: 'zombie-crisis-5',
        name: '僵尸危机 5',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机5.swf',
        cover: '/images/games/zombie-crisis-5.png',
        description: '僵尸危机系列第五作，终极生存体验',
      },
      {
        id: 'zombie-crisis-nightmare',
        name: '僵尸危机梦魇',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机梦魇.swf',
        cover: '/images/games/zombie-crisis-nightmare.png',
        description: '僵尸危机梦魇版本，更高难度的挑战',
      },
      {
        id: 'zombie-crisis-nightmare-christmas',
        name: '僵尸危机梦魇圣诞版',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机梦魇圣诞版.swf',
        cover: '/images/games/zombie-crisis-nightmare-christmas.png',
        description: '圣诞特别版，节日主题的僵尸射击',
      },
      {
        id: 'zombie-crisis-nightmare-bieber',
        name: '僵尸危机梦魇比伯版',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机梦魇比伯版.swf',
        cover: '/images/games/zombie-crisis-nightmare-bieber.png',
        description: '比伯特别版，独特的游戏角色',
      },
      {
        id: 'zombie-crisis-crazy',
        name: '僵尸危机疯狂版',
        category: '僵尸危机',
        file: '/swf/僵尸危机/僵尸危机疯狂版.swf',
        cover: '/images/games/zombie-crisis-crazy.png',
        description: '疯狂模式，极限挑战你的生存能力',
      },
    ],
  },
]

// 获取所有游戏的扁平列表
export const allGames: SwfGame[] = swfGames.flatMap((category) => category.games)
