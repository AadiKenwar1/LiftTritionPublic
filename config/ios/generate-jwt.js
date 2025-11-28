const jwt = require("jsonwebtoken");
const fs = require("fs");

// Your Apple Developer info:
const teamId = "MW44ZRD7CN"; // <--- Your Team ID
const keyId = "55A3K8K444"; // <--- Your Key ID (matches filename)
const clientId = "com.LiftLyzerCo.liftLyzer.auth"; // <-- Replace with your Service ID (the one you created earlier)

// Load the private key file you have
const privateKey = fs.readFileSync("./config/ios/AuthKey_55A3K8K444.p8");

const token = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d", // 6 months is maximum allowed
  issuer: teamId,
  audience: "https://appleid.apple.com",
  subject: clientId,
  keyid: keyId,
});

console.log("\n✅ Your generated client secret:\n");
console.log(token);
