import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/Services/user.service';
import { NotificationsService } from 'src/app/Services/notifications.service';

@Component({
  selector: 'app-add-modal',
  templateUrl: './add-modal.component.html',
  styleUrls: ['./add-modal.component.css'],
})
export class AddModalComponent implements OnInit {
  editMode: boolean = false;
  userForm: FormGroup = this.fb.group({
    userName: ['', Validators.required],
    userMail: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
      ,
      Validators.required,
    ],
    userPhone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
        Validators.maxLength(16),
      ],
    ],
  });
  formSubmitted = false;

  constructor(
    public dialogRef: MatDialogRef<AddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private userService: UserService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.editMode = this.data.editMode;
    if (this.editMode) {
      const user = this.data.user;
      this.userForm.patchValue({
        userName: user.userName,
        userMail: user.userMail,
        userPhone: user.userPhone,
      });
    }
  }

  onAdd(): void {
    this.formSubmitted = true;
    if (this.userForm.valid) {
      if (this.editMode) {
        const userUpdated = this.userForm.value;
        const userId = this.data.user.id;
        this.userService.putUser(userUpdated, userId).then(
          (response) => {
            this.notificationsService.showSuccess(
              'Usuario actualizado correctamente'
            );
            this.dialogRef.close();
          },
          (error) => {
            this.notificationsService.showError(
              'Ha ocurrido un error al actualizar el usuario'
            );
          }
        );
      } else {
        this.userService.postUser(this.userForm.value).then(
          (response) => {
            this.notificationsService.showSuccess(
              'Usuario creado correctamente'
            );
            this.dialogRef.close();
            this.data.loadUsers();
          },
          (error) => {
            this.notificationsService.showError(
              'Ha ocurrido un error al crear el usuario'
            );
          }
        );
      }
    }
  }

  onBlur(fieldName: string) {
    this.userForm.get(fieldName)?.markAsTouched();
  }

  isFieldTouched(fieldName: string): boolean {
    return this.userForm.get(fieldName)?.touched || false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
