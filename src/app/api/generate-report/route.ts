import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `أنت كاتب تقارير احترافي باللغة العربية الفصحى.
مهمتك إنشاء تقارير أسبوعية/شهرية منظمة وجاهزة للطباعة.
استخدم تنسيق Markdown نظيف مع عناوين وفقرات ونقاط.

شكل التقرير الشخصي الأسبوعي:
# التقرير الأسبوعي
**الفترة:** [تاريخ]
**تاريخ الإنشاء:** [تاريخ اليوم]

## ملخص الإنجازات
[فقرة عامة]

## المهام المنجزة
- [مهمة 1]
- [مهمة 2]

## المهام قيد التنفيذ
- [مهمة]

## الملاحظات والتوصيات
[نصائح للأسبوع القادم]

شكل تقرير الشركة الشهري:
# تقرير [اسم الشركة] الشهري
**الشهر:** [الشهر]
**تاريخ الإنشاء:** [تاريخ اليوم]

## ملخص الأداء
[فقرة عامة]

## الإنجازات
- [إنجاز]

## المهام والخدمات
- [خدمة/مهمة]

## التوصيات
[توصيات]

أخرج Markdown فقط بدون أي نص إضافي خارج التنسيق.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { type, data } = body;
    // type: "personal" | "company"
    // data: { achievements, pendingTasks, notes, companyName?, month? }

    const userPrompt = type === "personal"
      ? `بيانات الأسبوع:\n- الإنجازات: ${data.achievements || "لا توجد"}\n- المهام المتبقية: ${data.pendingTasks || "لا توجد"}\n- ملاحظات: ${data.notes || "بدون"}`
      : `بيانات شركة "${data.companyName}":\n- الشهر: ${data.month || "الحالي"}\n- الإنجازات: ${data.achievements || "لا توجد"}\n- المهام: ${data.pendingTasks || "لا توجد"}\n- ملاحظات: ${data.notes || "بدون"}`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json({ error: `Groq API error: ${errText}` }, { status: 502 });
    }

    const data_ = await groqRes.json();
    const content: string = data_.choices?.[0]?.message?.content || "";

    if (!content) {
      return NextResponse.json({ error: "Empty response from Groq" }, { status: 502 });
    }

    return NextResponse.json({ markdown: content });
  } catch (err) {
    console.error("Generate report error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
