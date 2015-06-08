/// <reference path="typings/github.d.ts" />
import {Component, View, NgFor} from 'angular2/angular2';
import {Repository} from 'github';
import {OrderedSet} from 'set';
import {IssueComponent} from 'issue_component';

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

function byMilestonGroup(a: MilestoneGroup, b:MilestoneGroup): number {
  if (a.milestone.title == b.milestone.title) return 0;
  return a.milestone.title < b.milestone.title ? -1 : 1; 
}

function byName(a:any, b:any) {
  return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
}

@Component({
	selector: 'github-issues'
})
@View({
  directives: [NgFor, IssueComponent],
  template: `
  <h1>GitHub</h1>
  <button (click)="loadIssues()">Load Issues {{repo.state}}</button>
  Action: [ <a href (click)="setupAuthToken(); false">{{hasAuthToken() ? 'Using' : 'Needs'}} Github Auth Token</a> 
          (<a href="https://github.com/settings/developers" target="_blank">Get Token</a>) ]
        
  <h1>Milestone</h1>
  <table border=1 cellspacing=0>
    <tr>
      <th><a href="https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Aassignee" target="_blank">!Assigned</a></th>
      <th *ng-for="var assignee of milestoneAssignees.items">
        <a href="https://github.com/angular/angular/issues/assigned/{{assignee.login}}" target="_blank">
          <img width="60" height="60" [src]="assignee.avatar_url || ''" title="{{assignee.login}}">
        </a>
      </th>
    </tr>
    <tbody *ng-for="var milestoneGroup of milestones.items">
      <tr><td [col-span]="milestoneAssignees.items.length + 1"><h2>{{milestoneGroup.milestone.title}}</h2></td></tr>
      <tr>
        <td valign="top">
          <issue *ng-for="var issue of milestoneGroup.noAssignee.items" [issue]="issue"></issue>
        </td>
        <td *ng-for="var assignee of milestoneAssignees.items" valign="top">
          <issue *ng-for="var issue of milestoneGroup.getIssues(assignee)" [issue]="issue" [compact]="true"></issue>
        </td>
      </tr>
    </tbody>
  <table>

  <h1>Hotlist</h1>
  <table border=1 cellspacing=0>
    <tr>
      <th *ng-for="var hotlistGroup of hotlistIssues.items" valign="top">
        <a target="_blank" href='https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+label%3A%22hotlist%3A+{{hotlistGroup.name}}%22'>{{hotlistGroup.name}}</a>
      </th>
    </tr>
    <tr>
      <td *ng-for="var hotlistGroup of hotlistIssues.items" valign="top">
        <issue *ng-for="var issue of hotlistGroup.issues.items" [issue]="issue" [compact]="false"></issue>
      </td>
    </tr>
  </table>    
      
  <h1>Backlog</h1>
  <table border=1 cellspacing=0>
    <tr>
      <th *ng-for="var componentGroup of backlogComponents.items" valign="top">
        <a target="_blank" href='https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Amilestone+label%3A%22comp%3A+{{componentGroup.name}}%22'>{{componentGroup.name}}</a>
      </th>
    </tr>
    <tr>
      <td *ng-for="var componentGroup of backlogComponents.items" valign="top">
        <issue *ng-for="var issue of componentGroup.issues.items" [issue]="issue" [compact]="true"></issue>
      </td>
    </tr>
  </table>    
  
  <h1>Triage</h1>
  <table border=1 cellspacing=0>
    <tr>
      <th><h2>Issues: {{triageIssues.items.length}}</h2></th>
      <th><h2>PRs: {{prIssues.items.length}}</h2></th>
    </tr>
    <tr>
      <td valign="top" width="40%">
        <issue *ng-for="var issue of triageIssues.items" [issue]="issue"></issue>
      </td>
      <td valign="top" width="60%">
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
      </td>
    </tr>
  </table>  
  `
})
export class GithubIssues {
  triageIssues = new OrderedSet<Issue>(byNumber);
  prIssues = new OrderedSet<Issue>(byPR);
  repo = new Repository("angular", "angular");
  milestoneAssignees = new OrderedSet<Assignee>((a:Assignee, b:Assignee) =>
    a.login == b.login ? 0 : a.login < b.login ? -1 : 1);
  milestones = new OrderedSet<MilestoneGroup>(byMilestonGroup);
  backlogComponents = new OrderedSet<ComponentGroup>(byName;
  hotlistIssues = new OrderedSet<HotlistGroup>(byName);

  
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
      if (issue.assignee) this.milestoneAssignees.set(issue.assignee);
      this.milestones.setIfAbsent(new MilestoneGroup(issue.milestone)).add(issue);
    } else {
      this.backlogComponents.setIfAbsent(new ComponentGroup(issue.comp)).add(issue);
    }
    if (issue.hotlist) {
      issue.hotlist.split(';').forEach((name) => {
        this.hotlistIssues.setIfAbsent(new HotlistGroup(name.trim())).add(issue);      
      })
    }
  }
  
  onNewPr(issue: Issue) {
    this.prIssues.set(issue);
  }
    
  setupAuthToken() {
    localStorage.setItem('github.client_id', prompt("Github 'client_id':"));
    localStorage.setItem('github.client_secret', prompt("Github 'client_sceret':"));
  }
  
  hasAuthToken() { 
    return localStorage.getItem('github.client_id') 
        && localStorage.getItem('github.client_secret');
  }
}

function byAssigneeGroup(a: AssigneeGroup, b: AssigneeGroup) {
  return _strCmp(a.assignee.login, b.assignee.login);
}

class MilestoneGroup {
  number: number;
  assignees = new OrderedSet<AssigneeGroup>(byAssigneeGroup);
  noAssignee = new OrderedSet<Issue>(byNumber);
  
  constructor(public milestone: Milestone) {
    this.number = milestone.number;
  }
  
  add(issue: Issue) {
    if (issue.assignee) {
      this.assignees.setIfAbsent(new AssigneeGroup(issue.assignee)).add(issue);
    } else {
      this.noAssignee.set(issue);
    }
  }
  
  getIssues(assignee: Assignee) {
    return this.assignees.setIfAbsent(new AssigneeGroup(assignee)).issues.items;   
  }
}

function byPriority(a: Issue, b:Issue): number {
  if (a.number === b.number) return 0;
  if (a.priority != b.priority) return _strCmp(a.priority, b.priority);
  if (a.effort != b.effort) return _strCmp(a.effort, b.effort);
  return a.number - b.number;
}


class AssigneeGroup {
  issues = new OrderedSet<Issue>(byPriority);
  constructor(public assignee:Assignee) { }
  
  add(issue: Issue) {
    this.issues.set(issue);
  }
}

class ComponentGroup {
  issues = new OrderedSet<Issue>(byPriority);
  
  constructor(public name:string) { }
  
  add(issue:Issue) {
    this.issues.set(issue);
  }  
}

class HotlistGroup {
  issues = new OrderedSet<Issue>(byPriority);
  
  constructor(public name:string) { }
  
  add(issue:Issue) {
    this.issues.set(issue);
  }  
}
