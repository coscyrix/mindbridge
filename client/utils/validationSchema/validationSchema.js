import { z } from "zod";
import { featureOptions } from "../../components/GetStartedForm";
import { gasQuestionBank } from "../constants";
const safeNumber = (val) =>
  val !== "" && val !== null && val !== undefined && !isNaN(Number(val))
    ? Number(val)
    : undefined;

export const ServiceTemplateSchema = z.object({
  service_id: z.preprocess(
    safeNumber,
    z
      .number({ required_error: "Service ID is required" })
      .min(1, "Service ID must be greater than 0")
  ),
  service_price: z.preprocess(
    safeNumber,
    z
      .number({ required_error: "Price is required" })
      .min(0, "Price must be greater than or equal to 0")
  ),
});

export const services = z.object({
  services: z
    .array(ServiceTemplateSchema)
    .min(1, "At least one service is required"),
});

export const ClientValidationSchema = z
  .object({
    clam_num: z
      .preprocess(
        (value) => value === "" || value === undefined ? undefined : Number(value),
        z.number().min(1, { message: "Serial Number is required" }).optional()
      )
      .optional(),
    tenant_name: z
      .string()
      .nullable()
      //.min(2, { message: "At least 2 characters required" })
      .optional(),
    user_first_name: z
      .string()
      .min(2, { message: "At least 2 characters required" }),
    user_last_name: z
      .string()
      .min(2, { message: "At least 2 characters required" }),

    user_phone_nbr: z.preprocess(
      (val) => (typeof val === "number" ? String(val) : val),
      z
        .string({
          required_error: "Number is required",
          invalid_type_error: "Please enter phone number",
        })
        .min(10, { message: "Phone must be equal to 10 dizit" })
        .max(10,{message:"Phone must be equal to 10 dizit"})
        .regex(/^[\d\s\(\)\-\+]+$/, { message: "Invalid phone number format" })
        .transform((value) => value.replace(/[\D]/g, ""))
        // .refine((value) => value.length!==10, {
        //   message: "Phone number must be 10 digit",
        // })
    ),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email address"),
    
    role_id: z
      .preprocess(
        (value) => Number(value),
        z.number().min(1, { message: "Role is required" })
      )
      .optional(),
    target_outcome_id: z
      .union([
        z.object({
          label: z.string().optional(),
          value: z.preprocess(
            (val) => Number(val),
            z.number().min(1, { message: "Target Outcomes is required" })
          ).optional()
        }).optional(),
        z.string().optional(),
        z.number().optional()
      ])
      .optional()
      .nullable(),
    tax: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().nullable().optional()),

    admin_fee: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().nullable().optional()),
    description: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Check if role_id is 1 (client) - require clam_num and target_outcome_id
      if (data.role_id === 1) {
        const clamNumValid = data.clam_num && data.clam_num > 0;
        const targetOutcomeValid = data.target_outcome_id && (
          (typeof data.target_outcome_id === 'object' && data.target_outcome_id.value) ||
          (typeof data.target_outcome_id === 'string' && data.target_outcome_id.length > 0) ||
          (typeof data.target_outcome_id === 'number' && data.target_outcome_id > 0)
        );
        return clamNumValid && targetOutcomeValid;
      }
      // If role_id is 3 (manager) - require admin_fee and tax
      if (data.role_id === 3) {
        const adminFeeValid = data.admin_fee && data.admin_fee > 0;
        const taxValid = data.tax && data.tax >= 0;
        return adminFeeValid && taxValid;
      }
      // For other roles, skip validation for clam_num and target_outcome_id
      return true;
    },
    {
      message: "Serial Number and Target Outcomes are required for clients, Admin Fees and Tax are required for managers",
      path: ["clam_num", "target_outcome_id", "admin_fee", "tax"],
    }
  )
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
// get started validation Schema;
const featureItemSchema = z.object({
  value: z.string().min(1, "Feature value is required"),
  label: z.string().min(1, "Feature label is required"),
});

