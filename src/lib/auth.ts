// lib/auth.ts
import { createClient } from "@supabase/supabase-js";
// import type { User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// export const handleSignIn = async (): Promise<void> => {
//   const { error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//   });
//   if (error) console.error("Error:", error);
// };

export const handleSignIn = async (): Promise<void> => {
  // Spring Boot Google OAuth 엔드포인트로 리디렉션
  window.location.href = "https://api.hoit.ai.kr/oauth2/authorization/google";
};

// export const handleSignOut = async (): Promise<void> => {
//   const { error } = await supabase.auth.signOut();
//   if (error) console.error("Error:", error);
// };

export const handleSignOut = async (): Promise<void> => {
  // 로그아웃 처리 시 Spring 서버 로그아웃 URL이 있다면 거기로 보내기
  window.location.href = "https://api.hoit.ai.kr/api/auth/logout";
};
