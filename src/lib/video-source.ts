// بعض فيديوهات المعرض كبيرة الحجم ومخزّنة داخل المشروع على هيئة أجزاء متتابعة
// (لأن حد حجم الملف الواحد في المستودع أصغر من حجم الفيديو الأصلي).
// نعيد تجميع الأجزاء في المتصفح قبل التشغيل، فيبقى الفيديو بجودته الأصلية
// وداخل المشروع نفسه بلا أي ارتباط بخادم أو حساب خارجي.
import { useEffect, useState } from "react";

const SPLIT_VIDEOS: Record<string, string[]> = {
  "/videos/pylontech-home-official.mp4": [
    "/videos/parts/pylontech-home-official.mp4.part00",
    "/videos/parts/pylontech-home-official.mp4.part01",
  ],
  "/videos/pylontech-rv12314.mp4": [
    "/videos/parts/pylontech-rv12314.mp4.part00",
    "/videos/parts/pylontech-rv12314.mp4.part01",
  ],
  "/videos/suntech-stp720s-d66-nsh.mp4": [
    "/videos/parts/suntech-stp720s-d66-nsh.mp4.part00",
    "/videos/parts/suntech-stp720s-d66-nsh.mp4.part01",
  ],
  "/videos/hithium-heroee-maxpower-16.mp4": [
    "/videos/parts/hithium-heroee-maxpower-16.mp4.part00",
    "/videos/parts/hithium-heroee-maxpower-16.mp4.part01",
  ],
  "/videos/suntech-stp595s-c72-nsh.mp4": [
    "/videos/parts/suntech-stp595s-c72-nsh.mp4.part00",
    "/videos/parts/suntech-stp595s-c72-nsh.mp4.part01",
  ],
};

const cache = new Map<string, string>();
const STORE_NAME = "actes-videos-v1";

async function openStore() {
  return typeof caches !== "undefined" ? await caches.open(STORE_NAME).catch(() => null) : null;
}

/** يخزّن فيديو في ذاكرة المتصفح الدائمة إن لم يكن مخزّناً (يُستخدم للتجهيز الخلفي). */
async function warmOne(store: Cache | null, url: string) {
  if (!store) return;
  const hit = await store.match(url).catch(() => undefined);
  if (hit) return;
  const res = await fetch(url).catch(() => null);
  if (res?.ok) await store.put(url, res).catch(() => {});
}

/** يجهّز قائمة فيديوهات في الخلفية وقت فراغ المتصفح، فتنطلق فوراً عند فتحها لاحقاً. */
export function warmVideos(urls: string[]) {
  if (typeof window === "undefined") return;
  const run = async () => {
    const store = await openStore();
    for (const url of urls) {
      const parts = SPLIT_VIDEOS[url] ?? [url];
      for (const p of parts) await warmOne(store, p);
    }
  };
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (idle) idle(() => void run(), { timeout: 8000 });
  else window.setTimeout(() => void run(), 4000);
}

/** يُرجع مسار التشغيل النهائي: المسار المباشر، أو رابط مؤقت لفيديو أُعيد تجميعه من أجزائه. */
export function useResolvedVideoSrc(src: string): string {
  const parts = SPLIT_VIDEOS[src];
  const [resolved, setResolved] = useState<string>(() => (parts ? cache.get(src) ?? "" : src));

  useEffect(() => {
    if (!parts) {
      // فيديو مباشر: إن كان مجهّزاً مسبقاً في الذاكرة الدائمة نشغّله منها فوراً.
      const cached = cache.get(src);
      if (cached) {
        setResolved(cached);
        return;
      }
      setResolved(src);
      let cancelled = false;
      void (async () => {
        const store = await openStore();
        const hit = store ? await store.match(src).catch(() => undefined) : undefined;
        if (!hit || cancelled) return;
        const url = URL.createObjectURL(await hit.blob());
        cache.set(src, url);
        setResolved(url);
      })();
      return () => {
        cancelled = true;
      };
    }
    const cached = cache.get(src);
    if (cached) {
      setResolved(cached);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        // التخزين الدائم في المتصفح: بعد أول تحميل يبدأ الفيديو فوراً دون إعادة تنزيل.
        const store = await openStore();
        const buffers = await Promise.all(
          parts.map(async (p) => {
            const hit = store ? await store.match(p) : undefined;
            if (hit) return hit.blob();
            const res = await fetch(p);
            if (!res.ok) throw new Error(`part failed: ${p}`);
            if (store) void store.put(p, res.clone()).catch(() => {});
            return res.blob();
          }),
        );
        if (cancelled) return;
        const url = URL.createObjectURL(new Blob(buffers, { type: "video/mp4" }));
        cache.set(src, url);
        setResolved(url);
      } catch {
        if (!cancelled) setResolved("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, parts]);

  return resolved;
}
