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

export const accountVerificationEmail = (email) => {
  return {
    to: email,
    subject: 'Account Not Verified',
    html: `
      <h1>Account Need Verification</h1>
      <p>Hello,</p>
      <p>Your account is not currently verified. An OTP code is required to activate your account. Please check your email for the OTP code.</p>
      <p>If you have any questions or need assistance, please contact our support team.</p>
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
export const treatmentToolsEmail = (
  email,
  client_full_name,
  tools_name,
  form_id,
  client_id,
  session_id,
) => {
  return {
    to: email,
    subject: `${tools_name} Assessment`,
    html: `
      <p>Hello, ${capitalizeFirstLetter(client_full_name)}</p>
      <p>We hope this message finds you well.</p>
      <p>As part of our commitment to providing personalized care, we invite you to participate in the ${tools_name} assessment. This brief questionnaire will help us tailor our approach to your unique needs.</p>
      <p>Participation is completely voluntary, and all information remains confidential. Your input will be invaluable in enhancing the quality of care we provide.</p>
      <p>Please click the link below to complete the assessment:</p>
      <p><a href="${process.env.BASE_URL}${process.env.FORMS}${tools_name.toLowerCase()}?form_id=${form_id}&client_id=${client_id}&session_id=${session_id}">Complete ${tools_name} Assessment</a></p>
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
      border-collapse: separate;
      border-spacing: 0;
      margin: 20px 0;
      font-size: 16px;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .branded-table thead {
      background: linear-gradient(90deg, #4CAF50, #2A9D8F);
      color: white;
    }
    .branded-table th,
    .branded-table td {
      padding: 14px 18px;
      text-align: left;
    }
    .branded-table th {
      font-weight: bold;
      text-align: center;
    }
    .branded-table tbody tr:nth-child(odd) {
      background-color: #f9f9f9;
    }
    .branded-table tbody tr:nth-child(even) {
      background-color: #ffffff;
    }
    .branded-table tbody tr:hover {
      background-color: #f1f1f1;
    }
    .branded-table td {
      border-top: 1px solid #ddd;
    }
  </style>
  <p>Dear ${capitalizeFirstLetter(clientName)},</p>
  <p>Welcome to ${process.env.PROJECT_NAME}! We are pleased to inform you that your account has been successfully created. Below are the details for your reference:</p>
  <table class="branded-table">
    <thead>
      <tr>
        <th>Account Information</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
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
        <td>${clientPhoneNumber || 'N/A'}</td>
      </tr>
      <tr>
        <td>Target Outcome</td>
        <td>${targetOutcome}</td>
      </tr>
    </tbody>
  </table>
  <p>Your designated counselor for these sessions will be <b>${capitalizeFirstLetter(counselorName)}</b>, who will guide and support you throughout your journey. We look forward to working with you to help achieve your goals.</p><br/>
  <p>Throughout our therapy sessions, you'll receive a comprehensive package, including:</p>
  <ul>
    <li><b>Smart Goals:</b> Tailored objectives to guide our progress</li>
    <li><b>Treatment Tools:</b> Evidence-based resources to support your growth</li>
    <li><b>Homework Assignments:</b> Targeted exercises to reinforce new skills</li>
  </ul>
  <p>Together, we'll work collaboratively to achieve these goals, using these tools to facilitate a transformative healing process.</p>
  <p>If you have any questions or need assistance accessing your account, please do not hesitate to contact us at ${process.env.SUPPORT_EMAIL} or ${process.env.SUPPORT_PHONE}.</p>
  <p>We’re here to support you every step of the way.</p>
  <p>Thank you,</p>
  <p>The MindBridge Team</p>
`,
  };
};

const timeZoneConfig =
  process.env.TIMEZONE === process.env.TIMEZONE ? process.env.TIMEZONE : 'UTC';

export const therapyRequestDetailsEmail = (email, therapyRequest) => {
  const {
    counselor_first_name,
    counselor_last_name,
    client_first_name,
    client_last_name,
    service_name,
    session_format_id,
    session_obj,
  } = therapyRequest;

  const sessionDetails = session_obj
    .map(
      (session, index) => `
        <tr style="border-bottom: 1px solid #dddddd; text-align: left; padding: 8px; ${
          session.is_report ? 'font-weight: bold;' : ''
        } background-color: ${
          session.is_report
            ? '#ffffcc'
            : index % 2 === 0
              ? '#f9f9f9'
              : '#ffffff'
        };">
          <td style="padding: 8px;">${session.service_name}</td>
          <td style="padding: 8px;">${session.intake_date}</td>
          <td style="padding: 8px;">${new Date(
            `1970-01-01T${session.scheduled_time}`,
          ).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: timeZoneConfig,
          })}</td>
          <td style="padding: 8px;">${session.session_format}</td>
          <td style="padding: 8px;">${session.session_status}</td>
        </tr>
      `,
    )
    .join('');

  return {
    to: email,
    subject: `${service_name} Session Schedule`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h4 style="color: #007bff; text-align: left; margin-bottom: 20px; font-size: 16px;">Therapy Request Details</h4>
         <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr style="text-align: left;">
            <td style="padding: 4px; font-weight: bold;">Counselor:</td>
            <td style="padding: 4px;">${capitalizeFirstLetter(counselor_first_name)} ${capitalizeFirstLetter(counselor_last_name)}</td>
          </tr>
          <tr style="text-align: left;">
            <td style="padding: 4px; font-weight: bold;">Client:</td>
            <td style="padding: 4px;">${capitalizeFirstLetter(client_first_name)} ${capitalizeFirstLetter(client_last_name)}</td>
          </tr>
          <tr style="text-align: left;">
            <td style="padding: 4px; font-weight: bold;">Service:</td>
            <td style="padding: 4px;">${service_name}</td>
          </tr>
          <tr style="text-align: left;">
            <td style="padding: 4px; font-weight: bold;">Session Format:</td>
            <td style="padding: 4px;">${session_format_id}</td>
          </tr>
        </table>
        
        <h4 style="color: #007bff; text-align: left; margin-top: 20px; margin-bottom: 10px; font-size: 16px;">Session Details</h4>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #dddddd; border-radius: 8px;">
          <thead>
            <tr style="background-color: #007bff; color: #fff; text-align: left;">
              <th style="padding: 12px 8px;">Service Name</th>  
              <th style="padding: 12px 8px;">Session Date</th>
              <th style="padding: 12px 8px;">Session Time</th>
              <th style="padding: 12px 8px;">Session Format</th>
              <th style="padding: 12px 8px;">Session Status</th>
            </tr>
          </thead>
          <tbody>
            ${sessionDetails}
          </tbody>
        </table>
        
        <p style="text-align: left;">Thank you,</p>
        <p style="text-align: left;"><strong>The MindBridge Team</strong></p>
      </div>
    `,
  };
};

