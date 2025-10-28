import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const copyLabSchema = z.object({
  userInfo: z.string().min(50, 'Forneça pelo menos 50 caracteres sobre o contexto'),
  agentDirective: z.string().min(30, 'A diretiva do agente precisa ter pelo menos 30 caracteres'),
});

export type CopyLabFormData = z.infer<typeof copyLabSchema>;
