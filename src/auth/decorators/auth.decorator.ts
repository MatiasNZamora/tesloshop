import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { validRoles } from "../interfaces";

import { RoleProtected } from "./role-protected.decorator";

import { UseRoleGuard } from "../guards/use-role/use-role.guard";


export function Auth(...roles: validRoles[]) {
    return applyDecorators(
        RoleProtected( ...roles ),
        UseGuards( AuthGuard(), UseRoleGuard )
        
    )
};

