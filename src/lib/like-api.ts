/**
 * Supabase 客户端 & 点赞 API 封装
 *
 * 环境变量（需要添加到 .env 和部署平台）：
 * - PUBLIC_SUPABASE_URL     你的 Supabase 项目 URL
 * - PUBLIC_SUPABASE_ANON_KEY Supabase 的 anon/public key（可公开暴露）
 *
 * 数据库准备：在 Supabase SQL Editor 中执行下面的 SQL（见 README 注释）
 */

/* ============================================================
   需要在 Supabase SQL Editor 中执行的 SQL：

   -- 1. 点赞记录表（page_path + fingerprint 唯一，防重复点赞）
   CREATE TABLE page_likes (
     page_path   TEXT NOT NULL,
     fingerprint TEXT NOT NULL,
     liked_at    TIMESTAMPTZ DEFAULT now(),
     CONSTRAINT unique_page_like UNIQUE (page_path, fingerprint)
   );

   -- 2. 点赞计数物化视图（也可直接用 COUNT 查询，小规模无需）
   CREATE VIEW page_like_counts AS
   SELECT page_path, COUNT(*)::int AS like_count
   FROM page_likes
   GROUP BY page_path;

   -- 3. RLS 策略：允许 anon 角色读写（生产环境按需收紧）
   ALTER TABLE page_likes ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "allow_public_read_write" ON page_likes
     FOR ALL USING (true);

   ============================================================ */

import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "astro:env/client";
import { getFingerprint } from "./fingerprint";

// ---- Supabase 客户端（模块级单例）----

const supabaseUrl = PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** 是否已配置 Supabase（缺少任一环境变量则禁用点赞功能） */
export const isSupabaseReady = !!(supabaseUrl && supabaseAnonKey);

// ---- 点赞 API ----

export interface LikeStatus {
  /** 当前用户是否已点赞 */
  liked: boolean;
  /** 该文章的总点赞数 */
  likeCount: number;
}

/**
 * 获取某篇文章的点赞状态和总数
 * @param pagePath 文章唯一标识（如 "posts/games/minecraft"）
 */
export async function getLikeStatus(pagePath: string): Promise<LikeStatus> {
  const fingerprint = await getFingerprint();

  // 并行查询：总数 + 当前用户是否已点赞
  const [{ count }, { data: userLike }] = await Promise.all([
    supabase
      .from("page_likes")
      .select("*", { count: "exact", head: true })
      .eq("page_path", pagePath),

    supabase
      .from("page_likes")
      .select("fingerprint")
      .eq("page_path", pagePath)
      .eq("fingerprint", fingerprint)
      .maybeSingle(),
  ]);

  return {
    likeCount: count ?? 0,
    liked: !!userLike,
  };
}

/**
 * 切换点赞状态：未点赞 → 点赞；已点赞 → 取消
 * 利用 Supabase 的 UNIQUE 约束天然防并发重复
 * @returns 切换后的状态
 */
export async function toggleLike(
  pagePath: string
): Promise<LikeStatus | null> {
  const fingerprint = await getFingerprint();

  // 先查询当前是否已点赞
  const { data: existing } = await supabase
    .from("page_likes")
    .select("fingerprint")
    .eq("page_path", pagePath)
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (existing) {
    // 已点赞 → 取消
    const { error } = await supabase
      .from("page_likes")
      .delete()
      .eq("page_path", pagePath)
      .eq("fingerprint", fingerprint);

    if (error) {
      console.error("取消点赞失败:", error);
      return null;
    }
  } else {
    // 未点赞 → 添加（UNIQUE 约束自动防止并发重复插入）
    const { error } = await supabase
      .from("page_likes")
      .insert({ page_path: pagePath, fingerprint });

    if (error) {
      // 409 冲突说明竞态条件（并发点了两次），当作成功
      if (error.code === "23505") {
        return getLikeStatus(pagePath);
      }
      console.error("点赞失败:", error);
      return null;
    }
  }

  // 重新查询最新状态和总数
  return getLikeStatus(pagePath);
}
