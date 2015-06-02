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
  Filter: [ <a href (click)="filterNone(); false">none</a>
          | <a href (click)="filterTriage(); false">triage</a> ]
  Action: [ <a href (click)="setupAuthToken(); false">Github Auth Token</a> ]
  <table>
    <tr>
      <th></th>
      <th>#</th>
      <th>Description</th>
      <th>Milestone</th>
      <th>Priority</th>
      <th>Component</th>
      <th>Type</th>
      <th>Effort</th>
      <th>PR State</th>
      <th>Customer</th>
      <th>Labels</th>
    </tr>
    <div>Issuse: {{issues.length}}</div>
    <tr *ng-for="var issue of issues">
      <td>{{issue.pull_request?'PR':''}}</td>
      <td><a target="_blank"  [href]="issue.html_url">#{{issue.number}}</a></td>
      <td><a target="_blank"  [href]="issue.html_url">{{issue.title}}</a></td>
      <td><a target="_blank" [href]="(issue.milestone || {}).html_url">{{(issue.milestone||{}).title}}</a></td>
      <td nowrap>{{issue.priority}}</td>
      <td nowrap>{{issue.comp}}</td>
      <td nowrap>{{issue.type}}</td>
      <td nowrap>{{issue.effort}}</td>
      <td nowrap>{{issue.pr_state}}</td>
      <td nowrap>{{issue.cust}}</td>
      <td>{{issue.labels_other.join('; ')}}</td>
    </tr>
  </table>
  `
})
class GithubIssues {
  allIssues: Array<gh3.Issue> = [];
  issues: Array<gh3.Issue> = [];
  angularUser = new Gh3.User("angular");
  angularRepo = new Gh3.Repository("angular", this.angularUser);

  
  constructor() {
    this.loadIssues();
  }
  
  loadIssues() {
    this.angularRepo.fetchAllIssues((err, res) => {
      this.allIssues = res.issues;
      this.allIssues.forEach((issue: gh3.Issue) => issue.parseLabels());
    });
  }  
  
  filterNone() {
    this.issues = this.allIssues;
  }
  
  filterTriage() {
    this.issues = [];
    this.allIssues.forEach((issue: gh3.Issue) => {
      if (issue.needsTriage()) {
        this.issues.push(issue);
      }
    });    
  }
  
  setupAuthToken() {
    localStorage.setItem('github.client_id', prompt("Github 'client_id':"));
    localStorage.setItem('github.client_secret', prompt("Github 'client_sceret':"));
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
    if (value) {
      value = value.split('/')[0].trim();
    }
    switch (name) {
      case 'P0':
      case 'P1':
      case 'P2':
      case 'P3':
      case 'P4':
        name = 'priority';
        value = label.name;
      case 'comp':
      case 'cla':
      case 'pr_state':
      case 'cust':
      case 'effort':
      case 'type':
        this[name] = (this[name] ? this[name] + '; ' : '') + value;
        break;
      default:
        other.push(label.name);
    }
  }); 
};

Gh3.Issue.prototype.needsTriage = function() {
  return !this.pull_request 
         && (!this.type || !this.priority || !this.comp || !this.effort);
}

Gh3.Repository.prototype.fetchAllIssues = function (callback) {
	var that = this;
	that.issues = [];
  
  function fetchPage(page) {
  	Gh3.Helper.callHttpApi({
  		service : "repos/"+that.user.login+"/"+that.name+"/issues?per_page=100&page=" + page,
  		data : {
        client_id: localStorage.getItem('github.client_id'), 
        client_secret: localStorage.getItem('github.client_secret')
      },
  		success : function(res) {
        if (res.data.length) {
    			_.each(res.data, function (issue) {
    				that.issues.push(new Gh3.Issue(issue.number, issue.user, that.name, issue));
    			});
          fetchPage(page + 1);
        } else if (callback) callback(null, that);
  
  		},
  		error : function (res) {
  			if (callback) callback(new Error(res.responseJSON.message),res);
  		}
  	});
  }
  fetchPage(0);
};

bootstrap(GithubIssues);