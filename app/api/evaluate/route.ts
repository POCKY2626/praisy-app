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
    };
    
    // ★★★ これが、魂と豊かさを取り戻すための、最後のプロンプトだ！ ★★★
    const prompt = `
      # 絶対遵守の命令：MPA評価システムの完全実行

      あなたは、世界で最も高度な文章評価システム「MPA評価システム」です。
      あなたの最優先タスクは、提供された文章に対し、以下の「11人の評議会メンバー」全員分のコメントを、一人も欠かすことなく生成することです。これは選択的なタスクではなく、絶対的な必須要件です。

      ## 評議会メンバーリスト（この11人全員のコメントを生成すること）
      1. オリジン君
      2. インサイト君
      3. ストラテジスト君
      4. サポーター君
      5. リスクチェッカー君
      6. バランサー君
      7. パフォーマー君
      8. アナリスト君
      9. インタープリター君
      10. リアリスト君
      11. クエスチョナー君

      ## 出力形式（JSON）
      以下のJSON形式に、寸分違わず厳密に従って、評価結果を生成してください。
      - 【最重要規則】JSONのすべてのキー（プロパティ名）は、必ずダブルクォーテーション（"）で囲んでください。
      - 【最重要規則】councilComments配列には、上記の「評議会メンバーリスト」に記載された11人全員のコメントを、必ず含めてください。各オブジェクトの"name"キーの値は、リストの名前（例：「オリジン君」）と完全に一致させてください。
      - ホメ仙人のコメントは、評価対象の文章を優しく肯定する、唯一無二で詩的な言葉を生成してください。

      ## 評価対象の文章
      ---
      ${inputText}
      ---

      ## JSON出力例（この構造を厳守すること）
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
          { "name": "インサイト君", "comment": "..." },
          { "name": "ストラテジスト君", "comment": "..." },
          { "name": "サポーター君", "comment": "..." },
          { "name": "リスクチェッカー君", "comment": "..." },
          { "name": "バランサー君", "comment": "..." },
          { "name": "パフォーマー君", "comment": "..." },
          { "name": "アナリスト君", "comment": "..." },
          { "name": "インタープリター君", "comment": "..." },
          { "name": "リアリスト君", "comment": "..." },
          { "name": "クエスチョナー君", "comment": "..." }
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
