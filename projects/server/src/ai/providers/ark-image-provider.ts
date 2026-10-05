// 火山方舟（Volcengine Ark）文生图适配器 —— 豆包 Seedream 4.0
// 文档端点：POST {ARK_BASE_URL}/images/generations

import type { ImageGenerationRequest, ImageGenerationResult, ImageProvider } from '../types.js';
import { AiProviderError, classifyHttpError } from '../errors.js';

const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_TIMEOUT_MS = 90_000;

interface ArkImageDataItem {
  url?: string;
  size?: string;
}

interface ArkImageSuccessBody {
  model?: string;
  data?: ArkImageDataItem[];
}

interface ArkErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

export interface ArkImageConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class ArkImageProvider implements ImageProvider {
  readonly name = 'volcengine-ark-seedream';
  private readonly cfg: ArkImageConfig;

  constructor(cfg: ArkImageConfig) {
    if (!cfg.apiKey) {
      throw new AiProviderError('UNAUTHORIZED', this.name, 'ARK_API_KEY 未配置');
    }
    if (!cfg.model) {
      throw new AiProviderError('BAD_REQUEST', this.name, 'ARK_IMAGE_MODEL 未配置');
    }
    this.cfg = { ...cfg, baseUrl: cfg.baseUrl.replace(/\/+$/, '') };
  }

  async generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const prompt = req.prompt?.trim();
    if (!prompt) {
      throw new AiProviderError('BAD_REQUEST', this.name, 'prompt 不能为空');
    }

    const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${this.cfg.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: this.cfg.model,
          prompt,
          sequential_image_generation: 'disabled',
          response_format: 'url',
          size: req.size ?? '2K',
          stream: false,
          watermark: req.watermark ?? false,
        }),
        signal: controller.signal,
      });

      const rawText = await res.text();

      if (!res.ok) {
        let code: string | undefined;
        let message: string | undefined;
        try {
          const parsed = JSON.parse(rawText) as ArkErrorBody;
          code = parsed.error?.code;
          message = parsed.error?.message;
        } catch {
          // 非 JSON 错误页，保留原始片段用于日志
          message = rawText.slice(0, 200);
        }
        const kind = classifyHttpError(res.status, code, message);
        // 抛给上层的是可读消息；原始报文只进服务端日志（在 service 层打印）
        throw new AiProviderError(kind, this.name, message || `Ark HTTP ${res.status}`, res.status);
      }

      let body: ArkImageSuccessBody;
      try {
        body = JSON.parse(rawText) as ArkImageSuccessBody;
      } catch {
        throw new AiProviderError('SERVER_ERROR', this.name, 'Ark 返回了无法解析的响应体');
      }

      const item = body.data?.[0];
      if (!item?.url) {
        throw new AiProviderError('SERVER_ERROR', this.name, 'Ark 返回体中未找到图片地址 data[0].url');
      }

      return {
        tempUrl: item.url,
        size: item.size,
        provider: this.name,
        model: body.model ?? this.cfg.model,
      };
    } catch (err) {
      if (err instanceof AiProviderError) {
        throw err;
      }
      if ((err as Error)?.name === 'AbortError') {
        throw new AiProviderError('TIMEOUT', this.name, `Ark 文生图超过 ${timeoutMs}ms 未响应`);
      }
      throw new AiProviderError(
        'NETWORK',
        this.name,
        `调用 Ark 失败: ${(err as Error)?.message ?? '未知网络错误'}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

let singleton: ArkImageProvider | null = null;

/** 从服务端环境变量构造单例（密钥绝不进入前端 bundle） */
export function getArkImageProvider(): ArkImageProvider {
  if (singleton) return singleton;
  singleton = new ArkImageProvider({
    apiKey: process.env.ARK_API_KEY ?? '',
    baseUrl: process.env.ARK_BASE_URL || DEFAULT_BASE_URL,
    model: process.env.ARK_IMAGE_MODEL ?? '',
  });
  return singleton;
}
