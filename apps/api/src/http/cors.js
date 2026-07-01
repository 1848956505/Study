const DEFAULT_CORS_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const DEFAULT_CORS_HEADERS = 'Content-Type';

export function parseCorsAllowedOrigins(value = '') {
  if (Array.isArray(value)) {
    return value.map((origin) => String(origin).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin, allowedOrigins) {
  return Boolean(origin) && (
    allowedOrigins.includes('*') || allowedOrigins.includes(origin)
  );
}

export function applyCorsHeaders(response, request, allowedOrigins = []) {
  const origin = request.headers.origin;
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return false;
  }

  response.setHeader(
    'Access-Control-Allow-Origin',
    allowedOrigins.includes('*') ? '*' : origin
  );
  response.setHeader('Access-Control-Allow-Methods', DEFAULT_CORS_METHODS);
  response.setHeader('Access-Control-Allow-Headers', DEFAULT_CORS_HEADERS);

  if (!allowedOrigins.includes('*')) {
    response.setHeader('Vary', 'Origin');
  }

  return true;
}

export function handleCorsPreflight({ request, response, allowedOrigins = [] }) {
  if (request.method !== 'OPTIONS' || !request.headers.origin) {
    return false;
  }

  if (!applyCorsHeaders(response, request, allowedOrigins)) {
    response.writeHead(403, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(JSON.stringify({
      error: {
        code: 'CORS_ORIGIN_FORBIDDEN',
        message: 'CORS origin is not allowed'
      }
    }));
    return true;
  }

  response.writeHead(204);
  response.end();
  return true;
}
