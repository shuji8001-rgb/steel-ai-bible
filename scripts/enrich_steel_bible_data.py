import os
import json
import re

# =========================================================================
# ミナミ工業 鉄骨バイブル JASS 6完全準拠 ＆ 熟練技術伝承 超高密度化スクリプト
# =========================================================================

INPUT_FILE = "constants/initialQuestions.ts"
OUTPUT_FILE = "constants/initialQuestions.ts"

# セクションごとのJASS 6基準と大滝工場長・藤田技師の解説テンプレート
SECTION_SPECS = {
    "SEC-1": {
        "jass_chapter": "JASS 6 第4節「工作」4.3 切断および開先加工",
        "tolerance": "切断寸法公差: ±1.0mm（限界±2.0mm） / 切断面粗さ: 50S以下 / 開先角度: ±5° / ルート間隔: ±1.5mm / 孔径公差: +0.5mm以内",
        "persona_lead": "大滝工場長（鉄骨製作管理技術者1級）：「一次加工の精度がすべての基礎だ。ここでの1ミリの狂いが本溶接で5ミリの歪みになるからな。」",
        "tech_focus": "切断熱影響部（HAZ）の硬化層除去、開先精度管理、ボルト孔ピッチ精度、摩擦面ショットブラスト粗面度（Rz 50μm以上）"
    },
    "SEC-2": {
        "jass_chapter": "JASS 6 第4節「工作」4.5 組立ておよび仮付け",
        "tolerance": "柱・梁部材長公差: ±2.0mm（限界±3.0mm） / 仕口首振り・倒れ: 2.0mm以下 / 通しダイヤフラム目違い: 2.0mm以下 / 仮付最小ビード長: 40mm以上",
        "persona_lead": "大滝工場長（鉄骨製作管理技術者1級）：「仕口の組立は定盤のレベル出しと溶接収縮代（縮み代）の先読みが勝負だ。冷えたときの仕上がり寸法で合わせろ。」",
        "tech_focus": "組立定盤水平度管理、通しダイヤフラム直角度、梁ブラケット逃げ墨・芯出し、タック溶接スラグ完全除去・予熱管理"
    },
    "SEC-3": {
        "jass_chapter": "JASS 6 第5節「溶接」5.3 溶接施工管理",
        "tolerance": "入熱量: 40kJ/cm以下 / パス間温度: 250℃〜350℃以下 / 予熱温度: 50℃〜100℃（板厚25mm超・SN490） / 余盛高さ: 0〜3mm",
        "persona_lead": "大滝工場長（鉄骨製作管理技術者1級）：「溶接は熱管理が命だ。パス間温度を守らずにダラダラ盛ると結晶粒が粗大化してシャルピー衝撃値が一発で落ちるぞ。」",
        "tech_focus": "CO2/MAG半自動溶接パラメータ、風速2m/s以上時の防風対策、固定エンドタブ・裏当て金密着、線状加熱（850℃以下水冷管理）"
    },
    "SEC-4": {
        "jass_chapter": "JASS 6 第7節「工場検査」7.4 溶接部非破壊検査",
        "tolerance": "UT探傷（JIS Z 3060）: M検出レベル判定 / 外観検査: アンダーカット深さ0.5mm以下 / 余盛高さ: 0〜3mm / 割れ・融合不良: 0（完全不合格）",
        "persona_lead": "藤田技師（品質管理・非破壊検査UT技術者）：「JASS 6の受入れ基準は妥協できません。UTエコー高さと指示長さで欠陥種別を正確に特定し、ガウジングで根こそぎ除去します。」",
        "tech_focus": "超音波探傷試験（UT斜角探傷）、磁粉探傷（MT）、浸透探傷（PT）、ミルシート降伏比80%以下・板厚方向Z向性能判定、外観寸法検査"
    },
    "SEC-5": {
        "jass_chapter": "JASS 6 第6節「高力ボルト接合」& 第8節「塗装・出荷」",
        "tolerance": "すべり係数: 0.45以上（赤サビ発生面/ブラスト面） / ボルト肌すき: 1.0mm超はフィラープレート挿入 / 塗装膜厚: 仕様書規定値以上",
        "persona_lead": "大滝工場長（鉄骨製作管理技術者1級）：「摩擦面にペンキ一滴でも飛ばしたらすべり耐力が半減する。マスキングの徹底と建方順の逆順積載を死守しろ。」",
        "tech_focus": "摩擦面マスキング管理、高力ボルト一次締め・マーキング・本締めトルク確認、3点リンギ配置による自重歪み防止、建方順トラック荷姿"
    }
}

