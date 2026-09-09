import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Account, AccountType, SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addSavingType, updateSavingType } from '../../state/lookups/lookups.actions';
import { map, Observable } from 'rxjs';
import { selectAllAccounts } from 'src/app/state/lookups/lookups.selectors';
import { MatOption } from "@angular/material/select";
import { MatSelectModule } from '@angular/material/select';
@Component({
    selector: 'app-saving-type-form',
    standalone: true,
    imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatOption,
    MatSelectModule,
    MatCheckboxModule
],
    templateUrl: './saving-type-form.component.html',
    styleUrls: ['./saving-type-form.component.css']
})
export class SavingTypeFormComponent implements OnInit {
    form!: FormGroup;
    editMode = false;
    depositAccounts$!: Observable<Account[]>;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<SavingTypeFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { savingType?: SavingType }
    ) { }

    ngOnInit(): void {
        const st = this.data?.savingType;
        this.form = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            accountId: [st?.accountId ?? null],
            description: [''],
            isMandatory: [st?.isMandatory ?? false],
            minimumAmount: [st?.minimumAmount ?? 0, [Validators.required, Validators.min(0)]],
        });
        if (st) {
            this.editMode = true;
            this.form.patchValue(st);
        }
        this.depositAccounts$ = this.store.select(selectAllAccounts).pipe(
              map((accounts) =>
                (accounts ?? []).filter(
                  (a) => a.accountType === AccountType.LIABILITY && a.isActive !== false
                )
              )
            );
    }

    submit() {
        if (this.form.invalid) return;
        const data = { ...this.form.value };
        data.isMandatory = !!data.isMandatory;
        data.minimumAmount = Number(data.minimumAmount ?? 0);
        if (this.editMode && data.id) {
            this.store.dispatch(updateSavingType({ savingType: data as SavingType }));
        } else {
            delete data.id;
            this.store.dispatch(addSavingType({ savingType: data as SavingType }));
        }
        this.dialogRef.close(true);
    }
    

    onCancel() { this.dialogRef.close(); }
}
