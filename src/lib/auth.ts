// Client-side auth SDK singleton. Auth is handled by better-auth's client —
// not tRPC and not a Server Action — because the library sets the session
// cookie through its own handler at /api/auth/[...all] (see AGENTS.md §4).
// Only `better-auth/react`'s client factory is used here; no React APIs.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
