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
  
  <h1>Triage</h1>
  <table border=1 cellspacing=0>
    <tr>
      <th><h2>Issues {{triageIssues.items.length}}</h2></th>
      <th><h2>PRs {{prIssues.items.length}}</h2></th>
    </tr>
    <tr>
      <td valign="top" width="50%">
        <issue *ng-for="var issue of triageIssues.items" [issue]="issue"></issue>
      </td>
      <td valign="top" width="50%">
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
  
      
  <h1>Milestone</h1>
  <div *ng-for="var milestoneGroup of milestones.items">
    <h2><a target="_blank" [href]="milestoneGroup.milestone.html_url">
        {{milestoneGroup.milestone.title}}</a></h2>
    <table border=1 cellspacing=0>
      <tr>
        <th><a href="https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Aassignee" target="_blank">!Assigned</a></th>
        <th *ng-for="var assigneeGroup of milestoneGroup.assignees.items">
          <img width="15" height="15" [src]="assigneeGroup.assignee.avatar_url || ''">
           <a href="https://github.com/angular/angular/issues/assigned/{{assigneeGroup.assignee.login}}" target="_blank">{{assigneeGroup.assignee.login}}</a></th>
      </tr>
      <tr>
        <td valign="top">
          <issue *ng-for="var issue of milestoneGroup.noAssignee.items" [issue]="issue"></issue>
        </td>
        <td *ng-for="var assigneeGroup of milestoneGroup.assignees.items" valign="top">
          <issue *ng-for="var issue of assigneeGroup.issues.items" [issue]="issue" [compact]="true"></issue>
        </td>
      </tr>
    </table>    
  </div>
  
  <h1>Backlog</h1>
  <!--
  <table border=1 cellspacing=0>
    <tr>
      <th *ng-for="var componentGroup of backlog.components.items">
        <img width="15" height="15" [src]="assigneeGroup.assignee.avatar_url || ''">
         <a href="https://github.com/angular/angular/issues/assigned/{{assigneeGroup.assignee.login}}" target="_blank">{{assigneeGroup.assignee.login}}</a></th>
    </tr>
    <tr>
      <td *ng-for="var componentGroup of backlog.components.items" valign="top">
        <issue *ng-for="var issue of assigneeGroup.issues.items" [issue]="issue" [compact]="true"></issue>
      </td>
    </tr>
  </table>    
  -->  
  `
})
export class GithubIssues {
  triageIssues = new OrderedSet<Issue>(byNumber);
  prIssues = new OrderedSet<Issue>(byPR);
  repo = new Repository("angular", "angular");
  milestones = new OrderedSet<MilestoneGroup>(byMilestonGroup);
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
      this.milestones.setIfAbsent(new MilestoneGroup(issue.milestone)).add(issue);
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
  
  add(issue:Issue) {
    if (issue.assignee) {
      this.assignees.setIfAbsent(new AssigneeGroup(issue.assignee)).add(issue);
    } else {
      this.noAssignee.set(issue);
    }
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
