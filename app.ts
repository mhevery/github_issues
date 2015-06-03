/// <reference path="typings/angular2/angular2.d.ts" />
/// <reference path="typings/github.d.ts" />

import {Component, View, bootstrap, NgFor} from 'angular2/angular2';

function get_number(i:any) {return i.number;}

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
  triageIssues = new Set<Issue>(get_number);
  prIssues = new Set<Issue>(get_number);
  repo = new Repository("angular", "angular");
  milestones = new Set<MilestonePane>(get_number);
  noMilestone = new Set<Issue>(get_number);

  
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
      var milestonePane = this.milestones.getByKey(issue.milestone.number);
      if (!milestonePane) {
        milestonePane = new MilestonePane(issue.milestone);
        this.milestones.set(milestonePane);
      }
      milestonePane.add(issue);
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

class MilestonePane {
  number: number;
  asignees: Array<AsigneePane> = [];
  
  constructor(public milestone: Milestone) {
    this.number = milestone.number;
  }
  
  add(issue:Issue) {}
}

class AsigneePane {
  
}

class Set<T> {
  keys: { [s: number]: T; } = {};
  items: Array<T> = [];
  
  constructor(public keyGetter:(t:T) => number) {}
  
  getByKey(key: number) {
    return this.keys[key];
  }
  
  set(item: T):T {
    var key = this.keyGetter(item);
    var oldItem = this.keys[key];
    if (oldItem) {
      var index = this.items.indexOf(oldItem);
      this.items[index] = item;
    } else {
      this.items.push(item);
    }
    this.keys[key] = item;
    return item;
  }
}


class Repository {
  state: string;
  
  issues:  { [s: string]: Issue; } = {};
  previousIssues:  { [s: string]: Issue; } = {};
  prs:  { [s: string]: Issue; } = {};
  previousPrs:  { [s: string]: Issue; } = {};
  
  onNewIssue: (issue: Issue) => void = () => null;
  onRemovedIssue: (issue: Issue) => void = () => null;
  onNewPR: (issue: Issue) => void = () => null;
  onRemovedPR: (issue: Issue) => void = () => null;
  
  constructor(public username: string, public repository: string) {
    this.state = '';
  }
  
  clientId() {
    return localStorage.getItem('github.client_id');
  }
  
  clientSecret() {
    return localStorage.getItem('github.client_secret');
  }
  
  refresh() {
    this.state = 'refreshing';
    this.previousIssues = this.issues;
    this.previousPrs = this.prs;
    
    var fetchPage = (page: number) => {
      var http = new XMLHttpRequest();
      var params = `client_id=${this.clientId()}&client_secret=${this.clientSecret()}&per_page=100&page=${page}`;
      var url = `https://api.github.com/repos/angular/angular/issues?${params}`;
      http.open("GET", url, true);
      
      http.onreadystatechange = () => {
        var response = http.responseText;
        if (http.readyState == 4) {
          if(http.status == 200) {
            var issues: Array<Issue> = JSON.parse(response);
            issues.forEach(this._processIssues.bind(this));
            if (issues.length >= 100) {
              fetchPage(page + 1);
            } else {
              this.state = '';
              this._notifyRemoves();
            }
          } else {
            console.error(response);
          }
        }
      }
      http.send(params);
    }
    fetchPage(0);
  }
  
  _processIssues(issue: Issue) {
    this._parseLabels(issue);
    issue.needsTriage = function() {
      if (this.pull_requst) {
        return false;
      } else {
        return !this.type || !this.priority || !this.comp || !this.effort;
      }
    }

    if (issue.pull_request) {
      this.issues[issue.number] = issue;
      this.onNewPR(issue);
    } else {
      this.prs[issue.number] = issue;
      this.onNewIssue(issue);
    }
  }

  _notifyRemoves() {
    for(var issueNo in this.previousIssues) {
      if (!this.issues[issueNo]) {
        this.onRemovedIssue(this.previousIssues[issueNo]);
      }
    }
    for(var prNo in this.previousPrs) {
      if (!this.prs[prNo]) {
        this.onRemovedIssue(this.previousPrs[prNo]);
      }
    }
  }

  _parseLabels(issue: Issue) {
    var other = issue.labels_other = [];
    issue.priority = '';
    issue.type = '';
    issue.component = '';
    
    issue.labels.forEach((label: Label) => {
      var split = label.name.split(':');
      var name = split[0];
      var value = split[1];
      if (value) {
        value = value.split('/')[0].trim();
      }
      switch (name) {
        case 'P0':
        case 'P1':
        case 'P2':
        case 'P3':
        case 'P4':
          value = name;
          name = 'priority';
        case 'comp':
        case 'cla':
        case 'pr_state':
        case 'pr_action':
        case 'cust':
        case 'effort':
        case 'type':
          issue[name] = (issue[name] ? issue[name] + '; ' : '') + value;
          break;
        default:
          other.push(label.name);
      }
    }); 
  }
}

bootstrap(GithubIssues);