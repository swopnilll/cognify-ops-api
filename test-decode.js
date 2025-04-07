// test-decode.js
const jwt = require('jsonwebtoken');

// --- IMPORTANT ---
// Replace the placeholder below with the actual token string from your server log
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNBd1N0dVN1blJlelc1UEg5bDdQZyJ9.eyJpc3MiOiJodHRwczovL2Rldi1maGU4NzBpZW0xNW50N3I3LmF1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2N2VmM2YzMjhiNTUxOWM2NGJhNDBlZDgiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuY29nbmlmeW9wcy5jb20iLCJodHRwczovL2Rldi1maGU4NzBpZW0xNW50N3I3LmF1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NDQwMTQ0ODEsImV4cCI6MTc0NDEwMDg4MSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImd0eSI6InBhc3N3b3JkIiwiYXpwIjoidzB0SmJFQk1qU1g0MTBlejhVVjJIMnJLTktqc0lHd3cifQ.OMTR55tUCkBN8xrH6aVpYlcsIubXU-DHzzY7bbMrLHQZqjij0ZeJPGK2cwV5mJyTiaFIXgRviSlr0alA1w-kaUczvW0VJdNzjybbDpu6NWGPsrSxH9gcdEYrujx3rGhaAOTXaNUwidC_sB4eGLFdfCUlSx410AhYNA3F0fCAoWQXMWQrivlViTmZ8-YqfQMHLkBxC2wzfBhexcCwFjnDlt7w9_xdocaP3Ixmq-LfUqUg9O9A6FvhUdDCNejJOszjXl9KrVKSWDq3gOtBctp8V25pNP3HUOcJlbBz3He8eNOcX4LZ31y0kPc_4AUOtpyQXMfyDvN1PJDKLL2dOwyVMw";
// For example: const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNBd1N0dVN1blJlelc1UEg5bDdQZyJ9.eyJpc3MiOiJodHRwczovL2Rldi1maGU4NzBpZW0xNW50N3I3LmF1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2N2VmM2YzMjhiNTUxOWM2NGJhNDBlZDgiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuY29nbmlmeW9wcy5jb20iLCJodHRwczovL2Rldi1maGU4NzBpZW0xNW50N3I3LmF1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NDQwMTQ0ODEsImV4cCI6MTc0NDEwMDg4MSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImd0eSI6InBhc3N3b3JkIiwiYXpwIjoidzB0SmJFQk1qU1g0MTBlejhVVjJIMnJLTktqc0lHd3cifQ.OMTR55tUCkBN8xrH6aVpYlcsIubXU-DHzzY7bbMrLHQZqjij0ZeJPGK2cwV5mJyTiaFIXgRviSlr0alA1w-kaUczvW0VJdNzjybbDpu6NWGPsrSxH9gcdEYrujx3rGhaAOTXaNUwidC_sB4eGLFdfCUlSx410AhYNA3F0fCAoWQXMWQrivlViTmZ8-YqfQMHLkBxC2wzfBhexcCwFjnDlt7w9_xdocaP3Ixmq-LfUqUg9O9A6FvhUdDCNejJOszjXl9KrVKSWDq3gOtBctp8V25pNP3HUOcJlbBz3He8eNOcX4LZ31y0kPc_4AUOtpyQXMfyDvN1PJDKLL2dOwyVMw";

if (!token || token === "PASTE_YOUR_EXACT_TOKEN_HERE") {
  console.error("Error: Please replace 'PASTE_YOUR_EXACT_TOKEN_HERE' with the actual token.");
  process.exit(1); // Exit the script
}

console.log("Attempting to decode token:", token);

try {
  // Decode the token to get header and payload without verifying the signature
  const decoded = jwt.decode(token, { complete: true });

  if (decoded) {
    console.log("\n✅ Decoded successfully:");
    console.log(JSON.stringify(decoded, null, 2)); // Pretty print the JSON
  } else {
    // This is likely the case you are hitting in your app
    console.error("\n❌ jwt.decode returned null. The token string might be malformed or invalid for decoding.");
  }
} catch (err) {
  console.error("\n❌ jwt.decode threw an error:", err);
}