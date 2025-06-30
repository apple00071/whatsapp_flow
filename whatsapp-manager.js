const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

class WhatsAppManager {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
  }

  initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'whatsapp-api',
        dataPath: path.join(process.cwd(), '.wwebjs_auth')
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      }
    });

    this.client.on('qr', (qr) => {
      this.qrCode = qr;
      console.log('QR RECEIVED:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('authenticated', () => {
      console.log('AUTHENTICATED');
      this.qrCode = null;
    });

    this.client.on('ready', () => {
      this.isReady = true;
      console.log('Client is ready!');
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      console.log('Client was disconnected', reason);
    });

    this.client.initialize();
  }

  getStatus() {
    return {
      isReady: this.isReady,
      hasQR: !!this.qrCode,
      clientInfo: this.client?.info || null
    };
  }

  async sendMessage(to, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    const sanitizedNumber = to.toString().replace(/[^\d]/g, '');
    const chat = await this.client.getChatById(sanitizedNumber + '@c.us');
    return chat.sendMessage(message);
  }
}

module.exports = new WhatsAppManager(); 