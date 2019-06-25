import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string = "";
  password: string = "";



  constructor(public _user: UserService, public _router:Router) { }

  ngOnInit() {
  }

  logIn() {
    console.log(this.email, this.password);

  }


  goRegister() {
    this._user.goRegister();
  }

}
