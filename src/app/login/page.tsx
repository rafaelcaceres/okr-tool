"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = flow === "signUp";
  const hasMinLength = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/planejamento");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);

    try {
      await signIn("password", formData);
      router.replace("/planejamento");
    } catch {
      setError(
        flow === "signIn"
          ? "Email ou senha inválidos."
          : "Não foi possível criar a conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">OKR Tool</CardTitle>
          <CardDescription>
            {flow === "signIn"
              ? "Entre com sua conta"
              : "Crie uma nova conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isSignUp && password.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  {hasMinLength ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className={hasMinLength ? "text-emerald-500" : "text-muted-foreground"}>
                    Mínimo de 8 caracteres
                  </span>
                </div>
              )}
            </div>
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    {passwordsMatch ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className={passwordsMatch ? "text-emerald-500" : "text-muted-foreground"}>
                      {passwordsMatch ? "Senhas coincidem" : "Senhas não coincidem"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading || (isSignUp && (!hasMinLength || !passwordsMatch))}>
              {loading
                ? "Carregando..."
                : isSignUp
                  ? "Criar conta"
                  : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {flow === "signIn" ? (
              <p>
                Não tem conta?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-primary"
                  onClick={() => {
                    setFlow("signUp");
                    setError("");
                    setPassword("");
                    setConfirmPassword("");
                    setName("");
                  }}
                >
                  Criar conta
                </button>
              </p>
            ) : (
              <p>
                Já tem conta?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-primary"
                  onClick={() => {
                    setFlow("signIn");
                    setError("");
                    setPassword("");
                    setConfirmPassword("");
                    setName("");
                  }}
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
