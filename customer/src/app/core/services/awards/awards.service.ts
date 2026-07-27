import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AwardPack {
  id: string;
  title: string;
  description: string;
  icon: string;
  minBookings: number;
  awardValue: string;
  isActive: boolean;
  createdAt: string;
  userTotalBookings: number;
  eligible: boolean;
  earned: boolean;
  pending: boolean;
}

export interface UserAward {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pack: AwardPack;
  createdAt: string;
}

export interface PackDetailResponse {
  pack: AwardPack;
  awards: UserAward[];
  totalBookings: number;
}

@Injectable({ providedIn: 'root' })
export class AwardsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.customer;

  getMyAwards(): Observable<UserAward[]> {
    return this.http.get<UserAward[]>(`${this.api}/awards`);
  }

  getPacks(): Observable<AwardPack[]> {
    return this.http.get<AwardPack[]>(`${this.api}/awards/packs`);
  }

  requestAward(packId: string): Observable<any> {
    return this.http.post(`${this.api}/awards/request/${packId}`, {});
  }

  getPackDetail(packId: string): Observable<PackDetailResponse> {
    return this.http.get<PackDetailResponse>(`${this.api}/awards/pack/${packId}`);
  }
}
