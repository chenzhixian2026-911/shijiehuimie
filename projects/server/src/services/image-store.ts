// 图片持久化：供应商返回的是 24h 有效的签名 URL，
// 必须在生成后立即下载并转存到 Supabase Storage 公共桶，换取永久可访问地址。

import { randomUUID } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from '../storage/database/supabase-client.js';

const DEFAULT_BUCKET = 'blog-covers';
const DOWNLOAD_TIMEOUT_MS = 30_000;

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
}

function getStorageClient(): SupabaseClient {
  // 复用现有环境加载逻辑（.env.local / dotenv / Coze workload identity）
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase Storage 未配置：需要 COZE_SUPABASE_URL 与 COZE_SUPABASE_SERVICE_ROLE_KEY（转存 AI 配图用）',
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureBucket(client: SupabaseClient, bucket: string): Promise<void> {
  const { data: buckets, error } = await client.storage.listBuckets();
  if (error) {
    throw new Error(`读取 Supabase 存储桶失败: ${error.message}`);
  }
  if (buckets?.some(b => b.name === bucket)) {
    return;
  }
  const { error: createError } = await client.storage.createBucket(bucket, { public: true });
  // 并发场景下可能已被其它请求创建
  if (createError && !/already exist/i.test(createError.message)) {
    throw new Error(`创建 Supabase 存储桶 ${bucket} 失败: ${createError.message}`);
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export interface StoredImage {
  publicUrl: string;
  key: string;
  bucket: string;
}

export async function persistImageToStorage(tempUrl: string): Promise<StoredImage> {
  const client = getStorageClient();
  const bucket = getBucketName();

  // 1) 下载临时图片
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  let bytes: Uint8Array;
  let contentType = 'image/jpeg';
  try {
    const res = await fetch(tempUrl, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`下载生成图片失败: HTTP ${res.status}`);
    }
    contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';
    bytes = new Uint8Array(await res.arrayBuffer());
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      throw new Error('下载生成图片超时');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (bytes.byteLength === 0) {
    throw new Error('下载生成图片为空文件');
  }

  // 2) 确保公共桶存在
  await ensureBucket(client, bucket);

  // 3) 按日期分区上传（blog-covers/YYYYMM/uuid.jpeg）
  const now = new Date();
  const ext = contentType.includes('png') ? 'png' : 'jpeg';
  const key = `blog-covers/${now.getFullYear()}${pad2(now.getMonth() + 1)}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await client.storage.from(bucket).upload(key, bytes, {
    contentType,
    upsert: false,
  });
  if (uploadError) {
    throw new Error(`上传图片到 Supabase Storage 失败: ${uploadError.message}`);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(key);
  if (!data?.publicUrl) {
    throw new Error('获取图片永久访问地址失败');
  }

  return { publicUrl: data.publicUrl, key, bucket };
}
