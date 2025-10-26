const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter using SMTP
const createTransporter = () => {
  // For production, use your SMTP configuration
  // For development, use Ethereal Email or your preferred service
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your_email@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'your_app_password'
    }
  });
};

const emailService = {
  // Send welcome email with credentials
  sendCredentials: async (email, name, password, role, saccoName) => {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@sacco.com',
        to: email,
        subject: `Welcome to ${saccoName || 'SACCO Management System'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
              .credentials { background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              .button { display: inline-block; padding: 10px 20px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to SACCO Management System</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Your account has been created successfully with role: <strong>${role}</strong></p>
                
                ${saccoName ? `<p>You have been assigned to: <strong>${saccoName}</strong></p>` : ''}
                
                <div class="credentials">
                  <h3>Your Login Credentials:</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Password:</strong> ${password}</p>
                  <p><strong>Role:</strong> ${role}</p>
                  <p style="color: #d32f2f; font-weight: bold;">⚠️ Please change your password after first login</p>
                </div>
                
                <p>You can now login to your account and manage your SACCO operations.</p>
                
                <a href="${process.env.FRONTEND_URL || 'http://100.75.39.40:3333/login'}" class="button">
                  Login Now
                </a>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2025 SACCO Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Welcome to SACCO Management System!
          
          Hello ${name}!
          
          Your account has been created successfully.
          
          Role: ${role}
          ${saccoName ? `SACCO: ${saccoName}` : ''}
          
          Login Credentials:
          Email: ${email}
          Password: ${password}
          
          ⚠️ Please change your password after first login.
          
          You can now login at: ${process.env.FRONTEND_URL || 'http://100.75.39.40:3333/login'}
          
          This is an automated email. Please do not reply.
        `
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Credentials email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send credentials email to ${email}:`, error);
      // Don't throw error - email sending failure shouldn't stop registration
      return { success: false, error: error.message };
    }
  },

  // Send notification email
  sendNotification: async (email, subject, message) => {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@sacco.com',
        to: email,
        subject: subject,
        text: message,
        html: `<p>${message}</p>`
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Notification email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send notification email to ${email}:`, error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;

