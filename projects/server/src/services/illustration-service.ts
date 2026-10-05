// AI 配图业务编排：读文章 -> 构造绘图 prompt -> 调方舟生图 -> 转存 Supabase -> 回写 cover_url

import { getPool } from '../storage/database/db-client.js';
import { getArkImageProvider } from '../ai/providers/ark-image-provider.js';
import { persistImageToStorage } from './image-store.js';
import { logAiEvent } from '../ai/logger.js';
import { AiProviderError, toBusinessMessage } from '../ai/errors.js';

export interface ArticleCoverRow {
  id: number;
  title: string;
  summary: string;
  content: string;
  cover_url: string | null;
  created_at?: string;
}

/** 业务级错误：携带 HTTP 状态与对外可读信息 */
export class IllustrationServiceError extends Error {
  readonly httpStatus: number;
  readonly code: string;
  constructor(httpStatus: number, code: string, message: string) {
    super(message);
    this.name = 'IllustrationServiceError';
    this.httpStatus = httpStatus;
    this.code = code;
  }
}

/** 根据文章标题/摘要构造中文绘图提示词（情感博客封面向，无文字无水印） */
function buildCoverPrompt(title: string, summary: string): string {
  return [
    '扁平化插画风格，温暖治愈的色调，恋爱与情感沟通主题',
    '柔和浪漫的光影，简洁高级的构图，适合作为情感博客文章封面',
    '画面中不要出现任何文字、字母、水印',
    `文章标题：${title}`,
    `内容概述：${summary}`,
  ].join('，');
}

export async function generateArticleCover(articleId: number): Promise<ArticleCoverRow> {
  if (!Number.isInteger(articleId) || articleId <= 0) {
    throw new IllustrationServiceError(400, 'BAD_REQUEST', '无效的文章 ID');
  }

  const pool = getPool();

  // 1) 取文章
  const articleRes = await pool.query<ArticleCoverRow>(
    'SELECT id, title, summary, content, cover_url FROM blog_posts WHERE id = $1',
    [articleId],
  );
  const article = articleRes.rows[0];
  if (!article) {
    throw new IllustrationServiceError(404, 'ARTICLE_NOT_FOUND', '文章不存在');
  }

  // 2) 调方舟文生图
  const provider = getArkImageProvider();
  const prompt = buildCoverPrompt(article.title, article.summary);
  const startedAt = Date.now();

  logAiEvent({ phase: 'start', provider: provider.name, action: 'generate_blog_cover' });

  let tempUrl: string;
  let imageSize: string | undefined;
  let imageModel: string | undefined;
  try {
    const result = await provider.generateImage({
      prompt,
      size: '2K',
      watermark: false, // 业务要求关闭水印
      timeoutMs: 90_000,
    });
    tempUrl = result.tempUrl;
    imageSize = result.size;
    imageModel = result.model;
    logAiEvent({
      phase: 'end',
      provider: provider.name,
      action: 'generate_blog_cover',
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    if (err instanceof AiProviderError) {
      logAiEvent({
        phase: 'error',
        provider: provider.name,
        action: 'generate_blog_cover',
        durationMs,
        statusCode: err.statusCode,
        errorKind: err.kind,
        errorSummary: err.message,
      });
      throw new IllustrationServiceError(
        mapAiKindToHttp(err.kind),
        err.kind,
        toBusinessMessage(err.kind),
      );
    }
    logAiEvent({
      phase: 'error',
      provider: provider.name,
      action: 'generate_blog_cover',
      durationMs,
      errorKind: 'SERVER_ERROR',
      errorSummary: (err as Error)?.message,
    });
    throw new IllustrationServiceError(503, 'SERVER_ERROR', '图片生成失败，请稍后重试');
  }

  // 3) 立即转存到 Supabase Storage（签名 URL 仅 24h 有效）
  let stored;
  try {
    stored = await persistImageToStorage(tempUrl);
  } catch (err) {
    logAiEvent({
      phase: 'error',
      provider: 'supabase-storage',
      action: 'persist_blog_cover',
      errorKind: 'SERVER_ERROR',
      errorSummary: (err as Error)?.message,
    });
    throw new IllustrationServiceError(502, 'STORAGE_ERROR', '图片已生成但转存失败，请稍后重试');
  }

  // 4) 回写 cover_url
  const updateRes = await pool.query<ArticleCoverRow>(
    'UPDATE blog_posts SET cover_url = $1 WHERE id = $2 RETURNING *',
    [stored.publicUrl, articleId],
  );

  logAiEvent({
    phase: 'end',
    provider: provider.name,
    action: 'persist_blog_cover',
    errorSummary: `model=${imageModel ?? ''} size=${imageSize ?? ''} bucket=${stored.bucket}`,
  });

  return updateRes.rows[0];
}

function mapAiKindToHttp(kind: string): number {
  switch (kind) {
    case 'BAD_REQUEST':
    case 'CONTENT_POLICY':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'RATE_LIMITED':
    case 'QUOTA_EXCEEDED':
      return 429;
    case 'TIMEOUT':
      return 504;
    case 'NETWORK':
      return 502;
    default:
      return 503;
  }
}
