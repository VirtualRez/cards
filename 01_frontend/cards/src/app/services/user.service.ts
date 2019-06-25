import { Injectable } from '@angular/core';

import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLogged: boolean = true;

  isRegister: boolean = false;

  userdataDummy: Object = { "email": "hola", "password": "1234" }

  login(email, password) {

    this._router.navigateByUrl('/home')

    if (this.userdataDummy['email'] === email && password === this.userdataDummy['password']) {
      this.isLogged = true;
    } else {
      this.isLogged = false;
    }
  }

  logout() {
    this._router.navigateByUrl('/login')
  }

  goRegister() {
    this._router.navigateByUrl('/register')
    this.isRegister = true;

  }

  constructor(public _router: Router) { }

}

//   constructor() { }
// }
