import { z } from "zod";

export const ClientValidationSchema = z
  .object({
    clam_num: z
      .preprocess(
        (value) => Number(value),
        z.number().min(1, { message: "Serial Number is required" })
      )
      .optional(),
    user_first_name: z
      .string()
      .min(2, { message: "At least 2 characters required" }),
    user_last_name: z
      .string()
      .min(2, { message: "At least 2 characters required" }),

    user_phone_nbr: z
      .string({
        required_error: "Number is required",
        invalid_type_error: "Please enter phone number",
      })
      .min(1, { message: "Phone number is required" })
      .regex(/^[\d\s\(\)\-\+]+$/, { message: "Invalid phone number format" })
      .transform((value) => value.replace(/[\D]/g, ""))
      .refine((value) => value.length >= 10 && value.length <= 15, {
        message: "Phone number must be between 10 and 15 digits",
      }),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email address"),
    service: z.string().nonempty("Service Type is required").optional(),
    role_id: z
      .preprocess(
        (value) => Number(value),
        z.number().min(1, { message: "Role is required" })
      )
      .optional(),
    target_outcome_id: z
      .object({
        label: z.string(),
        value: z.preprocess(
          (val) => Number(val),
          z.number().min(1, { message: "Target Outcomes is required" })
        ),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Check if role_id is 2
      if (data.role_id === 2) {
        // Validate user_first_name, user_last_name, and email
        const firstNameValid = z
          .string()
          .min(2, { message: "At least 2 characters required" })
          .safeParse(data.user_first_name);
        const lastNameValid = z
          .string()
          .min(2, { message: "At least 2 characters required" })
          .safeParse(data.user_last_name);
        const emailValid = z
          .string()
          .nonempty("Email is required")
          .email("Invalid email address")
          .safeParse(data.email);

        return (
          firstNameValid.success && lastNameValid.success && emailValid.success
        );
      }
      // If role_id is not 2, skip validation for user_first_name, user_last_name, and email
      return true;
    },
    {
      message:
        "user_first_name, user_last_name, and email are required when role_id is 2",
      path: ["user_first_name", "user_last_name", "email"], // Indicate where the error is
    }
  );

// export const EditClientValidationSchema = z.object({
//   clam_num: z.preprocess(
//     (value) => Number(value),
//     z.number().min(1, { message: "Serial Number is required" })
//   ),
//   user_first_name: z
//     .string()
//     .min(2, { message: "At least 2 characters required" }),
//   user_last_name: z
//     .string()
//     .min(2, { message: "At least 2 characters required" }),
//   user_phone_nbr: z
//     .string({
//       required_error: "Number is required",
//       invalid_type_error: "Please enter phone number",
//     })
//     .min(1, { message: "Phone number is required" })
//     .regex(/^[\d\s\(\)\-\+]+$/, { message: "Invalid phone number format" })
//     .transform((value) => value.replace(/[\D]/g, ""))
//     .refine((value) => value.length >= 10 && value.length <= 15, {
//       message: "Phone number must be between 10 and 15 digits",
//     }),
//   email: z
//     .string()
//     .nonempty("Email is required")
//     .email("Invalid email address"),
//   service:
//     z.role_id == 2 && optiona().string().nonempty("Service Type is required"),
//   role_id: z.preprocess(
//     (value) => Number(value),
//     z.number().min(1, { message: "Role is required" })
//   ),
//   target_outcome_id: z.preprocess(
//     (value) => Number(value),
//     z.number().min(1, { message: "Target Outcome is required" })
//   ),
// });

export const CreateClientSessionValidationSchema = z.object({
  client_first_name: z.object({
    label: z.string().min(1, { message: "Invalid client name" }),
    value: z.number().min(1, { message: "Invalid client ID" }),
    serialNumber: z.number().optional(), // Optional since it might be "N/A" or missing
  }),
  service_id: z.object({
    label: z.string().min(1, { message: "Invalid service label" }),
    value: z.number().min(1, { message: "Invalid service ID" }),
  }),
  session_format_id: z.object({
    label: z.string().min(1, { message: "Invalid session format" }),
    value: z.string().min(1, { message: "Invalid session format ID" }), // Keeping it as string since "1" and "2" are strings
  }),
  // session_desc: z
  //   .string()
  //   .min(2, { message: "Please enter more then 2 wordds" }),
  req_dte: z.string().refine((value) => !isNaN(new Date(value).getTime()), {
    message: "Invalid date format",
  }),
  req_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Invalid time format",
  }),
});

export const PasswordConfirmationSchema = z
  .object({
    verificationCode: z
      .string({
        required_error: "Verification Code is required",
      })
      .min(1, "Verification code is required"),
    password: z
      .string({
        required_error: "Enter your new password",
      })
      .min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string({
        required_error: "Enter your new password",
      })
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const EmailVerificationSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Please enter correct email address",
    })
    .email({ message: "Invalid email address" }),
});
