import emailjs from 'emailjs-com';

// Initialize EmailJS with your user ID (this should be moved to environment variables in production)
// You would need to sign up for EmailJS and get your user ID from their dashboard
const EMAILJS_USER_ID = 'YOUR_USER_ID'; // Replace with actual user ID
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your template ID

/**
 * Send an email to a user
 * @param to Recipient's email address
 * @param subject Email subject
 * @param message Email message content
 * @param name Recipient's name
 * @returns Promise resolving to the EmailJS response
 */
export const sendEmail = async (
  to: string,
  subject: string,
  message: string,
  name: string
): Promise<any> => {
  try {
    const templateParams = {
      to_email: to,
      to_name: name,
      subject: subject,
      message: message,
    };

    // For development/testing, log the email instead of actually sending it
    if (process.env.NODE_ENV === 'development') {
      console.log('Email would be sent with the following parameters:', templateParams);
      return Promise.resolve({ status: 200, text: 'Email logged (development mode)' });
    }

    // In production, actually send the email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
    
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a password reset email to a user
 * @param email User's email address
 * @param name User's name
 * @param resetToken Password reset token or temporary password
 * @returns Promise resolving to the EmailJS response
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<any> => {
  const subject = 'Password Reset Request';
  const message = `
    Hello ${name},
    
    You recently requested to reset your password for your Mokm Zansi Books account.
    
    Your temporary password is: ${resetToken}
    
    Please use this temporary password to log in, and you will be prompted to create a new password.
    
    If you did not request a password reset, please contact support immediately.
    
    Thank you,
    Mokm Zansi Books Team
  `;
  
  return sendEmail(email, subject, message, name);
};

/**
 * Send a welcome email to a new user
 * @param email User's email address
 * @param name User's name
 * @returns Promise resolving to the EmailJS response
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<any> => {
  const subject = 'Welcome to Mokm Zansi Books';
  const message = `
    Hello ${name},
    
    Welcome to Mokm Zansi Books! We're excited to have you on board.
    
    Your account has been successfully created. You can now log in and start using our platform.
    
    If you have any questions or need assistance, please don't hesitate to contact our support team.
    
    Thank you,
    Mokm Zansi Books Team
  `;
  
  return sendEmail(email, subject, message, name);
};
