'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { QuestionForm } from '@/components/QuestionForm';
import { QuestionIndex } from '@/components/QuestionIndex';
import { InterviewWorkspace } from '@/components/InterviewWorkspace';
import { KnowledgeCards } from '@/components/KnowledgeCards';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { WorkerSummaryView } from '@/components/WorkerSummaryView';
import { ManualModal, ManualPersona } from '@/components/ManualModal';
import { EditKnowledgeModal } from '@/components/EditKnowledgeModal';
import { 
  QuestionQueueItem, 
  KnowledgeRecord, 
  MainViewMode 
} from '@/types';
import {
  getLocalQuestions,
  getLocalKnowledge,
  saveLocalQuestions,
  saveLocalKnowledge,
  syncFromSupabase,
  resetAllToDefaults,
} from '@/lib/storage';
import { BookOpen, ListOrdered } from 'lucide-react';

export default function Home() {
  const [questions, setQuestions] = useState<QuestionQueueItem[]>([]);
  const [records, setRecords] = useState<KnowledgeRecord[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionQueueItem | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MainViewMode>('BIBLE');
  const [autoStartTrigger, setAutoStartTrigger] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'INDEX' | 'INTERVIEW'>('INDEX');
  
  // モーダルステート
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualPersona, setManualPersona] = useState<ManualPersona>('ENGINEER');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKnowledgeRecord, setEditingKnowledgeRecord] = useState<KnowledgeRecord | null>(null);
  const [editingQuestionItem, setEditingQuestionItem] = useState<QuestionQueueItem | null>(null);

  // 初回ロード ＆ Supabase同期
  useEffect(() => {
    async function loadData() {
      const initialQ = getLocalQuestions();
      const initialK = getLocalKnowledge();
      setQuestions(initialQ);
      setRecords(initialK);

      const target = initialQ.find((q) => q.has_voice_answer) || initialQ[0] || null;
      setSelectedQuestion(target);

      const synced = await syncFromSupabase();
      if (synced.questions.length > 0) {
        setQuestions(synced.questions);
      }
      if (synced.knowledge.length > 0) {
        setRecords(synced.knowledge);
      }
    }
    loadData();
  }, []);

  // マニュアルを開くハンドラー
  const handleOpenManual = (persona: ManualPersona = 'ENGINEER') => {
    setManualPersona(persona);
    setIsManualOpen(true);
  };

  // 編集モーダルを開くハンドラー
  const handleOpenEditModal = (questionId: string) => {
    const kRecord = records.find((k) => k.question_id === questionId);
    const qItem = questions.find((q) => q.id === questionId);
    if (kRecord) {
      setEditingKnowledgeRecord(kRecord);
      setEditingQuestionItem(qItem || null);
      setIsEditModalOpen(true);
    }
  };

  // 編集保存ハンドラー
  const handleSaveEditedKnowledge = (
    updatedRecord: KnowledgeRecord,
    updatedQuestion?: QuestionQueueItem
  ) => {
    const updatedRecords = records.map((r) =>
      r.id === updatedRecord.id ? updatedRecord : r
    );
    setRecords(updatedRecords);
    saveLocalKnowledge(updatedRecords);

    if (updatedQuestion) {
      const updatedQuestions = questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      );
      setQuestions(updatedQuestions);
      saveLocalQuestions(updatedQuestions);

      if (selectedQuestion?.id === updatedQuestion.id) {
        setSelectedQuestion(updatedQuestion);
      }
    }
  };

  // ナレッジ削除ハンドラー
  const handleDeleteKnowledge = (questionId: string) => {
    const updatedRecords = records.filter((r) => r.question_id !== questionId);
    setRecords(updatedRecords);
    saveLocalKnowledge(updatedRecords);

    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);
    saveLocalQuestions(updatedQuestions);

    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(updatedQuestions[0] || null);
    }
  };

  // 音声回答リセット（未回答状態に戻す）ハンドラー
  const handleResetVoiceAnswer = (questionId: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, has_voice_answer: false };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    saveLocalQuestions(updatedQuestions);

    const updatedRecords = records.map((r) => {
      if (r.question_id === questionId) {
        return {
          ...r,
          has_voice_answer: false,
          audio_url: '',
          full_transcript: '（※ベテラン職長の音声回答をお待ちしています）',
        };
      }
      return r;
    });
    setRecords(updatedRecords);
    saveLocalKnowledge(updatedRecords);
  };

  // 新規質問追加ハンドラー
  const handleQuestionAdded = (newQuestion: QuestionQueueItem, newKnowledge?: KnowledgeRecord) => {
    const updatedQ = [newQuestion, ...questions];
    setQuestions(updatedQ);
    saveLocalQuestions(updatedQ);

    if (newKnowledge) {
      const updatedK = [newKnowledge, ...records];
      setRecords(updatedK);
      saveLocalKnowledge(updatedK);
    }

    setSelectedQuestion(newQuestion);
    setAutoStartTrigger(false);
    setActiveTabMobile('INTERVIEW');
    setActiveView('BIBLE');
  };

  // 質問選択ハンドラー
  const handleSelectQuestion = (q: QuestionQueueItem, autoStart: boolean = false) => {
    setSelectedQuestion(q);
    setAutoStartTrigger(autoStart);
    setActiveTabMobile('INTERVIEW');
    setActiveView('BIBLE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 補足・追記録音の開始（カードから呼び出し）
  const handleStartAppendVoice = (questionId: string) => {
    const target = questions.find((q) => q.id === questionId);
    if (target) {
      setSelectedQuestion(target);
      setAutoStartTrigger(true);
      setActiveTabMobile('INTERVIEW');
      setActiveView('BIBLE');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ナレッジ登録完了ハンドラー
  const handleKnowledgeCreated = (newRecord: KnowledgeRecord, questionId: string) => {
    const existingIndex = records.findIndex((r) => r.question_id === questionId);
    let updatedRecords: KnowledgeRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...records];
      updatedRecords[existingIndex] = newRecord;
    } else {
      updatedRecords = [newRecord, ...records];
    }
    setRecords(updatedRecords);
    saveLocalKnowledge(updatedRecords);

    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          has_voice_answer: true,
          worker_summary: newRecord.worker_summary || q.worker_summary,
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    saveLocalQuestions(updatedQuestions);

    const nextUnanswered = updatedQuestions.find(
      (q) => !q.has_voice_answer && q.id !== questionId
    );
    if (nextUnanswered) {
      setSelectedQuestion(nextUnanswered);
      setAutoStartTrigger(false);
    }
  };

  // 初期データへリセット
  const handleResetData = () => {
    if (confirm('すべての登録データを初期プリセットへリセットしますか？')) {
      const def = resetAllToDefaults();
      setQuestions(def.questions);
      setRecords(def.knowledge);
      setSelectedQuestion(def.questions[0] || null);
      alert('初期プリセットへリセットしました。');
    }
  };

  const answeredCount = questions.filter((q) => q.has_voice_answer).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* システムヘッダー */}
      <Header
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenManual={handleOpenManual}
        onResetData={handleResetData}
      />

      {/* モバイル用タブ切替（バイブルモード時） */}
      {activeView === 'BIBLE' && (
        <div className="lg:hidden flex border-b border-slate-800 bg-slate-900 sticky top-[72px] z-30">
          <button
            onClick={() => setActiveTabMobile('INDEX')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTabMobile === 'INDEX'
                ? 'border-amber-400 text-amber-400 bg-slate-800/50'
                : 'border-transparent text-slate-400'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>5大工程インデックス</span>
          </button>
          <button
            onClick={() => setActiveTabMobile('INTERVIEW')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTabMobile === 'INTERVIEW'
                ? 'border-amber-400 text-amber-400 bg-slate-800/50'
                : 'border-transparent text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>職長インタビュー＆バイブル</span>
          </button>
        </div>
      )}

      {/* メインコンテンツエリア */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-3 lg:p-6">
        
        {/* 1. 📖 ナレッジバイブル（2画面スプリット） */}
        {activeView === 'BIBLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* 左ペイン：現場メモ投稿 ＆ 5大工程インデックス（幅 4/12） */}
            <section
              className={`lg:col-span-4 flex flex-col h-auto lg:h-[calc(100vh-100px)] lg:sticky lg:top-[90px] space-y-3 min-h-0 ${
                activeTabMobile === 'INTERVIEW' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* 現場質問メモ投稿フォーム（上部・開閉式） */}
              <div className="shrink-0">
                <QuestionForm 
                  onQuestionAdded={handleQuestionAdded}
                  questions={questions}
                  knowledgeList={records}
                  onSelectQuestion={handleSelectQuestion}
                  onOpenManual={() => handleOpenManual('ENGINEER')}
                />
              </div>

              {/* 5大工程インデックス（独立スクロールエリア） */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <QuestionIndex
                  questions={questions}
                  selectedQuestion={selectedQuestion}
                  onSelectQuestion={handleSelectQuestion}
                  activeSection={activeSection}
                />
              </div>
            </section>

            {/* 右ペイン：職長インタビュー ＆ ナレッジカード一覧（幅 8/12） */}
            <section
              className={`lg:col-span-8 space-y-6 ${
                activeTabMobile === 'INDEX' ? 'hidden lg:block' : 'block'
              }`}
            >
              <InterviewWorkspace
                selectedQuestion={selectedQuestion}
                autoStartTrigger={autoStartTrigger}
                onKnowledgeCreated={handleKnowledgeCreated}
              />

              <KnowledgeCards
                records={records}
                activeSection={activeSection}
                onOpenEditModal={handleOpenEditModal}
                onStartAppendVoice={handleStartAppendVoice}
              />
            </section>

          </div>
        )}

        {/* 2. 👷‍♂️ 現場作業員クイック要約ビュー */}
        {activeView === 'WORKER_SUMMARY' && (
          <WorkerSummaryView
            questions={questions}
            knowledgeList={records}
            onSelectQuestionForDetails={handleSelectQuestion}
            onOpenManual={() => handleOpenManual('QC')}
          />
        )}

        {/* 3. 📊 品質分析ダッシュボードビュー */}
        {activeView === 'ANALYTICS' && (
          <AnalyticsDashboard
            isOpen={true}
            onClose={() => setActiveView('BIBLE')}
            questions={questions}
            records={records}
          />
        )}

      </main>

      {/* 編集・詳細モーダル */}
      <EditKnowledgeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        knowledgeRecord={editingKnowledgeRecord}
        questionItem={editingQuestionItem}
        onSave={handleSaveEditedKnowledge}
        onDelete={handleDeleteKnowledge}
        onResetVoiceAnswer={handleResetVoiceAnswer}
      />

      {/* 運用マニュアルモーダル */}
      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        defaultPersona={manualPersona}
      />

      {/* フッター */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>ミナミ工業 建築鉄骨製作・溶接品質「技術伝承AIバイブル」 | JASS 6 鉄骨精度検査基準準拠</p>
      </footer>
    </div>
  );
}
