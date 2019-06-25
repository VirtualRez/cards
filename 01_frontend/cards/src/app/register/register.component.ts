import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(public _user: UserService, public _router:Router) { }

  ngOnInit() {
  }

  // printData() {
  //   let objectData = {
  //     "username": this.username,
  //     "password": this.password,
  //     'subscription': this.subscription,
  //    }
  //
  //   console.log(objectData);
  //   this._user.isRegister = true;
  //   this._router.navigateByUrl('/home');
  // }


}
