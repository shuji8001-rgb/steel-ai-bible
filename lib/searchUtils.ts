import { QuestionQueueItem, KnowledgeRecord } from '@/types';

// 鉄骨専門用語シノニム（同義語・現場話し言葉辞書）
const STEEL_SYNONYMS: Record<string, string[]> = {
  '炙る': ['線状加熱', '加熱矯正', 'プロパン', 'バーナー', '三角加熱', '歪み取り'],
  '炙り': ['線状加熱', '加熱矯正', 'プロパン', 'バーナー', '歪み取り'],
  'バーナー': ['プロパン', '線状加熱', '加熱矯正', 'ガス切断'],
  'ガスバーナー': ['プロパン', '線状加熱', '加熱矯正', 'ガス切断'],
  '角歪み': ['フランジ', '逆歪み', 'ハの字', '変形', '倒れ', '溶接変形'],
  '逆ハの字': ['ハの字', '角歪み', 'フランジ', '逆歪み', '倒れ'],
  'ハの字': ['角歪み', 'フランジ', '逆歪み', '倒れ', '溶接変形'],
  'h鋼': ['h形鋼', '大梁', 'ビルトh', 'フランジ', 'ウェブ'],
  'ノロ': ['ドロス', 'スラグ', '切断ノッチ', 'ガス切断'],
  'ドロス': ['ノロ', 'スラグ', 'ガス切断'],
  'エコー': ['ut', '超音波探傷', '欠陥指示', 'iii領域', '探傷'],
  'ut': ['超音波探傷', 'エコー', '探傷検査', '非破壊検査'],
  '積む': ['積載', 'トラック', 'トレーラー', '逆順', 'リンギ'],
  'トラック': ['トレーラー', '積載', '逆順', '出荷', 'ヤード', 'リンギ'],
  'トレーラー': ['トラック', '積載', '逆順', '出荷', 'リンギ'],
  'ボルト': ['ハイテンボルト', '高力ボルト', '孔あけ', 'リーマー', 'ピッチ'],
  '穴': ['孔', 'ボルト孔', '孔あけ', 'リーマー', '長孔'],
  'ピッチ': ['孔ピッチ', 'ボルト孔', '芯ズレ', '穴'],
  'クラック': ['割れ', '高温割れ', '遅れ割れ', '欠陥', '破断'],
  'アンダーカット': ['溶接欠陥', '余盛', '手直し', '肉盛り'],
  'ブローホール': ['ピット', 'ガス欠陥', 'シールドガス', '風'],
  '乾燥': ['未乾燥', '塗膜', '硬化', '温度', '湿度'],
};

// 日本語の重要キーワード抽出（助詞・不要語の簡易除去）
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const normalized = text
    .toLowerCase()
    .replace(/[、。！？!?,.\(\)\[\]\{\}「」『』\n\t]/g, ' ')
    .trim();

  // 単語分割
  const rawWords = normalized.split(/\s+/).filter((w) => w.length >= 2);
  const keywords = new Set<string>();

  // 助詞などのストップワード
  const stopWords = new Set(['したら', 'して', 'すれば', 'した', 'から', 'ので', 'けど', 'です', 'ます', 'いい', 'どう', 'なに', 'これ', 'それ', 'あれ']);

  rawWords.forEach((word) => {
    if (!stopWords.has(word)) {
      keywords.add(word);
    }
  });

  // 2〜4文字の重要フレーズ抽出
  const textClean = normalized.replace(/\s+/g, '');
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= textClean.length - len; i++) {
      const phrase = textClean.substring(i, i + len);
      if (!stopWords.has(phrase)) {
        keywords.add(phrase);
      }
    }
  }

  return Array.from(keywords);
}

// 類似度スコアの高度な計算
export function calculateSimilarityScore(
  query: string,
  targetText: string,
  extraTerms: string[] = []
): number {
  if (!query || !targetText) return 0;

  const q = query.toLowerCase().trim();
  const t = targetText.toLowerCase().trim();

  // 1. 完全一致・部分一致
  if (t.includes(q) || q.includes(t)) {
    return 0.95;
  }

  const queryKeywords = extractKeywords(q);
  if (queryKeywords.length === 0) return 0;

  let matchedScore = 0;
  let strongMatchCount = 0;

  // 2. クエリキーワードの直接一致
  queryKeywords.forEach((kw) => {
    if (t.includes(kw)) {
      const weight = kw.length >= 3 ? 0.35 : 0.2;
      matchedScore += weight;
      strongMatchCount++;
    }

    // 3. シノニム（類義語）展開一致
    const synonyms = STEEL_SYNONYMS[kw] || [];
    synonyms.forEach((syn) => {
      if (t.includes(syn)) {
        matchedScore += 0.25;
        strongMatchCount++;
      }
    });
  });

  // 4. 追加キーワードリストの一致
  extraTerms.forEach((term) => {
    if (q.includes(term.toLowerCase())) {
      matchedScore += 0.2;
      strongMatchCount++;
    }
  });

  // 2つ以上の重要キーワードが合致した場合、重複確率が極めて高い
  if (strongMatchCount >= 2) {
    matchedScore = Math.max(matchedScore, 0.45);
  }

  return Math.min(matchedScore, 1.0);
}

