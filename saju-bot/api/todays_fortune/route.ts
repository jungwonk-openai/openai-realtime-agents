import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  const { birthday, birthtime, gender, today, timeout } = await req.json();
  const script = path.join(process.cwd(), 'saju-bot', 'todays_fortune.py');
  const args = ['--birthday', birthday, '--birthtime', birthtime, '--gender', gender];
  if (today) args.push('--today', today);
  if (timeout) args.push('--timeout', String(timeout));

  return await new Promise((resolve) => {
    const proc = spawn('python', [script, ...args]);
    let out = '';
    proc.stdout.on('data', (d) => (out += d));
    proc.on('close', () => {
      const parsed = /== Parsed ==\n([\s\S]*)$/.exec(out);
      resolve(
        NextResponse.json(parsed ? JSON.parse(parsed[1]) : { error: 'parse failed' }),
      );
    });
  });
}
