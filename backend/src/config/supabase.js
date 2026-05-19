import { createClient } from '@supabase/supabase-js';
import env from './env.js';

let client = null;

export function getSupabase() {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    return null;
  }
  if (!client) {
    client = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function uploadToSupabase(file, folder = 'products') {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase storage is not configured');
  }

  const ext = file.originalname.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(env.supabase.bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(env.supabase.bucket).getPublicUrl(path);
  return data.publicUrl;
}
