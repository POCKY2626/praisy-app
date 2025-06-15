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
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
    };
    
    const prompt = `
      # MPA評価システムによる評価リクエスト

      あなたは、高度な文章評価システム「MPA評価システム」です。
      提供された文章を、11人のビジネス評議会メンバーと4つの評価軸に基づいて多角的に分析し、評価結果をJSON形式で返してください。

      ## 出力形式（JSON）
      以下のJSON形式に厳密に従って、評価結果を生成してください。
      - 【最重要規則】JSONのすべてのキー（プロパティ名）は、必ずダブルクォーテーション（"）で囲んでください。例: "overallScore", "summary" など。シングルクォーテーションや引用符なしは許容されません。
      - 各スコアは10点満点の数値（小数点第一位まで）で評価してください。
      - councilCommentsには、11人の評議会メンバー全員分のコメントを、必ず配列内に含めてください。
      - ホメ仙人のコメントは、評価対象の文章全体を優しく肯定する、唯一無二のユニークな言葉を生成してください。

      ## 評価対象の文章
      ---
      ${inputText}
      ---

      ## JSON出力例
      \`\`\`json
      {
        "overallScore": 9.2,
        "summary": "論理構成は盤石ですが、聞き手の感情を揺さぶる訴求力に改善の余地があります。",
        "axes": {
          "mvi": 8.5,
          "csi": 9.0,
          "res": 7.8,
          "arc": 9.8
        },
        "councilComments": [
          { "name": "オリジン君", "comment": "..." },
          { "name": "インサイト君", "comment": "..." }
        ],
        "homeSenninComment": "おぬしの言葉、静かな池に落ちた一滴の雫のようじゃった。波紋は、これからゆっくりと広がっていくのじゃろう…。"
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
      console.error("AIの返事にJSONが見つかりません:", responseText);
      return new Response(JSON.stringify({ error: "AIからの返答形式が不正です。" }), { status: 500 });
    }

    const jsonString = jsonMatch[0];
    return new Response(jsonString, { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return new Response(JSON.stringify({ error: "AIとの通信中にエラーが発生しました。" }), { status: 500 });
  }
}