export interface SimilarMatchResult {
  question: QuestionQueueItem;
  knowledge?: KnowledgeRecord;
  score: number;
  matchedReason: string;
}

// 類似する質問・ナレッジの上位N件を検索
export function findSimilarQuestions(
  query: string,
  questions: QuestionQueueItem[],
  knowledgeList: KnowledgeRecord[] = [],
  limit: number = 3,
  minScoreThreshold: number = 0.18
): SimilarMatchResult[] {
  if (!query || query.trim().length < 2) return [];

  const results: SimilarMatchResult[] = [];

  questions.forEach((q) => {
    const k = knowledgeList.find((item) => item.question_id === q.id);

    // 検索対象となる全テキストを結合
    const targetAction = [
      q.worker_summary?.immediate_action || '',
      q.worker_summary?.forbidden_action || '',
      q.worker_summary?.summary_phenomenon || '',
    ].join(' ');

    const targetTheory = [
      q.ai_standard_answer?.theory || '',
      q.ai_standard_answer?.standard_criteria || '',
      q.suggested_criteria || '',
      ...(q.key_check_points || []),
    ].join(' ');

    const targetKnowledge = [
      k?.phenomenon || '',
      k?.cause || '',
      k?.action_and_criteria || '',
      k?.prevention || '',
      ...(k?.key_terminology || []),
    ].join(' ');

    // タイトル類似度
    const titleScore = calculateSimilarityScore(query, q.title);
    // 現場処置・NG行動類似度
    const actionScore = calculateSimilarityScore(query, targetAction);
    // 質問文類似度
    const rawScore = calculateSimilarityScore(query, `${q.raw_text || ''} ${q.refined_question || ''}`);
    // 技術理論・JASS 6基準類似度
    const theoryScore = calculateSimilarityScore(query, targetTheory);
    // ナレッジ全般類似度
    const knowScore = calculateSimilarityScore(query, targetKnowledge);

    const maxScore = Math.max(
      titleScore * 1.2,
      actionScore * 1.15,
      rawScore,
      theoryScore * 0.95,
      knowScore * 0.9
    );

    if (maxScore >= minScoreThreshold) {
      let reason = '質問タイトルが類似';
      if (actionScore >= titleScore && actionScore >= minScoreThreshold) {
        reason = '現場処置・手直し内容が一致';
      } else if (titleScore < rawScore && rawScore >= minScoreThreshold) {
        reason = '過去の現場疑問メモと類似';
      } else if (theoryScore > titleScore) {
        reason = '発生メカニズム・JASS6基準が合致';
      }

      results.push({
        question: q,
        knowledge: k,
        score: maxScore,
        matchedReason: reason,
      });
    }
  });

  // スコア降順ソート
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function filterKnowledgeRecords(
  records: KnowledgeRecord[],
  keyword: string,
  sectionFilter: string | null
): KnowledgeRecord[] {
  let list = records;

  if (sectionFilter && sectionFilter !== 'ALL') {
    list = list.filter((r) => r.section === sectionFilter);
  }

  if (!keyword.trim()) {
    return list;
  }

  const q = keyword.toLowerCase().trim();

  return list.filter((r) => {
    return (
      r.question_title.toLowerCase().includes(q) ||
      (r.phenomenon && r.phenomenon.toLowerCase().includes(q)) ||
      (r.cause && r.cause.toLowerCase().includes(q)) ||
      (r.action_and_criteria && r.action_and_criteria.toLowerCase().includes(q)) ||
      (r.jass_standard && r.jass_standard.toLowerCase().includes(q)) ||
      (r.prevention && r.prevention.toLowerCase().includes(q)) ||
      (r.key_terminology && r.key_terminology.some((t) => t.toLowerCase().includes(q))) ||
      (r.full_transcript && r.full_transcript.toLowerCase().includes(q))
    );
  });
}

export function filterQuestionQueue(
  questions: QuestionQueueItem[],
  keyword: string,
  sectionFilter: string | null,
  statusFilter: 'ALL' | 'UNANSWERED' | 'ANSWERED' = 'ALL'
): QuestionQueueItem[] {
  let list = questions;

  if (sectionFilter && sectionFilter !== 'ALL') {
    list = list.filter((q) => q.section === sectionFilter);
  }

  if (statusFilter === 'UNANSWERED') {
    list = list.filter((q) => !q.has_voice_answer);
  } else if (statusFilter === 'ANSWERED') {
    list = list.filter((q) => q.has_voice_answer);
  }

  if (!keyword.trim()) {
    return list;
  }

  const q = keyword.toLowerCase().trim();

  return list.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.refined_question && item.refined_question.toLowerCase().includes(q)) ||
      (item.raw_text && item.raw_text.toLowerCase().includes(q)) ||
      (item.worker_summary?.immediate_action &&
        item.worker_summary.immediate_action.toLowerCase().includes(q))
    );
  });
}
