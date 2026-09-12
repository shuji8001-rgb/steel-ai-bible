-- ==============================================================================
-- ミナミ工業 建築鉄骨製作・溶接品質「技術伝承AIバイブル」 Supabase テーブル設計
-- ==============================================================================

-- 1. 質問キュー（未回答リスト・初期インデックス格納用）
CREATE TABLE IF NOT EXISTS questions_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no INT,
    section TEXT NOT NULL, -- SEC-1 〜 SEC-4
    title TEXT NOT NULL,
    refined_question TEXT, -- AI具体化済みテキスト
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 完成した鉄骨QAナレッジバイブル
CREATE TABLE IF NOT EXISTS knowledge_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    question_id UUID REFERENCES questions_queue(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    section TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    phenomenon TEXT NOT NULL,
    cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    jass_standard TEXT,
    prevention TEXT NOT NULL,
    raw_transcript TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}'
);

-- 3. インデックス作成
CREATE INDEX IF NOT EXISTS idx_steel_section ON knowledge_records(section);
CREATE INDEX IF NOT EXISTS idx_steel_created ON knowledge_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions_queue(section);
CREATE INDEX IF NOT EXISTS idx_questions_answered ON questions_queue(is_answered);

-- 4. Storage バケット設定 (Supabase Storage > Buckets にて作成)
-- バケット名: steel-media (Public bucket)
-- policies: INSERT, SELECT を public/anon に許可
