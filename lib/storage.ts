import { supabaseAdmin, supabase, isSupabaseConfigured } from './supabase';
import { QuestionQueueItem, KnowledgeRecord } from '@/types';
import { INITIAL_QUESTIONS, INITIAL_KNOWLEDGE_RECORDS } from '@/constants/initialQuestions';

const BUCKET_NAME = 'steel-media';
const STORAGE_KEY_QUESTIONS = 'steel_bible_questions_v1';
const STORAGE_KEY_KNOWLEDGE = 'steel_bible_knowledge_v1';

export function getLocalQuestions(): QuestionQueueItem[] {
  if (typeof window === 'undefined') return INITIAL_QUESTIONS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error, fallback to initial questions:', e);
  }
  return INITIAL_QUESTIONS;
}

export function getLocalKnowledge(): KnowledgeRecord[] {
  if (typeof window === 'undefined') return INITIAL_KNOWLEDGE_RECORDS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_KNOWLEDGE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error, fallback to initial knowledge:', e);
  }
  return INITIAL_KNOWLEDGE_RECORDS;
}

export function saveLocalQuestions(questions: QuestionQueueItem[]) {
  if (typeof window === 'undefined' || !Array.isArray(questions)) return;
  try {
    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
  } catch (e: any) {
    console.warn('LocalStorage save error for questions, attempting lightweight compression safeguard:', e);
    try {
      // 🌟 容量超過時セーフガード: 巨大なBase64画像文字列を軽量化してテキスト・判定ナレッジを保護
      const lightweightQuestions = questions.map((q) => ({
        ...q,
        images: (q.images || []).map((img) =>
          img && img.length > 500 ? img.slice(0, 150) + '...' : img
        ),
      }));
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(lightweightQuestions));
    } catch (innerErr) {
      console.error('Critical failure saving questions to localStorage:', innerErr);
    }
  }
}

export function saveLocalKnowledge(knowledge: KnowledgeRecord[]) {
  if (typeof window === 'undefined' || !Array.isArray(knowledge)) return;
  try {
    localStorage.setItem(STORAGE_KEY_KNOWLEDGE, JSON.stringify(knowledge));
  } catch (e: any) {
    console.warn('LocalStorage save error for knowledge, attempting lightweight compression safeguard:', e);
    try {
      // 🌟 容量超過時セーフガード: 巨大なBase64画像文字列を軽量化してテキスト・判定ナレッジを保護
      const lightweightKnowledge = knowledge.map((k) => ({
        ...k,
        images: (k.images || []).map((img) =>
          img && img.length > 500 ? img.slice(0, 150) + '...' : img
        ),
      }));
      localStorage.setItem(STORAGE_KEY_KNOWLEDGE, JSON.stringify(lightweightKnowledge));
    } catch (innerErr) {
      console.error('Critical failure saving knowledge to localStorage:', innerErr);
    }
  }
}

export function resetAllToDefaults(): { questions: QuestionQueueItem[]; knowledge: KnowledgeRecord[] } {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_QUESTIONS);
    localStorage.removeItem(STORAGE_KEY_KNOWLEDGE);
  }
  return {
    questions: INITIAL_QUESTIONS,
    knowledge: INITIAL_KNOWLEDGE_RECORDS,
  };
}

/**
 * Supabase DBからのデータ同期 ＆ 初回自動シード投入
 */
export async function syncFromSupabase(): Promise<{ questions: QuestionQueueItem[]; knowledge: KnowledgeRecord[] }> {
  if (!isSupabaseConfigured || !supabase) {
    return { questions: getLocalQuestions(), knowledge: getLocalKnowledge() };
  }

  try {
    const { data: qData, error: qErr } = await supabase
      .from('questions_queue')
      .select('*')
      .order('no', { ascending: true });

    const { data: kData, error: kErr } = await supabase
      .from('knowledge_records')
      .select('*')
      .order('created_at', { ascending: false });

    // 🌟 初回接続時：Supabase側が空の場合は初期マスターデータを一括投入
    if ((!qData || qData.length === 0) && !qErr) {
      console.log('🌱 Supabaseが初期状態のため、マスターデータ（200問）を自動投入します...');
      try {
        const cleanQuestions = INITIAL_QUESTIONS.map((q) => ({
          ...q,
          images: q.images || [],
        }));
        const cleanKnowledge = INITIAL_KNOWLEDGE_RECORDS.map((k) => ({
          ...k,
          images: k.images || [],
          key_terminology: k.key_terminology || [],
        }));

        await supabase.from('questions_queue').upsert(cleanQuestions);
        await supabase.from('knowledge_records').upsert(cleanKnowledge);
        
        return {
          questions: INITIAL_QUESTIONS,
          knowledge: INITIAL_KNOWLEDGE_RECORDS,
        };
      } catch (seedErr) {
        console.warn('Auto-seed to Supabase failed:', seedErr);
      }
    }

    const questions = (qData && qData.length > 0) ? (qData as QuestionQueueItem[]) : getLocalQuestions();
    const knowledge = (kData && kData.length > 0) ? (kData as KnowledgeRecord[]) : getLocalKnowledge();

    // ローカルキャッシュも最新化
    saveLocalQuestions(questions);
    saveLocalKnowledge(knowledge);

    return { questions, knowledge };
  } catch (err) {
    console.warn('Supabase sync error:', err);
    return { questions: getLocalQuestions(), knowledge: getLocalKnowledge() };
  }
}

/**
 * 音声や画像ファイルのアップロード
 */
export async function uploadMediaFile(
  file: Blob | File,
  folder: 'audio' | 'images',
  customFileName?: string
): Promise<string> {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = file.type.includes('webm')
    ? 'webm'
    : file.type.includes('mp4')
    ? 'mp4'
    : file.type.includes('ogg')
    ? 'ogg'
    : file.type.includes('png')
    ? 'png'
    : file.type.includes('jpeg') || file.type.includes('jpg')
    ? 'jpg'
    : 'bin';

  const fileName = customFileName || `${folder}/${timestamp}_${randomStr}.${extension}`;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.error('Storage upload exception:', err);
    }
  }

  // フォールバック: Data URL生成
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}
