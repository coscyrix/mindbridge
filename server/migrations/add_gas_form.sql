-- Migration to add GAS form to forms table for automatic sending
-- This will allow the GAS form to be automatically assigned to sessions

INSERT INTO forms (
  form_id,
  form_cde,
  frequency_desc,
  frequency_typ,
  session_position,
  svc_ids,
  form_sequence_id,
  status_yn,
  tenant_id
) VALUES (
  25,
  'GAS',
  'goal attainment scaling assessment',
  'static',
  '[1, 3, 5]', -- Send on sessions 1, 3, and 5 (adjust as needed)
  '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]', -- All services (adjust as needed)
  1,
  1,
  1 -- Default tenant_id (adjust as needed)
) ON DUPLICATE KEY UPDATE
  form_cde = VALUES(form_cde),
  frequency_desc = VALUES(frequency_desc),
  frequency_typ = VALUES(frequency_typ),
  session_position = VALUES(session_position),
  svc_ids = VALUES(svc_ids),
  status_yn = VALUES(status_yn); 