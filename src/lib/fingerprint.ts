/**
 * 设备指纹生成器
 *
 * 原理：采集浏览器特征信息（屏幕分辨率、时区、语言、Canvas 指纹等），
 * 通过 SHA-256 哈希生成一个近似唯一的设备标识。
 * 指纹缓存在 localStorage 中，避免重复计算。
 *
 * 用途：作为点赞防刷的轻量方案 —— 同一设备对同一文章只能点赞一次。
 */

/**
 * 采集浏览器特征并生成 SHA-256 哈希的设备指纹
 */
async function generateFingerprint(): Promise<string> {
  const components: string[] = [
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform ?? "unknown",
    String(navigator.hardwareConcurrency || 0),
  ];

  // Canvas 指纹 —— 不同设备/GPU 渲染结果有细微差异
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Hello, world! 🌍", 2, 15);
      // 取图片数据的最后 60 个字符作为特征
      components.push(canvas.toDataURL().slice(-60));
    }
  } catch {
    components.push("canvas-blocked");
  }

  const fingerprint = components.join("|");
  return await sha256(fingerprint);
}

/**
 * 对字符串做 SHA-256 哈希，返回十六进制字符串
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 获取设备指纹（优先从 localStorage 缓存读取）
 */
export async function getFingerprint(): Promise<string> {
  const cached = localStorage.getItem("like_fingerprint");
  if (cached) return cached;

  const fingerprint = await generateFingerprint();
  localStorage.setItem("like_fingerprint", fingerprint);
  return fingerprint;
}
