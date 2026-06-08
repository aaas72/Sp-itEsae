const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🔍 Detecting connected Android devices...");

// 1. Get connected devices via adb
let devices = [];
try {
  const adbOut = execSync('adb devices').toString();
  const lines = adbOut.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && line.includes('device') && !line.includes('List of devices')) {
      const parts = line.split(/\s+/);
      devices.push(parts[0]);
    }
  }
} catch (err) {
  console.error("❌ Failed to list adb devices:", err.message);
  process.exit(1);
}

if (devices.length === 0) {
  console.error("❌ No Android devices or emulators found. Please start your emulators first!");
  process.exit(1);
}

console.log(`✅ Found ${devices.length} connected device(s):`, devices);

const shouldBuild = !process.argv.includes('--no-build');

// 2. Build the APK using Gradle (unless --no-build is specified)
const appDir = path.join(__dirname, '..');
const apkPath = path.join(appDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

if (shouldBuild) {
  console.log("\n🔨 Building the Android app (assembleDebug)... This might take a few minutes...");
  try {
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    execSync(`${gradlew} assembleDebug`, { 
      cwd: path.join(appDir, 'android'), 
      stdio: 'inherit' 
    });
    console.log("✅ Gradle build successful!");
  } catch (err) {
    console.error("❌ Gradle build failed:", err.message);
    process.exit(1);
  }
} else {
  console.log("\n⚡ Skipping build step (--no-build flag detected). Deploying existing APK...");
  if (!fs.existsSync(apkPath)) {
    console.log("⚠️ Existing APK not found! Forcing a new build...");
    try {
      const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
      execSync(`${gradlew} assembleDebug`, { 
        cwd: path.join(appDir, 'android'), 
        stdio: 'inherit' 
      });
      console.log("✅ Gradle build successful!");
    } catch (err) {
      console.error("❌ Gradle build failed:", err.message);
      process.exit(1);
    }
  }
}

if (!fs.existsSync(apkPath)) {
  console.error("❌ Built APK not found at target location:", apkPath);
  process.exit(1);
}

// 3. Install and run on all devices in parallel
console.log("\n🚀 Installing and launching on all devices simultaneously...");
const promises = devices.map(device => {
  return new Promise((resolve) => {
    try {
      console.log(`[${device}] Installing APK...`);
      execSync(`adb -s ${device} install -r "${apkPath}"`);
      console.log(`[${device}] ✅ APK Installed!`);
      
      console.log(`[${device}] Launching app...`);
      // Use monkey command to launch launcher activity of our package dynamically
      execSync(`adb -s ${device} shell monkey -p com.splitesae.app -c android.intent.category.LAUNCHER 1`);
      console.log(`[${device}] ✅ App Launched!`);
      resolve();
    } catch (err) {
      console.error(`[${device}] ❌ Failed:`, err.message);
      resolve();
    }
  });
});

Promise.all(promises).then(() => {
  console.log("\n🎉 Done! The app is now running on all emulators/devices.");
  console.log("Make sure your Metro bundler (npm run start) is running to allow hot-reloading.");
});
