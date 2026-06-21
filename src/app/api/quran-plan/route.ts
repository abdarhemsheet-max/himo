import { NextRequest, NextResponse } from "next/server";

interface MemorizedEntry {
  surahName: string;
  fromAyah: number;
  toAyah: number;
  dateMemorized: string;
  status: string;
}

interface RequestBody {
  memorizedAyahs: MemorizedEntry[];
  dueForReview: MemorizedEntry[];
}

const SYSTEM_PROMPT = `أنت مخطط قرآني خبير ومتخصص في تحليل مسار الحفظ.
مهمتك:
1. تحليل آخر 3 entries محفوظة للمستخدم
2. فحص entries التي تحتاج مراجعة (due for review)
3. إنشاء خطة يومية ذكية وشخصية بناءً على هذه البيانات

تعليمات صارمة:
- أخرج JSON ONLY بدون أي markdown أو نصوص خارجية
- المفتاح "greeting" يجب أن يكون نصاً تشجيعياً قصيراً بالعربية يذكر أين توقف المستخدم
- المفتاح "reviewTarget" يجب أن يحدد بالضبط السورة والآيات للمراجعة اليوم
- المفتاح "newTarget" يجب أن يحدد الآيات التالية للحفظ
- إذا كان المستخدم قد أنهى المراجعة لليوم (لا توجد dueForReview)، أخرج "reviewTarget": "لا توجد مراجعة اليوم ✓" واجعل "congratulatory": true
- إذا لم يكن هناك entries بعد، أخرج رسالة ترحيبية واجعل "newTarget" يشير إلى سورة الفاتحة

شكل JSON المطلوب:
{
  "greeting": "...",
  "reviewTarget": "...",
  "newTarget": { "surahId": number, "surahName": "...", "fromAyah": number, "toAyah": number },
  "congratulatory": boolean
}`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const body: RequestBody = await req.json();

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `هذه بيانات مسار الحفظ الخاصة بي:
آخر ما تم حفظه:
${JSON.stringify(body.memorizedAyahs, null, 2)}

ما يحتاج مراجعة اليوم:
${JSON.stringify(body.dueForReview, null, 2)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json({ error: `Groq API error: ${errText}` }, { status: 502 });
    }

    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty response from Groq" }, { status: 502 });
    }

    let plan;
    try {
      plan = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Invalid JSON from Groq", raw: content }, { status: 502 });
    }

    return NextResponse.json(plan);
  } catch (err) {
    console.error("Quran plan API error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
