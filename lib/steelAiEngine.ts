import { SectionId, AiStandardAnswer, WorkerSummary, QuestionQueueItem, KnowledgeRecord } from '../types';

export interface RefinedSteelResult {
  title: string;
  refinedQuestion: string;
  detectedSection: SectionId;
  aiStandardAnswer: AiStandardAnswer;
  keyCheckPoints: string[];
  suggestedCriteria: string;
  workerSummary: WorkerSummary;
  causeCategory: string;
  actionCategory: string;
}

interface TopicRule {
  keywords: string[];
  section: SectionId;
  causeCategory: string;
  actionCategory: string;
  verdict: WorkerSummary['verdict_ok_ng'];
  getTitle: (text: string) => string;
  getRefinedQuestion: (text: string) => string;
  theory: string;
  standardCriteria: string;
  checkPoints: string[];
  immediateAction: string;
  forbiddenAction: string;
}

const STEEL_TOPIC_RULES: TopicRule[] = [
  // 1. 開先加工・ノロ・スラグ・切断精度
  {
    keywords: ['開先', 'ノロ', '切断', '開先角度', 'ルート間隔', 'プラズマ', 'ガス切断', 'ベベル'],
    section: 'SEC-1',
    causeCategory: '切断・開先不良',
    actionCategory: 'グラインダー・再切断',
    verdict: 'NG（手直し必須）',
    getTitle: (text) => '【品管確認】開先加工精度・裏面ノロ残存による溶接欠陥防止と修正基準',
    getRefinedQuestion: (text) =>
      `職長、現場にて「${text}」の事象が起きています。開先角度・ルート間隔の公差外れや切断時の酸化ノロ残存は完全溶込み溶接のブローホールや溶込み不良の原因となります。JASS 6基準に照らした許容差と、グラインダーケレンによる是正手順をご教示ください。`,
    theory:
      'ガス・プラズマ切断端面に固着した酸化鉄ノロ（酸化スラッジ）や不適切な開先角度は、アーク溶接時の溶融池にガスや不純物を巻き込み、融合不良や内部欠陥を誘発します。',
    standardCriteria:
      'JASS 6・鉄骨精度検査基準：開先角度公差 ±5°以内、ルート間隔公差 ±1.5mm以内。開先面のノロ・サビ・油分は溶接前に完全除去が必須。',
    checkPoints: [
      '開先ゲージによる角度（35°〜45°）およびルートギャップ測定',
      '開先裏面および止端部の酸化ノロ・スラグのグラインダー除去状態',
      '母材端面のラミネーション（層状剥離）の有無',
    ],
    immediateAction:
      '① ディスクグラインダー（#36〜#60）で開先面および裏面のノロを金属光沢が出るまで研磨\n② 開先ゲージで角度とルート間隔を実測し、JASS 6許容値内に収まっているか確認',
    forbiddenAction:
      'ノロが付着したまま「溶接の熱で溶ける」と判断してそのまま仮止め・本溶接を行うこと',
  },

  // 2. 柱大梁仕口・組立て倒れ・クリアランス・仮止め
  {
    keywords: ['仕口', '倒れ', 'ダイヤフラム', 'クリアランス', '仮止め', '組立', '組立て', '建て倒れ', '直角度'],
    section: 'SEC-2',
    causeCategory: '組立・拘束不足',
    actionCategory: '治具修正・仮止め補強',
    verdict: 'NG（手直し必須）',
    getTitle: (text) => '【品管確認】柱大梁仕口の直角度・倒れ公差超過と治具矯正基準',
    getRefinedQuestion: (text) =>
      `職長、現場にて「${text}」が発生しています。柱大梁接合部（仕口部）のブラケット倒れやダイヤフラムの傾きがJASS 6管理許容差を超過する恐れがあります。治具拘束の修正方法と本溶接前の仮止め補強基準について教えてください。`,
    theory:
      '仮止め溶接時の局部的な熱収縮および部材の自重・治具クランプ圧のアンバランスにより、仕口ブラケット先端でテコの原理が働き、微小な角度ズレが先端で数ミリの倒れとなって現れます。',
    standardCriteria:
      'JASS 6 鉄骨工事精度検査基準：柱・梁仕口の直角度（倒れ）管理許容差 e ≦ 2.0mm（限界許容差 3.0mm）。本溶接前の仮止め段階で1.0mm以内に追い込むこと。',
    checkPoints: [
      'スコヤ（直角定規）およびレーザー測定器による仕口直角度の実測',
      '仮止め溶接の脚長（4mm以上）およびピッチ（100〜150mm間隔）の健全性',
      'ダイヤフラムとスキンプレートの目違い・ギャップ量',
    ],
    immediateAction:
      '① スコヤで倒れ方向と寸法差を実測記録\n② 仮止めビードを削り落とし、レバーブロックや油圧ジャッキで正規位置に拘束し直して再仮止め',
    forbiddenAction:
      '倒れが出たまま「本溶接の裏面溶接で引っ張って戻す」と勘に頼った溶接を行うこと（余計に変形が増大します）',
  },

  // 3. 溶接欠陥・アンダーカット・クラック・ピット・入熱過大
  {
    keywords: ['溶接', 'アンダーカット', 'オーバーラップ', 'クラック', 'ピット', 'ブローホール', 'mag', '入熱', '脚長不足'],
    section: 'SEC-3',
    causeCategory: '入熱過大・溶接欠陥',
    actionCategory: 'グラインダー・再溶接',
    verdict: 'NG（手直し必須）',
    getTitle: (text) => '【品管確認】溶接ビードのアンダーカット・欠陥補修と入熱管理基準',
    getRefinedQuestion: (text) =>
      `職長、現場にて「${text}」の不具合が見られます。MAG溶接部止端部に深さ0.5mmを超えるアンダーカットやピットが発生しています。JASS 6判定基準と、グラインダー滑らか仕上げまたは補修肉盛り手順についてご教示ください。`,
    theory:
      '溶接電流・電圧の過大、アーク電圧のアンバランス、またはトーチ角度の不適正（前進角過大）により、母材溶融部が溶加材で十分に充填されずに窪みとして残る現象です。応力集中源となり疲労強度が著しく低下します。',
    standardCriteria:
      'JASS 6 鉄骨精度検査基準：アンダーカット深さ 0.5mm以下（かつ連続しないこと）。0.5mmを超えるものは補修対象（肉盛り溶接またはグラインダーによる緩やか仕上げ・1/4勾配）。',
    checkPoints: [
      '溶接ゲージによるアンダーカット深さの実測（0.5mm超過の有無）',
      '溶接条件（電流・電圧・ワイヤ送給速度・シールドガス流量20〜25L/min）の確認',
      'パス間温度（350℃以下）および予熱管理',
    ],
    immediateAction:
      '① 軽微な窪みはディスクグラインダーで止端部を1/4以下の緩やかな勾配で滑らかに仕上げ\n② 0.5mm以上の深欠陥は母材予熱を行った上で細径ワイヤによる補修肉盛りを行い余盛を均す',
    forbiddenAction:
      '未補修のアンダーカットの上にそのまま塗装を施して外観を隠蔽すること',
  },

  // 4. 線状加熱・油圧矯正・曲がり変形
  {
    keywords: ['線状加熱', '加熱', '水冷', '油圧', '矯正', '反り', '曲がり', '歪み', '変形'],
    section: 'SEC-3',
    causeCategory: '入熱過大・溶接欠陥',
    actionCategory: '線状加熱・油圧矯正',
    verdict: '判定要注意（JASS 6測定要）',
    getTitle: (text) => '【品管確認】溶接熱変形に対する線状加熱・油圧プレス矯正の温度管理基準',
    getRefinedQuestion: (text) =>
      `職長、現場にて「${text}」が発生しています。大梁フランジやプレートの溶接収縮変形を線状加熱で矯正する際の最高加熱温度（850℃以下）、水冷タイミング、母材材質（SN490等）に応じた注意点について教えてください。`,
    theory:
      '鋼材の特定箇所をバーナーで帯状に急速加熱すると、周囲の拘束により高温部が熱膨張できず塑性圧縮を受けます。その後の冷却過程で収縮力が発生し、部材の反りや曲がりを逆方向に引き戻します。',
    standardCriteria:
      'JASS 6 鉄骨工事精度検査基準・建築学会指針：\n・SN400/SN490材の線状加熱温度：850℃以下（赤熱色：チェリーレッド）\n・水冷開始温度：650℃以下（空冷後、暗赤色になってから水冷）\n・TMCP鋼・高張力鋼は原則空冷',
    checkPoints: [
      '放射温度計またはテンプスティックによる加熱表面温度の実測（850℃厳守）',
      '水冷開始時の表面温度（650℃以下まで空冷を待っているか）',
      '矯正後のJASS 6真直度公差（L/1000以下）の達成確認',
    ],
    immediateAction:
      '① テンプスティック（800℃/850℃）を母材に塗布し、トーチ送り速度を一定に保ちながら加熱\n② 650℃以下に自然空冷されるのを確認してから散水冷却を実施し、定盤上で真直度を測定',
    forbiddenAction:
      '850℃を超える白熱状態（900℃以上）まで強熱すること、または赤熱直後に急冷散水すること（鋼材組織が脆化し焼き割れを起こします）',
  },

  // 5. UT超音波探傷・エコー・内部欠陥・検査
  {
    keywords: ['ut', '探傷', '超音波', 'エコー', '内部欠陥', '溶込み不良', 'スラグ巻き込み', 'jass 6', '合否'],
    section: 'SEC-4',
    causeCategory: '寸法公差・UTエコー',
    actionCategory: 'JASS6再測定',
    verdict: '判定要注意（JASS 6測定要）',
    getTitle: (text) => '【品管確認】完全溶込み溶接部のUT超音波探傷エコー判定と手直し基準',
    getRefinedQuestion: (text) =>
      `職長、現場にて「${text}」についてUT探傷検査の判定相談です。完全溶込み溶接部で検出された欠陥エコー高さ（M線・H線）と指示長さに基づくJIS Z 3060・JASS 6合否判定、およびガウジングハツリ再溶接の手順を教えてください。`,
    theory:
      '超音波パルスが鋼材内部を伝播し、溶接内部の不連続部（ブローホール、スラグ巻き込み、融合不良）に当たって反射するエコー信号の振幅とビーム路程から欠陥の位置・深さ・大きさを特定します。',
    standardCriteria:
      'JIS Z 3060・JASS 6判定基準：\n・エコー高さ領域：L線以下（合格）、M線〜H線（指示長さに応じて判定）、H線超（不合格）\n・4類判定：完全溶込み継手における有害な平面状欠陥・割れエコーは一発不合格。',
    checkPoints: [
      '探触子屈折角（70°/65°/45°）および接触媒質（グリセリン・油）の塗布状態',
      '欠陥深さ（母材厚みのどの位置か：第1パス裏当て金付近か最終パス層間か）',
      '欠陥指示長さ（連続性）の測定と探傷記録シートの作成',
    ],
    immediateAction:
      '① UT探傷器で欠陥の正確な深さと長さをマーキング\n② カーボンアークガウジングで欠陥部を完全に削り出し、浸透探傷（PT）で欠陥消失を確認後に再溶接',
    forbiddenAction:
      '欠陥深さを確認せずに適当に表面だけグラインダーで削って上から薄くフタ溶接すること',
  },

  // 6. 塗装膜厚・2種ケレン・一次下塗り・未乾燥・サビ
  {
    keywords: ['塗装', '塗膜', '膜厚', 'サビ止め', '錆止め', 'ケレン', '2種ケレン', '3種ケレン', '未乾燥', 'タレ'],
    section: 'SEC-5',
    causeCategory: '塗装膜厚・養生不良',
    actionCategory: 'ケレン・再塗装',
    verdict: 'NG（手直し必須）',
    getTitle: (text) => '【品管確認】鉄骨一次下塗り（サビ止め）の塗膜厚不足と素地調整（ケレン）基準',
    getRefinedQuestion: (text) =>
      `職長、現場にて「${text}」の事象が見られます。変性エポキシ樹脂塗料やサビ止めペイントの乾燥塗膜厚不足、または素地調整（2種ケレン・赤サビ除去）不良による密着不良への対応手順についてご教示ください。`,
    theory:
      '防錆塗料の防食性能は素地清浄度（ISO Sa2.5 / 2種ケレン相当）と均一な乾燥塗膜厚によって決まります。ミルスケール残存や膜厚不足（ピンホール残存）があると早期に点赤サビが発生します。',
    standardCriteria:
      'JASS 6 塗装基準：\n・一次下塗り（サビ止め塗料）：指定乾燥膜厚（例: 35μm以上、変性エポキシ系なら60μm以上）\n・素地調整：2種ケレン（ディスクサンダー等でミルスケール・浮きサビ完全除去）',
    checkPoints: [
      '電磁式塗膜厚計による主要部各5点測定（規定膜厚以上か）',
      '塗装面の湿潤状態・結露の有無（湿度85%以上または気温5℃以下での塗装禁止）',
      '摩擦接合面（高力ボルト接合部・F10T面）の無塗装マスキング状態',
    ],
    immediateAction:
      '① 塗膜厚不足箇所を特定し、指定塗料で増し塗り（タッチアップ）を実施\n② サビ発生部や密着不良部はディスクサンダー（2種ケレン）で素地露出後に再塗装',
    forbiddenAction:
      '高力ボルト摩擦接合面（すべり耐力面）に誤ってサビ止め塗料を塗り込むこと（すべり係数が低下し大事故になります）',
  },

  // 7. 出荷・トラック積載・リンギ・逆順積載
  {
    keywords: ['出荷', '積載', 'トラック', 'リンギ', '固縛', '荷崩れ', '逆順', '建て方順'],
    section: 'SEC-5',
    causeCategory: '塗装膜厚・養生不良',
    actionCategory: 'ケレン・再塗装',
    verdict: 'OK（合格/許容）',
    getTitle: (text) => '【品管確認】鉄骨部材のトラック積載・リンギ配置と建て方順出荷管理基準',
    getRefinedQuestion: (text) =>
      `職長、現場にて「${text}」について出荷前確認です。輸送中の部材歪み・塗装キズ防止のための角材（リンギ）適正配置、荷締め固縛ルール、および現場建て方順（逆順積み）の徹底事項を教えてください。`,
    theory:
      '長尺梁や大型柱をトラック積載する際、上下部材のリンギ位置が垂直に揃っていないと輸送中の振動荷重で曲げモーメントが作用し、部材の反り変形やガセットプレートの曲がり事故を引き起こします。',
    standardCriteria:
      '建築鉄骨出荷・輸送安全基準：\n・上下段のリンギは必ず同一垂直線上に配置（通しリンギ）\n・現場建て方順序の逆順（最初に揚重する部材を一番上に積載）\n・固縛ワイヤーと製品接触部に当てゴム・養生アングルを設置',
    checkPoints: [
      '上下段リンギの垂直位置の通り（ズレがないか）',
      '仕口ブラケット・ガセットプレートがトラック煽りや他部材と干渉していないか',
      '現場建て方図面とトラック積載伝票の部材記号照合',
    ],
    immediateAction:
      '① 通しリンギが垂直に並んでいることを確認し、ワイヤープロテクターを挟んで固縛\n② 出荷伝票に部材マークと積載段数を明記し、現場監督へ事前連絡',
    forbiddenAction:
      '上下でリンギ位置をバラバラにしたままワイヤーで強固に締め付けること（部材が恒久変形します）',
  },
];

