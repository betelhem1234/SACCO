import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectRoles } from '../state/auth/auth.selectors';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(private store: Store, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {

        const requiredRoles = route.data['roles'] as Array<string>;

        if (!requiredRoles || requiredRoles.length === 0) {
            return new Observable<boolean>(observer => observer.next(true));
        }

        return this.store.select(selectRoles).pipe(
            take(1),
            map(roles => {
                const hasRole = roles.some(role => requiredRoles.includes(role));
                if (!hasRole) {
                    this.router.navigate(['/unauthorized']);
                    return false;
                }
                return true;
            })
        );
    }
}
