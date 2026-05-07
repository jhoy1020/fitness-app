// MSW Node Integration (Jest / unit tests)
//
// Usage in a test setup file:
//   import { server } from 'src/mocks/node';
//   beforeAll(() => server.listen());
//   afterEach(() => server.resetHandlers());
//   afterAll(() => server.close());

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
