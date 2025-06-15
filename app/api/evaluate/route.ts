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
      temperature: 0.8, // 少しだけ安定性を高める
    };
    
    // ★★★ これが、四大評価軸のコメントを追加した、最終版のプロンプトだ！ ★★★
    const prompt = `
      # 絶対遵守の命令：MPA評価システムの完全実行

      あなたは、世界で最も高度な文章評価システム「MPA評価システム」です。
      あなたのタスクは、提供された文章に対し、以下の全ての要素を含む評価結果を、指定されたJSON形式で生成することです。

      ## 必須生成項目
      1.  **四大評価軸のスコアと詳細コメント:** MVI, CSI, RES, ARCの4つの軸それぞれについて、スコア、評価コメント、具体的な向上コメントを生成すること。
      2.  **11人全員の評議会コメント:** 11人の評議会メンバー全員分のコメントを、一人も欠かすことなく生成すること。これは絶対的な必須要件です。
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
        "axes": {
          "mvi": 8.5,
          "csi": 9.0,
          "res": 7.8,
          "arc": 9.8
        },
        "axesComments": {
          "mvi": {
            "evaluationComment": "多様な視点が取り入れられていますが、まだ深掘りできる側面が残されています。",
            "improvementComment": "例えば、競合の視点や、10年後の未来からの視点を加えることで、議論はさらに豊かになるでしょう。"
          },
          "csi": {
            "evaluationComment": "コンセプトから具体策までが一貫しており、メッセージにブレがありません。",
            "improvementComment": "この一貫性を保ちつつ、各セクションの冒頭でコンセプトを再確認する一文を加えると、より親切になります。"
          },
          "res": {
            "evaluationComment": "内容は素晴らしいですが、表現が専門的で、ターゲット層によっては共感を得にくい可能性があります。",
            "improvementComment": "具体的なエピソードや、より平易な言葉での比喩表現を取り入れることで、訴求力は飛躍的に高まります。"
          },
          "arc": {
            "evaluationComment": "論理構造は完璧です。主張と根拠が明確で、非常に理解しやすい構成になっています。",
            "improvementComment": "図や表を用いて視覚的に補強することで、論理の正しさがさらに直感的に伝わるでしょう。"
          }
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