/**
 * 鉄骨現場テキストから最適なトピックルールを抽出し、高精度なAI具体化＆仮解説データを生成
 */
export function generateRefinedSteelData(rawText: string, section?: SectionId | 'AUTO' | string): RefinedSteelResult {
  const text = (rawText || '').trim();
  const lowerText = text.toLowerCase();

  // 1. ルールベースによる最適マッチング
  let matchedRule: TopicRule | null = null;
  let maxScore = 0;

  for (const rule of STEEL_TOPIC_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      matchedRule = rule;
    }
  }

  if (!matchedRule && section && section !== 'AUTO') {
    matchedRule = STEEL_TOPIC_RULES.find((r) => r.section === section) || null;
  }

  // 2. マッチしたルールに基づく動的生成
  if (matchedRule && maxScore > 0) {
    const finalSec = (section && section !== 'AUTO' ? section : matchedRule.section) as SectionId;
    const title = matchedRule.getTitle(text);
    const refinedQuestion = matchedRule.getRefinedQuestion(text);

    return {
      title,
      refinedQuestion,
      detectedSection: finalSec,
      aiStandardAnswer: {
        theory: matchedRule.theory,
        standard_criteria: matchedRule.standardCriteria,
        points_to_check: matchedRule.checkPoints,
      },
      keyCheckPoints: matchedRule.checkPoints,
      suggestedCriteria: matchedRule.standardCriteria,
      workerSummary: {
        summary_phenomenon: `${text.slice(0, 22) || '鉄骨現場事象'}の品質確認`,
        verdict_ok_ng: matchedRule.verdict,
        immediate_action: matchedRule.immediateAction,
        forbidden_action: matchedRule.forbiddenAction,
      },
      causeCategory: matchedRule.causeCategory,
      actionCategory: matchedRule.actionCategory,
    };
  }

  // 3. セマンティック動的フォールバック
  const clean = text || '鉄骨製作現場トラブル確認';
  const shortTitle = clean.length > 25 ? clean.slice(0, 25) + '…' : clean;
  let detectedSec: SectionId = (section && section !== 'AUTO' ? section : 'SEC-3') as SectionId;

  if (section === 'AUTO' || !section) {
    if (lowerText.includes('切断') || lowerText.includes('孔') || lowerText.includes('開先') || lowerText.includes('ノロ')) detectedSec = 'SEC-1';
    else if (lowerText.includes('組') || lowerText.includes('仕口') || lowerText.includes('ダイヤフラム')) detectedSec = 'SEC-2';
    else if (lowerText.includes('溶接') || lowerText.includes('mag') || lowerText.includes('歪') || lowerText.includes('入熱')) detectedSec = 'SEC-3';
    else if (lowerText.includes('ut') || lowerText.includes('探傷') || lowerText.includes('検査') || lowerText.includes('寸法')) detectedSec = 'SEC-4';
    else if (lowerText.includes('塗装') || lowerText.includes('出荷') || lowerText.includes('リンギ') || lowerText.includes('サビ')) detectedSec = 'SEC-5';
  }

  return {
    title: `【品管確認】${shortTitle}の要因分析とJASS 6判定`,
    refinedQuestion: `職長、現場にて「${clean}」が確認されました。JASS 6建築鉄骨精度検査基準に照らした許容限界と、原因見極めの勘所、および具体的な現場手直し・是正手順について教えていただけますか？`,
    detectedSection: detectedSec,
    aiStandardAnswer: {
      theory: `【標準理論】「${clean}」に関して、鋼材の熱影響、残留応力、幾何公差または治具拘束のアンバランスによる部材変形・組織変化の要因を検証する必要があります。`,
      standard_criteria: 'JASS 6 鉄骨工事精度検査基準（限界許容差・管理許容差）に準拠。',
      points_to_check: [
        '定盤上での寸法・角度・反りの実測確認',
        '溶接・加工条件（電流・電圧・ノズル状態・環境温度）の再点検',
        '母材表面状態および治具セット状態の確認',
      ],
    },
    keyCheckPoints: ['定盤上寸法測定', '溶接条件確認', '母材開先状態'],
    suggestedCriteria: 'JASS 6 鉄骨工事精度検査基準',
    workerSummary: {
      summary_phenomenon: `${shortTitle}の現場確認`,
      verdict_ok_ng: clean.includes('クラック') || clean.includes('破断') ? '危険（作業即停止）' : '判定要注意（JASS 6測定要）',
      immediate_action: '① 定盤または校正済み測定器で公差実測\n② 許容差超過時は職長指示で線状加熱またはグラインダー修正\n③ 次工程への自己判断送り出し禁止',
      forbidden_action: '基準値を確認せずに無理やり次工程へ回すこと',
    },
    causeCategory: '入熱過大・溶接欠陥',
    actionCategory: '線状加熱・油圧矯正',
  };
}
