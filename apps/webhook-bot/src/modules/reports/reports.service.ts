import { Logger } from '@spraxium/logger';
import { Send, WebhookSender } from '@spraxium/webhook';
import { EmbedBuilder } from 'discord.js';

@WebhookSender()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  @Send('reports')
  async buildDailySummary(): Promise<string> {
    const date = new Date().toDateString();
    this.logger.debug(`Building daily summary for ${date}`);
    return `Daily summary: ${date}: all systems nominal.`;
  }

  @Send('alerts')
  async buildErrorReport(error: Error): Promise<EmbedBuilder> {
    this.logger.warn(`Building error report for: ${error.message}`);

    return new EmbedBuilder()
      .setTitle('Error Report')
      .setDescription(`\`\`\`\n${error.message}\n\`\`\``)
      .setColor(0xed4245)
      .setTimestamp()
      .setFooter({ text: 'Spraxium webhook-bot' });
  }

  @Send('logs')
  async buildActivityLog(action: string, userId: string): Promise<{ content: string }> {
    return { content: `Activity: \`${action}\` by <@${userId}> at ${new Date().toISOString()}` };
  }
}
