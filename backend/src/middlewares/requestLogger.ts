import { Request, Response, NextFunction } from 'express';

interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  path: string;
  query: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: {
    authorization?: string;
    'content-type'?: string;
    origin?: string;
    referer?: string;
    'user-agent'?: string;
  };
  ip?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request details
  const logData: RequestLog = {
    timestamp,
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    headers: {
      'content-type': req.headers['content-type'],
      origin: req.headers.origin,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent'],
      authorization: req.headers.authorization ? '***REDACTED***' : undefined,
    },
  };

  // Log request body (but exclude sensitive fields)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Redact sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '***REDACTED***';
    if (sanitizedBody.token) sanitizedBody.token = '***REDACTED***';
    if (sanitizedBody.secret) sanitizedBody.secret = '***REDACTED***';
    logData.body = sanitizedBody;
  }

  // Log incoming request
  console.log('\n📥 ===== INCOMING REQUEST =====');
  console.log(`⏰ Time: ${logData.timestamp}`);
  console.log(`🔹 Method: ${logData.method}`);
  console.log(`🔹 URL: ${logData.url}`);
  console.log(`🔹 Path: ${logData.path}`);
  if (Object.keys(logData.query).length > 0) {
    console.log(`🔹 Query:`, JSON.stringify(logData.query, null, 2));
  }
  if (logData.body) {
    console.log(`🔹 Body:`, JSON.stringify(logData.body, null, 2));
  }
  console.log(`🔹 IP: ${logData.ip}`);
  if (logData.headers && logData.headers.origin) {
    console.log(`🔹 Origin: ${logData.headers.origin}`);
  }

  // Capture response details
  const originalSend = res.send;
  res.send = function (body: unknown) {
    const responseTime = Date.now() - startTime;
    logData.statusCode = res.statusCode;
    logData.responseTime = responseTime;

    // Log response
    console.log('\n📤 ===== RESPONSE =====');
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.log(`🔹 Status: ${logData.statusCode}`);
    console.log(`🔹 Response Time: ${responseTime}ms`);
    if (logData.statusCode && logData.statusCode >= 400) {
      console.log(`❌ Error Response:`, typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body).substring(0, 200));
    }
    console.log('========================\n');

    return originalSend.call(this, body);
  };

  // Handle errors
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    if (!logData.statusCode) {
      logData.statusCode = res.statusCode;
      logData.responseTime = responseTime;
    }
  });

  next();
};

export default requestLogger;

