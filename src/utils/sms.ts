import { config } from '../config';
import { logger } from './logger';

// Mock SMS provider (logs OTPs to file/console)
import * as fs from 'fs';
import * as path from 'path';

export interface SMSProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
}

class MockSMSProvider implements SMSProvider {
  private otpLogPath = path.join(process.cwd(), 'logs', 'otp.log');

  async sendSMS(to: string, message: string): Promise<boolean> {
    const logEntry = `[${new Date().toISOString()}] To: ${to}, Message: ${message}\n`;
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.otpLogPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(this.otpLogPath, logEntry);
    
    logger.info(`[MOCK SMS] ${logEntry.trim()}`);
    console.log(`\n==================== MOCK SMS ====================`);
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log(`==================================================\n`);
    
    return true;
  }
}

class TwilioSMSProvider implements SMSProvider {
  private client: any;

  constructor() {
    // Only import and initialize Twilio if actually using it
    if (config.sms.twilio.accountSid && config.sms.twilio.authToken) {
      const twilio = require('twilio');
      this.client = twilio(
        config.sms.twilio.accountSid,
        config.sms.twilio.authToken
      );
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('Twilio client not initialized');
      }

      await this.client.messages.create({
        body: message,
        from: config.sms.twilio.phoneNumber,
        to: to,
      });

      logger.info(`SMS sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      return false;
    }
  }
}

// Factory function to get the appropriate SMS provider
export function getSMSProvider(): SMSProvider {
  if (config.sms.provider === 'twilio') {
    return new TwilioSMSProvider();
  }
  return new MockSMSProvider();
}

export const smsProvider = getSMSProvider();
