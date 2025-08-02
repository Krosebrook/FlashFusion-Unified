import Twilio from 'twilio';
import { storage } from './storage';
import type { InsertSmsMessage } from '../shared/schema';

// Check for Twilio credentials
const hasTwilioCredentials = process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_PHONE_NUMBER &&
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC');

if (!hasTwilioCredentials) {
  console.warn('Twilio credentials not properly configured. SMS functionality will not work.');
}

const twilioClient = hasTwilioCredentials
  ? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export class SmsService {
  async sendSms(fromUserId: string, toPhoneNumber: string, content: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!twilioClient) {
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      // Create SMS message record first
      const smsMessage = await storage.createSmsMessage({
        fromUserId,
        toPhoneNumber,
        content,
        status: 'pending'
      });

      // Send via Twilio
      const message = await twilioClient.messages.create({
        body: content,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: toPhoneNumber,
      });

      // Update with Twilio SID and status
      await storage.updateSmsMessageStatus(smsMessage.id, 'sent', message.sid);

      return { success: true, messageId: smsMessage.id };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserSmsHistory(userId: string) {
    return await storage.getUserSmsMessages(userId);
  }

  // Webhook handler for Twilio status updates
  async handleTwilioWebhook(body: any) {
    const { MessageSid, MessageStatus } = body;
    
    if (!MessageSid || !MessageStatus) {
      return { success: false, error: 'Invalid webhook data' };
    }

    try {
      // Find message by Twilio SID and update status
      // Note: We'd need to add a method to find by Twilio SID
      console.log(`SMS ${MessageSid} status updated to: ${MessageStatus}`);
      return { success: true };
    } catch (error) {
      console.error('Webhook processing failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const smsService = new SmsService();