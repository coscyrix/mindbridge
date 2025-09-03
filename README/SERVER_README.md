# MindBridge Server

This repository contains the server-side code for the MindBridge application. The server is built using Node.js and Express, and it handles various user profile operations.

## API Endpoints

### User Profile

- **POST /api/user-profile**

  - **Description**: Create a new user profile.
  - **Request Body**: JSON containing user profile data.
  - **Response**: JSON containing the created user profile.

- **POST /api/user-profile/user-client-profile**

  - **Description**: Create a new client profile.
  - **Request Body**: JSON containing client profile data.
  - **Response**: JSON containing the created client profile.

- **PUT /api/user-profile**

  - **Description**: Update an existing user profile.
  - **Query Parameters**: `user_profile_id` (required)
  - **Request Body**: JSON containing updated user profile data.
  - **Response**: JSON containing the updated user profile.

- **PUT /api/user-profile/del/**

  - **Description**: Delete a user profile.
  - **Query Parameters**: `user_profile_id` (required)
  - **Response**: JSON confirming the deletion.

- **GET /api/user-profile**

  - **Description**: Retrieve a user profile by ID, email, or user ID.
  - **Query Parameters**: `user_profile_id`, `email`, `user_id` (at least one required)
  - **Response**: JSON containing the user profile.

### User Authentication

- **POST /api/auth/sign-up**

  - **Description**: Register a new user.
  - **Request Body**: JSON containing user registration data.
  - **Response**: JSON containing the registered user information.

- **POST /api/auth/sign-in**

  - **Description**: Authenticate a user and provide a token.
  - **Request Body**: JSON containing user credentials.
  - **Response**: JSON containing the authentication token.

- **POST /api/auth/reset-password**

  - **Description**: Initiate password reset process.
  - **Request Body**: JSON containing user email.
  - **Response**: JSON confirming password reset initiation.

- **POST /api/auth/send-otp**

  - **Description**: Send OTP for verification.
  - **Request Body**: JSON containing necessary details for OTP.
  - **Response**: JSON confirming OTP has been sent.

- **POST /api/auth/verify**

  - **Description**: Verify user account with OTP.
  - **Request Body**: JSON containing OTP and user details.
  - **Response**: JSON confirming account verification.

- **POST /api/auth/change-password**

  - **Description**: Change user password.
  - **Request Body**: JSON containing old and new passwords.
  - **Response**: JSON confirming password change.

### Therapy Requests

- **POST /api/thrpyReq/**

  - **Description**: Create a new therapy request.
  - **Request Body**: JSON containing therapy request details.
  - **Response**: JSON containing the created therapy request.

- **PUT /api/thrpyReq/**

  - **Description**: Update an existing therapy request by ID.
  - **Request Body**: JSON containing updated therapy request data.
  - **Response**: JSON containing the updated therapy request.

- **PUT /api/thrpyReq/discharge/**

  - **Description**: Discharge a therapy request.
  - **Request Body**: JSON containing discharge details.
  - **Response**: JSON confirming discharge.

- **PUT /api/thrpyReq/del/**

  - **Description**: Delete a therapy request by ID.
  - **Request Body**: JSON containing the `thrpyReq` ID.
  - **Response**: JSON confirming deletion.

- **GET /api/thrpyReq/**

  - **Description**: Retrieve a therapy request by ID.
  - **Query Parameters**: `thrpyReq_id` (required)
  - **Response**: JSON containing the therapy request details.

### Sessions

- **POST /api/session/**

  - **Description**: Create a new session.
  - **Request Body**: JSON containing session details.
  - **Response**: JSON containing the created session.

- **PUT /api/session/**

  - **Description**: Update an existing session by ID.
  - **Request Body**: JSON containing updated session data.
  - **Response**: JSON containing the updated session.

- **PUT /api/session/del/**

  - **Description**: Delete a session by ID.
  - **Request Body**: JSON containing the `session_id`.
  - **Response**: JSON confirming deletion.

- **GET /api/session/**

  - **Description**: Retrieve a session by ID.
  - **Query Parameters**: `session_id` (required)
  - **Response**: JSON containing the session details.

### Services

- **POST /api/service/**

  - **Description**: Create a new service.
  - **Request Body**: JSON containing service details.
  - **Response**: JSON containing the created service.

- **PUT /api/service/**

  - **Description**: Update an existing service by ID.
  - **Request Body**: JSON containing updated service data.
  - **Response**: JSON containing the updated service.

- **PUT /api/service/del/**

  - **Description**: Delete a service by ID.
  - **Request Body**: JSON containing the `service_id`.
  - **Response**: JSON confirming deletion.

- **GET /api/service/**

  - **Description**: Retrieve a service by ID.
  - **Query Parameters**: `service_id` (required)
  - **Response**: JSON containing the service details.

### Invoices

- **POST /api/invoice/**

  - **Description**: Create a new invoice.
  - **Request Body**: JSON containing invoice details.
  - **Response**: JSON containing the created invoice.

- **PUT /api/invoice/**

  - **Description**: Update an existing invoice by ID.
  - **Request Body**: JSON containing updated invoice data.
  - **Response**: JSON containing the updated invoice.

- **GET /api/invoice/**

  - **Description**: Retrieve an invoice by ID.
  - **Query Parameters**: `invoice_id` (required)
  - **Response**: JSON containing the invoice details.
