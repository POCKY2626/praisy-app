import { GoogleGenerativeAI } from "@google/generative-ai";

// 秘密の金庫から、合言葉を読み込む準備
const API_KEY = process.env.GEMINI_API_KEY || "";

// これが魔法使いの本体
export async function POST(request: Request) {
  
  // ウェイターから、お客さんの注文を受け取る
  const { inputText } = await request.json();

  if (!inputText) {
    return new Response(JSON.stringify({ error: "テキストが入力されていません。" }), { status: 400 });
  }

  try {
    // 毎回のリクエストをユニークにするための「隠し味」
    const randomSalt = Date.now(); 

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // ★★★ ここが、最終進化した「秘伝のレシピ（プロンプト）」だ！ ★★★
    const prompt = `
      # MPA評価システムによる評価リクエスト

      あなたは、高度な文章評価システム「MPA評価システム」です。
      提供された文章を、11人のビジネス評議会メンバーと4つの評価軸に基づいて多角的に分析し、評価結果をJSON形式で返してください。

      ## ビジネス評議会11名
      (オリジン君、インサイト君、ストラテジスト君、サポーター君、リスクチェッカー君、バランサー君、パフォーマー君、アナリスト君、インタープリター君、リアリスト君、クエスチョナー君)

      ## 四大評価軸
      (MVI、CSI、RES、ARC)

      ## 評価対象の文章
      ---
      ${inputText}
      ---

      ## 出力形式（JSON）
      以下のJSON形式に従って、評価結果を生成してください。
      - 各スコアは10点満点の数値（小数点第一位まで）で評価してください。
      - 各人格のコメントは、そのキャラクターの役割と性格を反映した、具体的で示唆に富む内容にしてください。
      - **【最重要指示】ホメ仙人のコメントは、評価対象の文章全体を優しく肯定する、唯一無二のユニークな言葉を生成してください。静寂型、質問型、詩型などの変奏スタイルを意識し、決して以前の回答と同じ言葉や、ありきたりな表現を使わないでください。**
      - 内部的なユニークID: ${randomSalt} // このIDは出力に含めないでください

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
          { "name": "オリジン君", "comment": "この文章の根源的な目的は何か、その一点が明確に伝わってきます。" }
        ],
        "homeSenninComment": "おぬしの言葉、静かな池に落ちた一滴の雫のようじゃった。波紋は、これからゆっくりと広がっていくのじゃろう…。"
      }
      \`\`\`
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text();
    
    // AIの返事からJSON部分だけを賢く抽出する
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