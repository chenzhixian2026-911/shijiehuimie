// 哄哄模拟器 - 核心游戏引擎

// ============ 类型定义 ============

export type InputCategory =
  | 'sincere_apology'      // 真诚道歉
  | 'empathy'              // 共情理解
  | 'sweet_romantic'       // 甜蜜浪漫
  | 'action_compensation'  // 行动补偿
  | 'explanation'          // 解释说明
  | 'dismissive'           // 敷衍轻描淡写
  | 'aggressive'           // 攻击性言论
  | 'cold_silence'         // 冷暴力
  | 'humorous'             // 幽默化解
  | 'neutral';             // 中性/兜底

export interface InputAnalysis {
  category: InputCategory;
  matchedKeywords: string[];
  angerDelta: number;       // 负数=降怒气，正数=升怒气
  label: string;            // 分类标签
  quality: 'excellent' | 'good' | 'mediocre' | 'bad' | 'toxic';
}

export interface ChatMessage {
  id: string;
  role: 'player' | 'ai';
  text: string;
  timestamp: number;
  analysis?: InputAnalysis;  // 仅玩家消息有
}

export type GamePhase = 'welcome' | 'playing' | 'won' | 'lost';

export interface GameState {
  phase: GamePhase;
  anger: number;           // 0-100
  round: number;           // 当前第几轮 (1-10)
  maxRounds: number;
  messages: ChatMessage[];
  history: InputAnalysis[]; // 所有玩家输入的分析记录
  gameOverReason?: 'success' | 'rounds_exhausted' | 'toxic_input';
}

// ============ 话术识别规则 ============

interface CategoryRule {
  category: InputCategory;
  keywords: string[];
  angerRange: [number, number]; // [min, max] 怒气变化范围
  label: string;
  quality: InputAnalysis['quality'];
  // 如果匹配到此分类，怒气变化取 angerRange 中的随机值
  // 特殊：aggressive 分类直接触发 game over
}

