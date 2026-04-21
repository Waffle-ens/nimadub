import { prisma } from "./prisma";

interface CreateAuditLogParams {
  taskId?: string;
  entity: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  actor?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  return prisma.auditLog.create({
    data: {
      taskId: params.taskId,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      before: params.before ? JSON.stringify(params.before) : undefined,
      after: params.after ? JSON.stringify(params.after) : undefined,
      actor: params.actor,
    },
  });
}
