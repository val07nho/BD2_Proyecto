import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";

import { AuthService } from "../services/auth.service";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = (route.data["roles"] as string[] | undefined) ?? [];
  const role = authService.getRole();

  if (role && expectedRoles.includes(role)) {
    return true;
  }

  router.navigate(["/auth/login"]);
  return false;
};
