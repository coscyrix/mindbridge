// utils/emailTmplt.js
import dotenv from 'dotenv';
import { capitalizeFirstLetter } from './common.js';

dotenv.config();

export const forgetPasswordEmail = (email, newPassword) => {
  return {
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hello,</p>
      <p>You requested a password reset. Your new password is:</p>
      <p><strong>${newPassword}</strong></p>
      <p>Please use this new password to log in to your account.</p>
      <p>If you did not request this password reset, please contact our support team immediately.</p>
      <p>Thank you,</p>
      <p>MindBridge</p>
    `,
  };
};

export const otpEmail = (email, otp) => {
  return {
    to: email,
    subject: 'Your One-Time Password (OTP)',
    html: `
      <h1>Your One-Time Password (OTP)</h1>
      <p>Hello,</p>
      <p>To verify this account, please use the OTP below:</p>
      <p><strong style="font-size: 1.5em; color: #2e6da4;">${otp}</strong></p>
      <p>This OTP is valid for the next 5 minutes. Please do not share this code with anyone.</p>
      <p>If you did not request this OTP, please contact our support team immediately to secure your account.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};

export const clientWelcomeEmail = (email, password) => {
  return {
    to: email,
    subject: 'Welcome to MindBridge',
    html: `
      <h1>Welcome to MindBridge</h1>
      <p>Hello,</p>
      <p>Your account has been successfully created. Here are your login details:</p>
      <p>Password: <strong>${password}</strong></p>
      <p>Please keep this information secure.</p>
      <p> <strong>We recommend you change your password once you log in. </strong></p>
      <p>Thank you for choosing MindBridge!</p>
      <p>The MindBridge Team</p>
    `,
  };
};

export const emailUpdateEmail = (email) => {
  return {
    to: email,
    subject: 'Email Address Updated',
    html: `
      <h1>Email Address Updated</h1>
      <p>Hello,</p>
      <p>Your email address has been successfully updated. If you did not make this change, please contact our support team immediately.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};

export const accountDeactivatedEmail = (email) => {
  return {
    to: email,
    subject: 'Account Deactivated',
    html: `
      <h1>Account Deactivated</h1>
      <p>Hello,</p>
      <p>Your account is currently deactivated. If you want to restore your account, please contact our support team.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};

export const changePasswordEmail = (email) => {
  return {
    to: email,
    subject: 'Password Changed',
    html: `
      <h1>Password Changed</h1>
      <p>Hello,</p>
      <p>Your password has been successfully changed. If you did not make this change, please contact our support team immediately.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};

// This function sends an email to the client with a summary of their treatment plan.
export const treatmentToolsEmail = (email, client_full_name, tools_name) => {
  return {
    to: email,
    subject: `${tools_name} Assessment`,
    html: `
      <p>Hello, ${capitalizeFirstLetter(client_full_name)}</p>
      <p>We hope this message finds you well.</p>
      <p>As part of our commitment to providing personalized care, we invite you to participate in the ${tools_name} assessment. This brief questionnaire will help us tailor our approach to your unique needs.</p>
      <p>Participation is completely voluntary, and all information remains confidential. Your input will be invaluable in enhancing the quality of care we provide.</p>
      <p>Please click the link below to complete the assessment:</p>
      <p><a href="${tools_name}">Complete ${tools_name} Assessment</a></p>
      <p>If you have any questions or concerns, feel free to reach out. We’re here to support you.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};

//This function sends an email to the client with a summary of their attendance record.
export const attendanceSummaryEmail = (
  email,
  client_full_name,
  attendanceLink,
) => {
  return {
    to: email,
    subject: 'Attendance Summary',
    html: `
      <p>Hi ${capitalizeFirstLetter(client_full_name)},</p>
      <p>I hope this message finds you well. As part of our commitment to supporting your wellness journey, please find a summary of your recent attendance record below. This summary can help you track your progress and stay informed of your session history.</p>
      <p>Attendance Record:</p>
      <p><a href="${attendanceLink}">View Attendance Record</a></p>
      <p>Please let me know if you have any questions or if there’s anything specific you’d like to discuss in our upcoming sessions.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};

// This function sends an email to the client with the consent form for their review and submission.
export const consentFormEmail = (email, clientName, consentFormLink) => {
  return {
    to: email,
    subject: 'Consent Form for Your Review and Submission',
    html: `
      <p>Dear ${capitalizeFirstLetter(clientName)},</p>
      <p>I hope this message finds you well.</p>
      <p>Attached, you will find the Consent Form document, which is an important step in our process. This document requires careful review and your consent to proceed.</p>
      <p>Please take some time to review the form at your earliest convenience. Once completed, kindly submit it. If you have any questions or would like further clarification, we can review and finalize it together during our next session.</p>
      <p><a href="${consentFormLink}">Click here to access the Consent Form</a></p>
      <p>If you have any concerns or need assistance, don’t hesitate to reach out.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};

export const welcomeAccountDetailsEmail = (
  email,
  clientName,
  clientPhoneNumber,
  targetOutcome,
  counselorName,
) => {
  return {
    to: email,
    subject:
      'Welcome to MindBridge - Account Details for Your Therapy Sessions',
    html: `
      <style>
        .branded-table {
          width: 100%;
          border-collapse: collapse;
        }
        .branded-table th, .branded-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .branded-table th {
          background-color: #f2f2f2;
        }
      </style>
      <p>Dear ${capitalizeFirstLetter(clientName)},</p>
      <p>Welcome to [Your Company Name]! We are pleased to inform you that your account has been successfully created. Below are the details for your reference:</p>
      <table class="branded-table">
        <tr>
          <th>Account Information</th>
          <th>Details</th>
        </tr>
        <tr>
          <td>Name</td>
          <td>${capitalizeFirstLetter(clientName)}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>${email}</td>
        </tr>
        <tr>
          <td>Phone Number</td>
          <td>${clientPhoneNumber}</td>
        </tr>
        <tr>
          <td>Target Outcome</td>
          <td>${targetOutcome}</td>
        </tr>
      </table>
      <p>Your designated counselor for these sessions will be <b>${capitalizeFirstLetter(counselorName)}</b>, who will guide and support you throughout your journey. We look forward to working with you to help achieve your goals.</p>
      <p>If you have any questions or need assistance accessing your account, please do not hesitate to contact us at ${process.env.SUPPORT_EMAIL} or ${process.env.SUPPORT_PHONE}.</p>
      <p>We’re here to support you every step of the way.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};
