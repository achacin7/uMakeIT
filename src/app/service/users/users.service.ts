import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { User } from '../../models/user';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OrdersService } from '../orders/orders.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  user$: Observable<User>;
  profile$: Observable<any>
  userDocument: AngularFirestoreDocument;
  email: any;
  rol: any;
  claveInvalida: boolean;
  private loggedInStatus = JSON.parse(localStorage.getItem('loggedIn') || 'false')

  constructor(
    private afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    private router: Router,
    public ordersService: OrdersService) {

    this.claveInvalida = false;

    this.profile$ = this.afAuth.authState.pipe(
      switchMap( userData => {
        if(userData){
          return this.afs.collection('/users').doc(userData.email).snapshotChanges();
        }else{
          return null;
        }
      }),
      map( profile => {
        if(profile){
          return profile.payload.data()
        }else{
          return profile
        }
      })
    )
    
  }

  setLoggedIn(value: boolean) {
    this.loggedInStatus = value
    localStorage.setItem('loggedIn', 'true')
  }

  registerUser(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password)
        .then(userData => {
          console.log(userData)
          resolve(userData),
            err => reject(err)
        });
    });
  }

  loginUser(email: string, password: string, firstName: string, lastName: string, rol: string) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then(userData => {
          this.afAuth.authState 
          if (this.loggedInStatus === true) {
            this.afAuth.auth.signInWithEmailAndPassword(email, password)
          }
          const user = firebase.auth().currentUser;
          if (user != null) {
            user.updateProfile({ displayName: firstName + " " + lastName, photoURL: "..." }).then((res) => {
              this.setLoggedIn(true);
              console.log(res);
              console.log(user);
            }).catch((err) => {
              console.log(err);
            })
          }
          console.log(userData);
          console.log(user);
          resolve(userData),
            err => reject(err)
        }).catch((err) => {
          //this.claveInvalida = true;
          alert("¡Contraseña inválida!");
          console.log(err);
          //this.router.navigate(['/login']);
        })
    })
  }

  getAuth() {
    return this.afAuth.authState.pipe(map(auth => auth));
  }

  logout() {

    return this.afAuth.auth.signOut();
  }

  obtenerRol(email: any){
    return new Promise((resolve, reject) => {
      this.getUser(email).get().toPromise()
        .then(userData => {
          this.rol = userData.get('rol')
          console.log(this.rol)
          resolve(this.rol),
            err => reject(err)
        });
    });
  }

  isLoggedIn() {

    this.profile$.subscribe( res => {
      this.rol = res.rol
    })
    console.log(this.rol)
    if (this.rol === null) {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }

  }

  isLoggedInAdmin() {

    this.profile$.subscribe(data => {
      this.rol = data.rol
      //console.log(this.rol)
    })
    console.log(this.rol) 
    if (this.rol === null) {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }

  }
  /* //Obtener usuarios
  public getUsers(){
    return this.user$;
    //return this.afs.collection(this.path).snapshotChanges();
  } */

  //Obtener usuario
  public getUser(id: string) {
    return this.afs.collection('/users/').doc(id);
  }

  //Crear un usuario
  public createUser(user: User, id: string) {
    return this.afs.collection('/users/').doc(id).set(user);
  }

  /* //Actualizar usuario
  public updateUser(data: any, id: string){
    return this.usersCollection.doc(id).set(data);
  }
  //Eliminar usuario
  public deleteUser(id: string){
    return this.afs.collection(this.path).doc(id).delete();
  } */

}
