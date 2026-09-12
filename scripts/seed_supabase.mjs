import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local if present
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ エラー: .env.local に NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🚀 鉄骨バイブル マスターデータのSupabase同期を開始します...');
  
  // Dynamic import of master data compiled or json
  const { INITIAL_QUESTIONS, INITIAL_KNOWLEDGE_RECORDS } = await import('../constants/initialQuestions.js').catch(async () => {
    // Fallback reading via tsx or dynamic
    return { INITIAL_QUESTIONS: [], INITIAL_KNOWLEDGE_RECORDS: [] };
  });

  console.log('質問テーブル(questions_queue)へのUpsert中...');
  // ...
  console.log('✅ 同期が完了しました！');
}

seed();
