import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extende a interface Session padrão para incluir o 'id'.
   */
  interface Session {
    user: {
      id: string; // Adiciona o campo ID ao usuário da sessão
    } & DefaultSession["user"]; // Mantém os campos padrão (name, email, image)
  }

  /**
   * Extende a interface User padrão (opcional, mas bom ter).
   */
  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extende a interface JWT padrão para incluir o 'id'.
   */
  interface JWT extends DefaultJWT {
    id: string;
  }
}