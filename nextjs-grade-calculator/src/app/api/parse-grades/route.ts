import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

// const PYTHON_SCRIPT_PATH = process.env.PYTHON_SCRIPT_PATH || path.join(process.cwd(), 'app.py');

export async function POST(req: NextRequest) {
    try {
        const { sisData } = await req.json();
        
        const python = spawn('python', ["./src/app.py"]);
        
        let result = '';
        let error = '';

        python.stdout.on('data', (data) => {
            result += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        return new Promise((resolve) => {
            python.on('close', (code) => {
                if (code !== 0) {
                    console.error('Python script error:', error);
                    resolve(NextResponse.json({ error: 'Error parsing grades' }, { status: 500 }));
                } else {
                    try {
                        const parsedResult = JSON.parse(result);
                        if (parsedResult.error) {
                            resolve(NextResponse.json({ error: parsedResult.error }, { status: 500 }));
                        } else if (parsedResult.grades && parsedResult.types) {
                            resolve(NextResponse.json({ grades: parsedResult.grades, types: parsedResult.types }));
                        } else {
                            resolve(NextResponse.json({ error: 'Unexpected response format' }, { status: 500 }));
                        }
                    } catch (parseError) {
                        console.error('Error parsing Python output:', parseError);
                        resolve(NextResponse.json({ error: 'Error parsing grades' }, { status: 500 }));
                    }
                }
            });

            python.stdin.write(JSON.stringify({ sisData }));
            python.stdin.end();
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

