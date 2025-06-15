"use client";

import { useState } from 'react';

// 結果の型を定義しておくと、より安全なコードになるよ
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
      // ★★★ ここが、ボタンと魔法使いをつなぐ「秘密の糸」だ！ ★★★
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText }),
      });

      if (!response.ok) {
        throw new Error('分析中にエラーが発生しました。');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A202C] text-white flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold">PRAISY (仮)</h1>
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col items-center justify-center">
        
        {/* 結果が表示されていない時だけ、入力フォームを見せる */}
        {!result && (
          <div className="w-full text-center">
            <h2 className="text-4xl font-bold mb-4">
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
            {error && <p className="text-red-500 mt-2">{error}</p>}
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

        {/* ★★★ ここが、AIからの返事を表示するダッシュボードだ！ ★★★ */}
        {result && (
           <div className="w-full animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-6">評価結果ダッシュボード</h2>
             
             <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-lg font-bold text-[#00A7C4]">総合評価</h3>
                <p className="text-5xl font-bold my-2">{result.overallScore} <span className="text-2xl">/ 10.0</span></p>
                <p className="text-gray-300">{result.summary}</p>
             </div>

             <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-lg font-bold text-[#00A7C4] mb-4">評議会コメント</h3>
                <div className="space-y-4">
                  {result.councilComments.map((comment, index) => (
                    <div key={index} className="border-l-4 border-[#00A7C4] pl-4">
                      <p className="font-bold">{comment.name}</p>
                      <p className="text-gray-300">{comment.comment}</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="text-center">
                <button onClick={() => setResult(null)} className="mt-4 px-8 py-2 border border-[#00A7C4] rounded-full hover:bg-[#00A7C4] transition">
                    もう一度分析する
                </button>
             </div>
           </div>
        )}

      </main>

      <footer className="w-full max-w-4xl pt-10 text-center text-gray-500">
        <p>&copy; 2025 MPA System Prototype</p>
      </footer>
    </div>
  );
}