import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LibraryService } from '../services/library.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  title = 'ajax';
  data: object[] = [];
  subs: any;
  colorBorde: string = 'blue';

  cardSearch: string; //variable para que actúe el ngModel

  totalPrice: number = 0;

  constructor(public _user: UserService, public _router: Router, public _api: ApiService, public _library: LibraryService) { }

  ngOnInit() {
  }

  goSearch() {//me permite buscar cartas en el search poniendo ej: {"Name":"Art Scam"}

    let nombreCarta = this.cardSearch;//para poder buscar por nombre y no tener que meter el json
    let cardSearchJson = '{"Name":"' + nombreCarta + '"}'//lo mismo

    this._api.post("http://localhost:3000/cardlistByQuery", JSON.parse(cardSearchJson))//cambiamos this.cardSearch por cardSearchJson
      .subscribe((apiResult) => {
        for (let i = 0; i < apiResult.length; i++) {
          this.data.push(apiResult[i]);
          this.totalPrice += (parseFloat(apiResult[i].meanPrice)>0 ? parseFloat(apiResult[i].meanPrice) : 0);//añadir precio total, sumando los precios
        }
        this._api.post("http://localhost:3000/cryptlistByQuery", JSON.parse(cardSearchJson))//cambiamos this.cardSearch por cardSearchJson
          .subscribe((apiResult) => {
            for (let i = 0; i < apiResult.length; i++) {
              this.data.push(apiResult[i]);
              this.totalPrice += (parseFloat(apiResult[i].meanPrice)>0 ? parseFloat(apiResult[i].meanPrice) : 0) ;//añadir precio total, sumando los precios
            }

          });
        console.log('Esto es todo data:', this.data, 'Esto es apiResult:', apiResult);


      });
  }

}
