/// <reference path="typings/angular2/angular2.d.ts" />
/// <reference path="typings/gh3.d.ts" />

import {Component, View, bootstrap, NgFor} from 'angular2/angular2';

@Component({
	selector: 'github-issues'
})
@View({
  directives: [NgFor],
  template: `
  <h1>GitHub</h1>
  <button (click)="loadIssues()">Load Issues</button>
  <table>
    <tr>
      <th>#</th>
      <th>Description</th>
      <th>Milestone</th>
      <th>Priority</th>
      <th>Component</th>
      <th>Type</th>
      <th>Labels</th>
    </tr>
    <div>Issuse: {{issues.length}}</div>
    <tr *ng-for="var issue of issues">
      <td><a [href]="issue.html_url">#{{issue.number}}</a></td>
      <td>{{issue.title}}}</td>
      <td><a [href]="(issue.milestone || {}).html_url">{{(issue.milestone||{}).title}}</a></td>
      <td>{{issue.priority}}</td>
      <td>{{issue.component}}</td>
      <td>{{issue.type}}</td>
      <td>{{issue.labels_other.join('; ')}}</td>
    </tr>
  </table>
  `
})
class GithubIssues {
  issues: Array<gh3.Issue> = [];
  angularUser = new Gh3.User("angular");
  angularRepo = new Gh3.Repository("angular", this.angularUser);

  
  constructor() {
    this.loadIssues();
  }
  
  loadIssues() {
    this.angularRepo.fetchIssues((err, res) => {
      this.issues = res.issues;
      this.issues.forEach((issue: gh3.Issue) => {
        console.log(issue);
        issue.parseLabels();
      });
    });
  }  
}


Gh3.Issue.prototype.parseLabels = function() {
  var other = this.labels_other = [];
  this.priority = '';
  this.type = '';
  this.component = '';
  
  this.labels.forEach((label: gh3.Label) => {
    var split = label.name.split(':');
    var name = split[0];
    var value = split[1];
    if (value) value = value.trim();
    switch (name) {
      case 'P0':
      case 'P1':
      case 'P2':
      case 'P3':
      case 'P4':
        name = 'priority';
      case 'comp':
      case 'type':
        this[name] = (this[name] ? this[name] + '|' : '') + value;
        break;
      default:
        other.push(label.name);
    }
  }); 
};

bootstrap(GithubIssues);