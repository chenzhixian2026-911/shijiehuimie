// AI 调用可观测日志：请求开始/结束、provider、耗时、状态码、错误摘要
// 仅记录元信息，不记录 prompt 全文与任何密钥。

export interface AiLogFields {
  phase: 'start' | 'end' | 'error';
  provider: string;
  action: string;
  durationMs?: number;
  statusCode?: number;
  /** 归一后的错误类别，如 RATE_LIMITED / TIMEOUT */
  errorKind?: string;
  /** 截断后的错误摘要，避免刷屏 */
  errorSummary?: string;
}

function truncate(text: string, max = 200): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function logAiEvent(fields: AiLogFields): void {
  const line: Record<string, unknown> = {
    t: new Date().toISOString(),
    tag: 'ai',
    phase: fields.phase,
    provider: fields.provider,
    action: fields.action,
  };
  if (fields.durationMs !== undefined) line.durationMs = fields.durationMs;
  if (fields.statusCode !== undefined) line.statusCode = fields.statusCode;
  if (fields.errorKind) line.errorKind = fields.errorKind;
  if (fields.errorSummary) line.errorSummary = truncate(fields.errorSummary);

  if (fields.phase === 'error') {
    console.error(`[AI] ${JSON.stringify(line)}`);
  } else {
    console.log(`[AI] ${JSON.stringify(line)}`);
  }
}
