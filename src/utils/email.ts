import nodemailer from 'nodemailer';
import dotenv from "dotenv"
dotenv.config()

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER 
const EMAIL_PASS = process.env.EMAIL_PASS 
const EMAIL_FROM = process.env.EMAIL_FROM 



// Looking to send emails in production? Check out our Email API/SMTP product!


// Create transporter
// Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

/**
 * Send email using nodemailer
 * @param options Email options (to, subject, text/html)
 * @returns Promise resolving to sending result
 */
export const sendEmail = async (options: EmailOptions): Promise<any> => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transport.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Verify email configuration by attempting to connect to the SMTP server
 * @returns Promise resolving to true if connection successful
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transport.verify();
    console.log('Email service ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};