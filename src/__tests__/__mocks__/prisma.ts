import { vi } from 'vitest'

export const prisma = {
  project: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  task: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  approval: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  document: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  auditLog: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  taskMessage: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  decision: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  githubLink: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  memorySnapshot: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma,
}))
