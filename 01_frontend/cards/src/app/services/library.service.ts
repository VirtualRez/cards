import { Injectable } from '@angular/core';
//SERVICE
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  title = 'ajax';
  data: object[] = [{}];
  subs: any;

  constructor(public _api: ApiService) {
  //Con ésta petición consigo que me ponga todas las cartas en la lista.
    // this.subs = this._api.get("http://localhost:3000/cardlist")
    //   .subscribe((apiResult) => {
    //     this.data = apiResult;
    //     console.log(apiResult);
    //   });
  }
}
