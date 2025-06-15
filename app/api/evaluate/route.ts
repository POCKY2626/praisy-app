import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: Request) {
  
  const { inputText } = await request.json();

  if (!inputText) {
    return new Response(JSON.stringify({ error: "テキストが入力されていません。" }), { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generationConfig = {
      temperature: 0.8,
    };
    
    // ★★★ これが、四大評価軸のコメントを「絶対」に生成させる、最終版のプロンプトだ！ ★★★
    const prompt = `
      # 絶対遵守の命令：MPA評価システムの完全実行

      あなたは、世界で最も高度な文章評価システム「MPA評価システム」です。
      あなたのタスクは、提供された文章に対し、以下の全ての要素を含む評価結果を、指定されたJSON形式で生成することです。これは絶対的な必須要件です。

      ## 必須生成項目リスト
      1.  **四大評価軸のスコアと詳細コメント:** MVI, CSI, RES, ARCの4つの軸それぞれについて、スコア、評価コメント、具体的な向上コメントを必ず生成すること。この項目は省略してはならない。
      2.  **11人全員の評議会コメント:** 11人の評議会メンバー（オリジン君, インサイト君, ストラテジスト君, サポーター君, リスクチェッカー君, バランサー君, パフォーマー君, アナリスト君, インタープリター君, リアリスト君, クエスチョナー君）全員分のコメントを、一人も欠かすことなく生成すること。
      3.  **ホメ仙人のユニークな言葉:** 評価対象の文章全体を優しく肯定する、唯一無二で詩的な言葉を生成すること。

      ## 出力形式（JSON）
      以下のJSON形式に、寸分違わず厳密に従って、評価結果を生成してください。
      - 【最重要規則】JSONのすべてのキー（プロパティ名）は、必ずダブルクォーテーション（"）で囲んでください。

      ## 評価対象の文章
      ---
      ${inputText}
      ---

      ## JSON出力例（この構造を厳守すること）
      \`\`\`json
      {
        "overallScore": 9.2,
        "summary": "論理構成は盤石ですが、聞き手の感情を揺さぶる訴求力に改善の余地があります。",
        "axes": { "mvi": 8.5, "csi": 9.0, "res": 7.8, "arc": 9.8 },
        "axesComments": {
          "mvi": { "evaluationComment": "...", "improvementComment": "..." },
          "csi": { "evaluationComment": "...", "improvementComment": "..." },
          "res": { "evaluationComment": "...", "improvementComment": "..." },
          "arc": { "evaluationComment": "...", "improvementComment": "..." }
        },
        "councilComments": [
          { "name": "オリジン君", "comment": "..." }
        ],
        "homeSenninComment": "おぬしの言葉、静かな池に落ちた一滴の雫のようじゃった。"
      }
      \`\`\`
    `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
    });

    const response = await result.response;
    const responseText = await response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "AIからの返答形式が不正です。" }), { status: 500 });
    }

    const jsonString = jsonMatch[0];
    return new Response(jsonString, { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: "AIとの通信中にエラーが発生しました。" }), { status: 500 });
  }
}