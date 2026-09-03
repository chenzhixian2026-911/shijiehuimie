const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = process.cwd();
const zipPath = path.join(projectDir, 'mingit.zip');
const extractDir = path.join(projectDir, 'git');

// Multiple mirror URLs for Git portable
const urls = [
  'https://mirrors.huaweicloud.com/git-for-windows/MinGit-2.45.2-64-bit.zip',
  'https://npmmirror.com/mirrors/git-for-windows/v2.45.2.windows.1/MinGit-2.45.2-64-bit.zip',
  'https://github.com/git-for-windows/git/releases/download/v2.45.2.windows.1/MinGit-2.45.2-64-bit.zip',
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Trying to download from:', url);
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Node.js'
      }
    }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 307) {
        const redirectUrl = response.headers.location;
        console.log('Redirecting to:', redirectUrl);
        response.resume();
        downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      let downloadedSize = 0;
      let lastProgress = 0;
      
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = Math.floor((downloadedSize / totalSize) * 100);
        if (progress - lastProgress >= 10) {
          lastProgress = progress;
          console.log(`Download progress: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(1)}MB / ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
        }
      });
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function tryDownload() {
  for (const url of urls) {
    try {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      await downloadFile(url, zipPath);
      console.log('Download successful!');
      return true;
    } catch (err) {
      console.log('Failed to download from', url, ':', err.message);
    }
  }
  return false;
}

async function main() {
  console.log('Step 1: Downloading MinGit (portable Git)...');
  const success = await tryDownload();
  
  if (!success) {
    console.error('\nFailed to download Git automatically.');
    console.log('Please install Git manually from https://git-scm.com/download/win');
    process.exit(1);
  }
  
  console.log('\nStep 2: Extracting...');
  try {
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
    
    // Use PowerShell to extract zip
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`, {
      stdio: 'inherit'
    });
    
    // MinGit extracts to a subdirectory like "mingw64" or directly? Let's check
    const extractedContents = fs.readdirSync(extractDir);
    console.log('Extracted contents:', extractedContents);
    
    // Find where git.exe is
    function findGitExe(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const found = findGitExe(fullPath);
          if (found) return found;
        } else if (file === 'git.exe' && fullPath.includes('cmd')) {
          return fullPath;
        }
      }
      return null;
    }
    
    // Wait a bit for filesystem
    await new Promise(r => setTimeout(r, 500));
    
    let gitExe = findGitExe(extractDir);
    console.log('Git executable found at:', gitExe);
    
    if (gitExe) {
      // Create VS Code settings pointing to this git.exe
      const vscodeDir = path.join(projectDir, '.vscode');
      if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
      }
      
      const settingsPath = path.join(vscodeDir, 'settings.json');
      const settings = {
        "git.path": gitExe
      };
      
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('Created VS Code settings at:', settingsPath);
      console.log('Git path configured to:', gitExe);
      
      // Clean up zip
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      
      console.log('\n✅ Success!');
      console.log('Please reload the IDE window now:');
      console.log('1. Press Ctrl+Shift+P');
      console.log('2. Type "Developer: Reload Window" and press Enter');
      console.log('\nAfter reloading, Git should work!');
    } else {
      console.error('Could not find git.exe after extraction');
    }
    
  } catch (err) {
    console.error('Error during extraction:', err.message);
    console.log('You can manually extract the zip file:', zipPath);
  }
}

main();
