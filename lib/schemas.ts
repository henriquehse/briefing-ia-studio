import { z } from 'zod';

/**
 * Schema de Login
 */
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema de Onboarding (dados pessoais + API key)
 */
export const onboardingSchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    company: z.string().optional(),
    geminiApiKey: z.string().min(20, 'Chave da API Gemini inválida'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

/**
 * Schema de Formulário Adaptativo (briefing inicial)
 */
export const briefingSchema = z.object({
    assetType: z.enum(['site', 'landing-page', 'app', 'sistema']),
    description: z.string().min(10, 'Descreva com mais detalhes'),
    referenceUrl: z.string().url('URL inválida').optional().or(z.literal('')),
    services: z.array(z.string()).min(1, 'Selecione pelo menos um serviço'),
});

export type BriefingFormData = z.infer<typeof briefingSchema>;

/**
 * Schema de Upload de Arquivos (Copy Lab)
 */
export const uploadSchema = z.object({
    files: z
        .array(z.instanceof(File))
        .min(1, 'Envie pelo menos um arquivo')
        .max(10, 'Máximo de 10 arquivos'),
    directive: z.string().min(20, 'Diretiva deve ter no mínimo 20 caracteres'),
});

export type UploadFormData = z.infer<typeof uploadSchema>;
