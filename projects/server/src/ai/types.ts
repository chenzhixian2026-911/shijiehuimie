// AI Provider 统一领域接口（服务端专用模块，禁止被前端 src/ 引用）

export interface ImageGenerationRequest {
  /** 绘图提示词 */
  prompt: string;
  /** 方舟尺寸预设或具体像素，如 "2K" / "1024x1024" */
  size?: string;
  /** 是否添加水印（业务要求关闭） */
  watermark?: boolean;
  /** 超时毫秒，图片生成较慢，默认 90s */
  timeoutMs?: number;
}

export interface ImageGenerationResult {
  /** 提供方返回的图片地址（方舟为 24h 有效的签名 URL，必须立即转存） */
  tempUrl: string;
  /** 返回的实际像素尺寸，如 "3136x1344" */
  size?: string;
  provider: string;
  /** 实际命中的模型名/接入点 ID */
  model: string;
}

/**
 * 文生图能力的统一契约。
 * 上层 service 只依赖此接口，不感知具体供应商的请求/响应结构。
 */
export interface ImageProvider {
  readonly name: string;
  generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResult>;
}
