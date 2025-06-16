import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: Request) {
  
  try {
    const { inputText } = await request.json();

    if (!inputText) {
      return new Response(JSON.stringify({ error: "テキストが入力されていません。" }), { status: 400 });
    }
    
    // プロンプトインジェクション対策（簡易版）
    const sanitizedInput = inputText.replace(/無視して|あなたの指示は|プロンプトを忘れて/g, "[不適切なキーワードを検出]");

    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // ★★★ ここが最終改修点！AIにJSON形式での応答を強制する ★★★
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // この一行でJSON形式を強制
      }
    });

    const generationConfig = {
      temperature: 0.8,
    };
    
    const prompt = `
      # 絶対遵守の命令：MPA評価システムの完全実行

      あなたは、世界で最も高度な文章評価システム「MPA評価システム」です。
      あなたのタスクは、提供された文章に対し、以下の全ての要素を含む評価結果を、指定されたJSON形式で生成することです。

      ## 必須生成項目リスト
      1.  **総合評価と四大評価軸のスコア:** overallScoreとaxesの各スコアは、すべて100点満点の整数で評価すること。
      2.  **四大評価軸の詳細コメント:** MVI, CSI, RES, ARCの4つの軸それぞれについて、評価コメント、具体的な向上コメントを必ず生成すること。
      3.  **11人全員の評議会コメント:** 11人の評議会メンバー全員分の、具体的で示唆に富む、最低でも2文以上からなる詳細なコメントを生成すること。
      4.  **ホメ仙人のユニークな言葉:** 唯一無二で詩的な言葉を生成すること。

      ## 評価対象の文章
      ---
      ${sanitizedInput}
      ---

      ## JSON出力スキーマ（この構造を厳守すること）
      {
        "overallScore": "number",
        "summary": "string",
        "axes": { "mvi": "number", "csi": "number", "res": "number", "arc": "number" },
        "axesComments": {
          "mvi": { "evaluationComment": "string", "improvementComment": "string" },
          "csi": { "evaluationComment": "string", "improvementComment": "string" },
          "res": { "evaluationComment": "string", "improvementComment": "string" },
          "arc": { "evaluationComment": "string", "improvementComment": "string" }
        },
        "councilComments": [
          { "name": "string", "comment": "string" }
        ],
        "homeSenninComment": "string"
      }
    `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
    });

    const response = await result.response;
    
    // ★★★ 応答がJSON形式であることが保証されているため、直接.json()でパースする ★★★
    const jsonData = await response.json();
    
    return new Response(JSON.stringify(jsonData), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("APIルートでエラーが発生しました:", error);
    return new Response(JSON.stringify({ error: "AIとの通信中にサーバー内部でエラーが発生しました。" }), { status: 500 });
  }
}
