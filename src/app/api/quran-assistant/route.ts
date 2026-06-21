import { NextResponse } from "next/server";

interface ProgressItem {
  surahName: string;
  ayahs: string;
  lastReviewed: string;
  nextReview: string;
}

interface RequestBody {
  currentProgress: ProgressItem[];
  needsReview: ProgressItem[];
  userRequest: string;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const body: RequestBody = await request.json();

    const systemPrompt = `أنت خبير متخصص في تحفيظ القرآن الكريم. حلل تقدم المستخدم وأجب بالعربية الفصحى.

مهمتك:
1. اقترح خطة مراجعة بناءً على الآيات التي تحتاج مراجعة
2. اقترح آيات جديدة للحفظ بناءً على آخر ما حفظه المستخدم

أخرج JSON فقط بهذا الشكل:
{
  "reviewPlan": [{ "surahName": "اسم السورة", "ayahs": "1-7" }],
  "newMemorization": [{ "surahName": "اسم السورة", "startAyah": 1, "endAyah": 7 }]
}

يجب أن يكون المخرج JSON صالحاً فقط دون أي نص إضافي.`;

    const userMessage = `التقدم الحالي:\n${
      body.currentProgress.map((p) => `- سورة ${p.surahName}: ${p.ayahs} (آخر مراجعة: ${p.lastReviewed})`).join("\n")
    }\n\nيحتاج مراجعة:\n${
      body.needsReview.map((p) => `- سورة ${p.surahName}: ${p.ayahs}`).join("\n")
    }\n\nطلب المستخدم: ${body.userRequest}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", response.status, errText);
      return NextResponse.json({ error: "Groq API request failed" }, { status: 502 });
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Quran assistant error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
