"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    // Check if user is already confirmed
    checkAuthStatus();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [searchParams, router]);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push("/dashboard");
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err.message || "Failed to resend email");
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Konfirmasi Email Anda</CardTitle>
          <CardDescription className="text-base">
            Kami telah mengirim email konfirmasi ke
            {email && (
              <span className="block font-semibold text-foreground mt-2">
                {email}
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Langkah 1: Buka Email Anda</p>
                <p className="text-sm text-muted-foreground">
                  Periksa inbox email Anda untuk pesan dari AI Notes App
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Langkah 2: Klik Link Konfirmasi</p>
                <p className="text-sm text-muted-foreground">
                  Klik tombol atau link konfirmasi di dalam email
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Langkah 3: Mulai Gunakan</p>
                <p className="text-sm text-muted-foreground">
                  Anda akan otomatis diarahkan ke dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-yellow-900 dark:text-yellow-200">
                  Email tidak ditemukan?
                </p>
                <ul className="text-sm text-yellow-800 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Periksa folder <strong>Spam</strong> atau <strong>Junk</strong></li>
                  <li>Tunggu beberapa menit (email bisa terlambat)</li>
                  <li>Pastikan email yang Anda masukkan benar</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {resendSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
                ✓ Email konfirmasi berhasil dikirim ulang!
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
                {resendError}
              </div>
            )}

            <Button
              onClick={handleResendEmail}
              disabled={resending || !email}
              variant="outline"
              className="w-full"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim ulang...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Kirim Ulang Email Konfirmasi
                </>
              )}
            </Button>

            <Button
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full"
            >
              Kembali ke Login
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Sudah konfirmasi email?{" "}
              <button
                onClick={checkAuthStatus}
                className="text-primary hover:underline font-medium"
              >
                Refresh halaman ini
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
