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
var core_team_1 = require('core_team');
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
var prAssigneeMilestone = {
    number: -1,
    html_url: null,
    state: null,
    title: 'PRs by Assignee'
};
var prAuthorMilestone = {
    number: -1,
    html_url: null,
    state: null,
    title: 'PRs by Author'
};
var GithubIssues = (function () {
    function GithubIssues() {
        this.triageIssues = new set_1.OrderedSet(byNumber);
        this.repo = new github_1.Repository("angular", "angular");
        this.milestoneUsers = new set_1.OrderedSet(function (a, b) {
            var aLogin = a ? a.login.toLowerCase() : '';
            var aIsCore = core_team_1.coreTeam.has(aLogin);
            var bLogin = b ? b.login.toLowerCase() : '';
            var bIsCore = core_team_1.coreTeam.has(bLogin);
            if (aIsCore != bIsCore)
                return aIsCore ? -1 : 1;
            return _strCmp(aLogin, bLogin);
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
        if (issue.milestone) {
            if (issue.assignee)
                this.milestoneUsers.set(issue.assignee);
            this.milestones.setIfAbsent(new MilestoneGroup(issue.milestone)).addByAsignee(issue);
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
    GithubIssues.prototype.onNewPr = function (pr) {
        // By Assignee
        if (pr.assignee)
            this.milestoneUsers.set(pr.assignee);
        this.milestones.setIfAbsent(new MilestoneGroup(prAssigneeMilestone)).addByAsignee(pr);
        // By Author
        if (pr.user)
            this.milestoneUsers.set(pr.user);
        this.milestones.setIfAbsent(new MilestoneGroup(prAuthorMilestone)).addByUser(pr);
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
function byUserGroup(a, b) {
    var aUser = a.user ? a.user.login.toLowerCase() : '';
    var bUser = b.user ? b.user.login.toLowerCase() : '';
    return _strCmp(aUser, bUser);
}
var MilestoneGroup = (function () {
    function MilestoneGroup(milestone) {
        this.milestone = milestone;
        this.users = new set_1.OrderedSet(byUserGroup);
        this.noUser = new set_1.OrderedSet(byNumber);
        this.number = milestone.number;
    }
    MilestoneGroup.prototype.addByAsignee = function (issue) {
        if (issue.assignee) {
            this.users.setIfAbsent(new UserGroup(issue.assignee)).add(issue);
        }
        else {
            this.noUser.set(issue);
        }
    };
    MilestoneGroup.prototype.addByUser = function (issue) {
        if (issue.user) {
            this.users.setIfAbsent(new UserGroup(issue.user)).add(issue);
        }
        else {
            this.noUser.set(issue);
        }
    };
    MilestoneGroup.prototype.getIssues = function (assignee) {
        return this.users.setIfAbsent(new UserGroup(assignee)).issues.items;
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
var UserGroup = (function () {
    function UserGroup(user) {
        this.user = user;
        this.issues = new set_1.OrderedSet(byPriority);
    }
    UserGroup.prototype.add = function (issue) {
        this.issues.set(issue);
    };
    return UserGroup;
})();
var ComponentGroup = (function () {
    function ComponentGroup(name) {
        this.name = name;
        this.issues = {
            'P0': new set_1.OrderedSet(byPriority),
            'P1': new set_1.OrderedSet(byPriority),
            'P2': new set_1.OrderedSet(byPriority),
            'P3': new set_1.OrderedSet(byPriority),
            'P4': new set_1.OrderedSet(byPriority),
            'P!': new set_1.OrderedSet(byPriority),
            '': new set_1.OrderedSet(byPriority)
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