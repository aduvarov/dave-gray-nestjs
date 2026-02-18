import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
    private readonly logDir = path.join(process.cwd(), 'logs');
    private readonly logFile = path.join(this.logDir, 'myLogFile.log');

    async logToFile(entry: string) {
        const formattedEntry = `${new Date().toISOString()}\t${entry}\n`;

        try {
            // Check once or use a flag to avoid repeated disk I/O checks
            if (!fs.existsSync(this.logDir)) {
                await fsPromises.mkdir(this.logDir, { recursive: true });
            }
            await fsPromises.appendFile(this.logFile, formattedEntry);
        } catch (e) {
            if (e instanceof Error)
                console.error(`Failed to write log: ${e.message}`);
        }
    }

    log(message: any, context?: string) {
        super.log(message, context); // Print to console immediately
        this.logToFile(`[LOG] [${context || 'App'}] ${message}`).catch(
            (err) => {
                // Fallback: if file logging fails, at least print it to stderr
                console.error('File logger failed:', err);
            },
        );
    }

    error(message: any, stackOrContext?: string) {
        super.error(message, stackOrContext);
        this.logToFile(`[ERROR] [${stackOrContext || 'App'}] ${message}`).catch(
            (err) => {
                // Fallback: if file logging fails, at least print it to stderr
                console.error('File logger failed:', err);
            },
        );
    }

    warn(message: any, context?: string) {
        super.warn(message, context);
        this.logToFile(`[WARN] [${context || 'App'}] ${message}`).catch(
            (err) => {
                // Fallback: if file logging fails, at least print it to stderr
                console.error('File logger failed:', err);
            },
        );
    }
}
