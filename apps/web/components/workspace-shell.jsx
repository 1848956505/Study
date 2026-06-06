import { IconRail } from './icon-rail.jsx';
import { TopBar } from './top-bar.jsx';
import { StatusBar } from './status-bar.jsx';

export function WorkspaceShell({ children }) {
  return (
    <div className="workspace-shell app-root">
      <IconRail />
      <div className="workspace-main">
        <TopBar />
        <main className="workspace-stage">{children}</main>
        <StatusBar />
      </div>
    </div>
  );
}
