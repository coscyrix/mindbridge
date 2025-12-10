# Homework Statistics Dashboard Component

## Overview
The OverallScore component has been updated to display a bar chart showing the frequency of homework sent out per client with threshold annotations.

## Implementation

### Files Modified:
1. **`client/services/CommonServices.js`** - Added `getHomeworkStats()` method
2. **`client/components/DashboardComponents/OverallScore/index.js`** - Completely redesigned component
3. **`client/pages/dashboard.tsx`** - Passed `filterCounselorId` prop to OverallScore

## Features

### Bar Chart Display
- **X-Axis**: Client names (formatted as "FirstName L.")
- **Y-Axis**: Total homework assignments sent
- **Bar Colors**: 
  - 🟢 Green (`#28a745`) for 3 or more homework assignments
  - 🔴 Red (`#dc3545`) for less than 3 homework assignments
- **Labels**: Homework count displayed on top of each bar

### Interactive Tooltip
Hovering over a bar shows:
- Client full name
- Total sessions
- Total homework sent
- Average homework per session

### Role-Based Filtering
- **Counselors (role_id = 2)**: See only their own clients
- **Managers (role_id = 3)**: Can filter by counselor or see all counselors in their tenant
- **Admins (role_id = 4)**: Can view all data

## React Query Integration

The component uses React Query for:
- Automatic data fetching
- Caching
- Background refetching
- Loading and error states

## API Endpoint Used

```
GET /api/session/homework-stats
```

Query Parameters:
- `role_id` (required)
- `counselor_id` (conditional)
- `tenant_id` (optional)

## Response Format

```json
[
  {
    "thrpy_req_id": 321,
    "client_id": 456,
    "client_first_name": "John",
    "client_last_name": "Doe",
    "counselor_id": 789,
    "tenant_id": 1,
    "total_sessions": 5,
    "total_homework_sent": 8,
    "first_session_date": "2025-01-01T00:00:00.000Z",
    "last_session_date": "2025-01-15T00:00:00.000Z"
  }
]
```

## Component Props

### `filterCounselorId` (optional)
- Type: `number | null`
- Description: Used by managers to filter by specific counselor
- If `null` or not provided, shows all counselors in the tenant (for managers)

## States Handled

### Loading State
```jsx
<div style={{ textAlign: "center", padding: "20px" }}>
  Loading...
</div>
```

### Error State
```jsx
<div style={{ textAlign: "center", padding: "20px", color: "red" }}>
  Error loading homework statistics
</div>
```

### No Data State
```jsx
title: {
  text: "No data available",
  left: "center",
  top: "center",
}
```

## Chart Configuration

### ECharts Options
- **Chart Type**: Bar chart
- **Bar Width**: 60%
- **Title**: "Frequency of Homework Sent Out per Client with Threshold Annotations"
- **Legend**: Shows "Below 3" (red) and "3 or Above" (green)
- **Grid**: Responsive with proper margins
- **Axis Labels**: Rotated 45° for better readability

## Usage Example

```jsx
import OverallScore from "../components/DashboardComponents/OverallScore";

function Dashboard() {
  const filterCounselorId = selectedCounselor?.value === "ALL" 
    ? null 
    : selectedCounselor?.value;

  return (
    <DashboardContainer>
      <OverallScore filterCounselorId={filterCounselorId} />
    </DashboardContainer>
  );
}
```

## Threshold Logic

The component uses a threshold of **3 homework assignments**:
- Clients with 3 or more homework assignments are shown in **green** (meeting threshold)
- Clients with less than 3 homework assignments are shown in **red** (below threshold)

This threshold can be easily adjusted by modifying the condition:

```javascript
const barColors = homeworkCounts.map((count) =>
  count >= 3 ? "#28a745" : "#dc3545"  // Change 3 to desired threshold
);
```

## Performance Considerations

1. **React Query Caching**: Data is cached and reused across component re-renders
2. **Memoization**: Chart options are memoized to prevent unnecessary recalculations
3. **Lazy Loading**: ECharts renders efficiently with `notMerge` and `lazyUpdate` props

## Customization Options

### Changing Colors
```javascript
// In the chartOption useMemo
const barColors = homeworkCounts.map((count) =>
  count >= 3 ? "#yourGreenColor" : "#yourRedColor"
);
```

### Changing Chart Height
```jsx
<ReactECharts
  style={{ height: "500px", width: "100%" }}  // Adjust height here
  // ...
/>
```

### Adjusting Bar Width
```javascript
series: [
  {
    // ...
    barWidth: "70%",  // Adjust bar width (default 60%)
  },
]
```

## Testing

To test the component:

1. Start the server: `npm run dev` (server)
2. Start the client: `npm run dev` (client)
3. Login as different roles:
   - Counselor: Should see their own clients
   - Manager: Should see dropdown to filter by counselor
   - Admin: Should see all clients
4. Verify:
   - Bar colors (green for ≥3, red for <3)
   - Hover tooltips
   - Loading states
   - Error handling

## Troubleshooting

### Data Not Showing
- Check if the API endpoint is running
- Verify authentication token is valid
- Check browser console for errors
- Verify query parameters match your role

### Colors Not Displaying
- Ensure `total_homework_sent` field exists in API response
- Check threshold condition logic

### Chart Not Rendering
- Verify `echarts-for-react` is installed
- Check if data format matches expected structure
- Look for console errors related to ECharts

