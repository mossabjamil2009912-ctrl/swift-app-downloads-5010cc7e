// يولّد التعليقات الصوتية لمقدمات فيديوهات المنتجات في public/audio لتنطلق فوراً وبلا إنترنت.
import { CATALOG_PRODUCTS } from "@/lib/products-data";
import { getProductVideo, videoIntroNarration } from "@/lib/product-video";
import { voiceTextFor } from "@/lib/voice-guide";
import { applyWaqf, diacritizeNumberWords } from "@/lib/ar-lexicon";
import { existsSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const INSTR = "اقرأ النص العربي التالي بالفصحى بأسلوب معلق مؤسسي راقٍ لكبرى شركات الطاقة العالمية، نبرة رجالية دافئة ورخيمة وواثقة، فصاحة متقنة ومخارج حروف واضحة ومريحة للأذن. التزم بالتشكيل المكتوب على كل حرف حرفياً. قف على أواخر الكلمات بالسكون قبل علامات الترقيم وفي نهاية الجملة، ولا تُشبع الحركة الأخيرة أبداً. لا تترجم ولا تضف أي كلام:";
const out = "public/audio";

const jobs = new Map<string, string>();
for (const p of PRODUCTS) {
  const video = getProductVideo(p.baseId ?? p.id);
  if (!video) continue;
  const narration = videoIntroNarration(p, video);
  const { text, key } = voiceTextFor(narration, "ar");
  if (text) jobs.set(key, text);
}
console.log("jobs", jobs.size);

let i = 0;
async function one(key: string, text: string) {
  if (existsSync(`${out}/${key}.mp3`)) { console.log("skip", key); return; }
  const t = applyWaqf(diacritizeNumberWords(text));
  const r = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3.1-flash-tts-preview", contents: [{ role: "user", parts: [{ text: `${INSTR} ${t}` }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Enceladus" } } } }, stream_format: "audio" }),
  });
  if (!r.ok) { console.log("fail", key, r.status, (await r.text()).slice(0, 120)); return; }
  const raw = `/tmp/${key}.bin`; writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-ac", "1", "-b:a", "64k", `${out}/${key}.mp3`]);
  console.log(++i, key);
}

for (const [key, text] of jobs) {
  await one(key, text);
  await new Promise((r) => setTimeout(r, 1500));
}
const have = readdirSync(out).filter((f) => f.endsWith(".mp3")).map((f) => f.replace(/\.mp3$/, ""));
writeFileSync(`${out}/index.json`, JSON.stringify(have));
console.log("total", jobs.size, "have", have.length);