const CATEGORY_RULES: CategoryRule[] = [
  // 1. 攻击性言论 → 直接终止
  {
    category: 'aggressive',
    keywords: [
      '你有病', '你无理取闹', '你疯了', '你神经病', '你脑子有问题',
      '随便你', '爱信不信', '关你屁事', '关我屁事', '滚', '去死',
      '烦死了', '你烦不烦', '够了', '闭嘴', '少废话', '你算什么东西',
      '我不爱你了', '分手', '离婚', '你配吗', '你值得吗',
      '爱过不过', '不想过了', '你行你上', '你爱咋咋地',
      '你讲不讲理', '你讲点道理', '神经', '有病', '脑残',
      '智障', 'sb', 'nmsl', 'wtf', 'fuck', 'shit',
      '你妈', '你爸', '你全家', '泼妇', '疯子',
    ],
    angerRange: [30, 50],
    label: '攻击性言论',
    quality: 'toxic',
  },
  // 2. 敷衍/轻描淡写 → 怒气上升
  {
    category: 'dismissive',
    keywords: [
      '别生气了', '别闹了', '至于吗', '多大点事', '小题大做',
      '你想多了', '没什么大不了的', '别哭了', '别哭了行吗',
      '行了行了', '好了好了', '差不多得了', '别作了', '别矫情',
      '有什么好气的', '这有什么', '不至于', '算了', '随便',
      '无所谓', '都行', '你开心就好', '好好好', '对对对',
      '别无理取闹', '别闹', '别烦', '消消气', '想开点',
    ],
    angerRange: [8, 18],
    label: '敷衍轻描淡写',
    quality: 'bad',
  },
  // 3. 冷暴力 → 怒气上升
  {
    category: 'cold_silence',
    keywords: [
      '哦', '嗯', '嗯嗯', '噢', '好', '行', '知道了',
      '呵呵', '哈哈', '...', '……', '6', '牛', '厉害',
    ],
    angerRange: [5, 12],
    label: '冷暴力',
    quality: 'bad',
  },
  // 4. 真诚道歉 → 大幅降怒气
  {
    category: 'sincere_apology',
    keywords: [
      '对不起', '我错了', '是我的错', '我不该', '我道歉',
      '我不好', '我太过分了', '我不应该', '我承认', '我认错',
      '都是我的错', '千错万错都是我的错', '我向你道歉',
      '原谅我', '给我一次机会', '我再也不会', '我保证',
      '我反思', '我检讨', '我深刻认识到', '我真的很抱歉',
      '我不该那样说', '我不该那样做', '我后悔',
    ],
    angerRange: [-25, -15],
    label: '真诚道歉',
    quality: 'excellent',
  },
  // 5. 共情理解 → 大幅降怒气
  {
    category: 'empathy',
    keywords: [
      '我理解', '我懂你', '你感受', '你一定很', '换作是我',
      '你难过', '你伤心', '你委屈', '你生气是对的', '你有理由',
      '你生气是应该的', '我能体会', '我感同身受', '你不容易',
      '你辛苦了', '你受委屈了', '你心里不好受', '你心里难受',
      '如果我是你', '站在你的角度', '你的感受很重要',
      '你在意的是', '你希望的是', '你期待的是',
    ],
    angerRange: [-22, -12],
    label: '共情理解',
    quality: 'excellent',
  },
  // 6. 甜蜜浪漫 → 中等降怒气
  {
    category: 'sweet_romantic',
    keywords: [
      '我爱你', '你是最重要的', '没有你我', '你是我的世界',
      '我最在乎你', '你是最好的', '你是最美的', '你是最棒的',
      '我不能没有你', '我离不开你', '你是唯一', '我只爱你',
      '你是我的小', '宝贝', '亲爱的', '老婆', '乖乖',
      '抱抱', '亲亲', '想你了', '好想你', '特别想你',
      '你对我很重要', '我珍惜你', '我心疼你',
    ],
    angerRange: [-15, -8],
    label: '甜蜜浪漫',
    quality: 'good',
  },
  // 7. 行动补偿 → 中等降怒气
  {
    category: 'action_compensation',
    keywords: [
      '我给你买', '我带你去', '我请你吃', '我陪你去',
      '我帮你', '我来做', '我承包', '我清空购物车',
      '买包', '买口红', '买衣服', '买鞋', '吃大餐',
      '看电影', '逛街', '旅游', '出去玩', '约会',
      '做家务', '做饭', '洗碗', '打扫', '收拾',
      '我给你', '我送你', '我为你', '我改', '我改还不行吗',
    ],
    angerRange: [-15, -8],
    label: '行动补偿',
    quality: 'good',
  },
  // 8. 幽默化解 → 看情况
  {
    category: 'humorous',
    keywords: [
      '跪键盘', '跪榴莲', '搓衣板', '罚我', '罚站',
      '写检讨', '抄书', '打我', '骂我', '你说了算',
      '你最大', '你说了算', '听你的', '都听你的',
      '我是猪', '我是笨蛋', '我是大笨蛋', '我蠢',
      '小的知错了', '奴才知错', '臣知罪',
    ],
    angerRange: [-12, -5],
    label: '幽默化解',
    quality: 'good',
  },
  // 9. 解释说明 → 少量降怒气（解释不好会让人觉得在找借口）
  {
    category: 'explanation',
    keywords: [
      '其实', '事情是', '你听我说', '你听我解释', '事情不是',
      '不是你想的', '原因是', '因为', '之所以', '实际上',
      '事实是', '真相是', '让我解释', '情况是', '本来',
      '我是因为', '我有苦衷', '你误会了', '不是那样的',
    ],
    angerRange: [-8, -2],
    label: '解释说明',
    quality: 'mediocre',
  },
];

// ============ 核心逻辑 ============

/**
 * 分析玩家输入，返回分类和怒气变化
 */
