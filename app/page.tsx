"use client";

import { useState } from 'react';

// 型定義
type AxisComment = {
  evaluationComment: string;
  improvementComment: string;
};
type AnalysisResult = {
  overallScore: number;
  summary: string;
  axes: { mvi: number; csi: number; res: number; arc: number; };
  axesComments?: { mvi: AxisComment; csi: AxisComment; res: AxisComment; arc: AxisComment; };
  councilComments: { name: string; comment: string; }[];
  homeSenninComment?: string;
};

// 11人格のデータ
const councilMembers = [
    { icon: "👑", name: "オリジン君", title: "本質の探求者" },
    { icon: "💡", name: "インサイト君", title: "直感の先駆者" },
    { icon: "⚪️", name: "ストラテジスト君", title: "論理の設計者" },
    { icon: "💎", name: "サポーター君", title: "チームの支援者" },
    { icon: "⚫️", name: "リスクチェッカー君", title: "厳格な監査役" },
    { icon: "🟢", name: "バランサー君", title: "最適化の調停者" },
    { icon: "🟠", name: "パフォーマー君", title: "情熱の伝道師" },
    { icon: "🟡", name: "アナリスト君", title: "データの分析官" },
    { icon: "🌙", name: "インタープリター君", title: "意図の翻訳家" },
    { icon: "🪨", name: "リアリスト君", title: "現実の実行官" },
    { icon: "🌀", name: "クエスチョナー君", title: "常識への挑戦者" }
];

// 四大評価軸のデータ
const axesData = [
    { key: 'mvi', name: 'MVI (多角的視点知性)', icon: '🧠', description: '多角的な視点から本質を捉え、発展を促す力' },
    { key: 'csi', name: 'CSI (コンセプト統合度)', icon: '🧬', description: '理念から具体策までが一貫し、統合されているか' },
    { key: 'res', name: 'RES (訴求力・共鳴力)', icon: '🌟', description: '言葉やアウトプットが、他者や市場と響き合う力' },
    { key: 'arc', name: 'ARC (論理構成度)', icon: '❄️', description: '表現の明快さ、論理的一貫性、構造の完成度' }
];

const StarRating = ({ score }: { score: number }) => {
  const fullStars = Math.floor(score / 20);
  const emptyStars = 5 - fullStars;
  return (<div className="flex items-center text-yellow-400">{[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>★</span>)}{[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-600">★</span>)}</div>);
};

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null); 
  const [error, setError] = useState('');
  
  // ★★★ 文字数制限とカウンターのための設定 ★★★
  const MAX_CHARS = 7000;
  const charCount = inputText.length;
  const charColor = charCount > MAX_CHARS ? 'text-red-500' : charCount > MAX_CHARS * 0.9 ? 'text-yellow-500' : 'text-gray-400';

  const handleAnalysis = async () => {
    if (!inputText.trim()) { setError('テキストを入力してください。'); return; }
    if (charCount > MAX_CHARS) { setError(`文字数上限（${MAX_CHARS}文字）を超えています。`); return; }
    setIsLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText }) });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || '分析中にサーバーエラーが発生しました。'); }
      // JSON形式が保証されているので、直接 .json() を使用
      const data: AnalysisResult = await response.json();
      setResult(data);
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { setError(err instanceof Error ? err.message : '不明なエラーが発生しました。'); } 
    finally { setIsLoading(false); }
  };
  
  const handleReset = () => {
    setResult(null);
    setInputText('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="relative container mx-auto px-4 py-10 z-10">
        
        <header className="w-full text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold text-white tracking-wider">MPA評価システム</h1>
          <p className="text-teal-300 text-xl mt-3 tracking-widest">あなたの内面レベル、四軸評価と11人格で可視化</p>
        </header>

        {!result ? (
        <>
            <main id="analysis-form" className="w-full max-w-4xl mx-auto flex-grow flex flex-col items-center justify-center bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-2xl animate-fade-in-slow">
                <div className="w-full text-center">
                  <h2 className="text-3xl font-bold mb-4 text-white">さあ、あなたの思考を解き放とう</h2>
                  <textarea
                    className="w-full h-60 p-4 bg-gray-900/80 rounded-lg border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none transition text-white placeholder-gray-500"
                    placeholder="ここに分析したい文章、企画、アイデアを入力してください..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isLoading}
                    maxLength={MAX_CHARS + 500} // 多少の超過は許容
                  />
                  {/* ★★★ 文字数カウンターと案内の表示 ★★★ */}
                  <div className="flex justify-between items-center mt-2 px-2 text-sm">
                    <p className="text-gray-500">約7,000文字（10,000トークン）まで対応</p>
                    <p className={charColor}>{charCount} / {MAX_CHARS}</p>
                  </div>
                  
                  {error && <p className="text-red-400 mt-4 animate-fade-in">{error}</p>}
                  <button onClick={handleAnalysis} disabled={isLoading} className="mt-6 px-12 py-4 bg-teal-500 text-white rounded-full text-lg font-bold hover:bg-teal-400 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(45,212,191,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                    {isLoading ? '分析中...' : '11人格による評価を開始する'}
                  </button>
                  {isLoading && (<div className="mt-4 flex justify-center items-center space-x-2"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div><p className="text-gray-400">11人格があなたの内面を分析中です...</p></div>)}
                </div>
            </main>

            <section className="my-24 animate-fade-in-slow">
                <h2 className="text-4xl font-bold text-center mb-12 text-white">MPA評価システムとは？</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {axesData.map(axis => (<div key={axis.name} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-xl text-center"><span className="text-5xl">{axis.icon}</span><h3 className="text-xl font-bold mt-4 text-white">{axis.name}</h3><p className="text-sm text-gray-400 mt-2">{axis.description}</p></div>))}
                </div>
            </section>

            <section className="my-24 animate-fade-in-slow">
                <h2 className="text-4xl font-bold text-center mb-12 text-white">あなたの中に眠る、11の人格</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {councilMembers.map(member => (<div key={member.name} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-5 rounded-xl text-center hover:bg-gray-700/70 transition duration-300"><span className="text-4xl">{member.icon}</span><h3 className="text-lg font-bold mt-2 text-white">{member.name}</h3><p className="text-sm text-teal-300 font-semibold">{member.title}</p></div>))}
                </div>
            </section>
        </>
        ) : (
          <main id="result-section" className="w-full max-w-6xl mx-auto mt-16 animate-fade-in-slow">
             {/* ... (結果表示部分は変更なし) ... */}
          </main>
        )}

        <footer className="w-full pt-10 mt-16 text-center text-gray-500 border-t border-gray-700">
          <p>&copy; 2025 MPA Evaluation System Prototype</p>
        </footer>
      </div>
    </div>
  );
}
