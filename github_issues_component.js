if (typeof __decorate !== "function") __decorate = function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
if (typeof __metadata !== "function") __metadata = function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/// <reference path="typings/github.d.ts" />
var angular2_1 = require('angular2/angular2');
var github_1 = require('github');
var set_1 = require('set');
var issue_component_1 = require('issue_component');
function _strCmp(a, b) {
    if (a === undefined)
        a = '';
    if (b === undefined)
        b = '';
    if (a === b)
        return 0;
    return a < b ? -1 : 1;
}
function byNumber(a, b) {
    return a.number - b.number;
}
function byPR(a, b) {
    if (a.number === b.number)
        return 0;
    if (a.pr_action != b.pr_action)
        return _strCmp(a.pr_action, b.pr_action);
    if (a.pr_state != b.pr_state)
        return _strCmp(a.pr_state, b.pr_state);
    return a.number - b.number;
}
function byMilestonPane(a, b) {
    if (a.milestone.title == b.milestone.title)
        return 0;
    return a.milestone.title < b.milestone.title ? -1 : 1;
}
var GithubIssues = (function () {
    function GithubIssues() {
        this.triageIssues = new set_1.OrderedSet(byNumber);
        this.prIssues = new set_1.OrderedSet(byPR);
        this.repo = new github_1.Repository("angular", "angular");
        this.milestones = new set_1.OrderedSet(byMilestonPane);
        this.noMilestone = new set_1.OrderedSet(byNumber);
        this.repo.onNewIssue = this.onNewIssue.bind(this);
        this.repo.onNewPR = this.onNewPr.bind(this);
        this.loadIssues();
    }
    GithubIssues.prototype.loadIssues = function () {
        this.repo.refresh();
    };
    GithubIssues.prototype.onNewIssue = function (issue) {
        if (issue.needsTriage()) {
            this.triageIssues.set(issue);
        }
        else if (issue.milestone) {
            this.milestones.setIfAbsent(new MilestonePane(issue.milestone)).add(issue);
        }
        else {
            this.noMilestone.set(issue);
        }
    };
    GithubIssues.prototype.onNewPr = function (issue) {
        this.prIssues.set(issue);
    };
    GithubIssues.prototype.setupAuthToken = function () {
        localStorage.setItem('github.client_id', prompt("Github 'client_id':"));
        localStorage.setItem('github.client_secret', prompt("Github 'client_sceret':"));
    };
    GithubIssues.prototype.hasAuthToken = function () {
        return localStorage.getItem('github.client_id')
            && localStorage.getItem('github.client_secret');
    };
    GithubIssues = __decorate([
        angular2_1.Component({
            selector: 'github-issues'
        }),
        angular2_1.View({
            directives: [angular2_1.NgFor, issue_component_1.IssueComponent],
            template: "\n  <h1>GitHub</h1>\n  <button (click)=\"loadIssues()\">Load Issues {{repo.state}}</button>\n  Action: [ <a href (click)=\"setupAuthToken(); false\">{{hasAuthToken() ? 'Using' : 'Needs'}} Github Auth Token</a> \n          (<a href=\"https://github.com/settings/developers\" target=\"_blank\">Get Token</a>) ]\n  \n  <h1>Triage</h1>\n  <table border=1>\n    <tr>\n      <th><h2>Issues {{triageIssues.items.length}}</h2></th>\n      <th><h2>PRs {{prIssues.items.length}}</h2></th>\n    </tr>\n    <tr>\n      <td valign=\"top\" width=\"50%\">\n        <issue *ng-for=\"var issue of triageIssues.items\" [issue]=\"issue\"></issue>\n      </td>\n      <td valign=\"top\" width=\"50%\">\n        <table>\n            <tr>\n              <th>PR#</th>\n              <th>Description</th>\n              <th>PR State</th>\n              <th>PR Action</th>\n              <th>Priority</th>\n              <th>Customer</th>\n              <th>Labels</th>\n              <th>Assigned</th>\n            </tr>\n            <tr *ng-for=\"var issue of prIssues.items\">\n              <td><a target=\"_blank\"  [href]=\"issue.html_url\">#{{issue.number}}</a></td>\n              <td><a target=\"_blank\"  [href]=\"issue.html_url\">{{issue.title}}</a></td>\n              <td nowrap>{{issue.pr_state}}</td>\n              <td nowrap>{{issue.pr_action}}</td>\n              <td nowrap>{{issue.priority}}</td>\n              <td nowrap>{{issue.cust}}</td>\n              <td>{{issue.labels_other.join('; ')}}</td>\n              <td><a href=\"{{}}\" target=\"_blank\"><img width=\"15\" height=\"15\" [hidden]=\"!issue.assignee\" [src]=\"(issue.assignee||{}).avatar_url || ''\"> {{(issue.assignee||{}).login}}</a></td>\n            </tr>\n          </table>\n      </td>\n    </tr>\n  </table>\n  \n      \n  <h1>Milestone</h1>\n  <div *ng-for=\"var milestonePane of milestones.items\">\n    <h2><a target=\"_blank\" [href]=\"milestonePane.milestone.html_url\">\n        {{milestonePane.milestone.title}}</a></h2>\n    <table>\n      <tr>\n        <th><a href=\"https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Aassignee\" target=\"_blank\">!Assigned</a></th>\n        <th *ng-for=\"var assigneePane of milestonePane.assignees.items\">\n          <img width=\"15\" height=\"15\" [src]=\"assigneePane.assignee.avatar_url || ''\">\n           <a href=\"https://github.com/angular/angular/issues/assigned/{{assigneePane.assignee.login}}\" target=\"_blank\">{{assigneePane.assignee.login}}</a></th>\n      </tr>\n      <tr>\n        <td valign=\"top\">\n          <issue *ng-for=\"var issue of milestonePane.noAssignee.items\" [issue]=\"issue\"></issue>\n        </td>\n        <td *ng-for=\"var assigneePane of milestonePane.assignees.items\" valign=\"top\">\n          <issue *ng-for=\"var issue of assigneePane.issues.items\" [issue]=\"issue\" [compact]=\"true\"></issue>\n        </td>\n      </tr>\n    </table>\n    \n  </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], GithubIssues);
    return GithubIssues;
})();
exports.GithubIssues = GithubIssues;
function byAssigneePane(a, b) {
    return _strCmp(a.assignee.login, b.assignee.login);
}
var MilestonePane = (function () {
    function MilestonePane(milestone) {
        this.milestone = milestone;
        this.assignees = new set_1.OrderedSet(byAssigneePane);
        this.noAssignee = new set_1.OrderedSet(byNumber);
        this.number = milestone.number;
    }
    MilestonePane.prototype.add = function (issue) {
        if (issue.assignee) {
            this.assignees.setIfAbsent(new AssigneePane(issue.assignee)).add(issue);
        }
        else {
            this.noAssignee.set(issue);
        }
    };
    return MilestonePane;
})();
var AssigneePane = (function () {
    function AssigneePane(assignee) {
        this.assignee = assignee;
        this.issues = new set_1.OrderedSet(AssigneePane.byPriority);
    }
    AssigneePane.byPriority = function (a, b) {
        if (a.number === b.number)
            return 0;
        if (a.priority != b.priority)
            return _strCmp(a.priority, b.priority);
        if (a.effort != b.effort)
            return _strCmp(a.effort, b.effort);
        return a.number - b.number;
    };
    AssigneePane.prototype.add = function (issue) {
        this.issues.set(issue);
    };
    return AssigneePane;
})();
//# sourceMappingURL=github_issues_component.js.map