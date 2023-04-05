import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: TelegramBot;
  private reminderInterval: NodeJS.Timeout;

  async onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.bot = new TelegramBot(token, { polling: true });

    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.startReminder(chatId);
      this.bot.sendMessage(chatId, '紀錄提醒已啟動。');
    });

    this.bot.onText(/\/stop/, (msg) => {
      const chatId = msg.chat.id;
      this.stopReminder();
      this.bot.sendMessage(chatId, '紀錄提醒已停止。');
    });

    this.bot.onText(/\/review (.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const date = match[1];
      this.review(chatId, date);
    });
  }

  startReminder(chatId: number) {
    // 計算到下一個整點的毫秒數
    const now = new Date();
    const millisecondsToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;

    // 延遲執行，以便在整點時啟動計時器
    setTimeout(() => {
      this.sendReminder(chatId);

      // 每小時發送提醒
      this.reminderInterval = setInterval(() => {
        this.sendReminder(chatId);
      }, 60 * 60 * 1000);
    }, millisecondsToNextHour);
  }

  sendReminder(chatId: number) {
    const now = new Date();
    this.bot.sendMessage(
      chatId,
      `現在是整點，請記得進行紀錄。現在時間：${now.getHours()}:00`,
    );
  }

  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }

  review(chatId: number, date: string) {
    // 在此處實現您的回顧邏輯，例如查詢資料庫並回傳結果。
    // 您可能需要將查詢結果轉換成合適的格式，然後使用 `this.bot.sendMessage(chatId, response)` 來回應。
  }
}
