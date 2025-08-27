const { spawn } = require('child_process');
const path = require('path');

const FORTUNE_TOOL_DEFINITION = {
  type: 'function',
  function: {
    name: 'fetch_todays_fortune',
    description:
      '사용자의 생년월일, 태어난 시간, 성별을 바탕으로 신한라이프 사주 API에서 오늘의 운세를 가져옵니다.',
    parameters: {
      type: 'object',
      properties: {
        birthday: {
          type: 'string',
          description: '생년월일. 예: 1990-01-15',
        },
        birthtime: {
          type: 'string',
          description: '태어난 시간. 24시간 HH:MM 형식. 예: 07:30',
        },
        gender: {
          type: 'string',
          enum: ['M', 'F'],
          description: '성별. 남자는 M, 여자는 F',
        },
        today: {
          type: 'string',
          description: '선택 사항. YYYY-MM-DD. 테스트용 날짜 고정에 사용.',
        },
      },
      required: ['birthday', 'birthtime', 'gender'],
    },
  },
};

function parsePythonOutput(output) {
  const parsedMarker = '== Parsed ==';
  const markerIndex = output.indexOf(parsedMarker);
  if (markerIndex === -1) {
    return { rawOutput: output.trim() };
  }

  const jsonStart = markerIndex + parsedMarker.length;
  const jsonText = output.slice(jsonStart).trim();
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return { rawOutput: output.trim(), parseError: error.message };
  }
}

async function callFortuneTool(args) {
  const scriptPath = path.resolve(__dirname, '../saju-bot/todays_fortune.py');
  const pythonArgs = [
    scriptPath,
    '--birthday',
    args.birthday,
    '--birthtime',
    args.birthtime,
    '--gender',
    args.gender,
  ];

  if (args.today) {
    pythonArgs.push('--today', args.today);
  }

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', pythonArgs, {
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || stdout || `todays_fortune.py exited with code ${code}`));
        return;
      }

      const parsed = parsePythonOutput(stdout);
      resolve(parsed);
    });

    pythonProcess.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
  FORTUNE_TOOL_DEFINITION,
  callFortuneTool,
};
