import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatOption } from '@angular/material/select';

import {
    Account,
    AccountType,
    AccountCategory,
    AccountClassification,
    ACCOUNT_TYPE_OPTIONS,
    ACCOUNT_CATEGORY_OPTIONS,
} from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addAccount, updateAccount } from '../../state/lookups/lookups.actions';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { selectAllAccountClassifications } from 'src/app/state/lookups/lookups.selectors';
import { loadAccountClassifications } from '../../state/lookups/lookups.actions';

@Component({
    selector: 'app-account-form',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatOption,
    ],
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.css'],
})
export class AccountFormComponent implements OnInit {
    form!: FormGroup;
    editMode = false;
    readonly typeOptions = ACCOUNT_TYPE_OPTIONS;
    readonly categoryOptions = ACCOUNT_CATEGORY_OPTIONS;
    classifications$!: Observable<AccountClassification[]>;
    filteredClassifications$!: Observable<AccountClassification[]>;
    filteredClassificationCount = 0;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AccountFormComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { account?: Account } | undefined
    ) {}

    ngOnInit(): void {
        this.store.dispatch(loadAccountClassifications());
        const all$ = this.store.select(selectAllAccountClassifications);
        this.classifications$ = all$;

        const a = this.data?.account;
        this.editMode = !!a?.id;

        const dateStr = a?.date
            ? new Date(a.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        this.form = this.fb.group({
            name: [a?.name ?? '', Validators.required],
            description: [a?.description ?? ''],
            accountNumber: [a?.accountNumber ?? ''],
            accountType: [a?.accountType ?? AccountType.ASSET, Validators.required],
            accountCategory: [a?.accountCategory ?? AccountCategory.OTHER_ACCOUNT, Validators.required],
            classificationId: [a?.classificationId ?? null],
            dateStr: [dateStr, Validators.required],
            isActive: [a?.isActive ?? true],
            isParent: [a?.isParent ?? false],
        });

        this.filteredClassifications$ = combineLatest([
            all$,
            this.form.get('accountType')!.valueChanges.pipe(startWith(this.form.get('accountType')!.value)),
        ]).pipe(
            map(([classifications, accountType]) => {
                const result = (classifications ?? []).filter((c) => c.accountType === accountType);
                this.filteredClassificationCount = result.length;
                return result;
            })
        );
    }

    submit(): void {
        if (this.form.invalid) return;
        const v = this.form.value;
        const date = new Date(v.dateStr).getTime();

        if (this.editMode && this.data?.account?.id) {
            const account: Account = {
                ...this.data.account,
                id: this.data.account.id,
                name: v.name,
                description: v.description || undefined,
                accountNumber: v.accountNumber || undefined,
                accountType: v.accountType as AccountType,
                accountCategory: v.accountCategory as AccountCategory,
                classificationId: v.classificationId || undefined,
                date,
                isActive: v.isActive,
                isParent: v.isParent,
            };
            this.store.dispatch(updateAccount({ account }));
        } else {
            const account: Account = {
                name: v.name,
                description: v.description || undefined,
                accountNumber: v.accountNumber || undefined,
                accountType: v.accountType as AccountType,
                accountCategory: v.accountCategory as AccountCategory,
                classificationId: v.classificationId || undefined,
                date,
                isActive: v.isActive,
                isParent: v.isParent,
            };
            this.store.dispatch(addAccount({ account }));
        }
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
