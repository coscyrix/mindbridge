// utils/emailTmplt.js

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

export const treatmentToolsEmail = (email, tools_name) => {
  return {
    to: email,
    subject: 'Treatment Tools',
    html: `
      <h1>Treatment Tools</h1>
      <p>Hello,</p>
      <p>Here are the treatment tools you requested:</p>
      <p><strong>${tools_name}</strong></p>
      <p>If you have any questions or need further assistance, please contact our support team.</p>
      <p>Thank you,</p>
      <p>The MindBridge Team</p>
    `,
  };
};
