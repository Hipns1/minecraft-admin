import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string() })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;
                    // In a real app, use hashed passwords.
                    // For this specific request, we use simple env var check.
                    const adminUser = process.env.ADMIN_USER || "admin";
                    const adminPass = process.env.ADMIN_PASSWORD || "admin";

                    if (username === adminUser && password === adminPass) {
                        return {
                            id: "1",
                            name: adminUser,
                            email: "admin@localhost"
                        };
                    }
                }
                return null;
            },
        }),
    ],
})
