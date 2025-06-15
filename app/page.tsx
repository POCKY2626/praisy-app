"use client";

import { useState } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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
  axesComments?: { // AIが返さない可能性も考慮して任意項目に
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

// 評議会メンバーのデータ
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

// 評価軸のデータ
const axesData = [
    { key: 'mvi', name: 'MVI (多角的視点知性)', icon: '🧠' },
    { key: 'csi', name: 'CSI (コンセプト統合度)', icon: '🧬' },
    { key: 'res', name: 'RES (訴求力・共鳴力)', icon: '🌟' },
    { key: 'arc', name: 'ARC (論理構成度)', icon: '❄️' }
];

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
    } catch (err) { setError(err instanceof Error ? err.message : '不明なエラーが発生しました。'); } 
    finally { setIsLoading(false); }
  };

  const radarData = {
    labels: axesData.map(axis => axis.name),
    datasets: [{
        label: '評価スコア',
        data: result ? axesData.map(axis => result.axes[axis.key as keyof typeof result.axes]) : [0, 0, 0, 0],
        backgroundColor: 'rgba(0, 167, 196, 0.2)',
        borderColor: 'rgba(0, 167, 196, 1)',
        borderWidth: 2,
    }],
  };
  const radarOptions = {
    scales: { r: { angleLines: { color: 'rgba(255, 255, 255, 0.2)' }, grid: { color: 'rgba(255, 255, 255, 0.2)' }, pointLabels: { color: '#fff', font: { size: 12 } }, ticks: { color: 'rgba(255, 255, 255, 0.7)', backdropColor: 'rgba(0,0,0,0)', min: 0, max: 10, stepSize: 2 }}},
    plugins: { legend: { display: false }},
    maintainAspectRatio: false
  };

  return (
    <div className="min-h-screen bg-[#1A202C] text-white">
      <div className="container mx-auto px-4 py-10">
        <header className="w-full text-center mb-12">
          <h1 className="text-4xl font-bold">PRAISY</h1>
          <p className="text-gray-400 mt-2">あなたの思考に、11人の評議会を。</p>
        </header>

        {!result ? (
          <main id="analysis-section" className="w-full max-w-3xl mx-auto flex-grow flex flex-col items-center justify-center bg-[#212938] p-8 rounded-2xl shadow-2xl">
            <div className="w-full text-center">
              <h2 className="text-3xl font-bold mb-4">さあ、評議会を招集しよう</h2>
              <textarea
                className="w-full h-60 p-4 bg-[#2D3748] rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#00A7C4] outline-none transition text-white"
                placeholder="ここに分析してほしい文章を入力..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />
              {error && <p className="text-red-500 mt-4 animate-fade-in">{error}</p>}
              <button onClick={handleAnalysis} disabled={isLoading} className="mt-6 px-10 py-3 bg-[#00A7C4] rounded-full text-lg font-bold hover:bg-opacity-80 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? '分析中...' : '評議会を招集する'}
              </button>
              {isLoading && (<div className="mt-4"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div><p className="mt-2 text-gray-400">AI評議会が議論中です...</p></div>)}
            </div>
          </main>
        ) : (
          <main className="w-full max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">評議会からの答申</h2>
            
            {/* 総評 */}
            <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg mb-8 text-center"><h3 className="text-lg font-semibold text-[#00A7C4]">評議会の総意</h3><p className="text-6xl font-bold my-2">{result.overallScore} <span className="text-3xl text-gray-400">/ 10.0</span></p><p className="text-gray-300 mt-4 max-w-2xl mx-auto">{result.summary}</p></div>

            <div className="grid lg:grid-cols-5 gap-8 mb-8">
                {/* レーダーチャート */}
                <div className="lg:col-span-2 bg-[#2D3748] p-6 rounded-xl shadow-lg"><h3 className="text-lg font-semibold text-[#00A7C4] mb-4 text-center">四大評価軸バランス</h3><div className="relative h-64 md:h-80"><Radar data={radarData} options={radarOptions} /></div></div>
                
                {/* ★★★ 四大評価軸の詳細コメント ★★★ */}
                <div className="lg:col-span-3 bg-[#2D3748] p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-[#00A7C4] mb-4">四大評価軸の分析</h3>
                    {result.axesComments ? (
                      <div className="space-y-4">
                          {axesData.map(axis => (
                              <div key={axis.key}>
                                  <h4 className="font-bold text-md flex items-center"><span className="text-2xl mr-2">{axis.icon}</span>{axis.name}</h4>
                                  <div className="border-l-2 border-gray-600 pl-4 ml-3 mt-2">
                                    <p className="text-sm text-gray-300"><strong className="text-green-400">評価:</strong> {result.axesComments![axis.key as keyof typeof result.axesComments].evaluationComment}</p>
                                    <p className="text-sm text-gray-300 mt-1"><strong className="text-yellow-400">向上案:</strong> {result.axesComments![axis.key as keyof typeof result.axesComments].improvementComment}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center mt-8">詳細な評価軸コメントは生成されませんでした。</p>
                    )}
                </div>
            </div>
            
            {/* 全評議会コメント */}
            <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg mb-8"><h3 className="text-lg font-semibold text-[#00A7C4] mb-4">11人の評議会コメント</h3><div className="grid md:grid-cols-2 gap-x-8 gap-y-5">{result.councilComments.map((comment, index) => (<div key={index} className="flex items-start space-x-3"><div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00A7C4] flex items-center justify-center font-bold text-lg">{councilMembers.find(m => m.name === comment.name)?.icon || comment.name.charAt(0)}</div><div><p className="font-bold">{comment.name}</p><p className="text-gray-300 text-sm">{comment.comment}</p></div></div>))}</div></div>
            
            {/* ホメ仙人 */}
            <div className="bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-500 p-1 rounded-xl shadow-lg"><div className="bg-[#2D3748] p-6 rounded-lg h-full flex flex-col justify-center items-center"><h3 className="text-lg font-semibold text-yellow-300 mb-2 text-center">🧙‍♂️ ホメ仙人からの言葉</h3><p className="text-yellow-100 text-center text-lg leading-relaxed">{result.homeSenninComment || 'おぬしの言葉、しかと見届けたぞ。その挑戦、まことに見事じゃ！'}</p></div></div>

            <div className="text-center"><button onClick={() => { setResult(null); setInputText(''); setError(''); }} className="mt-12 px-8 py-2 border border-gray-600 rounded-full hover:bg-gray-700 hover:border-gray-500 transition">新しい分析を始める</button></div>
          </main>
        )}
      </div>
    </div>
  );
}
