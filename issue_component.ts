import {Component, View} from 'angular2/angular2';

@Component({
  selector: 'issue',
  properties: {'issue': 'issue'}
})
@View({
  template: `
  <div>
    <a target="_blank" [href]="issue.html_url">{{perfIcon()}}{{effortIcon()}}{{issue.number}}</a>
    <!--<a [href]="issue.html_url">{{issue.title}}</a>-->
  </div>
  `
})
export class IssueComponent {
  issue: Issue;
  
  perfIcon() {
    switch (this.issue.priority) {
      case 'P0': return '0⃣';
      case 'P1': return '1⃣';
      case 'P2': return '2⃣';
      case 'P3': return '3⃣';
      case 'P4': return '4⃣';
      case 'P5': return '5⃣';
      default: return '❓';
    }
  }
  
  effortIcon() {
    switch (this.issue.effort) {
      case 'easy': return '😀';
      case 'medium': return '😐';
      case 'tough': return '😕';
      default: return '❓';
    }
  }
}

