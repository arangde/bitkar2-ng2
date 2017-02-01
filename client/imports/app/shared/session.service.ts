import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';

@Injectable()
export class SessionService {

  private sessionId: string;

  constructor() {
    if (!this.sessionId || this.sessionId == "") {
      this.sessionId = UUID.UUID();
    }
  }

  id() {
    return this.sessionId;
  }
}
