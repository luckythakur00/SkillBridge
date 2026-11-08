import { ApiError } from '../services/apiError';
import { getDb, saveDb } from './db';
import { authRoutes } from './handlers/auth';
import { candidateRoutes } from './handlers/candidates';
import { opportunityRoutes } from './handlers/opportunities';
import { applicationRoutes } from './handlers/applications';
import { skillRoutes } from './handlers/skills';
import { programRoutes } from './handlers/programs';
import { recruiterRoutes } from './handlers/recruiter';
import { institutionRoutes } from './handlers/institutions';

const LATENCY_MS = 180;

function compile([method, pattern, handler, options = {}]) {
  const keys = [];
  const source = pattern.replace(/:[a-zA-Z]+/g, (match) => {
    keys.push(match.slice(1));
    return '([^/]+)';
  });
  return { method, regex: new RegExp(`^${source}$`), keys, handler, role: options.role };
}

// Order matters: literal paths such as /opportunities/mine are registered before /opportunities/:id.
const routes = [
  ...authRoutes,
  ...candidateRoutes,
  ...opportunityRoutes,
  ...applicationRoutes,
  ...skillRoutes,
  ...programRoutes,
  ...recruiterRoutes,
  ...institutionRoutes,
].map(compile);

const userFromToken = (token) =>
  token?.startsWith('mock.') ? getDb().users.find((u) => u.id === token.slice(5)) ?? null : null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handleMockRequest({ method, path, params, body, token }) {
  await wait(LATENCY_MS);

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = path.match(route.regex);
    if (!match) continue;

    const user = userFromToken(token);
    if (route.role && !user) throw new ApiError(401, 'Please sign in to continue.');
    if (route.role && route.role !== 'ANY' && user.role !== route.role) {
      throw new ApiError(403, 'Your account type cannot access this resource.');
    }

    const pathParams = Object.fromEntries(route.keys.map((key, index) => [key, match[index + 1]]));
    const result = route.handler({ params: { ...params, ...pathParams }, body: body ?? {}, user });
    saveDb();
    // A copy, so that stores can never change the database by accident.
    return result === undefined ? null : structuredClone(result);
  }
  throw new ApiError(404, `No mock route for ${method} ${path}.`);
}

export { resetDb } from './db';
