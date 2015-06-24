declare var Firebase;

import {Component, View, NgFor, NgIf} from 'angular2/angular2';
import {Mentions} from './github';
import {CoreTeam} from 'core_team';

@Component({
  selector: 'gh-mentions',
  properties: ['org', 'days'],
  appInjector: [Mentions, CoreTeam]
})
@View({
  template: `
  <div>
    <input (keyup)="onKeyUp($event.target.value)" [value]="username">
    <button (click)="refresh()">Refresh</button>
    <ul>
      <li *ng-for="#mention of mentions.list">
        <a href="{{mention.url}}" target="_blank">#{{mention.number}}: {{mention.title}}</a> ({{mention.state}})
      </li>
    </ul>
    <p *ng-if="!fetched">Refresh to see mentions</p>
  </div>
  `,
  directives: [NgFor, NgIf]
})
export class MentionComponent {
  org: string;
  days: number;
  username: string = '';
  from: string[]
  mentions: Mentions;
  fetched: boolean = false;

  constructor(mentions: Mentions, coreTeam: CoreTeam) {
    this.from = coreTeam.members;
    this.mentions = mentions;
    var ref = new Firebase("https://ng2-projects.firebaseio.com");
    var auth;
    if (auth = ref.getAuth()) {
      this.username = auth.github.username;
    }
  }

  onKeyUp(value: string) {
    this.username = value;
  }

  refresh() {
    let username = this.username.trim();
    this.mentions.refresh(username, this.org, this.days, this.from);
    this.fetched = true;
  }
}
