export function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(payload));
}

export function sendBinary(response, statusCode, content, mimeType, fileName) {
  response.writeHead(statusCode, {
    'Content-Type': mimeType || 'application/octet-stream',
    'Content-Length': content.byteLength,
    'Content-Disposition': `inline; filename="${encodeURIComponent(fileName || 'attachment.bin')}"`
  });
  response.end(content);
}
