import {Component, View, NgFor, NgIf} from 'angular2/angular2';
import {Mentions} from './github';
import {CoreTeam} from './core_team';

@Component({
  selector: 'gh-mentions',
  properties: ['org', 'days'],
  providers: [Mentions, CoreTeam]
})
@View({
  template: `
  <div>
    <input (keyup)="username = $event.target.value" [value]="username" placeholder="username">
    <button (click)="refresh()" [disabled]="username.trim().length == 0">Refresh</button>
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
    var auth: any;
    if (auth = ref.getAuth()) {
      this.username = auth.github.username;
    }
  }

  refresh() {
    let username = this.username.trim();
    if (username.length) {
      this.mentions.refresh(username, this.org, this.days, this.from);
      this.fetched = true;
    }
  }
}
