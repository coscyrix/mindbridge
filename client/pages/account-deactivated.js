import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Container, Button } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import Cookies from "js-cookie";

function AccountDeactivated() {
  const router = useRouter();

  useEffect(() => {
    // Clear any existing session data without redirecting
    Cookies.remove("token");
    Cookies.remove("user");
    Cookies.remove("accountVerified");
    Cookies.remove("email");
    localStorage.removeItem("user");
    Cookies.remove("note_verification_time");
  }, []);

  const handleGoToLogin = () => {
    router.push("/login");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: 4,
        }}
      >
        <LockIcon
          sx={{
            fontSize: 80,
            color: "error.main",
            marginBottom: 2,
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Account Deactivated
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
          Your account has been deactivated by your administrator.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Please contact your administrator or tenant to reactivate your account.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToLogin}
          sx={{ mt: 2 }}
        >
          Return to Login
        </Button>
      </Box>
    </Container>
  );
}

export default AccountDeactivated;

