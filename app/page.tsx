"use client";

import React, { useState, useTransition } from "react";
import { authenticate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const error = await authenticate(undefined, formData);
        if (error) {
          setErrorMessage(error);
        }
      } catch (e) {
        // If it's a redirect error, it might be caught here depending on environment,
        // but usually Next.js handles it. 
        // If it's a real error, show generic message
        console.error(e);
        // We usually don't set error message for redirects
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-sm bg-gray-950 border-gray-800 text-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Admin Access</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access the console
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="bg-gray-900 border-gray-700 focus:border-primary"
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-gray-900 border-gray-700 focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            {errorMessage && (
              <div
                className="p-3 text-sm text-red-500 bg-red-950/30 rounded-md border border-red-900"
                role="alert"
              >
                {errorMessage}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-xs text-gray-500">
          Minecraft Admin Panel v1.0
        </CardFooter>
      </Card>
    </div>
  );
}
