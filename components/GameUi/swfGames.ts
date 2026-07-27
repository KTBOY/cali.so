export interface SwfGame {
  id: string
  name: string
  nameEn: string
  category: string
  categoryEn: string
  file: string
  cover: string
  description?: string
  descriptionEn?: string
}

export interface GameCategory {
  name: string
  nameEn: string
  games: SwfGame[]
}

export const swfGames: GameCategory[] = [
  {
    name: '僵尸危机',
    nameEn: 'Zombie Crisis',
    games: [
      {
        id: 'zombie-crisis-1',
        name: '僵尸危机 1',
        nameEn: 'Zombie Crisis 1',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/k7m2p9.swf',
        cover: '/images/games/zombie-crisis-1.png',
        description: '僵尸危机系列第一作，经典射击生存游戏',
        descriptionEn:
          'The first entry in the Zombie Crisis series — a classic shooting survival game',
      },
      {
        id: 'zombie-crisis-3',
        name: '僵尸危机 3',
        nameEn: 'Zombie Crisis 3',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/q3w8r5.swf',
        cover: '/images/games/zombie-crisis-3.png',
        description: '僵尸危机系列第三作，更多武器和关卡',
        descriptionEn: 'The third entry, with more weapons and levels',
      },
      {
        id: 'zombie-crisis-4',
        name: '僵尸危机 4',
        nameEn: 'Zombie Crisis 4',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/t6y1u4.swf',
        cover: '/images/games/zombie-crisis-4.png',
        description: '僵尸危机系列第四作，全新地图和挑战',
        descriptionEn: 'The fourth entry, featuring new maps and challenges',
      },
      {
        id: 'zombie-crisis-5',
        name: '僵尸危机 5',
        nameEn: 'Zombie Crisis 5',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/a9s2d7.swf',
        cover: '/images/games/zombie-crisis-5.png',
        description: '僵尸危机系列第五作，终极生存体验',
        descriptionEn: 'The fifth entry — the ultimate survival experience',
      },
      {
        id: 'zombie-crisis-nightmare',
        name: '僵尸危机梦魇',
        nameEn: 'Zombie Crisis: Nightmare',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/f4g8h3.swf',
        cover: '/images/games/zombie-crisis-nightmare.png',
        description: '僵尸危机梦魇版本，更高难度的挑战',
        descriptionEn: 'Nightmare edition with tougher challenges',
      },
      {
        id: 'zombie-crisis-nightmare-christmas',
        name: '僵尸危机梦魇圣诞版',
        nameEn: 'Zombie Crisis: Nightmare (Christmas)',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/j5k1l6.swf',
        cover: '/images/games/zombie-crisis-nightmare-christmas.png',
        description: '圣诞特别版，节日主题的僵尸射击',
        descriptionEn: 'Christmas special with holiday-themed zombie shooting',
      },
      {
        id: 'zombie-crisis-nightmare-bieber',
        name: '僵尸危机梦魇比伯版',
        nameEn: 'Zombie Crisis: Nightmare (Bieber)',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/z8x3c2.swf',
        cover: '/images/games/zombie-crisis-nightmare-bieber.png',
        description: '比伯特别版，独特的游戏角色',
        descriptionEn: 'Bieber special edition with a unique playable character',
      },
      {
        id: 'zombie-crisis-crazy',
        name: '僵尸危机疯狂版',
        nameEn: 'Zombie Crisis: Crazy',
        category: '僵尸危机',
        categoryEn: 'Zombie Crisis',
        file: '/g/v7b4n9.swf',
        cover: '/images/games/zombie-crisis-crazy.png',
        description: '疯狂模式，极限挑战你的生存能力',
        descriptionEn: 'Crazy mode — push your survival skills to the limit',
      },
    ],
  },
]

// 获取所有游戏的扁平列表
export const allGames: SwfGame[] = swfGames.flatMap((category) => category.games)
