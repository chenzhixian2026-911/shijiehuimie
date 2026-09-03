import { Router, Request, Response } from 'express';
import { getSupabaseClient } from './src/storage/database/db-client.js';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = Router();

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

// GET /api/blog - 获取文章列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`查询失败: ${error.message}`);
    res.json(data || []);
  } catch (err) {
    console.error('获取博客列表失败:', err);
    res.status(500).json({ error: '获取博客列表失败' });
  }
});

// GET /api/blog/:id - 获取文章详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, content, created_at')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw new Error(`查询失败: ${error.message}`);
    if (!data) {
      res.status(404).json({ error: '文章不存在' });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('获取文章详情失败:', err);
    res.status(500).json({ error: '获取文章详情失败' });
  }
});

// POST /api/blog/generate - 使用 LLM 生成新文章
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const config = new Config({
      apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
      baseUrl: process.env.COZE_INTEGRATION_BASE_URL,
    });
    // 转换 headers 类型
    const rawHeaders = req.headers as Record<string, string | string[] | undefined>;
    const headersObj: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (typeof value === 'string') {
        headersObj[key] = value;
      }
    }
    const forwardHeaders = HeaderUtils.extractForwardHeaders(headersObj);
    const llmClient = new LLMClient(config, forwardHeaders);

    const topics = [
      '如何在吵架后快速和好',
      '为什么倾听比表达更重要',
      '情侣之间如何正确表达需求',
      '吵架时最伤人的几句话',
      '如何用幽默化解矛盾',
      '道歉时最忌讳的几种态度',
      '吵架后如何重建信任',
      '为什么冷战是感情杀手',
    ];

    // 随机选择一个主题
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const response = await llmClient.invoke(
      [
        {
          role: 'system',
          content: '你是一个恋爱沟通技巧博主，文风轻松幽默，善于用网络流行语和生活化的比喻来讲解恋爱中的沟通技巧。每篇文章300-500字，要有标题、摘要和正文。输出格式为JSON：{"title": "标题", "summary": "摘要（50字以内）", "content": "正文"}',
        },
        {
          role: 'user',
          content: `请写一篇关于"${randomTopic}"的恋爱沟通技巧文章。`,
        },
      ],
      { temperature: 0.9 }
    );

    const content = response.content || '';
    
    // 尝试解析 JSON
    let article: { title: string; summary: string; content: string };
    try {
      // 尝试从返回内容中提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        article = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析 JSON');
      }
    } catch {
      // 如果解析失败，使用默认格式
      article = {
        title: randomTopic,
        summary: content.slice(0, 50) + '...',
        content: content,
      };
    }

    // 保存到数据库
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('blog_posts')
      .insert({
        title: article.title,
        summary: article.summary,
        content: article.content,
      })
      .select()
      .single();

    if (error) throw new Error(`保存失败: ${error.message}`);
    
    res.json(data);
  } catch (err) {
    console.error('生成文章失败:', err);
    res.status(500).json({ error: '生成文章失败' });
  }
});

export default router;
