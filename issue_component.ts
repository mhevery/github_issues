import {Component, View} from 'angular2/angular2';

@Component({
  selector: 'issue',
  properties: {'issue': 'issue', 'compact': 'compact'}
})
@View({
  template: `
  <div>
    <span title="{{issue.priority}}" style="width: .6em; display: inline-block">{{periorityIcon()}}</span
    ><span title="{{issue.type}}" style="width: .7em; display: inline-block">{{typeIcon()}}</span
    ><span title="{{issue.effort}}" style="width: 1em; display: inline-block">{{effortIcon()}}</span
    ><a target="_blank" title="[{{issue.comp}}] {{issue.title}}" [href]="issue.html_url">{{issue.number}}</a>
    <span [hidden]="compact">
      <a target="_blank" [href]="issue.html_url">{{issue.title}}</a>
      [ {{issue.comp}} ]
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
    switch (this.issue.effort) {
      case 'easy': return '.';
      case 'medium': return 'o';
      case 'tough': return 'O';
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
}

