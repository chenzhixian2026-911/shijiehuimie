# AGENTS.md

## 项目概览

哄哄模拟器 - 一个纯前端的恋爱沟通练习小游戏。玩家通过输入话术尝试将 AI 女友的怒气值从 100 降到 0，最多 10 次机会。

## 技术栈

- **Framework**: Vite + React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3 + CSS Variables
- **Build**: esbuild (via Vite)
- **部署**: 纯静态文件，无后端

## 目录结构

```
src/
├── main.tsx                    # React 入口
├── App.tsx                     # 主应用组件（状态机）
├── index.css                   # 全局样式 + Tailwind + 动画
├── components/
│   ├── WelcomeScreen.tsx       # 欢迎页/游戏说明
│   ├── GameScreen.tsx          # 游戏主界面（聊天+输入）
│   ├── ChatBubble.tsx          # 聊天消息气泡
│   ├── AngerMeter.tsx          # 怒气值指示器
│   └── ResultScreen.tsx        # 对局结算页面
└── lib/
    └── game-engine.ts          # 核心游戏引擎（话术识别+怒气计算+AI回复+评价）
```

## 核心功能

1. **话术识别引擎**：基于关键词匹配，将玩家输入分为 10 个类别
   - 真诚道歉 / 共情理解 → 大幅降怒气
   - 甜蜜浪漫 / 行动补偿 / 幽默化解 → 中等降怒气
   - 解释说明 → 少量降怒气
   - 敷衍轻描淡写 / 冷暴力 → 怒气上升
   - 攻击性言论 → 直接终止对局
   - 中性兜底 → 根据文本特征判定
2. **怒气值系统**：0-100，带颜色渐变和动画
3. **AI 女友回复**：根据怒气区间 + 输入类别，从预设池中选择回复
4. **对局结算**：S/A/B/C/D/F 评级 + 话术点评 + 改进建议
5. **纯前端**：无后端、无 API 调用、刷新即清空

## 开发命令

```bash
pnpm dev          # 启动开发服务
pnpm build        # 构建生产版本
pnpm ts-check     # TypeScript 类型检查
pnpm lint         # ESLint 检查
```

## 设计规范

- 主色：玫瑰粉 (#FF6B8A)
- 背景：奶油腮红 (#FFF5F7)
- 风格：甜蜜可爱、有代入感、恋爱小游戏
- 详见 DESIGN.md
