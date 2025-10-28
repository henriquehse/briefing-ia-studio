import { z } from 'zod';

// Schema de Login
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

// Schema de Onboarding
export const onboardingSchema = z.object({
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  industry: z.string().min(2, 'Setor é obrigatório'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Schema de Copy Lab
export const copyLabSchema = z.object({
  userInfo: z.string().min(50, 'Forneça pelo menos 50 caracteres sobre o contexto'),
  agentDirective: z.string().min(30, 'A diretiva do agente precisa ter pelo menos 30 caracteres'),
});

export type CopyLabFormData = z.infer<typeof copyLabSchema>;
