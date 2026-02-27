# Security Review Notes

Date: 2026-02-27

## Scope

- Electron main/preload process boundaries
- Local file persistence IPC surface
- Secret exposure in repository/runtime logs
- Auth flow and network call usage
- Dependency vulnerability posture

## Findings

1. High: IPC file path traversal risk in Electron main process.
   - `save-file` and `load-file` accepted renderer-controlled filenames without validation.
   - A compromised renderer could attempt to read/write arbitrary files using path traversal.
   - Status: Fixed by strict filename validation (`*.json`), resolved-path confinement to app data dir, trusted renderer checks, and file-size limits.

2. Medium: Renderer navigation/window-open hardening was incomplete.
   - Navigation controls did not explicitly block unexpected navigation or popup windows.
   - Status: Fixed by denying `window.open` and blocking unexpected navigations.

3. Medium: Development URL and DevTools exposure were too permissive.
   - `ELECTRON_START_URL` was consumed without sanitization, and DevTools opened automatically in dev mode.
   - Status: Fixed by loopback-only URL sanitization and opt-in DevTools (`OPEN_DEVTOOLS=true`).

4. Low: Runtime metadata leakage in logs.
   - Firebase project id was logged on startup.
   - Status: Fixed by removing the startup log line.

5. Low: External runtime stylesheet request from CDN.
   - `index.html` loaded a remote font stylesheet, increasing supply-chain/network surface.
   - Status: Fixed by removing remote stylesheet include.

## Dependency Vulnerability Audit Status

- Attempted `npm audit --omit=dev` on 2026-02-27.
- Could not complete due to offline/DNS failure to `registry.npmjs.org` in current environment.
- Follow-up required in network-enabled CI or workstation:
  - Run `npm audit --omit=dev`
  - Run full `npm audit`
  - Patch high/critical findings and regenerate lockfile

## Auth and Secret Handling Notes

- No hardcoded private keys or secret files were found in tracked files.
- Firebase client config is environment-driven and expected to be public client metadata.
- No active sign-in flow is implemented in current source; if auth is added later, enforce provider restrictions and secure token/session handling.
