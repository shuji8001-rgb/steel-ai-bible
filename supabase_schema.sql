-- =========================================================================
-- ミナミ工業 建築鉄骨製作・溶接品質「技術伝承AIバイブル」
-- Supabase PostgreSQL データベース構築スキーマ
-- =========================================================================

-- 1. 質問キューテーブル (questions_queue)
CREATE TABLE IF NOT EXISTS public.questions_queue (
  id TEXT PRIMARY KEY,
  no INTEGER NOT NULL,
  section TEXT DEFAULT 'SEC-1',
  category_id TEXT DEFAULT 'SEC-1',
  title TEXT NOT NULL,
  raw_text TEXT,
  refined_question TEXT,
  ai_standard_answer JSONB,
  key_check_points JSONB,
  suggested_criteria TEXT,
  is_answered BOOLEAN DEFAULT false,
  has_voice_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  images JSONB DEFAULT '[]'::jsonb,
  source_type TEXT DEFAULT 'user',
  knowledge_id TEXT,
  worker_summary JSONB,
  cause_category TEXT,
  action_category TEXT
);

-- 2. 蓄積ナレッジテーブル (knowledge_records)
CREATE TABLE IF NOT EXISTS public.knowledge_records (
  id TEXT PRIMARY KEY,
  question_id TEXT REFERENCES public.questions_queue(id) ON DELETE CASCADE,
  category_id TEXT,
  section TEXT,
  question_title TEXT NOT NULL,
  original_question TEXT,
  refined_problem TEXT,
  has_voice_answer BOOLEAN DEFAULT false,
  ai_standard_answer JSONB,
  phenomenon TEXT,
  cause TEXT,
  action_and_criteria TEXT,
  prevention TEXT,
  key_terminology JSONB DEFAULT '[]'::jsonb,
  full_transcript TEXT,
  audio_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  audio_duration_seconds NUMERIC,
  confidence_score NUMERIC,
  worker_summary JSONB,
  cause_category TEXT,
  action_category TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. インデックス作成（検索高速化）
CREATE INDEX IF NOT EXISTS idx_steel_questions_no ON public.questions_queue(no);
CREATE INDEX IF NOT EXISTS idx_steel_questions_created ON public.questions_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_steel_knowledge_qid ON public.knowledge_records(question_id);
CREATE INDEX IF NOT EXISTS idx_steel_knowledge_created ON public.knowledge_records(created_at DESC);

-- 4. RLS (Row Level Security) の設定（公開読み書き可能ポリシー）
ALTER TABLE public.questions_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read questions_queue" ON public.questions_queue FOR SELECT USING (true);
CREATE POLICY "Allow public insert questions_queue" ON public.questions_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update questions_queue" ON public.questions_queue FOR UPDATE USING (true);
CREATE POLICY "Allow public delete questions_queue" ON public.questions_queue FOR DELETE USING (true);

CREATE POLICY "Allow public read knowledge_records" ON public.knowledge_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert knowledge_records" ON public.knowledge_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update knowledge_records" ON public.knowledge_records FOR UPDATE USING (true);
CREATE POLICY "Allow public delete knowledge_records" ON public.knowledge_records FOR DELETE USING (true);

-- 5. Storage バケットの作成（音声・写真メディア用）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('steel-media', 'steel-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read steel-media" ON storage.objects FOR SELECT USING (bucket_id = 'steel-media');
CREATE POLICY "Allow public insert steel-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'steel-media');
CREATE POLICY "Allow public update steel-media" ON storage.objects FOR UPDATE USING (bucket_id = 'steel-media');
CREATE POLICY "Allow public delete steel-media" ON storage.objects FOR DELETE USING (bucket_id = 'steel-media');
