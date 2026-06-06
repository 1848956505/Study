import { KnowledgeBaseWorkspace } from '../components/knowledge-base-workspace.jsx';
import { WorkspaceShell } from '../components/workspace-shell.jsx';

export default function Page() {
  return (
    <WorkspaceShell>
      <KnowledgeBaseWorkspace />
    </WorkspaceShell>
  );
}
