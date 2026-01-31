import { UserRole } from "@/types/document";

export const RoleMatrix = {
  creator: [UserRole.CREATOR, UserRole.CHECKER, UserRole.APPROVER, UserRole.ADMIN],
  checker: [UserRole.CHECKER, UserRole.APPROVER, UserRole.ADMIN],
  approver: [UserRole.APPROVER, UserRole.ADMIN],
  admin: [UserRole.ADMIN],
};

export function canAssignWorkflowRole(userRole: UserRole, workflowRole: keyof typeof RoleMatrix) {
  return RoleMatrix[workflowRole].includes(userRole);
}
