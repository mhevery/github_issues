import {Component, View} from 'angular2/angular2';

@Component({
  selector: 'issue',
  properties: ['issue', 'compact']
})
@View({
  templateUrl: 'issue_component.html'
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

