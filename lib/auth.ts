import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email', 
          placeholder: 'seu@email.com' 
        },
        password: { 
          label: 'Senha', 
          type: 'password' 
        },
      },
      async authorize(credentials) {
        // Validação básica
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais ausentes');
          return null;
        }

        console.log('🔍 Tentativa de login:', credentials.email);

        // Verificar variáveis de ambiente
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          console.error('❌ Variáveis de ambiente não configuradas');
          return null;
        }

        // Validar credenciais
        if (
          credentials.email === adminEmail &&
          credentials.password === adminPassword
        ) {
          console.log('✅ Login bem-sucedido');
          
          return {
            id: '1',
            email: adminEmail,
            name: 'Admin',
          };
        }

        console.log('❌ Credenciais inválidas');
        return null;
      },
    }),
  ],
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};
