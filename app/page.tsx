"use client";

import { useState, useMemo } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// 型定義
type AnalysisResult = {
  overallScore: number;
  summary: string;
  axes: {
    mvi: number;
    csi: number;
    res: number;
    arc: number;
  };
  councilComments: {
    name: string;
    comment: string;
  }[];
  homeSenninComment?: string;
};

// 評議会メンバーのデータ
const councilMembers = [
    { icon: "👑", name: "オリジン君", title: "本質の探求者", quote: "すべての議論の前に、我々は『なぜ』に立ち返るべきだ" },
    { icon: "💡", name: "インサイト君", title: "直感の先駆者", quote: "理屈の前に、私はすでに『核心』が見えていた" },
    { icon: "⚪️", name: "ストラテジスト君", title: "論理の設計者", quote: "感情さえも、再現可能な仕組みで説明できるはずだ" },
    { icon: "💎", name: "サポーター君", title: "チームの支援者", quote: "迷ったら、まずチームを助けることから始めよう！" },
    { icon: "⚫️", name: "リスクチェッカー君", title: "厳格な監査役", quote: "なぁなぁは失敗のはじまりだ" },
    { icon: "🟢", name: "バランサー君", title: "最適化の調停者", quote: "他人の評価ではなく、プロジェクトとして嘘がないかだ" },
    { icon: "🟠", name: "パフォーマー君", title: "情熱の伝道師", quote: "『いいね！』がなければ、届いていないのと同じだ！" },
    { icon: "�", name: "アナリスト君", title: "データの分析官", quote: "なぜそう思うか、根拠となるデータを3つ挙げてくれ" },
    { icon: "🌙", name: "インタープリター君", title: "意図の翻訳家", quote: "その言葉、受け手にはまったく違う意味で届いているよ" },
    { icon: "🪨", name: "リアリスト君", title: "現実の実行官", quote: "理想は分かった。で、それは儲かるのか？" },
    { icon: "🌀", name: "クエスチョナー君", title: "常識への挑戦者", quote: "その前提、本当に“正しい”と言えるのか？" }
];

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null); 
  const [error, setError] = useState('');
  // ★★★ 「深層」が解放されたかを管理する、新しい状態 ★★★
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleAnalysis = async () => {
    if (!inputText.trim()) {
      setError('テキストを入力してください。');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);
    setIsUnlocked(false); // 新しい分析のたびにリセット

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析中にサーバーエラーが発生しました。');
      }
      const responseText = await response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AIからの返答形式が不正です。");
      }
      const data: AnalysisResult = JSON.parse(jsonMatch[0]);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInputText('');
    setError('');
    setIsUnlocked(false);
  }
  
  // 最初の3人格のコメントをメモ化して表示
  const simpleComments = useMemo(() => {
    if (!result) return [];
    // 多様な視点を見せるため、代表的な3人格を選ぶ
    const representativeNames = ["オリジン君", "リスクチェッカー君", "パフォーマー君"];
    return result.councilComments.filter(c => representativeNames.includes(c.name));
  }, [result]);

  const radarData = {
    labels: ['MVI (多角的視点)', 'CSI (コンセプト統合度)', 'RES (訴求力・共鳴力)', 'ARC (論理構成度)'],
    datasets: [{
        label: '評価スコア',
        data: result ? [result.axes.mvi, result.axes.csi, result.axes.res, result.axes.arc] : [0, 0, 0, 0],
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
        
        <header className="w-full">
          <h1 className="text-4xl font-bold text-center">PRAISY</h1>
          <p className="text-center text-gray-400 mt-2">あなたの思考に、11人の評議会を。</p>
        </header>

        {/* --- 結果がない時、またはリセットされた時は、ランディングページを表示 --- */}
        {!result ? (
          <>
            <section className="text-center my-16">
              <h2 className="text-5xl font-extrabold mb-4 leading-tight">11人のAI評議会が、<br />あなたの文章を徹底解剖。</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">単なる文章評価ではありません。あなたの思考に眠る11の視点を可視化し、アウトプットの質を根源から引き上げる、対話型の思考支援エンターテイメントです。</p>
              <div className="flex justify-center gap-4 mt-8">
                <div className="bg-[#2D3748] p-4 rounded-lg text-center"><span className="text-2xl">👑</span><h3 className="font-bold">本質の探求者</h3><p className="text-sm text-gray-400">オリジン君</p></div>
                <div className="bg-[#2D3748] p-4 rounded-lg text-center"><span className="text-2xl">⚫️</span><h3 className="font-bold">厳格な監査役</h3><p className="text-sm text-gray-400">リスクチェッカー君</p></div>
                <div className="bg-[#2D3748] p-4 rounded-lg text-center"><span className="text-2xl">🟠</span><h3 className="font-bold">情熱の伝道師</h3><p className="text-sm text-gray-400">パフォーマー君</p></div>
              </div>
            </section>

            <main id="analysis-section" className="w-full max-w-5xl mx-auto flex-grow flex flex-col items-center justify-center bg-[#212938] p-8 rounded-2xl shadow-2xl">
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

            <section className="my-24">
              <h2 className="text-4xl font-bold text-center mb-12">あなたの内に眠る、11人の評議会</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {councilMembers.map(member => (<div key={member.name} className="bg-[#2D3748] p-5 rounded-xl text-center hover:bg-[#374151] transition"><span className="text-4xl">{member.icon}</span><h3 className="text-lg font-bold mt-2">{member.name}</h3><p className="text-sm text-[#00A7C4] font-semibold">{member.title}</p><p className="text-xs text-gray-400 mt-2 italic">「{member.quote}」</p></div>))}
              </div>
            </section>
          </>
        ) : (
          /* --- 結果が表示される時のレイアウト --- */
          <main className="w-full max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">評議会からの答申</h2>

            {/* ステップ１：簡易分析結果 */}
            <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-[#00A7C4]">最初の見解</h3>
              <p className="text-gray-300 mt-2 mb-4">{result.summary}</p>
              <div className="space-y-4">
                {simpleComments.map((comment, index) => (
                  <div key={index} className="flex items-start space-x-4"><div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00A7C4] flex items-center justify-center font-bold text-lg">{comment.name.charAt(0)}</div><div><p className="font-bold">{comment.name}</p><p className="text-gray-300">{comment.comment}</p></div></div>
                ))}
              </div>
            </div>

            {/* ステップ２：解放されていない時の「解放ボタン」 */}
            {!isUnlocked && (
                <div className="text-center my-12 animate-pulse">
                    <button onClick={() => setIsUnlocked(true)} className="px-10 py-4 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full text-xl font-bold hover:from-teal-500 hover:to-blue-600 transition-all transform hover:scale-110 shadow-lg">
                        <span className="text-2xl mr-2">🔑</span>
                        評議会の深層へ…
                    </button>
                    <p className="mt-4 text-gray-400">残りの8人の評議会とホメ仙人の言葉、そして詳細分析を解放します。</p>
                </div>
            )}
            
            {/* ステップ３：解放された後の「全機能表示」 */}
            {isUnlocked && (
              <div className="animate-fade-in-slow">
                <div className="bg-[#212938] p-6 rounded-xl shadow-lg mb-8 text-center">
                  <h3 className="text-lg font-semibold text-[#00A7C4]">評議会の総意</h3>
                  <p className="text-6xl font-bold my-2">{result.overallScore} <span className="text-3xl text-gray-400">/ 10.0</span></p>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg"><h3 className="text-lg font-semibold text-[#00A7C4] mb-4 text-center">四大評価軸バランス</h3><div className="relative h-64 md:h-80"><Radar data={radarData} options={radarOptions} /></div></div>
                  <div className="bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-500 p-1 rounded-xl shadow-lg"><div className="bg-[#2D3748] p-6 rounded-lg h-full flex flex-col justify-center items-center"><h3 className="text-lg font-semibold text-yellow-300 mb-4 text-center">🧙‍♂️ ホメ仙人からの言葉</h3><p className="text-yellow-100 text-center text-lg leading-relaxed">{result.homeSenninComment || 'おぬしの言葉、しかと見届けたぞ。その挑戦、まことに見事じゃ！'}</p></div></div>
                </div>
                <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg"><h3 className="text-lg font-semibold text-[#00A7C4] mb-4">評議会の全コメント</h3><div className="space-y-5">{result.councilComments.map((comment, index) => (<div key={index} className="flex items-start space-x-4"><div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00A7C4] flex items-center justify-center font-bold text-lg">{councilMembers.find(m => m.name === comment.name)?.icon || comment.name.charAt(0)}</div><div><p className="font-bold">{comment.name}</p><p className="text-gray-300">{comment.comment}</p></div></div>))}</div></div>
              </div>
            )}

            <div className="text-center">
              <button onClick={handleReset} className="mt-12 px-8 py-2 border border-gray-600 rounded-full hover:bg-gray-700 hover:border-gray-500 transition">
                新しい分析を始める
              </button>
            </div>
          </main>
        )}

        <footer className="w-full pt-10 mt-16 text-center text-gray-500 border-t border-gray-700">
          <p>&copy; 2025 MPA System Prototype</p>
        </footer>
      </div>
    </div>
  );
}
