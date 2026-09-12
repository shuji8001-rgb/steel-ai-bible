export type SectionId = 'SEC-1' | 'SEC-2' | 'SEC-3' | 'SEC-4' | 'SEC-5';

export interface SectionMeta {
  id: SectionId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconName: string;
}

export const SECTIONS: Record<SectionId, SectionMeta> = {
  'SEC-1': {
    id: 'SEC-1',
    name: '一次加工工程（切断・孔あけ・開先・ショット・曲げ）',
    shortName: '一次加工',
    description: 'コラム・極厚板ガス切断・レーザー焼入れ層・ハイテン孔・開先精度・粗面度',
    color: 'amber',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    iconName: 'Scissors',
  },
  'SEC-2': {
    id: 'SEC-2',
    name: '組立・仕口工程（仮組み・仕口治具・ダイヤフラム・スプライス）',
    shortName: '組立・仕口',
    description: '定盤レベル・通しダイヤフラム目違い・溶接縮み代・首振り倒れ・逆歪み・タック溶接',
    color: 'blue',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-400',
    iconName: 'Layers',
  },
  'SEC-3': {
    id: 'SEC-3',
    name: '溶接・UT・歪み工程（半自動・MAG・サブマージ・線状加熱）',
    shortName: '溶接・UT・歪み',
    description: '姿勢別電流電圧・風速シールドガス・予熱パス間温度・裏当て金ルート・線状加熱・歪み取り',
    color: 'orange',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    badgeBorder: 'border-orange-500/30',
    badgeText: 'text-orange-400',
    iconName: 'Flame',
  },
  'SEC-4': {
    id: 'SEC-4',
    name: '品質管理・検査工程（製品寸法検査・UT探傷・外観・JASS 6判定）',
    shortName: '品質管理・検査',
    description: '製品寸法測定・UT斜角探傷欠陥波形・すべり係数サビ色判定・ミルシート・受入検査・JASS 6公差',
    color: 'purple',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
    iconName: 'ShieldCheck',
  },
  'SEC-5': {
    id: 'SEC-5',
    name: '塗装・出荷工程（塗装・マスキング・リンギ配置・建方順積載）',
    shortName: '塗装・出荷',
    description: '塗装禁止エリアマスキング・ジンクリッチ膜厚・リンギ配置・建方順トラック逆順積載・現場リーマー通し',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
    iconName: 'Truck',
  },
};

// 一般作業員・現場向けクイック要約
export interface WorkerSummary {
  summary_phenomenon: string; // 一目でわかる事象
  verdict_ok_ng: 'OK（合格/許容）' | 'NG（手直し必須）' | '判定要注意（JASS 6測定要）' | '危険（作業即停止）';
  immediate_action: string;    // 今すぐやる処置（2〜3行）
  forbidden_action: string;    // ⚠️ 絶対やってはいけないNG行動
}

// AIによる標準理論・JASS 6解説
export interface AiStandardAnswer {
  theory: string;              // 標準理論・発生メカニズム
  standard_criteria: string;   // JASS 6 / JIS規格・公的基準
  points_to_check: string[];   // 現場確認ポイント
}

// 質問キュー（Supabase: questions_queue）
export interface QuestionQueueItem {
  id: string;
  no: number;
  section: SectionId;
  title: string;
  raw_text?: string | null;
  refined_question?: string | null;
  ai_standard_answer?: AiStandardAnswer | null; // AIによる標準理論仮解説
  key_check_points?: string[] | null;
  suggested_criteria?: string | null;
  is_answered: boolean;       // AI仮解説済み
  has_voice_answer: boolean;   // 👑 職長の肉声音声回答済み
  created_at: string;
  images?: string[] | null;
  source_type: 'preset' | 'user';
  knowledge_id?: string | null;
  worker_summary?: WorkerSummary | null;
  cause_category?: string | null;     // 分析用：根本原因カテゴリ
  action_category?: string | null;    // 分析用：処置カテゴリ
}

// 蓄積ナレッジレコード（Supabase: knowledge_records）- AI標準解説 ＋ 職長実践ノウハウの2本立て
export interface KnowledgeRecord {
  id: string;
  question_id: string;
  question_title: string;
  section: SectionId;
  created_at: string;
  
  // 1. 質問と問題定義
  original_question?: string | null;
  refined_problem?: string | null;
  has_voice_answer: boolean;

  // 2. AI標準理論・JASS 6解説（青系）
  ai_standard_answer?: AiStandardAnswer | null;

  // 3. ベテラン職長の実践構造化ノウハウ（金/炎系）
  phenomenon: string;         // 【現象】何が起きているか
  cause: string;              // 【原因】なぜ生じたか（メカニズム）
  action_and_criteria: string;// 【処置・合否判定】現場手直し・社内判断ライン
  jass_standard?: string;     // JASS 6 精度基準
  prevention: string;         // 【再発防止策】次回製作へのフィードバック
  key_terminology: string[];  // 補正された専門用語・タグ
  full_transcript: string;    // 職長の語り全文文字起こし（誤変換補正済み）
  audio_url?: string | null;         // 音声URL
  images?: string[] | null;          // 写真URL
  audio_duration_seconds?: number | null;
  confidence_score?: number | null;

  // 4. 現場作業員向け要約 ＆ 分析用タグ
  worker_summary?: WorkerSummary | null;
  cause_category?: string | null;
  action_category?: string | null;
  tags?: string[];
}

export interface StructuredKnowledgeOutput {
  title: string;
  section: SectionId;
  tags: string[];
  phenomenon: string;
  cause: string;
  solution: string;
  jass_standard: string;
  prevention: string;
  raw_transcript: string;
}

export type MainViewMode = 'BIBLE' | 'WORKER_SUMMARY' | 'ANALYTICS';
