import { Message, MessageMetadata } from '@mochiport/shared';

// Azure OpenAI Client のインポートを追加 (v4対応)
import OpenAI from 'openai';

export interface AIModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface AIServiceResponse {
  text: string;
  metadata: MessageMetadata;
}

export interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  apiVersion: string;
  deploymentName: string;
  modelName: string;
}

/**
 * AI サービスのインターフェイス
 * 実際の実装では Azure OpenAI などへの接続を行う
 */
export interface IAIService {
  /**
   * AIモデルにメッセージを送信し、応答を取得する
   * @param messages 送信するメッセージ履歴
   * @param config AIモデルの設定
   */
  generateResponse(messages: Message[], config?: AIModelConfig): Promise<AIServiceResponse>;
  
  /**
   * テキストを要約する
   * @param text 要約するテキスト
   */
  summarizeText(text: string, maxLength?: number): Promise<string>;
}

/**
 * AIサービスのモック実装
 * 実際のAPIに接続せず、決まったレスポンスを返す
 */
export class MockAIService implements IAIService {
  /**
   * モックの応答を生成する
   */
  async generateResponse(messages: Message[], _config?: AIModelConfig): Promise<AIServiceResponse> {
    // 処理時間をシミュレート
    const startTime = Date.now();
    await this.delay(500 + Math.random() * 1000);
    
    // 最後のユーザーメッセージを取得
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      throw new Error('No user message found to respond to');
    }
    
    // ユーザーメッセージの内容に応じたレスポンスを返す
    const response = this.getResponseForMessage(lastUserMessage.content);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    return {
      text: response,
      metadata: {
        tokens: Math.floor(response.length / 4) + Math.floor(Math.random() * 30),
        processingTime,
        confidence: 0.7 + (Math.random() * 0.3)
      }
    };
  }
  
  /**
   * モックの要約を生成する
   */
  async summarizeText(text: string, maxLength: number = 100): Promise<string> {
    await this.delay(300 + Math.random() * 500);
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * 指定したミリ秒だけ遅延する
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * ユーザーメッセージに対応するモックレスポンスを返す
   */
  private getResponseForMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // 挨拶に対するレスポンス
    if (lowerMessage.includes('こんにちは') || lowerMessage.includes('hello')) {
      return 'こんにちは！どのようにお手伝いできますか？';
    }
    
    // 質問に対するレスポンス
    if (lowerMessage.includes('?') || lowerMessage.includes('？') || 
        lowerMessage.includes('何') || lowerMessage.includes('教えて')) {
      return 'ご質問いただきありがとうございます。具体的な情報を調査し、正確な回答を提供します。追加情報があればお知らせください。';
    }
    
    // 会話のトピックに応じたレスポンス
    if (lowerMessage.includes('ai')) {
      return 'AI技術は日々進化しています。最近のトレンドとしては、大規模言語モデルの進化、マルチモーダルAI、エッジAIなどが注目されています。他に興味のある分野はありますか？';
    }
    
    if (lowerMessage.includes('プログラミング') || lowerMessage.includes('コード')) {
      return 'プログラミングについてのご質問ですね。特定の言語や問題について詳しく教えていただければ、より具体的なサポートができます。';
    }
    
    // デフォルトのレスポンス
    return 'ご連絡ありがとうございます。お手伝いできることがあれば、お知らせください。より具体的な内容をいただけると、より適切な回答ができます。';
  }
}

/**
 * Azure OpenAI サービスの実装
 */
export class AzureOpenAIService implements IAIService {
  private client: OpenAI;
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: `${config.endpoint}/openai/deployments/${config.deploymentName}`,
      defaultQuery: { 'api-version': config.apiVersion },
      defaultHeaders: {
        'api-key': config.apiKey,
      },
    });
  }

  async generateResponse(messages: Message[], config?: AIModelConfig): Promise<AIServiceResponse> {
    const startTime = Date.now();

    try {
      // Messages を OpenAI 形式に変換
      const openAIMessages = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      const response = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: openAIMessages,
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 1000,
        top_p: config?.topP ?? 1,
      });

      const choice = response.choices[0];
      if (!choice.message?.content) {
        throw new Error('No response content received from Azure OpenAI');
      }

      const processingTime = (Date.now() - startTime) / 1000;

      return {
        text: choice.message.content,
        metadata: {
          tokens: response.usage?.total_tokens ?? 0,
          processingTime,
          confidence: 0.9, // Azure OpenAI では信頼度は提供されないため固定値
        },
      };
    } catch (error) {
      console.error('Azure OpenAI API Error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async summarizeText(text: string, maxLength: number = 100): Promise<string> {
    try {
      const prompt = `以下のテキストを${maxLength}文字以内で要約してください：\n\n${text}`;

      const response = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: Math.ceil(maxLength * 1.5), // 余裕を持った文字数制限
      });

      const choice = response.choices[0];
      if (!choice.message?.content) {
        throw new Error('No summary content received from Azure OpenAI');
      }

      return choice.message.content.trim();
    } catch (error) {
      console.error('Azure OpenAI Summarization Error:', error);
      // フォールバック: 単純な切り詰め
      return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + '...';
    }
  }
}

/**
 * AIサービスファクトリー
 * 環境変数に基づいてモックまたは実際のサービスを返す
 */
export class AIServiceFactory {
  private static instance: IAIService | null = null;

  static getInstance(): IAIService {
    if (this.instance) {
      return this.instance;
    }

    const useMock = process.env.USE_MOCK_AI_SERVICE === 'true';

    if (useMock) {
      console.log('Using Mock AI Service');
      this.instance = new MockAIService();
    } else {
      console.log('Using Azure OpenAI Service');
      
      const azureConfig: AzureOpenAIConfig = {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        apiKey: process.env.AZURE_OPENAI_API_KEY || '',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
        modelName: process.env.AZURE_OPENAI_MODEL_NAME || 'gpt-4',
      };

      // 必須環境変数のチェック
      if (!azureConfig.endpoint || !azureConfig.apiKey) {
        console.warn('Azure OpenAI configuration incomplete, falling back to Mock AI Service');
        this.instance = new MockAIService();
      } else {
        this.instance = new AzureOpenAIService(azureConfig);
      }
    }

    return this.instance;
  }

  // テスト用にインスタンスをリセット
  static resetInstance(): void {
    this.instance = null;
  }
}

// デフォルトエクスポート
export const aiService = AIServiceFactory.getInstance();
