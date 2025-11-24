const fs = require('fs');
const path = require('path');

console.log("🔧 Ensuring .expo/web directory exists...");

const expoWebPath = path.join(process.cwd(), '.expo', 'web');
try {
  if (!fs.existsSync(expoWebPath)) {
    fs.mkdirSync(expoWebPath, { recursive: true });
    console.log("✅ Created .expo/web directory");
  } else {
    console.log("✅ .expo/web directory already exists");
  }
} catch (error) {
  console.warn("⚠️ Could not create .expo/web:", error.message);
  // Don't fail the build, just warn
}

