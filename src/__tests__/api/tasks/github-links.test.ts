import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGithubLink, mockCreateAuditLog } = vi.hoisted(() => ({
  mockGithubLink: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  mockCreateAuditLog: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { githubLink: mockGithubLink },
}))

vi.mock('@/lib/audit', () => ({
  createAuditLog: mockCreateAuditLog,
}))

import { GET, POST } from '@/app/api/tasks/[id]/github-links/route'

const params = { params: { id: 'task-1' } }

const makeRequest = (body?: object) =>
  new Request('http://localhost/api/tasks/task-1/github-links', {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

describe('GET /api/tasks/[id]/github-links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return github links for a task ordered by createdAt desc', async () => {
    const links = [
      {
        id: 'g1',
        taskId: 'task-1',
        type: 'pr',
        url: 'https://github.com/org/repo/pull/42',
        number: 42,
        title: 'Fix bug',
        createdAt: '2025-04-21T00:00:00.000Z',
      },
      {
        id: 'g2',
        taskId: 'task-1',
        type: 'issue',
        url: 'https://github.com/org/repo/issues/7',
        number: 7,
        title: 'Open issue',
        createdAt: '2025-04-20T00:00:00.000Z',
      },
    ]
    mockGithubLink.findMany.mockResolvedValue(links)

    const res = await GET(makeRequest() as any, params)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual(links)
    expect(mockGithubLink.findMany).toHaveBeenCalledWith({
      where: { taskId: 'task-1' },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should return empty array when no links', async () => {
    mockGithubLink.findMany.mockResolvedValue([])

    const res = await GET(makeRequest() as any, params)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })

  it('should return 500 on database error', async () => {
    mockGithubLink.findMany.mockRejectedValue(new Error('DB error'))

    const res = await GET(makeRequest() as any, params)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Failed to fetch github links')
  })
})

describe('POST /api/tasks/[id]/github-links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a PR link with title and return 201', async () => {
    const newLink = {
      id: 'g3',
      taskId: 'task-1',
      type: 'pr',
      url: 'https://github.com/org/repo/pull/99',
      number: 99,
      title: 'Add feature X',
      createdAt: '2025-04-21T00:00:00.000Z',
    }
    mockGithubLink.create.mockResolvedValue(newLink)
    mockCreateAuditLog.mockResolvedValue({})

    const res = await POST(
      makeRequest({
        type: 'pr',
        url: 'https://github.com/org/repo/pull/99',
        number: 99,
        title: 'Add feature X',
      }) as any,
      params
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('g3')
    expect(body.data.type).toBe('pr')
    expect(body.data.number).toBe(99)
    expect(mockGithubLink.create).toHaveBeenCalledWith({
      data: {
        taskId: 'task-1',
        type: 'pr',
        url: 'https://github.com/org/repo/pull/99',
        number: 99,
        title: 'Add feature X',
      },
    })
    expect(mockCreateAuditLog).toHaveBeenCalledWith({
      taskId: 'task-1',
      entity: 'GithubLink',
      entityId: 'g3',
      action: 'CREATE',
      after: newLink,
    })
  })

  it('should create an issue link without title (optional)', async () => {
    const newLink = {
      id: 'g4',
      taskId: 'task-1',
      type: 'issue',
      url: 'https://github.com/org/repo/issues/5',
      number: 5,
      title: null,
      createdAt: '2025-04-21T00:00:00.000Z',
    }
    mockGithubLink.create.mockResolvedValue(newLink)
    mockCreateAuditLog.mockResolvedValue({})

    const res = await POST(
      makeRequest({
        type: 'issue',
        url: 'https://github.com/org/repo/issues/5',
        number: 5,
      }) as any,
      params
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.title).toBeNull()
    expect(mockGithubLink.create).toHaveBeenCalledWith({
      data: {
        taskId: 'task-1',
        type: 'issue',
        url: 'https://github.com/org/repo/issues/5',
        number: 5,
        title: undefined,
      },
    })
  })

  it('should create a link with number=0 (edge case)', async () => {
    const newLink = {
      id: 'g5',
      taskId: 'task-1',
      type: 'issue',
      url: 'https://github.com/org/repo/issues/0',
      number: 0,
      title: null,
      createdAt: '2025-04-21T00:00:00.000Z',
    }
    mockGithubLink.create.mockResolvedValue(newLink)
    mockCreateAuditLog.mockResolvedValue({})

    const res = await POST(
      makeRequest({
        type: 'issue',
        url: 'https://github.com/org/repo/issues/0',
        number: 0,
      }) as any,
      params
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.number).toBe(0)
  })

  it('should return 400 when type is missing', async () => {
    const res = await POST(
      makeRequest({ url: 'https://github.com/org/repo/pull/1', number: 1 }) as any,
      params
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toBe('type, url, number are required')
    expect(mockGithubLink.create).not.toHaveBeenCalled()
  })

  it('should return 400 when url is missing', async () => {
    const res = await POST(
      makeRequest({ type: 'pr', number: 1 }) as any,
      params
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toBe('type, url, number are required')
    expect(mockGithubLink.create).not.toHaveBeenCalled()
  })

  it('should return 400 when number is missing (undefined)', async () => {
    const res = await POST(
      makeRequest({ type: 'pr', url: 'https://github.com/org/repo/pull/1' }) as any,
      params
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toBe('type, url, number are required')
    expect(mockGithubLink.create).not.toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    mockGithubLink.create.mockRejectedValue(new Error('DB error'))

    const res = await POST(
      makeRequest({ type: 'pr', url: 'https://github.com/org/repo/pull/1', number: 1 }) as any,
      params
    )
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Failed to create github link')
  })
})
