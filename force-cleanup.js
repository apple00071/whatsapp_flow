const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Kill any Chrome processes that might be holding onto the session
function killChrome() {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec('taskkill /f /im chrome.exe', (error) => {
        if (error) {
          console.log('No Chrome processes found or could not kill them');
        } else {
          console.log('Chrome processes terminated');
        }
        resolve();
      });
    } else {
      exec('pkill -f chrome', (error) => {
        if (error) {
          console.log('No Chrome processes found or could not kill them');
        } else {
          console.log('Chrome processes terminated');
        }
        resolve();
      });
    }
  });
}

async function forceCleanup() {
  console.log('Starting aggressive cleanup...');
  
  // First kill any Chrome processes
  await killChrome();
  
  // Directories to clean
  const dirs = [
    '.wwebjs_auth',
    '.wwebjs_cache',
    '.wwebjs_data',
    'data'
  ];

  // Delete directories
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, dir);
    try {
      if (fs.existsSync(dirPath)) {
        console.log(`Removing ${dir}...`);
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✓ Removed ${dir}`);
      }
    } catch (error) {
      console.error(`Error removing ${dir}:`, error);
    }
  }

  console.log('Cleanup completed');
}

forceCleanup().catch(console.error); 