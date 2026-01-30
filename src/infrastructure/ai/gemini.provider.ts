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
    return `Eres un asistente experto en análisis de sentimiento de comentarios de clientes de e-commerce.

IDIOMA: ${context.language || 'detectar automáticamente'}

COMENTARIO DEL CLIENTE:
"${text}"

INSTRUCCIONES:
Analiza el comentario y proporciona:
1. RESUMEN: Breve descripción del comentario (máximo 2 líneas).
2. SENTIMIENTO: Clasifica según estas reglas:
   - POSITIVE: El cliente expresa satisfacción, agradecimiento o experiencia favorable. Incluso si menciona un problema menor, el tono general es positivo.
   - NEGATIVE: El cliente expresa frustración, queja, decepción o insatisfacción. Cualquier mención de problemas no resueltos, daños o mal servicio.
   - NEUTRAL: El cliente hace una pregunta, solicitud de información o sugerencia sin carga emocional clara. No hay satisfacción ni insatisfacción evidente.
   En caso de sentimientos mixtos, prioriza el sentimiento dominante. Si hay un problema concreto (producto dañado, retraso, etc.), clasifica como NEGATIVE aunque el tono sea educado.
3. ACCIONES: Lista de 2-4 acciones sugeridas para un agente de soporte.
4. RESPUESTA: Redacta una respuesta profesional, empática y personalizada lista para enviar al cliente.

EJEMPLOS:
- "El producto llegó bien pero el envío tardó más de lo esperado" → NEGATIVE (problema concreto: retraso en envío)
- "Gracias por la atención, todo perfecto" → POSITIVE (satisfacción clara)
- "¿Tienen este producto en color rojo?" → NEUTRAL (consulta sin carga emocional)
- "El producto es bueno pero llegó con la caja rota" → NEGATIVE (daño en el envío pesa más que la calidad)
- "Sería útil agregar más opciones de pago" → NEUTRAL (sugerencia constructiva)
- "Recibí mi pedido antes de lo esperado, excelente servicio" → POSITIVE (experiencia favorable)

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
