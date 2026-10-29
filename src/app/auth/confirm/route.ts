import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// 가입 확인 메일의 링크가 도착하는 곳 — 토큰 검증 후 로그인 페이지로
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL("/register", request.url));
    }
  }
  return NextResponse.redirect(new URL("/login?error=confirm", request.url));
}
