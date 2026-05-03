import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Member } from '@sacco/shared-models';
import { ApiService } from '../services/api.service';
import {
    loadMembers, loadMembersSuccess, loadMembersFailure,
    addMember, addMemberSuccess, addMemberFailure,
    updateMember, updateMemberSuccess, updateMemberFailure,
    deleteMember, deleteMemberSuccess, deleteMemberFailure
} from './members.actions';

@Injectable({ providedIn: 'root' })
export class MembersEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadMembers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadMembers),
            switchMap(() =>
                this.apiService.getMembers().pipe(
                    map(members => loadMembersSuccess({ members })),
                    catchError(error => of(loadMembersFailure({ error })))
                )
            )
        )
    );

    addMember$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addMember),
            mergeMap(action =>
                this.apiService.addMember(action.member).pipe(
                    map((member: Member) => addMemberSuccess({ member })),
                    tap(() => {
                        window.alert("Member successfully added");
                    }),
                    catchError(error => {
                        window.alert("Failed to add member!");
                        return of(addMemberFailure({ error }));
                    })
                )
            )
        )
    );

    updateMember$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateMember),
            mergeMap(action =>
                this.apiService.updateMember(action.member.id, action.member).pipe(
                    map((member: Member) => updateMemberSuccess({ member })),
                    tap(() => {
                        window.alert("Member successfully updated");
                    }),
                    catchError(error => {
                        window.alert("Failed to update member!");
                        return of(updateMemberFailure({ error }));
                    })
                )
            )
        )
    );

    deleteMember$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteMember),
            mergeMap(action =>
                this.apiService.deleteMember(action.id).pipe(
                    map(() => deleteMemberSuccess({ id: action.id })),
                    tap(() => {
                        window.alert("Member successfully deleted");
                    }),
                    catchError(error => {
                        window.alert("Failed to delete member!");
                        return of(deleteMemberFailure({ error }));
                    })
                )
            )
        )
    );
}
