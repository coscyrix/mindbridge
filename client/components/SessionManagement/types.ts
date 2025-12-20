export interface Session {
  session_id: number;
  session_number: number | null;
  thrpy_req_id: number;
  service_id: number;
  session_format: "ONLINE" | "IN_PERSON" | "IN-PERSON";
  is_report: boolean;
  is_additional: boolean;
  intake_date: string; // "YYYY-MM-DD"
  scheduled_time: string; // "HH:mm:ss.SSSZ" or "HH:mm:ss"
  session_code: string;
  session_description: string;
  forms_array?: string[] | null;
  session_status:
    | "SCHEDULED"
    | "SHOW"
    | "NO-SHOW"
    | "DISCHARGED"
    | "INACTIVE"
    | "CANCELLED";
  cancellation_reason: string | null;
  status_yn: "y" | "n";
  created_at: string;
  updated_at: string;
  tenant_id: number;
  session_price: string;
  session_taxes: string;
  session_counselor_amt: string;
  session_system_amt: string;
}

export interface SessionData {
  req_id: number;
  counselor_id: number;
  client_id: number;
  service_id: number;
  session_format_id: string;
  req_dte: string;
  req_time: string;
  session_desc: string;
  status_yn: string;
  thrpy_status: string;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  treatment_target: string | null;
  cancel_hash: string | null;
  counselor_first_name: string;
  counselor_last_name: string;
  counselor_phone_nbr: string | null;
  counselor_country_code: string | null;
  client_first_name: string;
  client_last_name: string;
  client_phone_nbr: string | null;
  client_country_code: string | null;
  service_name: string;
  service_code: string;
  session_obj: Session[];
}
