import { Injectable } from '@angular/core';
import { NotificationsService } from './notifications.service';
import { Observable } from 'rxjs';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import User from '../Interfaces/user.interface';
import { collectionData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private notificationService: NotificationsService) {}

  private firestore = getFirestore();
  private loggedUser: any;

  setUser(user: any) {
    this.loggedUser = user;
  }

  getUser() {
    return this.loggedUser;
  }

  getUserList(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
  }

  postUser(user: User) {
    const usersRef = collection(this.firestore, 'users');
    return addDoc(usersRef, user);
  }

  putUser(user: User, id: string) {
    const usersDocRef = doc(this.firestore, `users/${id}`);
    return updateDoc(usersDocRef, {
      userName: user.userName,
      userMail: user.userMail,
      userPhone: user.userPhone,
    });
  }

  deleteUser(id: string) {
    const usersDocRef = doc(this.firestore, `users/${id}`);
    return deleteDoc(usersDocRef);
  }
}
