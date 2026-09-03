# DESIGN.md

## 气质与意象
- 关键词：高级感、甜蜜、紧张、有代入感
- 意象：Apple 产品发布会的简洁感 + 恋爱小游戏的甜蜜紧张感
- 整体氛围：首页像苹果官网一样干净高级，游戏界面像可爱的恋爱小游戏

## 配色方案
- 主色：玫瑰粉 (#FF6B8A) — 恋爱感、温暖
- 辅色：暖珊瑚 (#FF8A65) — 紧迫感、活力
- 点缀色：柔金 (#FFB347) — 温暖、高级感
- 背景：#FAFAFA / 暖白 (#FFF8F9)
- 成功色：Apple 绿 (#34C759)
- 危险色：Apple 红 (#FF3B30)
- 文字主色：#1D1D1F (Apple 风格深灰)
- 文字次色：#86868B (Apple 风格中灰)
- 边框色：#E5E5EA
- 禁止使用紫色

## 字体排版
- 字体族：-apple-system / BlinkMacSystemFont / Noto Sans SC / PingFang SC
- 大标题：48-72px，font-weight 700，tracking-tight
- 副标题：28-40px，font-weight 700
- 正文：15-16px，行高 1.6
- 小字：12-13px，用于辅助信息

## 动效与交互
- 首页元素：fadeInUp + stagger 延迟，营造滚动叙事感
- 消息出现：从侧方弹入 + 淡入，250ms ease-out
- 怒气值变化：数字滚动 + 进度条平滑过渡，500ms ease-out
- 按钮：rounded-full，hover 放大 + 阴影加深
- 卡片：hover 时 shadow 加深
- 导航栏：glass morphism 毛玻璃效果

## 设计禁忌
- 不要使用紫色
- 不要使用冷色调（蓝色系为主色的场景）
- 不要使用深色模式
- 不要过于幼稚
- 不要使用纯白背景 (#FFFFFF) 做大面积底色
- 不要看起来像企业软件
