'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KnowledgeRecord, QuestionQueueItem, SECTIONS, SectionId } from '@/types';
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Wrench,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';

interface EditKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeRecord: KnowledgeRecord | null;
  questionItem?: QuestionQueueItem | null;
  onSave: (updatedRecord: KnowledgeRecord, updatedQuestion?: QuestionQueueItem) => void;
  onDelete?: (questionId: string) => void;
  onResetVoiceAnswer?: (questionId: string) => void;
}

export const EditKnowledgeModal: React.FC<EditKnowledgeModalProps> = ({
  isOpen,
  onClose,
  knowledgeRecord,
  questionItem,
  onSave,
  onDelete,
  onResetVoiceAnswer,
}) => {
  const [mounted, setMounted] = useState(false);

  const [questionTitle, setQuestionTitle] = useState('');
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [phenomenon, setPhenomenon] = useState('');
  const [cause, setCause] = useState('');
  const [actionAndCriteria, setActionAndCriteria] = useState('');
  const [jassStandard, setJassStandard] = useState('');
  const [prevention, setPrevention] = useState('');
  const [verdictOkNg, setVerdictOkNg] = useState<string>('判定要注意（JASS 6測定要）');
  const [immediateAction, setImmediateAction] = useState('');
  const [forbiddenAction, setForbiddenAction] = useState('');
  const [causeCategory, setCauseCategory] = useState('溶接施工条件・電気パラメータ');
  const [actionCategory, setActionCategory] = useState('溶接機電流電圧調整');
  const [hasVoiceAnswer, setHasVoiceAnswer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (knowledgeRecord) {
      setQuestionTitle(knowledgeRecord.question_title);
      setOriginalQuestion(knowledgeRecord.original_question || '');
      setFullTranscript(knowledgeRecord.full_transcript || '');
      setPhenomenon(knowledgeRecord.phenomenon || '');
      setCause(knowledgeRecord.cause || '');
      setActionAndCriteria(knowledgeRecord.action_and_criteria || '');
      setJassStandard(knowledgeRecord.jass_standard || '');
      setPrevention(knowledgeRecord.prevention || '');
      setVerdictOkNg(knowledgeRecord.worker_summary?.verdict_ok_ng || '判定要注意（JASS 6測定要）');
      setImmediateAction(knowledgeRecord.worker_summary?.immediate_action || '');
      setForbiddenAction(knowledgeRecord.worker_summary?.forbidden_action || '');
      setCauseCategory(knowledgeRecord.cause_category || '溶接施工条件・電気パラメータ');
      setActionCategory(knowledgeRecord.action_category || '溶接機電流電圧調整');
      setHasVoiceAnswer(knowledgeRecord.has_voice_answer);
      setShowDeleteConfirm(false);
    }
  }, [knowledgeRecord]);

  if (!isOpen || !knowledgeRecord || !mounted) return null;

  const handleSave = () => {
    const updatedRecord: KnowledgeRecord = {
      ...knowledgeRecord,
      question_title: questionTitle,
      original_question: originalQuestion,
      full_transcript: fullTranscript,
      phenomenon,
      cause,
      action_and_criteria: actionAndCriteria,
      jass_standard: jassStandard,
      prevention,
      has_voice_answer: hasVoiceAnswer,
      cause_category: causeCategory,
      action_category: actionCategory,
      worker_summary: {
        summary_phenomenon: `${questionTitle.slice(0, 24)}の現場確認`,
        verdict_ok_ng: verdictOkNg as any,
        immediate_action: immediateAction,
        forbidden_action: forbiddenAction,
      },
    };

    let updatedQuestion: QuestionQueueItem | undefined;
    if (questionItem) {
      updatedQuestion = {
        ...questionItem,
        title: questionTitle,
        has_voice_answer: hasVoiceAnswer,
        cause_category: causeCategory,
        action_category: actionCategory,
        worker_summary: updatedRecord.worker_summary,
      };
    }

    onSave(updatedRecord, updatedQuestion);
    onClose();
  };

  const sec = SECTIONS[knowledgeRecord.section] || SECTIONS['SEC-3'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col industrial-grid-bg relative z-[10000]">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${sec.badgeBg} ${sec.badgeText}`}>
                  {knowledgeRecord.section} - {sec.name}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {knowledgeRecord.id}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                ナレッジ ＆ 現場処置の編集
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム本文 */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* 基本情報 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. 質問・課題タイトル
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                トラブル見出し
              </label>
              <input
                type="text"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* 職長ノウハウ */}
          <div className="space-y-4 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>2. 職長構造化ナレッジ（JASS 6準拠）</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>発生現象・トラブル</span>
                </label>
                <textarea
                  value={phenomenon}
                  onChange={(e) => setPhenomenon(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>根本原因</span>
                </label>
                <textarea
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>処置・手直し方法・合否ライン</span>
                </label>
                <textarea
                  value={actionAndCriteria}
                  onChange={(e) => setActionAndCriteria(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>JASS 6 精度基準</span>
                </label>
                <textarea
                  value={jassStandard}
                  onChange={(e) => setJassStandard(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>再発防止策</span>
              </label>
              <textarea
                value={prevention}
                onChange={(e) => setPrevention(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>職長の文字起こし全文（テキスト回答）</span>
              </label>
              <textarea
                value={fullTranscript}
                onChange={(e) => setFullTranscript(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* 現場作業員クイック要約 */}
          <div className="space-y-4 p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/30">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              <span>3. 現場作業員クイック要約設定</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  合否判定ステータス
                </label>
                <select
                  value={verdictOkNg}
                  onChange={(e) => setVerdictOkNg(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                >
                  <option value="OK（合格/許容）">OK（合格/許容）</option>
                  <option value="NG（手直し必須）">NG（手直し必須）</option>
                  <option value="判定要注意（JASS 6測定要）">判定要注意（JASS 6測定要）</option>
                  <option value="危険（作業即停止）">危険（作業即停止）</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  今すぐやる処置（現場アクション）
                </label>
                <input
                  type="text"
                  value={immediateAction}
                  onChange={(e) => setImmediateAction(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-red-300 mb-1">
                ⚠️ 絶対やってはいけないNG行動（禁忌）
              </label>
              <input
                type="text"
                value={forbiddenAction}
                onChange={(e) => setForbiddenAction(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-red-500/30 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          {/* 危険な操作（削除・音声リセット） */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              4. ステータス管理・データ操作
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {onResetVoiceAnswer && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('職長の音声回答をリセットし、未回答状態に戻しますか？')) {
                      onResetVoiceAnswer(knowledgeRecord.question_id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>音声回答をリセット</span>
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('このナレッジと質問を完全に削除しますか？')) {
                      onDelete(knowledgeRecord.question_id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ナレッジを削除</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>保存する</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