export const dischargeEmail = (email, clientName) => {
  return {
    to: email,
    subject: 'Congratulations on Completing Your Therapy Journey!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear ${capitalizeFirstLetter(clientName)},</p>
        <p>I hope this email finds you well. I wanted to take a moment to acknowledge the completion of your therapy sessions and congratulate you on the progress you’ve made during this journey.</p>
        <p>It has been a privilege to work alongside you and witness your growth, resilience, and commitment to your well-being. I am confident that the tools and insights you’ve developed during our sessions will continue to support you in navigating life’s challenges.</p>
        <p>Thank you for trusting me to be part of your journey. I wish you continued strength, growth, and fulfillment in the path ahead.</p>
        <p style="text-align: left;">Thank you,</p>
        <p style="text-align: left;"><strong>The MindBridge Team</strong></p>
      </div>
    `,
  };
};

export const additionalServiceEmail = (
  email,
  clientName,
  service_name,
  date,
  time,
) => {
  return {
    to: email,
    subject: 'Additional Service Scheduled',
    html: `
       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hello, ${capitalizeFirstLetter(clientName)},</p>
        <p>I hope this email finds you well. I wanted to inform you that an additional service has been scheduled for you.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #dddddd; border-radius: 8px;">
          <tbody>
            <tr style="background-color: #f9f9f9; color: #333; text-align: left;">
              <th style="padding: 12px 8px;">Service Name</th>
              <td style="padding: 8px;">${service_name}</td>
            </tr>
            <tr style="background-color: #ffffff; color: #333; text-align: left;">
              <th style="padding: 12px 8px;">Date</th>
              <td style="padding: 8px;">${date}</td>
            </tr>
            <tr style="background-color: #f9f9f9; color: #333; text-align: left;">
              <th style="padding: 12px 8px;">Time</th>
              <td style="padding: 8px;">${time}</td>
            </tr>
          </tbody>
        </table>
        <p>If you have any questions or need to reschedule, please contact your assigned counselor or us at <strong>${process.env.SUPPORT_EMAIL}</strong> or <strong>${process.env.SUPPORT_PHONE}</strong>.</p>
        <p>Thank you,</p>
        <p><strong>The MindBridge Team</strong></p>
      </div>
    `,
  };
};
