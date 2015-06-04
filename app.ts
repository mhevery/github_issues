/// <reference path="typings/angular2/angular2.d.ts" />
/// <reference path="typings/github.d.ts" />

import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {Repository} from 'github';
import {OrderedSet} from 'set';

function _strCmp(a: string, b: string) {
  if (a === undefined) a = '';
  if (b === undefined) b = '';
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function byNumber(a: Issue, b:Issue): number {
  return a.number - b.number;
}

function byPR(a: Issue, b:Issue): number {
  if (a.number === b.number) return 0;
  if (a.pr_action != b.pr_action) return _strCmp(a.pr_action, b.pr_action);
  if (a.pr_state != b.pr_state) return _strCmp(a.pr_state, b.pr_state);
  return a.number - b.number;
}

function byMilestonPane(a: MilestonePane, b:MilestonePane): number {
  if (a.milestone.title == b.milestone.title) return 0;
  return a.milestone.title < b.milestone.title ? -1 : 1; 
}

@Component({
	selector: 'github-issues'
})
@View({
  directives: [NgFor],
  template: `
  <h1>GitHub</h1>
  <button (click)="loadIssues()">Load Issues {{repo.state}}</button>
  Action: [ <a href (click)="setupAuthToken(); false">Github Auth Token</a> ]
  
  <h1>Issue Triage</h1>
  Issues: {{triageIssues.items.length}}
  <table>
    <tr>
      <th>#</th>
      <th>Description</th>
      <th>Milestone</th>
      <th>Priority</th>
      <th>Component</th>
      <th>Type</th>
      <th>Effort</th>
      <th>Customer</th>
      <th>Labels</th>
    </tr>
    <tr *ng-for="var issue of triageIssues.items">
      <td><a target="_blank"  [href]="issue.html_url">#{{issue.number}}</a></td>
      <td><a target="_blank"  [href]="issue.html_url">{{issue.title}}</a></td>
      <td><a target="_blank" [href]="(issue.milestone || {}).html_url">{{(issue.milestone||{}).title}}</a></td>
      <td nowrap>{{issue.priority}}</td>
      <td nowrap>{{issue.comp}}</td>
      <td nowrap>{{issue.type}}</td>
      <td nowrap>{{issue.effort}}</td>
      <td nowrap>{{issue.cust}}</td>
      <td>{{issue.labels_other.join('; ')}}</td>
    </tr>
  </table>
  
  <h1>PR Triage</h1>
  PRs: {{prIssues.items.length}}
  <table>
    <tr>
      <th>PR#</th>
      <th>Description</th>
      <th>PR State</th>
      <th>PR Action</th>
      <th>Priority</th>
      <th>Customer</th>
      <th>Labels</th>
      <th>Assigned</th>
    </tr>
    <tr *ng-for="var issue of prIssues.items">
      <td><a target="_blank"  [href]="issue.html_url">#{{issue.number}}</a></td>
      <td><a target="_blank"  [href]="issue.html_url">{{issue.title}}</a></td>
      <td nowrap>{{issue.pr_state}}</td>
      <td nowrap>{{issue.pr_action}}</td>
      <td nowrap>{{issue.priority}}</td>
      <td nowrap>{{issue.cust}}</td>
      <td>{{issue.labels_other.join('; ')}}</td>
      <td><a href="{{}}" target="_blank"><img width="15" height="15" [hidden]="!issue.assignee" [src]="(issue.assignee||{}).avatar_url || ''"> {{(issue.assignee||{}).login}}</a></td>
    </tr>
  </table>
  
  <h1>Milestone</h1>
  <div *ng-for="var milestonePane of milestones.items">
    <h2><a target="_blank" [href]="milestonePane.milestone.html_url">
        {{milestonePane.milestone.title}}</a></h2>
    
  </div>
  `
})
class GithubIssues {
  triageIssues = new OrderedSet<Issue>(byNumber);
  prIssues = new OrderedSet<Issue>(byPR);
  repo = new Repository("angular", "angular");
  milestones = new OrderedSet<MilestonePane>(byMilestonPane);
  noMilestone = new OrderedSet<Issue>(byNumber);

  
  constructor() {
    this.repo.onNewIssue = this.onNewIssue.bind(this);
    this.repo.onNewPR = this.onNewPr.bind(this);
    this.loadIssues();
  }
  
  loadIssues() {
    this.repo.refresh();
  }  
  
  onNewIssue(issue: Issue) {
    if (issue.needsTriage()) {
      this.triageIssues.set(issue);
    } else if (issue.milestone) {
      this.milestones.setIfAbsent(new MilestonePane(issue.milestone)).add(issue);
    } else {
      this.noMilestone.set(issue);
    }
  }
  
  onNewPr(issue: Issue) {
    this.prIssues.set(issue);
  }
    
  setupAuthToken() {
    localStorage.setItem('github.client_id', prompt("Github 'client_id':"));
    localStorage.setItem('github.client_secret', prompt("Github 'client_sceret':"));
  }
}

function byAssigneePane(a: AsigneePane, b: AsigneePane) {
  return _strCmp(a.asignee.login, b.asignee.login);
}

class MilestonePane {
  number: number;
  asignees = new OrderedSet<AsigneePane>(byAssigneePane);
  notAssignee = new OrderedSet<Issue>(byNumber);
  
  constructor(public milestone: Milestone) {
    this.number = milestone.number;
  }
  
  add(issue:Issue) {
    if (issue.asignee) {
      this.asignees.setIfAbsent(new AsigneePane(issue.asignee)).add(issue);
    } else {
      this.notAssignee.set(issue);
    }
  }
}

class AsigneePane {
  issues = new OrderedSet<Issue>(byNumber);
  constructor(public asignee:Asignee) { }
  
  add(issue: Issue) {
    this.issues.set(issue);
  }
}


bootstrap(GithubIssues);