export const getStartedSchema = z.object({
  organization: z.string().min(1, "Organization name is required"),
  contact: z.string().min(1, "Contact name is required"),
  position: z.string().min(1, "Position/Title is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().min(1, "Company website is required"),
  address: z.string().min(1, "Office address is required"),
  counselors: z.string().min(1, "Number of counselors is required"),
  clients: z.string().min(1, "Estimated clients per month is required"),
  features: z
    .array(featureItemSchema)
    .min(1, "At least one feature is required")
    .refine((data) => data.length > 0, {
      message: "At least one feature must be selected",
    }),
  demodate: z.string().min(1, "Preferred demo date is required"),
  demotime: z.string().min(1, "Preferred demo time is required"),
  notes: z.string().min(1, "Additional notes are required"),
  typedName: z.string().min(1, "Typed name is required"),
  signature: z
    .string()
    .min(1, "Signature is required")
    .regex(/^data:image\/png;base64,/, "Signature must be a base64 image"),
  date: z.string().min(1, "Date is required"),
  confirmInfo: z.literal(true, {
    errorMap: () => ({ message: "You must confirm the information." }),
  }),
  agreeTerms: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to the Terms and Privacy Policy.",
    }),
  }),
});

export const bookAppointmentSchema = z.object({
  customer_name: z.string().min(1, "Name is required"),
  customer_email: z.string().email("Invalid email address"),
  contact_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number can't exceed 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  service: z.string().min(1, "Please select a service"),
  appointment_date: z
    .string()
    .min(1, "Appointment date is required")
    .refine(
      (val) => {
        const today = new Date().toISOString().split("T")[0];
        return val >= today;
      },
      { message: "Date must be today or later" }
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be under 500 characters"),
});

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});
const counselorOptionSchema = z.object({
  label: z.string(),
  tenant_id: z.string(),
  value: z.string(), //thuis value is same as counselor id
});


export const getConsentManagementSchema = (userData) => {
  const isAdmin = userData?.role_id === 4;

  return z.object({
    // agreeTerms: z.literal(true, {
    //   errorMap: () => ({
    //     message: "You must agree to the Terms and condition outlined above.",
    //   }),
    // }), 
    consent_Editor_Values: z
      .string()
      .min(1, "Consent text is required")
      .refine(
        (html) => {
          const stripped = html.replace(/<[^>]*>/g, "").trim();
          return stripped.length > 0;
        },
        { message: "Consent text cannot be empty" }
      ),
    counselorSelect: isAdmin
      ? counselorOptionSchema.nullable().refine((val) => !!val, {
          message: "Counselor is required for Admin",
        })
      : z.any().optional(),
  });
};


export const createGasSchema = (goalKey) => {
  const questionSet = gasQuestionBank[goalKey] || [];
  const dynamicQuestionSchema = questionSet.reduce((acc, q) => {
    acc[q.name] = z
      .number({
        required_error: "This question is required",
        invalid_type_error: "Select a valid score",
      })
      .min(-2, "Minimum value is -2")
      .max(2, "Maximum value is +2");
    return acc;
  }, {});

  return z.object({
    goal: z
      .object({
        label: z.string(),
        value: z.string(),
      })
      .nullable()
      .refine((val) => !!val?.value, {
        message: "Treatment goal is required",
      }),
    ...dynamicQuestionSchema,
  });
};
export const splitFeeManagementSchema = z
  .object({
    tenant_share: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number({ required_error: "Tenant share is required" }).min(0, "Tenant share must be at least 0").max(100, "Tenant share must be at most 100")),
    counselor_share: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number({ required_error: "Counselor share is required" }).min(0, "Counselor share must be at least 0").max(100, "Counselor share must be at most 100")),
  })
  .refine((data) => data.tenant_share + data.counselor_share === 100, {
    message: "Total share must be exactly 100%",
    path: ["tenant_share"],
  });
