import { GoogleGenerativeAI } from "@google/generative-ai";

// これは、僕らの作った秘密の金庫（.env.local）から、合言葉（APIキー）を読み込むための準備だよ
const API_KEY = process.env.GEMINI_API_KEY || "";

// ★★★ サーバーがAPIキーを認識しているか、ここで確認します ★★★
console.log("サーバーが読み込んだAPIキー:", API_KEY ? "キーは存在します" : "キーが見つかりません！");

// これが魔法使いの本体だ
export async function POST(request: Request) {
  
  // ウェイターから、お客さんの注文（入力されたテキスト）を受け取る
  const { inputText } = await request.json();

  // もし注文がなかったら、エラーを返す
  if (!inputText) {
    return new Response(JSON.stringify({ error: "テキストが入力されていません。" }), { status: 400 });
  }

  try {
    // ここから、魔法使いがシェフ（Gemini）に料理をお願いするプロセス
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // ★★★ ここが、君の「秘伝のレシピ（プロンプト）」だ！ ★★★
    const prompt = `
      # MPA評価システムによる評価リクエスト

      あなたは、高度な文章評価システム「MPA評価システム」です。
      提供された文章を、11人のビジネス評議会メンバーと4つの評価軸に基づいて多角的に分析し、評価結果をJSON形式で返してください。

      ## ビジネス評議会11名
      1. オリジン君（本質の探求者）
      2. インサイト君（直感の先駆者）
      3. ストラテジスト君（論理の設計者）
      4. サポーター君（チームの支援者）
      5. リスクチェッカー君（厳格な監査役）
      6. バランサー君（最適化の調停者）
      7. パフォーマー君（情熱の伝道師）
      8. アナリスト君（データの分析官）
      9. インタープリター君（意図の翻訳家）
      10. リアリスト君（現実の実行官）
      11. クエスチョナー君（常識への挑戦者）

      ## 四大評価軸
      - MVI（多角的視点知性）
      - CSI（コンセプト統合度）
      - RES（訴求力・共鳴力）
      - ARC（論理構成度）

      ## 評価対象の文章
      ---
      ${inputText}
      ---

      ## 出力形式（JSON）
      以下のJSON形式に従って、評価結果を生成してください。
      - 各スコアは10点満点の数値（小数点第一位まで）で評価してください。
      - 各人格のコメントは、そのキャラクターの役割と性格を反映した、具体的で示唆に富む内容にしてください。

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
        "homeSenninComment": "おぬしの言葉、しかと見届けたぞ。..."
          { "name": "オリジン君", "comment": "この文章の根源的な目的は何か、その一点が明確に伝わってきます。" },
          { "name": "リスクチェッカー君", "comment": "主張に矛盾はないが、反対意見に対する反論がやや弱い。リスクヘッジが不十分です。" },
          { "name": "パフォーマー君", "comment": "もっと情熱的な言葉を選べば、読者の心を鷲掴みにできるはず！少しもったいない！" }
        ]
      }
      \`\`\`
    `;

    // シェフに、レシピと注文を渡して、料理（分析）をお願いする
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text();

// AIの答えから、余分なマークダウンの飾りを削除する
// AIの返事からJSON部分だけを正規表現で抽出する
const jsonMatch = responseText.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  // JSONが見つからなかった場合のエラー処理
  console.error("AIの返事にJSONが見つかりません:", responseText);
  return new Response(JSON.stringify({ error: "AIからの返答形式が不正です。" }), { status: 500 });
}

const jsonString = jsonMatch[0];
console.log("抽出されたJSON:", jsonString);

// 抽出したJSON文字列をフロントエンドに返す
return new Response(jsonString, { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    // もし、キッチンで何かエラーが起きたら、それを知らせる
    console.error("Error calling Gemini API:", error);
    return new Response(JSON.stringify({ error: "AIとの通信中にエラーが発生しました。" }), { status: 500 });
  }
}