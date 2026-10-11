// تحميل مسبق فوري للصور الخفيفة المستخدمة في الشاشات الأولى،
// حتى تظهر بطاقات نوع المشروع وبطاقات الخدمات بصورها بلا أي انتظار.
import { warmVideos } from "@/lib/video-source";
import residentialImage from "@/assets/actes-residential.webp";
import commercialImage from "@/assets/actes-commercial.webp";
import industrialImage from "@/assets/actes-industrial.webp";
import agricultureImage from "@/assets/actes-agriculture.webp";
import cardQuote from "@/assets/card-quote.webp";
import cardEnergy from "@/assets/card-energy.webp";
import cardSupport from "@/assets/card-support.webp";
import cardProducts from "@/assets/card-products.webp";
import actesLogo from "@/assets/actes-logo-full.webp";
import homeHero from "@/assets/actes-home-hero.webp";
import partnersStrip from "@/assets/partners-strip.webp";
import startBgDesktop from "@/assets/start-bg-desktop.webp";
import startBgMobile from "@/assets/start-bg-mobile.webp";
import p2 from "@/assets/products/p2.webp";
import p3 from "@/assets/products/p3.webp";
import p4 from "@/assets/products/p4.webp";
import p8 from "@/assets/products/p8.webp";
import p9 from "@/assets/products/p9.webp";
import p10 from "@/assets/products/p10.webp";
import p11 from "@/assets/products/p11.webp";
import p12 from "@/assets/products/p12.webp";
import p13 from "@/assets/products/p13.webp";
import p14 from "@/assets/products/p14.webp";
import p15 from "@/assets/products/p15.webp";
import p16 from "@/assets/products/p16.webp";
import p17 from "@/assets/products/p17.webp";
import p18 from "@/assets/products/p18.webp";
import p19 from "@/assets/products/p19.webp";
import p20 from "@/assets/products/p20.webp";
import p21 from "@/assets/products/p21.webp";

// الترتيب بالأولوية: صورة الغلاف وشريط الوكلاء أولاً، ثم صور شاشة نوع المشروع وبطاقات الشاشة الرئيسية،
// ثم صور المنتجات (خفيفة WebP) حتى تظهر شاشات المنتجات وطلب صنف محدد فوراً.
const IMAGES = [
  homeHero,
  partnersStrip,
  startBgDesktop,
  startBgMobile,
  residentialImage,
  commercialImage,
  industrialImage,
  agricultureImage,
  cardQuote,
  cardEnergy,
  cardSupport,
  cardProducts,
  actesLogo,
  p2, p3, p4, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21,
];

// صور شاشات الأصناف والبوت (من public/media — كلها WebP خفيفة الآن)
const PUBLIC_IMAGES = [
  "/media/items/suntech-595w.webp",
  "/media/items/suntech-720w.webp",
  "/media/items/lipower-1.6kw-12v.webp",
  "/media/items/lipower-6.2kw-48v.webp",
  "/media/items/deye-8kw-1ph.webp",
  "/media/items/deye-12kw-1ph.webp",
  "/media/items/deye-16kw-1ph.webp",
  "/media/items/deye-12kw-3ph.webp",
  "/media/items/deye-16kw-3ph.webp",
  "/media/items/deye-20kw-3ph.webp",
  "/media/items/deye-50kw-3ph.webp",
  "/media/items/deye-80kw-3ph.webp",
  "/media/items/solis-50kw-3ph.webp",
  "/media/items/solis-125kw-3ph.webp",
  "/media/items/battery-pylontech-12v-100ah.webp",
  "/media/items/battery-pylontech-12v-200ah.webp",
  "/media/items/battery-hithium-12v-314ah.webp",
  "/media/items/battery-pylontech-uf5000-5.12kwh.webp",
  "/media/items/battery-pylontech-fidus-16kwh.webp",
  "/media/items/battery-hithium-legnd-16kwh.webp",
  "/media/items/actes-112kwh-heroee.webp",
  "/media/items/actes-313kwh-pylontech.webp",
  "/media/items/actes-104kwh-powercube-m1.webp",
  "/media/items/actes-61-5kwh-powercube.webp",
];

// فيديوهات المعرض: تُجهَّز في ذاكرة المتصفح الدائمة وقت الفراغ،
// فتنطلق فوراً عند فتح أي منتج (تبقى بجودتها الأصلية 1080p بلا أي ضغط).
const SHOWROOM_VIDEOS = [
  "/videos/deye-sun-3-6k-sg04lp1.mp4",
  "/videos/deye-sun-7-6-12k-sg02lp1.mp4",
  "/videos/deye-sun-14-20k-sg05lp3.mp4",
  "/videos/deye-sun-29-9-50k-sg01hp3.mp4",
  "/videos/deye-sun-60-80k-sg02hp3.mp4",
  "/videos/solis-s6-eh2p-5-8k.mp4",
  "/videos/solis-s6-eh3p-12-20k-h.mp4",
  "/videos/solis-s6-eh3p-29-9-50k-h.mp4",
  "/videos/solis-s6-eh3p-75-125k.mp4",
  "/videos/lipower-2012emh.mp4",
  "/videos/lipower-bz4024smhgw.mp4",
  "/videos/lipower-bz6248smh.mp4",
  "/videos/pylontech-uf5000.mp4",
  "/videos/pylontech-rv12100ch.mp4",
  "/videos/pylontech-rv12200.mp4",
  "/videos/pylontech-rv12314.mp4",
  "/videos/pylontech-fidus-battery-plus.mp4",
  "/videos/pylontech-optimus-a300-hy.mp4",
  "/videos/pylontech-optimus-l260-hy.mp4",
  "/videos/pylontech-powercube-m1c.mp4",
  "/videos/pylontech-powercube-m5a.mp4",
  "/videos/hithium-heroee-maxpower-16.mp4",
  "/videos/suntech-stp595s-c72-nsh.mp4",
  "/videos/suntech-stp720s-d66-nsh.mp4",
];

let done = false;

/** يحمّل الصور في ذاكرة المتصفح مرة واحدة فور بدء التطبيق، ويجهّز فيديوهات المعرض في الخلفية. */
export function preloadAppImages() {
  if (done || typeof window === "undefined") return;
  done = true;
  for (const src of [...IMAGES, ...PUBLIC_IMAGES]) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    void img.decode?.().catch(() => {});
  }
  // تجهيز الفيديوهات بعد اكتمال تحميل الصفحة حتى لا تنافس الصور على الإنترنت.
  const start = () => warmVideos(SHOWROOM_VIDEOS);
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
