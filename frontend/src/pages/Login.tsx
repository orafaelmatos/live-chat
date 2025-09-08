import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthCard } from "@/components/ui/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const success = await login(email, password);

    if (success) {
      navigate("/rooms");
    }
    setLoading(false);
  };

  return (
    <AuthCard title="Welcome to Live Chat" description="Sign in to your account to continue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-input border-border"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          disabled={loading || !email || !password}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
      <div className="text-center pt-4 border-t border-border/50">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <div className="text-center pt-4 border-t border-border/50 space-y-2">
        <p className="text-muted-foreground">Or use one of these credentials:</p>
        {[
          { email: "test1@testing.com", password: "test123" },
          { email: "test2@testing.com", password: "test123" },
        ].map((cred) => (
          <button
            key={cred.email}
            type="button"
            className="text-primary hover:underline font-medium block mx-auto"
            onClick={async () => {
              setEmail(cred.email);
              setPassword(cred.password);
              setLoading(true);
              const success = await login(cred.email, cred.password);
              if (success) navigate("/rooms");
              setLoading(false);
            }}
          >
            {cred.email} - {cred.password}
          </button>
        ))}
      </div>
    </AuthCard>
  );
};

export default Login;
