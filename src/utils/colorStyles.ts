import { ToothpasteStyle } from '../types';

export const PRESET_TOOTHPASTE_STYLES: ToothpasteStyle[] = [
  {
    id: 'aquafresh-classic',
    name: 'Classic Triple Stripe',
    nameZh: '经典三色条纹',
    type: 'striped',
    colors: ['#00B4D8', '#FFFFFF', '#FF3366'],
    sparkle: true,
  },
  {
    id: 'mint-berry-stripe',
    name: 'Mint & Berry Stripe',
    nameZh: '薄荷草莓条纹',
    type: 'striped',
    colors: ['#2EC4B6', '#FFFFFF', '#E71D36'],
    sparkle: true,
  },
  {
    id: 'rainbow-magic',
    name: 'Rainbow Sparkle',
    nameZh: '梦幻七彩虹',
    type: 'rainbow',
    colors: ['#FF5964', '#FFAA00', '#F9F871', '#35D0BA', '#3884FF', '#A06CD5'],
    sparkle: true,
  },
  {
    id: 'bubblegum-swirl',
    name: 'Bubblegum Swirl',
    nameZh: '泡泡糖甜心',
    type: 'striped',
    colors: ['#FF66C4', '#FFFFFF', '#00D2FF'],
    sparkle: true,
  },
  {
    id: 'watermelon-splash',
    name: 'Watermelon Splash',
    nameZh: '西瓜果味条纹',
    type: 'striped',
    colors: ['#2ECC71', '#FFFFFF', '#FF4757'],
    sparkle: true,
  },
  {
    id: 'blueberry-lemon',
    name: 'Lemon Blueberry',
    nameZh: '柠檬蓝莓条纹',
    type: 'striped',
    colors: ['#FFDD00', '#FFFFFF', '#6C5CE7'],
    sparkle: true,
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy Pastel',
    nameZh: '棉花糖粉彩',
    type: 'striped',
    colors: ['#FF9A9E', '#FFFFFF', '#A18CD1'],
    sparkle: true,
  },
  {
    id: 'sunny-citrus',
    name: 'Sunny Citrus Mint',
    nameZh: '阳光柑橘薄荷',
    type: 'striped',
    colors: ['#FFA502', '#FFFFFF', '#2ED573'],
    sparkle: true,
  },
  {
    id: 'galaxy-cosmic',
    name: 'Cosmic Galaxy',
    nameZh: '璀璨星空条纹',
    type: 'candy',
    colors: ['#5F27CD', '#FF9FF3', '#48DBFB', '#54A0FF'],
    sparkle: true,
  },
  {
    id: 'fresh-mint-solid',
    name: 'Shiny Fresh Mint',
    nameZh: '清爽薄荷绿',
    type: 'solid',
    colors: ['#00F2FE', '#4FACFE'],
    sparkle: true,
  },
  {
    id: 'sweet-strawberry-solid',
    name: 'Sweet Strawberry Gel',
    nameZh: '甜甜草莓晶莹粉',
    type: 'solid',
    colors: ['#FA709A', '#FEE140'],
    sparkle: true,
  },
  {
    id: 'grape-sparkle',
    name: 'Sparkling Grape',
    nameZh: '闪亮葡萄紫',
    type: 'striped',
    colors: ['#9B51E0', '#FFFFFF', '#56CCF2'],
    sparkle: true,
  }
];

const FUN_PALETTES = [
  ['#FF3366', '#FFFFFF', '#33CCFF'],
  ['#FF8008', '#FFFFFF', '#FFC837'],
  ['#11998E', '#FFFFFF', '#38EF7D'],
  ['#8E2DE2', '#FFFFFF', '#4A00E0'],
  ['#FC5C7D', '#6A82FB', '#FFFFFF'],
  ['#00F260', '#0575E6', '#FFFFFF'],
  ['#F857A6', '#FF5858', '#FFFFFF'],
  ['#43E97B', '#38F9D7', '#FFFFFF'],
  ['#FA709A', '#FEE140', '#FFFFFF'],
  ['#30E8BF', '#FF8235', '#FFFFFF'],
];

export function getRandomToothpasteStyle(previousId?: string): ToothpasteStyle {
  // 70% chance preset, 30% dynamically generated random stripe!
  if (Math.random() < 0.75) {
    const available = PRESET_TOOTHPASTE_STYLES.filter(s => s.id !== previousId);
    return available[Math.floor(Math.random() * available.length)];
  }

  // Dynamic random palette
  const randomPalette = FUN_PALETTES[Math.floor(Math.random() * FUN_PALETTES.length)];
  return {
    id: `random-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: 'Surprise Candy Stripe',
    nameZh: '惊喜糖果条纹',
    type: 'striped',
    colors: randomPalette,
    sparkle: true,
  };
}
