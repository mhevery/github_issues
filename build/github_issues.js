var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/// <reference path="typings/github.d.ts" />
var angular2_1 = require('angular2/angular2');
var github_1 = require('github');
var set_1 = require('set');
var issue_component_1 = require('issue_component');
var mentions_component_1 = require('mentions_component');
var ref = new Firebase("https://ng2-projects.firebaseio.com");
function _strCmp(a, b) {
    if (a === undefined)
        a = '';
    if (b === undefined)
        b = '';
    if (a === b)
        return 0;
    return a < b ? -1 : 1;
}
function milestoneName(i) {
    return i.milestone ? i.milestone.title : '~';
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
function byName(a, b) {
    return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
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
        this.backlogComponents = new set_1.OrderedSet(byName);
        this.hotlistIssues = new set_1.OrderedSet(byName);
        this.repo.onNewIssue = this.onNewIssue.bind(this);
        this.repo.onNewPR = this.onNewPr.bind(this);
        this.loadIssues();
    }
    GithubIssues.prototype.loadIssues = function () {
        this.repo.refresh();
    };
    GithubIssues.prototype.onNewIssue = function (issue) {
        var _this = this;
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
        if (issue.hotlist) {
            issue.hotlist.split(';').forEach(function (name) {
                _this.hotlistIssues.setIfAbsent(new HotlistGroup(name.trim())).add(issue);
            });
        }
    };
    GithubIssues.prototype.onNewPr = function (issue) {
        this.prIssues.set(issue);
    };
    GithubIssues.prototype.setupAuthToken = function () {
        ref.authWithOAuthPopup("github", function (error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            }
            else {
                console.log("Authenticated successfully with payload:", authData);
            }
        });
    };
    GithubIssues.prototype.hasAuthToken = function () {
        return ref.getAuth();
    };
    GithubIssues.prototype.getUsername = function () {
        return ref.getAuth().github.username;
    };
    GithubIssues = __decorate([
        angular2_1.Component({
            selector: 'github-issues'
        }),
        angular2_1.View({
            directives: [angular2_1.NgFor, issue_component_1.IssueComponent, mentions_component_1.MentionComponent, angular2_1.NgIf],
            templateUrl: 'github_issues.html'
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
    if (milestoneName(a) != milestoneName(b))
        return _strCmp(milestoneName(a), milestoneName(b));
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
        this.issues = {
            'P0': new set_1.OrderedSet(byPriority),
            'P1': new set_1.OrderedSet(byPriority),
            'P2': new set_1.OrderedSet(byPriority),
            'P3': new set_1.OrderedSet(byPriority),
            'P4': new set_1.OrderedSet(byPriority)
        };
    }
    ComponentGroup.prototype.add = function (issue) {
        this.issues[issue.priority].set(issue);
    };
    return ComponentGroup;
})();
var HotlistGroup = (function () {
    function HotlistGroup(name) {
        this.name = name;
        this.issues = new set_1.OrderedSet(byPriority);
    }
    HotlistGroup.prototype.add = function (issue) {
        this.issues.set(issue);
    };
    return HotlistGroup;
})();
//# sourceMappingURL=github_issues.js.map