import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatOption } from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';

import { AccountClassification, ACCOUNT_TYPE_OPTIONS } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addAccountClassification, updateAccountClassification } from '../../state/lookups/lookups.actions';

@Component({
    selector: 'app-account-classification-form',
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
        MatSelectModule
    ],
    templateUrl: './account-classification-form.component.html',
    styleUrls: ['./account-classification-form.component.css']
})
export class AccountClassificationFormComponent implements OnInit {
    form!: FormGroup;
    editMode = false;
    accountTypeOptions = ACCOUNT_TYPE_OPTIONS;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AccountClassificationFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { accountClassification?: AccountClassification }
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            description: [''],
            accountType: [null, Validators.required],
        });
        if (this.data?.accountClassification) {
            this.editMode = true;
            this.form.patchValue(this.data.accountClassification);
        }
    }

    submit() {
        if (this.form.invalid) return;
        const formData = { ...this.form.value };
        if (this.editMode && formData.id) {
            this.store.dispatch(updateAccountClassification({ accountClassification: formData as AccountClassification }));
        } else {
            delete formData.id;
            this.store.dispatch(addAccountClassification({ accountClassification: formData as AccountClassification }));
        }
        this.dialogRef.close(true);
    }

    onCancel() { this.dialogRef.close(); }
}
