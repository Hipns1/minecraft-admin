"use client";

import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-sm bg-gray-950 border-gray-800 text-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Acceso Administrativo</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Ingresa tus credenciales para acceder al panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="bg-gray-900 border-gray-700 focus:border-primary"
                placeholder="usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
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
            <LoginButton />
          </form>
        </CardContent>
        <CardFooter className="justify-center text-xs text-gray-500">
          Minecraft Admin Panel v1.0
        </CardFooter>
      </Card>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Iniciando sesión..." : "Iniciar Sesión"}
    </Button>
  );
}
