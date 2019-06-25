import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
//SERVICES
import { UserService} from './services/user.service';

import { FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

import { Routes, RouterModule } from '@angular/router';

const misRutas: Routes = [
{'path':'login', 'component': LoginComponent},
{'path':'home', 'component': HomeComponent},
{'path':'register', 'component': RegisterComponent},
{'path':'', 'component': LoginComponent},
{'path':'**', 'component': LoginComponent},

]

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(misRutas)
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
