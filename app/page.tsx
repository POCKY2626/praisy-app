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
  axes: {
    mvi: number;
    csi: number;
    res: number;
    arc: number;
  };
  axesComments?: { 
    mvi: AxisComment;
    csi: AxisComment;
    res: AxisComment;
    arc: AxisComment;
  };
  councilComments: {
    name: string;
    comment: string;
  }[];
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

// スコアから星評価を生成するヘルパーコンポーネント
const StarRating = ({ score }: { score: number }) => {
  const fullStars = Math.floor(score / 20);
  const halfStar = (score % 20) >= 10 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="flex items-center text-yellow-400">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>★</span>)}
      {halfStar === 1 && <span>☆</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-600">★</span>)}
    </div>
  );
};

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null); 
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (!inputText.trim()) { setError('テキストを入力してください。'); return; }
    setIsLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText }) });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || '分析中にサーバーエラーが発生しました。'); }
      const responseText = await response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { throw new Error("AIからの返答形式が不正です。"); }
      const data: AnalysisResult = JSON.parse(jsonMatch[0]);
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
        
        {/* ★★★ ここが修正点です ★★★ */}
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
                  />
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
                    {axesData.map(axis => (
                        <div key={axis.name} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-xl text-center">
                            <span className="text-5xl">{axis.icon}</span>
                            <h3 className="text-xl font-bold mt-4 text-white">{axis.name}</h3>
                            <p className="text-sm text-gray-400 mt-2">{axis.description}</p>
                        </div>
                    ))}
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
            <h2 className="text-4xl font-bold text-center mb-12 text-white">分析結果</h2>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-lg mb-8 text-center">
                <h3 className="text-lg font-semibold text-teal-300">評価</h3>
                <p className="text-6xl font-bold my-2 text-white">{result.overallScore} <span className="text-3xl text-gray-400">/ 100</span></p>
                <p className="text-gray-300 mt-4 max-w-3xl mx-auto">{result.summary}</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-lg mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">四大評価軸の分析</h3>
                {result.axesComments ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {axesData.map(axis => (
                            <div key={axis.key} className="bg-gray-900/50 p-6 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-lg flex items-center text-white">
                                        <span className="text-3xl mr-3">{axis.icon}</span>
                                        {axis.name}
                                    </h4>
                                    <div className="text-right">
                                        <StarRating score={result.axes[axis.key as keyof typeof result.axes]} />
                                        <p className="font-bold text-teal-300 text-lg">{result.axes[axis.key as keyof typeof result.axes]} / 100</p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-700 pt-3">
                                  <p className="text-sm text-gray-300"><strong className="text-green-400">評価:</strong> {result.axesComments[axis.key as keyof typeof result.axesComments]?.evaluationComment}</p>
                                  <p className="text-sm text-gray-300 mt-2"><strong className="text-yellow-400">向上案:</strong> {result.axesComments[axis.key as keyof typeof result.axesComments]?.improvementComment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                  <p className="text-gray-400 text-center col-span-2 mt-8">詳細な評価軸コメントは生成されませんでした。</p>
                )}
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-lg mb-8"><h3 className="text-lg font-semibold text-teal-300 mb-6">11人格からの詳細コメント</h3><div className="grid md:grid-cols-2 gap-x-8 gap-y-6">{result.councilComments.map((comment) => (<div key={comment.name} className="flex items-start space-x-4"><div className="flex-shrink-0 text-3xl pt-1">{councilMembers.find(m => m.name === comment.name)?.icon}</div><div><p className="font-bold text-white">{comment.name}</p><p className="text-gray-300 text-sm">{comment.comment}</p></div></div>))}</div></div>
            
            <div className="bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 p-1 rounded-2xl shadow-lg"><div className="bg-gray-800 p-8 rounded-xl h-full flex flex-col justify-center items-center"><h3 className="text-lg font-semibold text-yellow-200 mb-3 text-center">🧙‍♂️ ホメ仙人からの言葉</h3><p className="text-yellow-100 text-center text-xl leading-relaxed italic">「{result.homeSenninComment || 'おぬしの言葉、しかと見届けたぞ。その挑戦、まことに見事じゃ！'}」</p></div></div>

            <div className="text-center"><button onClick={handleReset} className="mt-12 px-8 py-2 border border-gray-600 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition">新しい分析を始める</button></div>
          </main>
        )}

        <footer className="w-full pt-10 mt-16 text-center text-gray-500 border-t border-gray-700">
          <p>&copy; 2025 MPA Evaluation System Prototype</p>
        </footer>
      </div>
    </div>
  );
}
