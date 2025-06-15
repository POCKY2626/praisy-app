"use client";

import { useState } from 'react';
// Chart.jsの部品をインポートします
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// 結果の型を定義します
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
  homeSenninComment?: string; // ホメ仙人のコメントは任意項目
};

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null); 
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (!inputText.trim()) {
      setError('テキストを入力してください。');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);

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
  
  // レーダーチャート用のデータを作成します
  const radarData = {
    labels: ['MVI (多角的視点)', 'CSI (コンセプト統合度)', 'RES (訴求力・共鳴力)', 'ARC (論理構成度)'],
    datasets: [
      {
        label: '評価スコア',
        data: result ? [result.axes.mvi, result.axes.csi, result.axes.res, result.axes.arc] : [0, 0, 0, 0],
        backgroundColor: 'rgba(0, 167, 196, 0.2)',
        borderColor: 'rgba(0, 167, 196, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 167, 196, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 167, 196, 1)',
      },
    ],
  };

  // レーダーチャートの見た目の設定です
  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
        pointLabels: { color: '#fff', font: { size: 12 } },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          backdropColor: 'rgba(0,0,0,0)',
          min: 0,
          max: 10,
          stepSize: 2
        },
      },
    },
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="min-h-screen bg-[#1A202C] text-white flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-5xl px-4">
        <h1 className="text-3xl font-bold">PRAISY</h1>
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-center">
        
        {!result && (
          <div className="w-full text-center">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              あなたのプレゼンを、<br />AI評議会が多角的に分析します。
            </h2>
            <p className="text-gray-400 mb-8">
              企画の概要やスピーチ原稿を貼り付けてください。
            </p>
            <textarea
              className="w-full h-64 p-4 bg-[#2D3748] rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#00A7C4] outline-none transition text-white"
              placeholder="ここに分析してほしい文章を入力..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            {error && <p className="text-red-500 mt-4 animate-fade-in">{error}</p>}
            <button
              onClick={handleAnalysis}
              disabled={isLoading}
              className="mt-8 px-10 py-3 bg-[#00A7C4] rounded-full text-lg font-bold hover:bg-opacity-80 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '分析中...' : '評議会を招集する'}
            </button>
            {isLoading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-400">AI評議会が議論中です...</p>
              </div>
            )}
          </div>
        )}

        {result && (
           <div className="w-full animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8">評価結果ダッシュボード</h2>
             
             {/* ① 総合スコア & ④ 総評サマリー */}
             <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg mb-8 text-center">
                <h3 className="text-lg font-semibold text-[#00A7C4]">総合評価</h3>
                <p className="text-6xl font-bold my-2">{result.overallScore} <span className="text-3xl text-gray-400">/ 10.0</span></p>
                <p className="text-gray-300 mt-4 max-w-2xl mx-auto">{result.summary}</p>
             </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* ② 四大評価軸レーダーチャート */}
              <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-[#00A7C4] mb-4 text-center">四大評価軸バランス</h3>
                <div className="relative h-64 md:h-80">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>
              
              {/* ⑤ ホメ仙人からの言葉 */}
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-500 p-1 rounded-xl shadow-lg">
                <div className="bg-[#2D3748] p-6 rounded-lg h-full flex flex-col justify-center items-center">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4 text-center">🧙‍♂️ ホメ仙人からの言葉</h3>
                  <p className="text-yellow-100 text-center text-lg leading-relaxed">{result.homeSenninComment || 'おぬしの言葉、しかと見届けたぞ。その挑戦、まことに見事じゃ！'}</p>
                </div>
              </div>
            </div>
            
             {/* ③ 評議会コメント */}
             <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-[#00A7C4] mb-4">評議会コメント</h3>
                <div className="space-y-5">
                  {result.councilComments.map((comment, index) => (
                    <div key={index} className="flex items-start space-x-4">
                       <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00A7C4] flex items-center justify-center font-bold text-lg">{comment.name.charAt(0)}</div>
                       <div>
                         <p className="font-bold">{comment.name}</p>
                         <p className="text-gray-300">{comment.comment}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="text-center">
                <button onClick={() => { setResult(null); setInputText(''); setError(''); }} className="mt-8 px-8 py-2 border border-[#00A7C4] rounded-full hover:bg-[#00A7C4] transition">
                    もう一度分析する
                </button>
             </div>
           </div>
        )}
      </main>

      <footer className="w-full max-w-5xl pt-10 text-center text-gray-500">
        <p>&copy; 2025 MPA System Prototype</p>
      </footer>
    </div>
  );
}
