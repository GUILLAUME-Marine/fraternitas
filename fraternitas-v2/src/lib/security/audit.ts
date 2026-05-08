import { prisma } from "@/lib/prisma";

interface AuditLogParams {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function auditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata as any,
        ipAddress: params.ipAddress,
      },
    });
  } catch {
    // Never let audit logging break the app
    console.error("Audit log failed:", params.action);
  }
}
