import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Plane } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/fleet", { replace: true });
  }, [user, navigate]);

  if (loading) return null;
  if (user) return <Navigate to="/fleet" replace />;

  const submit = async (mode: "signin" | "signup") => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/fleet` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in failed");
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-gradient-sky flex items-center justify-center">
            <Plane className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl font-bold">Flight School CRM</h1>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          {(["signin", "signup"] as const).map((m) => (
            <TabsContent key={m} value={m} className="space-y-3">
              <div>
                <Label htmlFor={`${m}-email`}>Email</Label>
                <Input id={`${m}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`${m}-pw`}>Password</Label>
                <Input id={`${m}-pw`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button className="w-full" disabled={busy} onClick={() => submit(m)}>
                {m === "signin" ? "Sign in" : "Create account"}
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" disabled={busy} onClick={google}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
