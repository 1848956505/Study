export async function uploadAttachmentImage({ file, noteId }) {
  if (!(file instanceof File)) {
    throw new Error('Image upload requires a file');
  }
  if (!noteId) {
    throw new Error('Please select a note before uploading images');
  }

  const contentBase64 = await fileToBase64(file);
  const response = await fetch('/api/storage/attachments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      noteId,
      fileName: file.name || 'image.png',
      mimeType: file.type || 'image/png',
      contentBase64
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Image upload failed');
  }

  const attachmentId = payload?.data?.id;
  if (!attachmentId) {
    throw new Error('Image upload response is missing attachment id');
  }

  return `/api/storage/attachments/${encodeURIComponent(attachmentId)}/content`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read image file'));
        return;
      }

      const commaIndex = result.indexOf(',');
      resolve(commaIndex === -1 ? result : result.slice(commaIndex + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
