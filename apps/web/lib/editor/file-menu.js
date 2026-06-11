function normalizeExistingTitles(items) {
  return new Set((items ?? []).map((item) => String(item ?? '').trim()).filter(Boolean));
}

export function createUntitledName(existingTitles, baseLabel) {
  const taken = normalizeExistingTitles(existingTitles);
  const trimmedBase = String(baseLabel ?? '').trim() || 'Untitled Note';

  if (!taken.has(trimmedBase)) {
    return trimmedBase;
  }

  let index = 2;
  while (taken.has(`${trimmedBase} ${index}`)) {
    index += 1;
  }

  return `${trimmedBase} ${index}`;
}

export function createDuplicateTitle(existingTitles, sourceTitle) {
  const taken = normalizeExistingTitles(existingTitles);
  const baseTitle = String(sourceTitle ?? '').trim() || 'Untitled Note';
  const copyBase = `${baseTitle} Copy`;

  if (!taken.has(copyBase)) {
    return copyBase;
  }

  let index = 2;
  while (taken.has(`${copyBase} ${index}`)) {
    index += 1;
  }

  return `${copyBase} ${index}`;
}

export function buildExportFileName(title, extension) {
  const safeBase = String(title ?? '')
    .trim()
    .replace(/\//g, ' - ')
    .replace(/[\\:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Untitled Note';

  return `${safeBase}.${String(extension ?? '').trim() || 'txt'}`;
}
