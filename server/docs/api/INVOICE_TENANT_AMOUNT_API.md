# Invoice API - Tenant Amount Calculation

## Overview
The Invoice API has been enhanced to include tenant amount calculation when `role_id=3` and `tenant_id` is present in the request. This feature calculates the tenant's share of session fees based on the fee split management configuration for each counselor.

## Feature Details

### When Tenant Amount is Calculated
- **Condition**: `role_id=3` AND `tenant_id` is provided in the request
- **Purpose**: Calculate the tenant's share of session fees based on counselor-specific fee split percentages
- **Scope**: 
  - If `counselor_id` is provided: Calculate for that specific counselor only
  - If no `counselor_id` is provided: Calculate for ALL counselors in the specified tenant

### Calculation Logic
1. **Group Sessions by Counselor**: Sessions are grouped by counselor to apply individual fee split percentages
2. **Map Counselor IDs**: Convert `counselor_id` (from user_profile table) to `user_id` (from user_profile table) for fee split lookup
3. **Get Fee Split Configuration**: For each counselor, retrieve their specific fee split configuration from the fee split management system using `user_id`
4. **Calculate Tenant Amount**: Apply the counselor's tenant share percentage to their total session amount
5. **Sum All Tenant Amounts**: Aggregate tenant amounts from all counselors

### API Endpoint
```
GET /api/invoice/multi
```

### Query Parameters
- `role_id` (required): User role ID
- `tenant_id` (required for tenant amount calculation): Tenant ID
- `counselor_id` (optional): Specific counselor ID
  - When `role_id=3` and `tenant_id` is provided without `counselor_id`, shows data for ALL counselors in that tenant
  - When `counselor_id` is provided, shows data for that specific counselor only
- `start_dte` (optional): Start date filter
- `end_dte` (optional): End date filter
- Other optional filters...

### Response Structure
When tenant amount is calculated, the response includes an additional field in the summary:

```json
{
  "message": "Requested invoice returned",
  "rec": {
    "summary": {
      "sum_session_price": "390.1500",
      "sum_session_counselor_amt": "245.7945",
      "sum_session_system_amt": "163.8630",
      "sum_session_system_units": 3,
      "sum_session_tenant_amt": "78.0300"
    },
    "rec_list": [...]
  }
}
```

### Fee Split Integration
The tenant amount calculation integrates with the existing fee split management system:

1. **Counselor-Specific Configuration**: Each counselor can have different fee split percentages
2. **Default Configuration**: If no counselor-specific configuration exists, uses tenant-wide default
3. **System Default**: If no configuration exists, defaults to 0% tenant share

### Example Calculation
```
Counselor A: 3 sessions, $100 each = $300 total
- Fee split enabled: true
- Fee split: 20% tenant, 80% counselor
- Tenant amount: $300 * 0.20 = $60

Counselor B: 2 sessions, $150 each = $300 total  
- Fee split enabled: true
- Fee split: 15% tenant, 85% counselor
- Tenant amount: $300 * 0.15 = $45

Total Tenant Amount: $60 + $45 = $105

Note: If fee splits are disabled, tenant amount will be 0 regardless of percentages.
```

## Frontend Integration

### Invoice Page
The invoice page displays the tenant amount in a new tab when available:
- **Tab Label**: "Total Amount to Tenant for a Month:"
- **Condition**: Only shown when `sum_session_tenant_amt` is present in the response

### Client Session Page
The client session page also displays the tenant amount for consistency:
- **Tab Label**: "Total Amount to Tenant for a Month:"
- **Condition**: Only shown when `sum_session_tenant_amt` is present in the response

## Testing

### Test Cases
1. **Tenant Amount Calculation**: Verify tenant amount is calculated when `role_id=3` and `tenant_id` is provided
2. **No Tenant Amount**: Verify tenant amount is not included when conditions are not met
3. **Validation**: Verify proper error responses for missing required fields
4. **Fee Split Integration**: Verify calculation uses correct fee split percentages

### Running Tests
```bash
cd server
npm test -- tests/api/test_reports_api.js
```

## Database Dependencies
- `fee_split_management` table: Contains counselor-specific fee split configurations (references `user_id` from user_profile table)
- `v_invoice` view: Provides session data with counselor information (uses `counselor_id` from user_profile table)
- `user_profile` table: Contains counselor profile information and maps `user_profile_id` to `user_id`

## Error Handling
- If fee split configuration cannot be retrieved, tenant amount defaults to 0
- If counselor has no specific configuration, uses tenant-wide default
- If no configuration exists, tenant amount is 0
- If counselor mapping from `user_profile_id` to `user_id` is not found in user_profile table, that counselor's sessions are skipped
- **Important**: Fee splits must be enabled (`is_fee_split_enabled = true`) for tenant amount calculation
- By default, fee splits are disabled and tenant share percentage is 0%

## Performance Considerations
- Fee split configurations are retrieved individually for each counselor
- Consider caching fee split configurations for better performance in high-volume scenarios
- Grouping sessions by counselor reduces the number of fee split lookups needed
