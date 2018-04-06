import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators/tap';

import { AppUser } from './app-user';
import { AppUserAuth } from './app-user-auth';

const API_URL = 'http://localhost:5000/api/security/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()
export class SecurityService {
  securityObject: AppUserAuth = new AppUserAuth();

  constructor(private http: HttpClient) { }

  logout(): void {
    this.resetSeurityObject();
  }

  resetSeurityObject(): void {
    this.securityObject.userName = '';
    this.securityObject.bearerToken = '';
    this.securityObject.isAuthenticated = false;

    this.securityObject.claims = [];

    localStorage.removeItem('bearerToken');
  }

  // This method can be called a couple of different ways
  // *hasClaim ="'calimType'" // assumes claimValue is true
  // *hasClaim="'claimType:value'" // Compares claimValue to value
  // *hasClaim = "['claimType1','claimType2:value','claimType3']"
  hasClaim(claimType: any, claimValue?: any) {
    let ret = false;

    // See if an array of values was passed in.
    if (typeof claimType === 'string') {
      ret = this.isClaimValid(claimType, claimValue);
    } else {
      const claims: string[] = claimType;
      if (claims) {
        for (let index = 0; index < claims.length; index++) {
          ret = this.isClaimValid(claims[index]);
          if (ret) { break; }
        }
      }
    }

    return ret;
  }

  private isClaimValid(claimType: string, claimValue?: string): boolean {
    let ret = false;
    let auth: AppUserAuth = null;

    // Retrieve security object
    auth = this.securityObject;
    if (auth) {
      // See if the claim type has a value
      // *hasClaim = "'claimType: value'"
      if (claimType.indexOf(':') >= 0) {
        const words: string[] = claimType.split(':');
        claimType = words[0].toLowerCase();
        claimValue = words[1];
      } else {
        claimType = claimType.toLowerCase();
        // Either get the claim value, or assume 'true'
        claimValue = claimValue ? claimValue : 'true';
      }
      // Attemp to find the claim
      ret = auth.claims.find(c => c.claimType.toLowerCase() === claimType && c.claimValue === claimValue) != null;
    }

    return ret;
  }

  login(entity: AppUser): Observable<AppUserAuth> {
    this.resetSeurityObject();

    return this.http.post<AppUserAuth>(API_URL + 'login', entity, httpOptions).pipe(
      tap(resp => {
        Object.assign(this.securityObject, resp);
        localStorage.setItem('bearerToken', this.securityObject.bearerToken);
      })
    );
    // Calling Mock
    // Object.assign(this.securityObject, LOGIN_MOCKS.find(user => user.userName.toLowerCase() === entity.userName.toLowerCase()));

    // if (this.securityObject.userName !== '') {
    //   localStorage.setItem('bearerToken', this.securityObject.bearerToken);
    // }

    // return of<AppUserAuth>(this.securityObject);
  }
}
