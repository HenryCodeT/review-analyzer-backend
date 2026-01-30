// Example Test - Use Case

/*
import { AnalyzeCommentUseCase } from '../application/analysis.usecase';
import { IAIService } from '../domain/analysis.ai';
import { IAnalysisRepository } from '../domain/analysis.repository';

const mockAIService: IAIService = {
  analyzeComment: jest.fn().mockResolvedValue({
    summary: 'Test summary',
    sentiment: 'NEGATIVE',
    severity: 'HIGH',
    category: 'LOGISTICS',
    suggestedActions: ['Action 1', 'Action 2'],
    suggestedResponse: 'Test response',
    tokensUsed: { input: 100, output: 200, total: 300 },
  }),
  getModelInfo: jest.fn().mockReturnValue({
    provider: 'gemini',
    version: 'test-model',
  }),
};

const mockRepository: IAnalysisRepository = {
  save: jest.fn().mockResolvedValue({
    id: 'test-id',
    rawText: 'test',
    summary: 'Test summary',
    sentiment: 'NEGATIVE',
    severity: 'HIGH',
    category: 'LOGISTICS',
    suggestedActions: ['Action 1'],
    suggestedResponse: 'Test response',
    modelProvider: 'gemini',
    modelVersion: 'test-model',
    channel: 'test',
    country: 'MX',
    createdAt: new Date(),
  }),
  findById: jest.fn(),
  findHistory: jest.fn(),
};

describe('AnalyzeCommentUseCase', () => {
  let useCase: AnalyzeCommentUseCase;

  beforeEach(() => {
    useCase = new AnalyzeCommentUseCase(mockAIService, mockRepository);
  });

  it('should analyze a comment successfully', async () => {
    const request = {
      text: 'El producto llegó roto',
      channel: 'post_sale',
      country: 'MX',
      language: 'es',
    };

    const result = await useCase.execute(request);

    expect(result.analysisId).toBeDefined();
    expect(result.sentiment).toBe('NEGATIVE');
    expect(result.severity).toBe('HIGH');
    expect(mockAIService.analyzeComment).toHaveBeenCalledWith(
      request.text,
      { channel: request.channel, country: request.country, language: request.language }
    );
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw error if text is empty', async () => {
    const request = { text: '', channel: 'post_sale', country: 'MX' };
    await expect(useCase.execute(request)).rejects.toThrow('texto del comentario es requerido');
  });

  it('should throw error if channel is missing', async () => {
    const request = { text: 'Test comment', channel: '', country: 'MX' };
    await expect(useCase.execute(request)).rejects.toThrow('canal es requerido');
  });
});
*/

export {};
