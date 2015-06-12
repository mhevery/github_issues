import {Component, View} from 'angular2/angular2';

@Component({
  selector: 'issue',
  properties: ['issue', 'compact']
})
@View({
  template: `
  <div>
    <span title="{{issue.priority}}" style="width: .6em; display: inline-block">{{periorityIcon()}}</span
    ><span title="{{issue.type}}" style="width: .7em; display: inline-block">{{typeIcon()}}</span
    ><span title="{{issue.effort}}" style="width: 1em; display: inline-block">{{effortIcon()}}</span
    ><a target="_blank" title="[{{issue.comp}}] {{issue.title}}" [href]="issue.html_url">{{issue.number}}</a
    ><span title="{{issue.action}}">{{stateIcon()}}</span>
    <span [hidden]="compact">
      <a target="_blank" [href]="issue.html_url">{{issue.title}}</a>
      <span [hidden]="!issue.comp">[<a href="https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Amilestone+label%3A%22comp%3A+{{issue.comp}}" target="_blank">{{issue.comp}}</a>]</span>
      <span [hidden]="!issue.milestone">&lt;<a href="https://github.com/angular/angular/milestones/{{issue.milestone?.title" target="_blank">{{issue.milestone?.title}}</a>&gt;</span>
    </span>
  </div>
  `
})
export class IssueComponent {
  static NOT_FOUND = '⁉';
  
  issue: Issue;
  compact = false;
  
  periorityIcon() {
    switch (this.issue.priority) {
      case 'P0': return '0';
      case 'P1': return '1';
      case 'P2': return '2';
      case 'P3': return '3';
      case 'P4': return '4';
      case 'P5': return '5';
      default: return IssueComponent.NOT_FOUND;
    }
  }
  
  effortIcon() {
    var effort = this.issue.effort;
    if (effort) effort = effort.split(':')[0]; 
    switch (effort) {
      case '1': return '.';
      case '2': return 'o';
      case '3': return 'O';
      default: return IssueComponent.NOT_FOUND;
    }
  }

  typeIcon() {
    switch (this.issue.type) {
      case 'RFC': return 'Q';
      case 'bug': return 'B';
      case 'feature': return 'F';
      case 'performance': return 'P';
      case 'refactor': return 'R';
      case 'chore': return 'C';
      default: return IssueComponent.NOT_FOUND;
    }
  }

  stateIcon() {
    switch (this.issue.issue_state || '') {
      case '': return '';
      case 'Needs Design': return '?';
      case 'PR': return '*';
      case 'Blocked': return '!';
      default: return IssueComponent.NOT_FOUND;
    }
  }
}

