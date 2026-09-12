// 建築鉄骨製作 現場音声誤変換 ＆ 専門用語リアルタイム自動補正辞書

interface TermRule {
  pattern: RegExp;
  replacement: string;
}

export const STEEL_TERMINOLOGY_RULES: TermRule[] = [
  // 1. 非破壊検査・UT・試験
  { pattern: /いうてぃー|ユーティー|UT/g, replacement: 'UT（超音波探傷試験）' },
  { pattern: /えむてぃー|MT/g, replacement: 'MT（磁粉探傷試験）' },
  { pattern: /ぴーてぃー|PT/g, replacement: 'PT（浸透探傷試験）' },
  { pattern: /あるてぃー|RT/g, replacement: 'RT（放射線透過試験）' },
  { pattern: /えこー|エコー|波形/g, replacement: 'UTエコー波形' },

  // 2. 切断・加工・開先
  { pattern: /がすせつ|ガス雪/g, replacement: 'ガス切断' },
  { pattern: /のろ|野呂|ノロ/g, replacement: 'ノロ（切断スラグ）' },
  { pattern: /べべる|開先/g, replacement: '開先（ベベル）' },
  { pattern: /るーとふぇいす|ルートフェイス/g, replacement: 'ルートフェイス' },
  { pattern: /るーとぎゃっぷ|ルートギャップ/g, replacement: 'ルートギャップ' },
  { pattern: /えんどたぶ|円度タブ|エンドタブ/g, replacement: 'エンドタブ' },
  { pattern: /ばっくがうじんぐ|ガウジング|うらはつり/g, replacement: '裏はつり（ガウジング）' },
  { pattern: /すからっぷ|スカラップ/g, replacement: 'スカラップ' },
  { pattern: /だいやふらむ|ダイヤフラム/g, replacement: 'ダイヤフラム' },

  // 3. 溶接欠陥・ビード
  { pattern: /すぱった|スパッタ/g, replacement: 'スパッタ' },
  { pattern: /すらぐ|スラグ/g, replacement: 'スラグ巻込み' },
  { pattern: /ぶろーほーる|ブローホール/g, replacement: 'ブローホール' },
  { pattern: /ぴっと|ピット/g, replacement: 'ピット' },
  { pattern: /ゆーごうふりょう|融合不良/g, replacement: '融合不良' },
  { pattern: /ようこみふりょう|溶込み不良/g, replacement: '溶込み不良' },
  { pattern: /あんだーかっと|アンダーカット/g, replacement: 'アンダーカット' },
  { pattern: /おーばーらっぷ|オーバーラップ/g, replacement: 'オーバーラップ' },
  { pattern: /くれーたー|クレーター/g, replacement: 'クレーター割れ' },

  // 4. 組立・建方・ボルト
  { pattern: /ひずみとり|歪み取り|歪取り/g, replacement: '歪取り' },
  { pattern: /はいれんぐす|ハイテン|高力ボルト/g, replacement: '高力ボルト（ハイテン）' },
  { pattern: /とるしあ|トルシア/g, replacement: 'トルシア型高力ボルト' },
  { pattern: /せんじょうかねつ|線状加熱/g, replacement: '線状加熱' },
  { pattern: /みす|ミルシート/g, replacement: 'ミルシート' },
  { pattern: /あんかーぼると|アンカーボルト/g, replacement: 'アンカーボルト' },
  { pattern: /じす|JIS/g, replacement: 'JIS' },
];

/**
 * 入力された音声テキストや手入力テキストに鉄骨専門用語辞書をリアルタイム適用する関数
 */
export function applySteelTerminology(text: string): string {
  if (!text) return text;
  let result = text;
  for (const rule of STEEL_TERMINOLOGY_RULES) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  return result;
}