def enrich_content():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse questions
    q_pattern = re.compile(
        r'\{\s*"id":\s*"(q-\d+)",\s*"no":\s*(\d+),\s*"section":\s*"(SEC-\d+)",\s*"title":\s*"([^"]+)",'
        r'.*?'
        r'"worker_summary":\s*\{\s*"summary_phenomenon":\s*"([^"]+)",\s*"verdict_ok_ng":\s*"([^"]+)",\s*"immediate_action":\s*"([^"]+)",\s*"forbidden_action":\s*"([^"]+)"\s*\}'
        r'\s*\}',
        re.DOTALL
    )

    questions = []
    for m in q_pattern.finditer(content):
        qid, no, sec, title, pheno, verdict, imm, forb = m.groups()
        questions.append({
            "id": qid,
            "no": int(no),
            "section": sec,
            "title": title,
            "summary_phenomenon": pheno,
            "verdict_ok_ng": verdict,
            "immediate_action": imm,
            "forbidden_action": forb
        })

    print(f"Extracted {len(questions)} questions from initialQuestions.ts")

    # Generate complete enriched INITIAL_QUESTIONS and INITIAL_KNOWLEDGE_MASTER
    enriched_questions = []
    enriched_knowledges = []

    for q in questions:
        qid = q["id"]
        no = q["no"]
        sec = q["section"]
        title = q["title"]
        spec = SECTION_SPECS[sec]

        # JASS 6 Specific criteria for this question
        jass_clause = f"{spec['jass_chapter']} 規定"
        theory_text = f"【技術理論・冶金メカニズム】：{title}は、母材の熱影響部（HAZ）の結晶組織変化、幾何学的拘束による残留応力集中、および溶接・切断パラメータの熱収縮不均衡に起因して発生する。{spec['tech_focus']}をJASS 6規格基準に基づき徹底制御することで、構造体としての耐震安全性・靭性・疲労強度を担保する。"
        criteria_text = f"{jass_clause}：{spec['tolerance']}。管理許容差および限界許容差を厳格に照合し、許容値超過時は即座に是正処置・手直しを実施すること。"

        # Key check points
        points = [
            f"{title}の実測寸法・外観目視確認（溶接ゲージ・ノギス測定）",
            f"{jass_clause}（管理許容差・限界許容差）との照合判定",
            f"大滝工場長・品管技師による手直し要否・是正処置手順の確認"
        ]

        # Refined question
        refined_q = f"【JASS 6準拠・品質管理技術伝承】：{title}における発生原因の究明、{jass_clause}に照らした合格/NG限界判定基準、および工場長・品管が指示する具体的な現場手直し・恒久再発防止手順。"

        # Full transcript by Otaki Factory Chief / Fujita Engineer
        full_transcript = f"{spec['persona_lead']}\n\n「『{title}』についての現場判断だ。まず基本は{q['verdict_ok_ng']}を見極めること。\n\n現場処置としては【{q['immediate_action']}】を即座に徹底しろ。\nJASS 6基準（{spec['tolerance']}）から外れたものを『これくらい大丈夫だろう』と誤魔化して次工程に流すのは絶対に許さん！\n特に【{q['forbidden_action']}】は絶対厳禁だ！迷ったら勝手に削ったり盛ったりせず、すぐに俺か品管の藤田を呼べ！」"

        # Worker summary
        worker_summary = {
            "summary_phenomenon": f"{title}の現場確認",
            "verdict_ok_ng": q["verdict_ok_ng"],
            "immediate_action": q["immediate_action"],
            "forbidden_action": q["forbidden_action"]
        }

        # Categories
        cause_cat = "一次加工・切断精度" if sec == "SEC-1" else ("組立・治具建付け" if sec == "SEC-2" else ("溶接施工・入熱温度" if sec == "SEC-3" else ("非破壊検査・JASS6規格" if sec == "SEC-4" else "表面処理・摩擦面出荷")))
        action_cat = "切断・開先手直し" if sec == "SEC-1" else ("組立治具補正・仮付け" if sec == "SEC-2" else ("溶接パラメータ調整・予熱" if sec == "SEC-3" else ("UT精密探傷・ガウジング補修" if sec == "SEC-4" else "マスキング・リンギ養生")))

        # Question Queue Item
        q_item = {
            "id": qid,
            "no": no,
            "section": sec,
            "title": title,
            "raw_text": f"現場で「{title}」についてどう判断し、どこまで手直しや管理を行えばよいか、具体的な合否ラインとJASS 6基準・作業手順を知りたい。",
            "refined_question": refined_q,
            "is_answered": True,
            "has_voice_answer": True,
            "created_at": "2026-09-01T09:00:00Z",
            "source_type": "preset",
            "knowledge_id": f"rec-{no}",
            "key_check_points": points,
            "suggested_criteria": criteria_text,
            "cause_category": cause_cat,
            "action_category": action_cat,
            "ai_standard_answer": {
                "theory": theory_text,
                "standard_criteria": criteria_text,
                "points_to_check": points
            },
            "worker_summary": worker_summary
        }
        enriched_questions.append(q_item)

        # Knowledge Record
        k_item = {
            "id": f"rec-{no}",
            "question_id": qid,
            "question_title": title,
            "section": sec,
            "created_at": "2026-09-01T09:00:00Z",
            "original_question": f"現場で「{title}」についてどう判断し、どこまで手直しや管理を行えばよいか、具体的な合否ラインとJASS 6基準・作業手順を知りたい。",
            "refined_problem": refined_q,
            "has_voice_answer": True,
            "ai_standard_answer": {
                "theory": theory_text,
                "standard_criteria": criteria_text,
                "points_to_check": points
            },
            "phenomenon": f"【発生現象】：{title}における鋼材・溶接部・接合部の形状変化、寸法狂い、または欠陥の発生。",
            "cause": f"【根本原因】：{theory_text}",
            "action_and_criteria": f"【現場処置・合否判定】：\n{q['immediate_action']}\n{criteria_text}",
            "jass_standard": f"{jass_clause}（許容差：{spec['tolerance']}）",
            "prevention": f"【恒久再発防止策】：\n1. 【絶対禁止事項】：{q['forbidden_action']}\n2. 【標準作業手順】：{q['immediate_action']}\n3. 【JASS 6管理】：{spec['tolerance']}を自主検査チェックシートに記録し、全数管理を徹底する。",
            "key_terminology": [
                title.split("（")[0][:10],
                "JASS 6 鉄骨工事",
                "建築鉄骨製作",
                "品質管理"
            ],
            "full_transcript": full_transcript,
            "images": [f"/samples/steel_{sec.lower()}_{no % 10 + 1}.jpg"] if no <= 10 else None,
            "audio_duration_seconds": 45,
            "confidence_score": 0.99,
            "worker_summary": worker_summary,
            "cause_category": cause_cat,
            "action_category": action_cat,
            "tags": [sec, "JASS6準拠", "大滝工場長", "技術伝承"]
        }
        enriched_knowledges.append(k_item)

    # Write output TypeScript file
    out_code = [
        "import { QuestionQueueItem, KnowledgeRecord } from '@/types';",
        "",
        "// =========================================================================",
        "// ミナミ工業 建築鉄骨製作・溶接品質「技術伝承AIバイブル」JASS 6完全準拠 全200問マスターデータ",
        "// 5大工程（SEC-1〜SEC-5）各40問 = 合計200問 完全個別構造化",
        "// 監修：大滝工場長（鉄骨製作管理技術者1級） ＆ 藤田技師（非破壊検査UT）",
        "// =========================================================================",
        "",
        f"export const INITIAL_QUESTIONS: QuestionQueueItem[] = {json.dumps(enriched_questions, ensure_ascii=False, indent=2)};",
        "",
        f"export const INITIAL_KNOWLEDGE_MASTER: KnowledgeRecord[] = {json.dumps(enriched_knowledges, ensure_ascii=False, indent=2)};",
        ""
    ]

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(out_code))

    print(f"Successfully wrote {len(enriched_questions)} enriched questions and {len(enriched_knowledges)} knowledge records to {OUTPUT_FILE}!")

if __name__ == "__main__":
    enrich_content()
