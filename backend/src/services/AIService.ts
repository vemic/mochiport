
import { Message, MessageRole, MessageMetadata } from '@ai-chat/shared';

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
  async generateResponse(messages: Message[], config?: AIModelConfig): Promise<AIServiceResponse> {
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
 * 実際のAIサービス実装（モックで代用）
 * 将来的には実際のAzure OpenAIなどに接続する実装に置き換える
 */
export class AIService extends MockAIService {
  // 将来的な実装のためのプレースホルダー
  // Azure OpenAI 接続情報などを追加
}
