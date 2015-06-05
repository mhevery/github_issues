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
function byMilestonGroup(a, b) {
    if (a.milestone.title == b.milestone.title)
        return 0;
    return a.milestone.title < b.milestone.title ? -1 : 1;
}
var GithubIssues = (function () {
    function GithubIssues() {
        this.triageIssues = new set_1.OrderedSet(byNumber);
        this.prIssues = new set_1.OrderedSet(byPR);
        this.repo = new github_1.Repository("angular", "angular");
        this.milestoneAssignees = new set_1.OrderedSet(function (a, b) {
            return a.login == b.login ? 0 : a.login < b.login ? -1 : 1;
        });
        this.milestones = new set_1.OrderedSet(byMilestonGroup);
        this.backlogComponents = new set_1.OrderedSet(function (a, b) {
            return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
        });
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
            if (issue.assignee)
                this.milestoneAssignees.set(issue.assignee);
            this.milestones.setIfAbsent(new MilestoneGroup(issue.milestone)).add(issue);
        }
        else {
            this.backlogComponents.setIfAbsent(new ComponentGroup(issue.comp)).add(issue);
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
            template: "\n  <h1>GitHub</h1>\n  <button (click)=\"loadIssues()\">Load Issues {{repo.state}}</button>\n  Action: [ <a href (click)=\"setupAuthToken(); false\">{{hasAuthToken() ? 'Using' : 'Needs'}} Github Auth Token</a> \n          (<a href=\"https://github.com/settings/developers\" target=\"_blank\">Get Token</a>) ]\n        \n  <h1>Milestone</h1>\n  <table border=1 cellspacing=0>\n    <tr>\n      <th><a href=\"https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Aassignee\" target=\"_blank\">!Assigned</a></th>\n      <th *ng-for=\"var assignee of milestoneAssignees.items\">\n        <a href=\"https://github.com/angular/angular/issues/assigned/{{assignee.login}}\" target=\"_blank\">\n          <img width=\"60\" height=\"60\" [src]=\"assignee.avatar_url || ''\" title=\"{{assignee.login}}\">\n        </a>\n      </th>\n    </tr>\n    <tbody *ng-for=\"var milestoneGroup of milestones.items\">\n      <tr><td [col-span]=\"milestoneAssignees.items.length + 1\"><h2>{{milestoneGroup.milestone.title}}</h2></td></tr>\n      <tr>\n        <td valign=\"top\">\n          <issue *ng-for=\"var issue of milestoneGroup.noAssignee.items\" [issue]=\"issue\"></issue>\n        </td>\n        <td *ng-for=\"var assignee of milestoneAssignees.items\" valign=\"top\">\n          <issue *ng-for=\"var issue of milestoneGroup.getIssues(assignee)\" [issue]=\"issue\" [compact]=\"true\"></issue>\n        </td>\n      </tr>\n    </tbody>\n  <table>\n      \n  <h1>Backlog</h1>\n  <table border=1 cellspacing=0>\n    <tr>\n      <th *ng-for=\"var componentGroup of backlogComponents.items\" valign=\"top\">\n        <a target=\"_blank\" href='https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Amilestone+label%3A%22comp%3A+{{componentGroup.name}}%22'>{{componentGroup.name}}</a>\n      </th>\n    </tr>\n    <tr>\n      <td *ng-for=\"var componentGroup of backlogComponents.items\" valign=\"top\">\n        <issue *ng-for=\"var issue of componentGroup.issues.items\" [issue]=\"issue\" [compact]=\"true\"></issue>\n      </td>\n    </tr>\n  </table>    \n  \n  <h1>Triage</h1>\n  <table border=1 cellspacing=0>\n    <tr>\n      <th><h2>Issues: {{triageIssues.items.length}}</h2></th>\n      <th><h2>PRs: {{prIssues.items.length}}</h2></th>\n    </tr>\n    <tr>\n      <td valign=\"top\" width=\"40%\">\n        <issue *ng-for=\"var issue of triageIssues.items\" [issue]=\"issue\"></issue>\n      </td>\n      <td valign=\"top\" width=\"60%\">\n        <table>\n            <tr>\n              <th>PR#</th>\n              <th>Description</th>\n              <th>PR State</th>\n              <th>PR Action</th>\n              <th>Priority</th>\n              <th>Customer</th>\n              <th>Labels</th>\n              <th>Assigned</th>\n            </tr>\n            <tr *ng-for=\"var issue of prIssues.items\">\n              <td><a target=\"_blank\"  [href]=\"issue.html_url\">#{{issue.number}}</a></td>\n              <td><a target=\"_blank\"  [href]=\"issue.html_url\">{{issue.title}}</a></td>\n              <td nowrap>{{issue.pr_state}}</td>\n              <td nowrap>{{issue.pr_action}}</td>\n              <td nowrap>{{issue.priority}}</td>\n              <td nowrap>{{issue.cust}}</td>\n              <td>{{issue.labels_other.join('; ')}}</td>\n              <td><a href=\"{{}}\" target=\"_blank\"><img width=\"15\" height=\"15\" [hidden]=\"!issue.assignee\" [src]=\"(issue.assignee||{}).avatar_url || ''\"> {{(issue.assignee||{}).login}}</a></td>\n            </tr>\n          </table>\n      </td>\n    </tr>\n  </table>  \n  "
        }), 
        __metadata('design:paramtypes', [])
    ], GithubIssues);
    return GithubIssues;
})();
exports.GithubIssues = GithubIssues;
function byAssigneeGroup(a, b) {
    return _strCmp(a.assignee.login, b.assignee.login);
}
var MilestoneGroup = (function () {
    function MilestoneGroup(milestone) {
        this.milestone = milestone;
        this.assignees = new set_1.OrderedSet(byAssigneeGroup);
        this.noAssignee = new set_1.OrderedSet(byNumber);
        this.number = milestone.number;
    }
    MilestoneGroup.prototype.add = function (issue) {
        if (issue.assignee) {
            this.assignees.setIfAbsent(new AssigneeGroup(issue.assignee)).add(issue);
        }
        else {
            this.noAssignee.set(issue);
        }
    };
    MilestoneGroup.prototype.getIssues = function (assignee) {
        return this.assignees.setIfAbsent(new AssigneeGroup(assignee)).issues.items;
    };
    return MilestoneGroup;
})();
function byPriority(a, b) {
    if (a.number === b.number)
        return 0;
    if (a.priority != b.priority)
        return _strCmp(a.priority, b.priority);
    if (a.effort != b.effort)
        return _strCmp(a.effort, b.effort);
    return a.number - b.number;
}
var AssigneeGroup = (function () {
    function AssigneeGroup(assignee) {
        this.assignee = assignee;
        this.issues = new set_1.OrderedSet(byPriority);
    }
    AssigneeGroup.prototype.add = function (issue) {
        this.issues.set(issue);
    };
    return AssigneeGroup;
})();
var ComponentGroup = (function () {
    function ComponentGroup(name) {
        this.name = name;
        this.issues = new set_1.OrderedSet(byPriority);
    }
    ComponentGroup.prototype.add = function (issue) {
        this.issues.set(issue);
    };
    return ComponentGroup;
})();
//# sourceMappingURL=github_issues_component.js.map