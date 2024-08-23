import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  testEnvironment: "@happy-dom/jest-environment",
  projects: await getJestProjectsAsync(),
});
