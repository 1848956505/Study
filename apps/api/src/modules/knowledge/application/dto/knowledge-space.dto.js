export function buildDefaultKnowledgeSpaceDto({ userId }) {
  return {
    id: `space-${userId}`,
    userId,
    name: 'Default Space',
    description: 'Primary knowledge space'
  };
}
