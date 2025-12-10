-- Migration: Add treatment_target column to v_thrpy_req view
-- This migration updates the v_thrpy_req view to include the treatment_target column
-- from the thrpy_req table

-- Check if treatment_target column already exists in the view
SET @has_treatment_target := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'v_thrpy_req'
    AND COLUMN_NAME = 'treatment_target'
);

-- Only proceed if treatment_target doesn't exist
SET @sql := IF(
  @has_treatment_target = 0,
  CONCAT(
    'CREATE OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `v_thrpy_req` AS ',
    'select `tr`.`req_id` AS `req_id`,',
    '`tr`.`counselor_id` AS `counselor_id`,',
    '`up`.`user_first_name` AS `counselor_first_name`,',
    '`up`.`user_last_name` AS `counselor_last_name`,',
    '`up`.`clam_num` AS `counselor_clam_num`,',
    '`tr`.`client_id` AS `client_id`,',
    '`up1`.`user_first_name` AS `client_first_name`,',
    '`up1`.`user_last_name` AS `client_last_name`,',
    '`up1`.`clam_num` AS `client_clam_num`,',
    '`tr`.`service_id` AS `service_id`,',
    '`ss`.`service_name` AS `service_name`,',
    '`ss`.`service_code` AS `service_code`,',
    '`tr`.`session_format_id` AS `session_format_id`,',
    '`tr`.`req_dte` AS `req_dte_not_formatted`,',
    'date_format(`tr`.`req_dte`,\'%W, %M %e, %Y\') AS `req_dte`,',
    '`tr`.`req_time` AS `req_time`,',
    '`tr`.`session_desc` AS `session_desc`,',
    '`tr`.`thrpy_status` AS `thrpy_status`,',
    '`tr`.`status_yn` AS `status_yn`,',
    '(select json_arrayagg(json_object(\'session_id\',`s`.`session_id`,\'thrpy_req_id\',`s`.`thrpy_req_id`,\'service_id\',`s`.`service_id`,\'service_name\',`ss_inner`.`service_name`,\'service_code\',`ss_inner`.`service_code`,\'session_format\',`s`.`session_format`,\'is_report\',`s`.`is_report`,\'is_additional\',`s`.`is_additional`,\'intake_date\',`s`.`intake_date`,\'scheduled_time\',`s`.`scheduled_time`,\'session_description\',`s`.`session_description`,\'session_status\',`s`.`session_status`,\'session_price\',`s`.`session_price`,\'session_taxes\',`s`.`session_taxes`,\'session_counselor_amt\',`s`.`session_counselor_amt`,\'session_system_amt\',`s`.`session_system_amt`,\'forms_array\',`s`.`forms_array`,\'status_yn\',`s`.`status_yn`,\'session_notes\',(select json_arrayagg(json_object(\'id\',`n`.`id`,\'message\',`n`.`message`,\'status_yn\',`n`.`status_yn`,\'created_at\',`n`.`created_at`,\'session_id\',`n`.`session_id`,\'updated_at\',`n`.`updated_at`)) from `notes` `n` where (`n`.`session_id` = `s`.`session_id`)),\'created_at\',`s`.`created_at`,\'updated_at\',`s`.`updated_at`,\'invoice_id\',`s`.`invoice_id`,\'invoice_nbr\',`s`.`invoice_nbr`)) from (`v_session` `s` join `service` `ss_inner` on((`s`.`service_id` = `ss_inner`.`service_id`))) where (`tr`.`req_id` = `s`.`thrpy_req_id`)) AS `session_obj`,',
    '`tr`.`created_at` AS `created_at`,',
    '`tr`.`updated_at` AS `updated_at`,',
    '`tr`.`tenant_id` AS `tenant_id`,',
    '`tr`.`treatment_target` AS `treatment_target` ',
    'from (((`thrpy_req` `tr` join `user_profile` `up` on((`tr`.`counselor_id` = `up`.`user_profile_id`))) join `user_profile` `up1` on((`tr`.`client_id` = `up1`.`user_profile_id`))) join `service` `ss` on((`tr`.`service_id` = `ss`.`service_id`))) order by `tr`.`req_id`'
  ),
  'SELECT "treatment_target column already exists in v_thrpy_req view" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column was added
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ treatment_target column successfully added to v_thrpy_req view'
    ELSE '❌ treatment_target column NOT found in v_thrpy_req view'
  END AS verification
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'v_thrpy_req'
  AND COLUMN_NAME = 'treatment_target';