export function analyzeInput(text: string): InputAnalysis {
  const lowerText = text.toLowerCase().trim();

  if (!lowerText) {
    return {
      category: 'neutral',
      matchedKeywords: [],
      angerDelta: 3,
      label: '空白输入',
      quality: 'bad',
    };
  }

  // 检查是否为纯标点/表情/超短文本
  const cleanedText = lowerText.replace(/[，。！？、；：\u201c\u201d\u2018\u2019（）【】\s.,!?;:'"()[\]{}]/g, '');
  if (cleanedText.length === 0) {
    return {
      category: 'cold_silence',
      matchedKeywords: ['[纯标点符号]'],
      angerDelta: 8,
      label: '冷暴力',
      quality: 'bad',
    };
  }

  // 按优先级匹配规则（攻击性 > 敷衍 > 冷暴力 > 其他正面分类）
  const priorityOrder: InputCategory[] = [
    'aggressive',
    'dismissive',
    'cold_silence',
    'sincere_apology',
    'empathy',
    'sweet_romantic',
    'action_compensation',
    'humorous',
    'explanation',
  ];

  for (const catName of priorityOrder) {
    const rule = CATEGORY_RULES.find(r => r.category === catName);
    if (!rule) continue;

    const matched = rule.keywords.filter(kw => lowerText.includes(kw.toLowerCase()));
    if (matched.length > 0) {
      // 计算怒气变化：匹配越多关键词，效果越强（但不超过范围）
      const [min, max] = rule.angerRange;
      const bonus = Math.min(matched.length - 1, 3) * (min < 0 ? -2 : 2);
      const delta = Math.max(min, Math.min(max, randomInRange(min, max) + bonus));

      return {
        category: rule.category,
        matchedKeywords: matched,
        angerDelta: delta,
        label: rule.label,
        quality: rule.quality,
      };
    }
  }

  // 兜底：中性输入，给一个很小的降怒气
  // 模拟"虽然没说到点子上，但至少态度还行"
  return generateFallbackAnalysis(text);
}

/**
 * 兜底分析：对于无法匹配关键词的输入
 * 根据文本特征给出一个合理的判定
 */
function generateFallbackAnalysis(text: string): InputAnalysis {
  const len = text.length;

  // 很短的回复（1-3字）→ 偏向冷暴力
  if (len <= 3) {
    return {
      category: 'cold_silence',
      matchedKeywords: ['[回复过短]'],
      angerDelta: randomInRange(5, 10),
      label: '冷暴力',
      quality: 'bad',
    };
  }

  // 包含问号 → 可能在质问/解释
  if (text.includes('？') || text.includes('?')) {
    return {
      category: 'explanation',
      matchedKeywords: ['[质问语气]'],
      angerDelta: randomInRange(-3, 3),
      label: '解释说明',
      quality: 'mediocre',
    };
  }

  // 较长的文本（>20字）→ 至少态度还行
  if (len > 20) {
    return {
      category: 'neutral',
      matchedKeywords: ['[态度尚可]'],
      angerDelta: randomInRange(-6, -2),
      label: '一般回应',
      quality: 'mediocre',
    };
  }

  // 默认中性
  return {
    category: 'neutral',
    matchedKeywords: [],
    angerDelta: randomInRange(-4, 2),
    label: '一般回应',
    quality: 'mediocre',
  };
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============ AI 女友回复生成 ============

interface AIResponsePool {
  [angerRange: string]: {
    [key in InputCategory]?: string[];
  };
}

const AI_RESPONSES: AIResponsePool = {
  // 怒气 80-100: 极度生气
  '80-100': {
    sincere_apology: [
      '你说对不起就有用吗？',
      '每次都道歉，有什么用？',
      '你错哪了？你说说看？',
      '我不听我不听！',
    ],
    empathy: [
      '你理解？你理解什么了？',
      '你要是真理解就不会这样了！',
      '别说了，你根本不懂！',
    ],
    sweet_romantic: [
      '少来这套！',
      '甜言蜜语没用！',
      '别哄我，我不吃这套！',
      '哼！',
    ],
    action_compensation: [
      '你以为买东西就能打发我？',
      '我不要你的东西！',
      '物质的补偿解决不了问题！',
    ],
    dismissive: [
      '你说什么？你再说一遍？',
      '你觉得这没什么？好，那我们完了！',
      '你居然这么想？',
      '我真的对你太失望了！',
    ],
    aggressive: [
      '你...你给我等着！',
      '好，很好。',
      '我从来没想过你是这种人。',
    ],
    cold_silence: [
      '......',
      '你连话都不想跟我说了是吗？',
      '呵。',
    ],
    explanation: [
      '我不想听你解释！',
      '解释就是掩饰！',
      '够了，别找借口了！',
    ],
    humorous: [
      '你觉得这很好笑吗？',
      '我在生气你在搞笑？',
      '你认真的吗？',
    ],
    neutral: [
      '......',
      '呵。',
      '我不想说话。',
      '你说完了吗？',
    ],
  },
  // 怒气 60-80: 还在生气
  '60-80': {
    sincere_apology: [
      '你知道自己错哪了吗？',
      '光说对不起就够了？',
      '那你以后打算怎么办？',
      '我暂时不想原谅你。',
    ],
    empathy: [
      '你终于知道我的感受了...',
      '哼，算你还有点良心。',
      '你早这样想不就好了？',
    ],
    sweet_romantic: [
      '别以为说几句好听的就行了。',
      '哼...我才不信呢。',
      '你说的是真的吗？',
    ],
    action_compensation: [
      '你以为这样就能弥补？',
      '看你的表现吧。',
      '我不稀罕...',
    ],
    dismissive: [
      '你什么态度？',
      '你居然觉得这没什么？',
      '好，你继续。',
    ],
    aggressive: [
      '你...你再说一次试试？',
      '我真的生气了。',
      '你变了。',
    ],
    cold_silence: [
      '你就没什么想说的？',
      '嗯，你也知道没话说？',
      '......行吧。',
    ],
    explanation: [
      '我不想听借口。',
      '你说的我都懂，但是...',
      '就算你说的是真的，那又怎样？',
    ],
    humorous: [
      '你还有心情开玩笑？',
      '哼，别以为这样我就不生气了。',
      '...你够了。',
    ],
    neutral: [
      '嗯。',
      '然后呢？',
      '就这？',
      '你说完了？',
    ],
  },
  // 怒气 40-60: 开始软化
  '40-60': {
    sincere_apology: [
      '哼...算你态度还行。',
      '你真的知道错了？',
      '那你说说，以后怎么办？',
      '我...我再考虑考虑。',
    ],
    empathy: [
      '你终于懂我了...',
      '其实我要的就是你这句话。',
      '你知道吗，你早这样说我就不会生气了。',
    ],
    sweet_romantic: [
      '你就会说好听的...',
      '哼，我才没有开心呢。',
      '你说的...我记住了。',
    ],
    action_compensation: [
      '那...好吧，看你表现。',
      '你说的哦，不许反悔。',
      '哼，算你有诚意。',
    ],
    dismissive: [
      '你又来了...算了。',
      '你能不能认真点？',
      '算了，跟你说不通。',
    ],
    aggressive: [
      '你...你怎么能这样说？',
      '我生气了，真的。',
    ],
    cold_silence: [
      '你就嗯一声？',
      '多说几个字会死吗？',
    ],
    explanation: [
      '好吧，我信你一次。',
      '你说的...有点道理。',
      '就算这样，你也不该...',
    ],
    humorous: [
      '你...你真是的！',
      '别以为我不知道你在搞笑。',
      '噗...不对，我在生气呢！',
    ],
    neutral: [
      '嗯...继续说。',
      '然后呢？',
      '就这样？',
    ],
  },
  // 怒气 20-40: 快好了
  '20-40': {
    sincere_apology: [
      '好吧...我原谅你了。',
      '哼，这次就饶了你。',
      '那你以后可不许再这样了！',
    ],
    empathy: [
      '你真的好懂我。',
      '有你在真好...不对，我还在生气呢！',
      '你终于开窍了。',
    ],
    sweet_romantic: [
      '你就会哄我开心...',
      '好啦好啦，我不生气了。',
      '你说的我都信。',
    ],
    action_compensation: [
      '好耶！你说的！不许反悔！',
      '这还差不多~',
      '那你可要说话算话哦。',
    ],
    dismissive: [
      '你...算了，不跟你计较。',
      '哼，这次就算了。',
    ],
    aggressive: [
      '你...你今天怎么了？',
      '你是不是不爱我了？',
    ],
    cold_silence: [
      '你怎么又不说话了？',
      '喂？',
    ],
    explanation: [
      '好吧，我相信你。',
      '嗯...我理解了。',
    ],
    humorous: [
      '你真是的...哈哈哈。',
      '好了好了，别闹了。',
      '我差点就笑出来了！',
    ],
    neutral: [
      '嗯~',
      '好啦~',
      '你说得对~',
    ],
  },
  // 怒气 0-20: 基本好了
  '0-20': {
    sincere_apology: [
      '好啦，我早就不生气了~',
      '你真好，我知道你是真心道歉的。',
      '我们和好了哦~',
    ],
    empathy: [
      '你最懂我了~',
      '有你在身边真好。',
      '谢谢你一直理解我。',
    ],
    sweet_romantic: [
      '我也爱你呀~',
      '你是最好的！',
      '嘻嘻，我就知道你最在乎我了。',
    ],
    action_compensation: [
      '好开心！走吧走吧~',
      '你最好了！',
      '嘻嘻，期待~',
    ],
    dismissive: [
      '哼，这次原谅你了。',
      '下次不许这样了哦。',
    ],
    aggressive: [
      '你...你怎么这样...呜呜...',
      '你是不是不想跟我好了？',
    ],
    cold_silence: [
      '你怎么不说话？',
      '喂喂喂？',
    ],
    explanation: [
      '嗯嗯，我懂~',
      '我相信你~',
    ],
    humorous: [
      '哈哈哈哈你太搞了！',
      '你真是我的开心果~',
    ],
    neutral: [
      '嗯嗯~',
      '好哒~',
      '嘻嘻~',
    ],
  },
};

/**
 * 根据怒气值和输入分类生成 AI 回复
 */
export function generateAIResponse(anger: number, analysis: InputAnalysis): string {
  // 确定怒气区间
  let rangeKey: string;
  if (anger >= 80) rangeKey = '80-100';
  else if (anger >= 60) rangeKey = '60-80';
  else if (anger >= 40) rangeKey = '40-60';
  else if (anger >= 20) rangeKey = '20-40';
  else rangeKey = '0-20';

  const pool = AI_RESPONSES[rangeKey];
  const responses = pool[analysis.category] || pool['neutral'] || ['......'];
  const idx = Math.floor(Math.random() * responses.length);
  return responses[idx];
}

// ============ 游戏状态管理 ============

export function createInitialState(): GameState {
  return {
    phase: 'welcome',
    anger: 100,
    round: 0,
    maxRounds: 10,
    messages: [],
    history: [],
  };
}

export function startGame(): GameState {
  const aiFirstMessage: ChatMessage = {
    id: generateId(),
    role: 'ai',
    text: '哼！我不想跟你说话！',
    timestamp: Date.now(),
  };

  return {
    phase: 'playing',
    anger: 100,
    round: 0,
    maxRounds: 10,
    messages: [aiFirstMessage],
    history: [],
  };
}

export function processPlayerInput(state: GameState, input: string): GameState {
  if (state.phase !== 'playing') return state;
  if (state.round >= state.maxRounds) return state;

  const analysis = analyzeInput(input);
  const newRound = state.round + 1;

  // 玩家消息
  const playerMessage: ChatMessage = {
    id: generateId(),
    role: 'player',
    text: input,
    timestamp: Date.now(),
    analysis,
  };

  // 检查是否为攻击性言论 → 直接结束
  if (analysis.category === 'aggressive') {
    const newAnger = Math.min(100, Math.max(0, state.anger + analysis.angerDelta));
    const aiResponse: ChatMessage = {
      id: generateId(),
      role: 'ai',
      text: generateAIResponse(state.anger, analysis),
      timestamp: Date.now(),
    };

    return {
      ...state,
      phase: 'lost',
      anger: newAnger,
      round: newRound,
      messages: [...state.messages, playerMessage, aiResponse],
      history: [...state.history, analysis],
      gameOverReason: 'toxic_input',
    };
  }

  // 计算新怒气值
  const newAnger = Math.min(100, Math.max(0, state.anger + analysis.angerDelta));

  // 检查是否胜利
  if (newAnger <= 0) {
    const aiResponse: ChatMessage = {
      id: generateId(),
      role: 'ai',
      text: '好啦好啦，我原谅你了~ 嘻嘻！',
      timestamp: Date.now(),
    };

    return {
      ...state,
      phase: 'won',
      anger: 0,
      round: newRound,
      messages: [...state.messages, playerMessage, aiResponse],
      history: [...state.history, analysis],
      gameOverReason: 'success',
    };
  }

  // AI 回复
  const aiResponse: ChatMessage = {
    id: generateId(),
    role: 'ai',
    text: generateAIResponse(newAnger, analysis),
    timestamp: Date.now(),
  };

  // 检查是否用完回合
  const newPhase: GamePhase = newRound >= state.maxRounds ? 'lost' : 'playing';

  return {
    ...state,
    phase: newPhase,
    anger: newAnger,
    round: newRound,
    messages: [...state.messages, playerMessage, aiResponse],
    history: [...state.history, analysis],
    gameOverReason: newPhase === 'lost' ? 'rounds_exhausted' : undefined,
  };
}

// ============ 结算评价 ============

export interface GameResult {
  won: boolean;
  roundsUsed: number;
  finalAnger: number;
  grade: string;       // S/A/B/C/D/F
  gradeLabel: string;  // 评级标签
  summary: string;     // 总体评价
  highlights: string[];  // 亮点
  improvements: string[]; // 改进建议
  categoryBreakdown: { label: string; count: number; quality: string }[];
}

export function evaluateGame(state: GameState): GameResult {
  const won = state.phase === 'won';
  const roundsUsed = state.round;
  const finalAnger = state.anger;

  // 评级
  let grade: string;
  let gradeLabel: string;
  if (won && roundsUsed <= 3) {
    grade = 'S';
    gradeLabel = '哄人大师';
  } else if (won && roundsUsed <= 5) {
    grade = 'A';
    gradeLabel = '沟通达人';
  } else if (won && roundsUsed <= 7) {
    grade = 'B';
    gradeLabel = '及格男友';
  } else if (won) {
    grade = 'C';
    gradeLabel = '勉强过关';
  } else if (state.gameOverReason === 'toxic_input') {
    grade = 'F';
    gradeLabel = '灾难现场';
  } else {
    grade = 'D';
    gradeLabel = '火上浇油';
  }

  // 分类统计
  const categoryCount: Record<string, { count: number; quality: string }> = {};
  for (const h of state.history) {
    if (!categoryCount[h.label]) {
      categoryCount[h.label] = { count: 0, quality: h.quality };
    } else {
      categoryCount[h.label].count++;
    }
  }
  const categoryBreakdown = Object.entries(categoryCount).map(([label, data]) => ({
    label,
    count: data.count,
    quality: data.quality,
  }));

  // 亮点
  const highlights: string[] = [];
  const excellentCount = state.history.filter(h => h.quality === 'excellent').length;
  const goodCount = state.history.filter(h => h.quality === 'good').length;

  if (excellentCount >= 2) highlights.push('你很擅长表达歉意和理解对方的感受');
  if (goodCount >= 2) highlights.push('你用了多种方式尝试哄对方，很有耐心');
  if (won && roundsUsed <= 5) highlights.push('你很快就找到了有效的沟通方式');
  if (state.history.some(h => h.category === 'empathy')) highlights.push('你展现了共情能力，这是很好的沟通技巧');
  if (highlights.length === 0 && won) highlights.push('最终你成功哄好了对方');
  if (highlights.length === 0) highlights.push('你至少尝试了沟通');

  // 改进建议
  const improvements: string[] = [];
  const hasAggressive = state.history.some(h => h.category === 'aggressive');
  const hasDismissive = state.history.some(h => h.category === 'dismissive');
  const hasCold = state.history.some(h => h.category === 'cold_silence');
  const hasEmpathy = state.history.some(h => h.category === 'empathy');
  const hasApology = state.history.some(h => h.category === 'sincere_apology');

  if (hasAggressive) improvements.push('避免使用攻击性语言，这只会让情况更糟');
  if (hasDismissive) improvements.push('不要轻描淡写对方的感受，"别生气了"比"你不该生气"更糟糕');
  if (hasCold) improvements.push('冷暴力不是好策略，简短的回复会让对方觉得你不在乎');
  if (!hasEmpathy) improvements.push('尝试表达你对她感受的理解，共情是最有效的沟通方式');
  if (!hasApology && !won) improvements.push('真诚的道歉是化解矛盾的第一步');
  if (state.history.filter(h => h.category === 'explanation').length > 2) {
    improvements.push('过多的解释会让人觉得你在找借口，适度即可');
  }
  if (improvements.length === 0) improvements.push('继续保持，你的沟通方式很棒');

  // 总体评价
  let summary: string;
  if (grade === 'S') {
    summary = '你是天生的哄人高手！既真诚又有技巧，对方完全招架不住你的温柔攻势。';
  } else if (grade === 'A') {
    summary = '你的沟通能力很强，懂得在合适的时候说合适的话，对方很快就被你哄好了。';
  } else if (grade === 'B') {
    summary = '你最终成功哄好了对方，虽然过程有些曲折，但结果是好的。';
  } else if (grade === 'C') {
    summary = '虽然最终哄好了，但花了不少回合。建议多学习共情和真诚道歉的技巧。';
  } else if (grade === 'F') {
    summary = '你说了攻击性的话，直接导致对局终止。在现实中，这样的话可能会造成无法挽回的伤害。';
  } else {
    summary = '这次尝试不太成功。你的话可能让对方更加生气了。记住：先处理情绪，再处理问题。';
  }

  return {
    won,
    roundsUsed,
    finalAnger,
    grade,
    gradeLabel,
    summary,
    highlights,
    improvements,
    categoryBreakdown,
  };
}

// ============ 工具函数 ============

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 获取 AI 女友的表情 emoji，根据怒气值
 */
export function getGirlfriendEmoji(anger: number): string {
  if (anger >= 90) return '😡';
  if (anger >= 70) return '😠';
  if (anger >= 50) return '😤';
  if (anger >= 30) return '😒';
  if (anger >= 15) return '😐';
  if (anger >= 5) return '🙂';
  return '🥰';
}

/**
 * 获取怒气值对应的颜色
 */
export function getAngerColor(anger: number): string {
  if (anger >= 80) return '#EF4444'; // 红色
  if (anger >= 60) return '#F97316'; // 橙色
  if (anger >= 40) return '#EAB308'; // 黄色
  if (anger >= 20) return '#84CC16'; // 黄绿色
  return '#4ADE80'; // 绿色
}

/**
 * 获取怒气值对应的标签
 */
export function getAngerLabel(anger: number): string {
  if (anger >= 90) return '暴怒';
  if (anger >= 70) return '很生气';
  if (anger >= 50) return '生气';
  if (anger >= 30) return '不太开心';
  if (anger >= 15) return '有点松动';
  if (anger >= 5) return '快好了';
  return '已原谅';
}
