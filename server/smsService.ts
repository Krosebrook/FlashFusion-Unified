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

function isE164(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}

export class SmsService {
  async sendSms(fromUserId: string, toPhoneNumber: string, content: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!twilioClient) {
      return { success: false, error: 'SMS service not configured' };
    }

    if (!isE164(toPhoneNumber)) {
      return { success: false, error: 'Invalid phone number format. Use E.164 (e.g., +15551234567).' };
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Message content is required.' };
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
    } catch (error: any) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  async getUserSmsHistory(userId: string) {
    return await storage.getUserSmsMessages(userId);
  }

  // Webhook handler for Twilio status updates
  async handleTwilioWebhook(body: any) {
    const { MessageSid, MessageStatus } = body || {};
    
    if (!MessageSid || !MessageStatus) {
      return { success: false, error: 'Invalid webhook data' };
    }

    try {
      const existing = await storage.findSmsMessageByTwilioSid(MessageSid);
      if (!existing) {
        // Nothing to update; acknowledge to avoid retries
        return { success: true, message: 'No matching message; acknowledged' };
      }

      await storage.updateSmsMessageStatus(existing.id, MessageStatus.toLowerCase());
      return { success: true };
    } catch (error: any) {
      console.error('Webhook processing failed:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
}

export const smsService = new SmsService();