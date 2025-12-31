import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const defaultBucket = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) || "produtos";

if (!url || !anonKey) {
  console.warn("[supabaseClient] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados.");
}

export const supabase = createClient(url || "", anonKey || "");

/**
 * Upload de imagem no Supabase Storage (com guard para ambientes sem configuração)
 */
export async function uploadImage(file: File, bucket: string = defaultBucket): Promise<string> {
  if (!url || !anonKey) {
    throw new Error("Supabase não configurado no ambiente atual. Upload desativado.");
  }

  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    const msg = String(error.message || "").toLowerCase();
    if (msg.includes("not found") || msg.includes("bucket")) {
      throw new Error(`Bucket "${bucket}" não encontrado no Supabase Storage. Crie o bucket e defina público para leitura.`);
    }
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Exclusão de imagem no Supabase Storage (com guard)
 */
export async function deleteImage(urlToDelete: string, bucket: string = defaultBucket): Promise<void> {
  if (!url || !anonKey) {
    throw new Error("Supabase não configurado no ambiente atual. Exclusão desativada.");
  }

  const urlParts = urlToDelete.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) {
    throw new Error("URL de imagem inválida");
  }

  const filePath = urlParts[1];
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    throw new Error(`Erro ao deletar imagem: ${error.message}`);
  }
}
