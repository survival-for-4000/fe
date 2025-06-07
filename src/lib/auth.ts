// lib/auth.ts
// import { createClient } from "@supabase/supabase-js";
// import type { User } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export const handleSignIn = async (): Promise<void> => {
//   const { error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//   });
//   if (error) console.error("Error:", error);
// };

export const handleSignIn = async (): Promise<void> => {
  // Spring Boot Google OAuth 엔드포인트로 리디렉션
  window.location.href =
    "http://localhost:8090/oauth2/authorization/google?redirect_uri=http://localhost:3000/";
};

// export const handleSignOut = async (): Promise<void> => {
//   const { error } = await supabase.auth.signOut();
//   if (error) console.error("Error:", error);
// };

export const handleSignOut = async (): Promise<void> => {
  try {
    const res = await fetch("http://localhost:8090/api/auth/logout", {
      method: "POST",
      credentials: "include", // 쿠키 포함
    });

    if (res.ok) {
      // ✅ 로그아웃 후 프론트 초기화 or 메인으로 이동
      window.location.href = "http://localhost:3000"; // 또는 "/"
    } else {
      console.error("로그아웃 실패:", res.status);
    }
  } catch (error) {
    console.error("로그아웃 중 예외 발생:", error);
  }
};
