// AI Provider 统一错误分类：把各家供应商的 HTTP/网络异常归一为业务错误

export type AiErrorKind =
  | 'BAD_REQUEST' // 400（参数问题）
  | 'UNAUTHORIZED' // 401（Key 无效）
  | 'FORBIDDEN' // 403（无权限/欠费停服）
  | 'RATE_LIMITED' // 429（限流）
  | 'CONTENT_POLICY' // 内容审核拒绝
  | 'QUOTA_EXCEEDED' // 额度/资源点不足
  | 'TIMEOUT' // 请求超时
  | 'NETWORK' // 网络不通/DNS/连接失败
  | 'SERVER_ERROR'; // 5xx 或无法解析的响应

export class AiProviderError extends Error {
  readonly kind: AiErrorKind;
  readonly provider: string;
  readonly statusCode?: number;

  constructor(kind: AiErrorKind, provider: string, message: string, statusCode?: number) {
    super(message);
    this.name = 'AiProviderError';
    this.kind = kind;
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

/**
 * 根据 HTTP 状态码与供应商错误码（方舟错误体为 { error: { code, message } }）分类。
 */
export function classifyHttpError(status: number, providerCode?: string, providerMessage?: string): AiErrorKind {
  const code = (providerCode || '').toLowerCase();
  const msg = (providerMessage || '').toLowerCase();

  if (/content|risk|sensitive|moderation|审核|敏感/.test(code + msg)) {
    return 'CONTENT_POLICY';
  }
  if (/quota|balance|arrear|resource.?point|额度|欠费/.test(code + msg)) {
    return 'QUOTA_EXCEEDED';
  }

  switch (status) {
    case 400:
    case 422:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 429:
      return 'RATE_LIMITED';
    default:
      return status >= 500 ? 'SERVER_ERROR' : 'BAD_REQUEST';
  }
}

/** 错误类别 -> 对外 HTTP 状态码 */
export function aiErrorToHttpStatus(kind: AiErrorKind): number {
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
    case 'SERVER_ERROR':
    default:
      return 503;
  }
}

/** 面向用户的可读中文提示（不泄露供应商原始报文） */
export function toBusinessMessage(kind: AiErrorKind): string {
  switch (kind) {
    case 'UNAUTHORIZED':
      return '图片服务密钥无效，请联系管理员检查配置';
    case 'FORBIDDEN':
      return '没有图片服务的访问权限或服务已停用';
    case 'RATE_LIMITED':
      return '请求过于频繁，请稍后再试';
    case 'QUOTA_EXCEEDED':
      return '图片生成额度已用完';
    case 'CONTENT_POLICY':
      return '绘图内容未通过安全审核，请换个主题再试';
    case 'TIMEOUT':
      return '图片生成超时，请稍后重试';
    case 'NETWORK':
      return '无法连接图片服务，请检查网络后重试';
    case 'BAD_REQUEST':
      return '图片服务不接受该请求参数';
    case 'SERVER_ERROR':
    default:
      return '图片服务暂时不可用，请稍后重试';
  }
}
