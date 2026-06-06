export function normalizeEnv(input = {}) {
  return {
    STORAGE_MODE: input.STORAGE_MODE?.trim() || 'local-first',
    STORAGE_UPLOADS_DIR: input.STORAGE_UPLOADS_DIR?.trim() || 'storage/uploads',
    STORAGE_EXPORTS_DIR: input.STORAGE_EXPORTS_DIR?.trim() || 'storage/exports',
    STORAGE_TEMP_DIR: input.STORAGE_TEMP_DIR?.trim() || 'storage/temp'
  };
}
