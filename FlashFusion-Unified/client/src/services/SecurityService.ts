interface SecurityLog {
  type: string;
  data: any;
  timestamp: string;
}

export class SecurityService {
  private static logs: SecurityLog[] = [];

  static logActivity(type: string, data: any) {
    const log: SecurityLog = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(log);
    
    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // In production, you might want to send these to a backend service
    if (process.env.NODE_ENV === 'production') {
      // Send to backend logging service
      this.sendToBackend(log);
    } else {
      console.log('Security Log:', log);
    }
  }

  static getLogs(type?: string): SecurityLog[] {
    if (type) {
      return this.logs.filter(log => log.type === type);
    }
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }

  private static async sendToBackend(log: SecurityLog) {
    // Implementation for sending logs to backend
    try {
      await fetch('/api/security/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log)
      });
    } catch (error) {
      console.error('Failed to send security log to backend:', error);
    }
  }
}