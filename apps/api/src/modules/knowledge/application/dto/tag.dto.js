function trimIfString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

export function buildCreateTagDto(input) {
  return {
    id: input.id,
    spaceId: input.spaceId,
    name: trimIfString(input.name),
    color: input.color ?? 'slate'
  };
}

export function buildUpdateTagDto(input) {
  const dto = {};

  if (input.name !== undefined) {
    dto.name = trimIfString(input.name);
  }
  if (input.color !== undefined) {
    dto.color = input.color;
  }

  return dto;
}
