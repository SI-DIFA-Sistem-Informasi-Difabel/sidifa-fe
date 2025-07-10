// Script untuk test reset password
// Jalankan dengan: node test-reset-password.js

import axios from "axios";

// Konfigurasi
const API_URL = "https://apisd.krisnabmntr.my.id/api/v1";
const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imhpc3lhbWthbWlsOTlAZ21haWwuY29tIiwiaWF0IjoxNzUyMDkzNTUwLCJleHAiOjE3NTIwOTUzNTB9.O-u88Z5xpwKwhLFt9gj1dGucaS0PaikvLZJ5xv0tipc";
const NEW_PASSWORD = "Admins1234";

async function testResetPassword() {
  try {
    console.log("🧪 Testing Reset Password...");
    console.log("API URL:", API_URL);
    console.log("Token:", TEST_TOKEN);
    console.log("New Password:", NEW_PASSWORD);

    const requestData = {
      token: TEST_TOKEN,
      password: NEW_PASSWORD,
    };

    console.log("\n📤 Request Data:", JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      `${API_URL}/auth/reset-password`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      },
    );

    console.log("\n✅ Success Response:");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  } catch (error) {
    console.log("\n❌ Error Response:");
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Message:", error.message);

    if (error.response?.headers) {
      console.log("Headers:", error.response.headers);
    }
  }
}

// Test CORS preflight
async function testCORS() {
  try {
    console.log("\n🌐 Testing CORS...");

    const response = await axios.options(`${API_URL}/auth/reset-password`, {
      headers: {
        Origin: "https://your-frontend-domain.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    console.log("CORS Headers:", response.headers);
  } catch (error) {
    console.log("CORS Error:", error.message);
  }
}

// Jalankan test
async function runTests() {
  await testCORS();
  await testResetPassword();
}

runTests();
