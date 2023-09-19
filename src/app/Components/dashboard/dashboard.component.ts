import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/Services/user.service';
import { NotificationsService } from 'src/app/Services/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { AddModalComponent } from '../add-modal/add-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit, OnInit {
  loggedUser: any;
  userList: any[] = [];
  selectedUser: any = {};
  displayedColumns: string[] = ['userName', 'userMail', 'userPhone', 'actions'];
  dataSource = new MatTableDataSource<any>(this.userList);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private notifications: NotificationsService
  ) {
    this.loggedUser = this.userService.getUser();
  }

  ngOnInit() {
    if (!this.loggedUser) {
      this.router.navigate(['/login']);
    } else {
      this.loadUsers();
      console.log(this.loggedUser);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.userService.getUserList().subscribe((response) => {
      this.userList = response;
      this.dataSource.data = this.userList;
    });
  }

  openModal(): void {
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      data: {
        editMode: false,
        user: null,
        loadUsers: this.loadUsers.bind(this),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  onEdit(user: any) {
    if (user) {
      this.selectedUser = user;
      this.openDialog(true);
    }
  }

  openDialog(editMode: boolean = false): void {
    if (editMode && !this.selectedUser) {
      this.notifications.showError('Debe seleccionar un usuario');
      return;
    }

    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      data: { editMode, user: this.selectedUser },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  onDelete(user: any) {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: '500px',
      data: { user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.deleteUser(user.id).then(
          (response) => {
            this.notifications.showSuccess('Usuario eliminado correctamente');
            this.loadUsers();
          },
          (error) => {
            this.notifications.showError(
              'Ha ocurrido un error al eliminar el usuario'
            );
          }
        );
      }
    });
  }

  applySorting(event: any) {
    const column = event.active;
    const direction = event.direction;

    if (!this.dataSource.sort) {
      return;
    }

    if (direction === '') {
      this.dataSource.sort.active = '';
      this.dataSource.sort.direction = '';
    } else {
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'userName':
            return item.useName;
          case 'userMail':
            return item.userMail;
          case 'userPhone':
            return item.userPhone;
          default:
            return '';
        }
      };
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
