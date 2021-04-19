import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor(private http: HttpClient) { }
  getFiles(filters: any) {
    console.log(filters);
    const params = new HttpParams()
        .set('mapName', filters.mapName)
        .set('playerName', filters.playerName)
        .set('endRaceTimeMin', filters.endRaceTimeMin)
        .set('endRaceTimeMax', filters.endRaceTimeMax)
        .set('raceFinished', filters.raceFinished)
        .set('dateMin', filters.dateMin)
        .set('maxResults', filters.maxResults)
        .set('orderBy', filters.orderBy)
    return (this.http.get<any>('http://localhost:3000/get-files', { params, withCredentials: true }));
}
  timeDifference(current: any, previous: any) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}
}
