const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

// Language ID Mapping for Judge0 API
// 71: Python 3.8.1, 63: JavaScript (Node.js 12.14.0), 54: C++ (GCC 9.2.0), 62: Java (OpenJDK 13.0.1)
const JUDGE0_LANG_IDS = {
  python: 71,
  py: 71,
  javascript: 63,
  js: 63,
  cpp: 54,
  'c++': 54,
  java: 62
};

/**
 * Execute JavaScript natively using Node.js child process
 */
function executeLocalJS(code, stdin = '') {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `academia_js_${Date.now()}_${Math.random().toString(36).substring(7)}.js`);

    try {
      fs.writeFileSync(filePath, code, 'utf-8');
    } catch (err) {
      resolve({
        success: false,
        output: '',
        error: 'FileSystem Error: ' + err.message,
        exitCode: 1
      });
      return;
    }

    const child = spawn('node', [filePath], { timeout: 8000 });
    let stdout = '';
    let stderr = '';

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on('data', data => stdout += data);
    child.stderr.on('data', data => stderr += data);

    child.on('close', code => {
      try { fs.unlinkSync(filePath); } catch (e) {}
      const isSuccess = code === 0;
      resolve({
        success: isSuccess,
        output: (stdout || stderr || '').trim(),
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code || 0
      });
    });

    child.on('error', err => {
      try { fs.unlinkSync(filePath); } catch (e) {}
      resolve({
        success: false,
        output: '',
        error: 'Execution Process Error: ' + err.message,
        exitCode: 1
      });
    });
  });
}

/**
 * Execute multi-language code via Judge0 Open CE API
 */
function executeViaJudge0(languageKey, code, stdin = '') {
  return new Promise((resolve) => {
    const langClean = (languageKey || 'python').toLowerCase();
    const languageId = JUDGE0_LANG_IDS[langClean] || 71;

    const payload = JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin: stdin
    });

    const options = {
      hostname: 'ce.judge0.com',
      port: 443,
      path: '/submissions?wait=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const stdout = (parsed.stdout || '').trim();
          const stderr = (parsed.stderr || parsed.compile_output || '').trim();
          const statusId = parsed.status ? parsed.status.id : 3;

          const isSuccess = statusId === 3; // 3 = Accepted
          const errorMsg = statusId !== 3 ? (stderr || (parsed.status ? parsed.status.description : 'Execution Failed')) : stderr;

          resolve({
            success: isSuccess,
            output: stdout || stderr,
            stdout,
            stderr,
            error: errorMsg,
            exitCode: isSuccess ? 0 : 1,
            time: parsed.time,
            memory: parsed.memory
          });
        } catch (err) {
          resolve({
            success: false,
            output: '',
            error: 'Failed to parse execution result: ' + err.message,
            exitCode: 1
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: 'Code Execution Engine Unavailable: ' + err.message,
        exitCode: 1
      });
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Unified Code Execution Interface
 */
async function executeCode(languageKey, code, stdin = '') {
  const lang = (languageKey || 'python').toLowerCase();

  // If JavaScript, run with local high-speed Node sandbox
  if (lang === 'javascript' || lang === 'js') {
    return await executeLocalJS(code, stdin);
  }

  // Otherwise use Judge0 API
  return await executeViaJudge0(languageKey, code, stdin);
}

module.exports = {
  executeCode,
  JUDGE0_LANG_IDS
};
