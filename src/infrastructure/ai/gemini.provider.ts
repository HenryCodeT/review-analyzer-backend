// Infrastructure: Gemini AI Provider

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  IAIService,
  AIReviewResult,
  AIAnalysisResult,
} from '../../domain/review.ai';
import { Sentiment } from '../../domain/review.entity';

export class GeminiAIService implements IAIService {
  private model: ChatGoogleGenerativeAI;
  private readonly modelName = 'gemini-2.0-flash';

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      modelName: this.modelName,
      temperature: 0.3,
      maxOutputTokens: 1000,
    });
  }

  async analyzeComment(
    text: string,
    context: { language?: string },
  ): Promise<AIAnalysisResult> {
    const prompt = this.buildPrompt(text, context);
    const start = Date.now();
    const response = await this.model.invoke(prompt);
    const latencyMs = Date.now() - start;

    const content = response.content.toString();
    const meta = response.usage_metadata as
      | { input_tokens?: number; output_tokens?: number; total_tokens?: number }
      | undefined;

    return {
      review: this.parseResponse(content),
      usage: {
        inputTokens: meta?.input_tokens ?? 0,
        outputTokens: meta?.output_tokens ?? 0,
        totalTokens: meta?.total_tokens ?? 0,
        latencyMs,
      },
    };
  }

  getModelInfo(): { provider: string; version: string } {
    return {
      provider: 'gemini',
      version: this.modelName,
    };
  }

  private buildPrompt(text: string, context: { language?: string }): string {
    return `Eres un asistente de análisis de comentarios de clientes de e-commerce.

IDIOMA: ${context.language || 'detectar automáticamente'}

COMENTARIO DEL CLIENTE:
"${text}"

INSTRUCCIONES:
Analiza el comentario y proporciona:
1. RESUMEN: Un resumen breve del problema (máximo 2 líneas)
2. SENTIMIENTO: POSITIVE, NEUTRAL o NEGATIVE
3. ACCIONES: Lista de 2-4 acciones sugeridas
4. RESPUESTA: Una respuesta profesional y empática para el cliente

FORMATO DE RESPUESTA (usar exactamente este formato JSON):
{
  "summary": "tu resumen aquí",
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "suggestedActions": ["acción 1", "acción 2", "acción 3"],
  "suggestedResponse": "tu respuesta aquí"
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`;
  }

  private parseResponse(content: string): AIReviewResult {
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?$/g, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);

      return {
        summary: parsed.summary || 'Sin resumen',
        sentiment: this.validateSentiment(parsed.sentiment),
        suggestedActions: Array.isArray(parsed.suggestedActions)
          ? parsed.suggestedActions.slice(0, 5)
          : ['Revisar manualmente'],
        suggestedResponse:
          parsed.suggestedResponse || 'Por favor, contáctanos para ayudarte.',
      };
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      return this.getFallbackResponse();
    }
  }

  private validateSentiment(value: string): Sentiment {
    const valid: Sentiment[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
    return valid.includes(value as Sentiment)
      ? (value as Sentiment)
      : 'NEUTRAL';
  }

  private getFallbackResponse(): AIReviewResult {
    return {
      summary: 'No se pudo analizar el comentario automáticamente',
      sentiment: 'NEUTRAL',
      suggestedActions: ['Revisar manualmente el comentario'],
      suggestedResponse:
        'Gracias por tu comentario. Estamos revisando tu caso.',
    };
  }
}
