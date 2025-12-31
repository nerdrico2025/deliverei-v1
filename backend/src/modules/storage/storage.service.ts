import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url =
    process.env.SUPABASE_URL ||
    (projectRef ? `https://${projectRef}.supabase.co` : undefined);
  if (!url || !serviceKey) {
    throw new Error('Supabase admin não configurado');
  }
  return createClient(url, serviceKey);
}

@Injectable()
export class StorageService {
  async ensureBucket(name: string) {
    const bucket = String(name || '').trim() || 'produtos';
    const supabase = getSupabaseAdmin();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      throw new Error(`Falha ao listar buckets: ${error.message}`);
    }
    const exists = (buckets || []).some((b) => b.name === bucket);
    if (exists) {
      return { ok: true, bucket };
    }
    const { error: createErr } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    if (createErr) {
      throw new Error(`Falha ao criar bucket: ${createErr.message}`);
    }
    return { ok: true, bucket };
  }

  async uploadImage(fileBuffer: Buffer, fileName: string, bucketName?: string) {
    const bucket = String(bucketName || '').trim() || 'produtos';
    const supabase = getSupabaseAdmin();
    const ts = Date.now();
    const ext = (fileName.split('.').pop() || 'bin').toLowerCase();
    const name = `${ts}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: this.detectContentType(ext),
    });
    if (error) {
      throw new Error(`Falha ao enviar imagem: ${error.message}`);
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: pub.publicUrl };
  }

  private detectContentType(ext: string): string {
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return 'application/octet-stream';
    }
  }
}
