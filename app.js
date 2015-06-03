/// <reference path="typings/angular2/angular2.d.ts" />
/// <reference path="typings/github.d.ts" />
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
var angular2_1 = require('angular2/angular2');
function get_number(i) { return i.number; }
var GithubIssues = (function () {
    function GithubIssues() {
        this.triageIssues = new Set(get_number);
        this.prIssues = new Set(get_number);
        this.repo = new Repository("angular", "angular");
        this.milestones = new Set(get_number);
        this.noMilestone = new Set(get_number);
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
            var milestonePane = this.milestones.getByKey(issue.milestone.number);
            if (!milestonePane) {
                milestonePane = new MilestonePane(issue.milestone);
                this.milestones.set(milestonePane);
            }
            milestonePane.add(issue);
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
    GithubIssues = __decorate([
        angular2_1.Component({
            selector: 'github-issues'
        }),
        angular2_1.View({
            directives: [angular2_1.NgFor],
            template: "\n  <h1>GitHub</h1>\n  <button (click)=\"loadIssues()\">Load Issues {{repo.state}}</button>\n  Action: [ <a href (click)=\"setupAuthToken(); false\">Github Auth Token</a> ]\n  \n  <h1>Issue Triage</h1>\n  Issues: {{triageIssues.items.length}}\n  <table>\n    <tr>\n      <th>#</th>\n      <th>Description</th>\n      <th>Milestone</th>\n      <th>Priority</th>\n      <th>Component</th>\n      <th>Type</th>\n      <th>Effort</th>\n      <th>Customer</th>\n      <th>Labels</th>\n    </tr>\n    <tr *ng-for=\"var issue of triageIssues.items\">\n      <td><a target=\"_blank\"  [href]=\"issue.html_url\">#{{issue.number}}</a></td>\n      <td><a target=\"_blank\"  [href]=\"issue.html_url\">{{issue.title}}</a></td>\n      <td><a target=\"_blank\" [href]=\"(issue.milestone || {}).html_url\">{{(issue.milestone||{}).title}}</a></td>\n      <td nowrap>{{issue.priority}}</td>\n      <td nowrap>{{issue.comp}}</td>\n      <td nowrap>{{issue.type}}</td>\n      <td nowrap>{{issue.effort}}</td>\n      <td nowrap>{{issue.cust}}</td>\n      <td>{{issue.labels_other.join('; ')}}</td>\n    </tr>\n  </table>\n  \n  <h1>PR Triage</h1>\n  PRs: {{prIssues.items.length}}\n  <table>\n    <tr>\n      <th>PR#</th>\n      <th>Description</th>\n      <th>PR State</th>\n      <th>PR Action</th>\n      <th>Priority</th>\n      <th>Customer</th>\n      <th>Labels</th>\n      <th>Assigned</th>\n    </tr>\n    <tr *ng-for=\"var issue of prIssues.items\">\n      <td><a target=\"_blank\"  [href]=\"issue.html_url\">#{{issue.number}}</a></td>\n      <td><a target=\"_blank\"  [href]=\"issue.html_url\">{{issue.title}}</a></td>\n      <td nowrap>{{issue.pr_state}}</td>\n      <td nowrap>{{issue.pr_action}}</td>\n      <td nowrap>{{issue.priority}}</td>\n      <td nowrap>{{issue.cust}}</td>\n      <td>{{issue.labels_other.join('; ')}}</td>\n      <td><a href=\"{{}}\" target=\"_blank\"><img width=\"15\" height=\"15\" [hidden]=\"!issue.assignee\" [src]=\"(issue.assignee||{}).avatar_url || ''\"> {{(issue.assignee||{}).login}}</a></td>\n    </tr>\n  </table>\n  \n  <h1>Milestone</h1>\n  <div *ng-for=\"var milestonePane of milestones.items\">\n    <h2><a target=\"_blank\" [href]=\"milestonePane.milestone.html_url\">\n        {{milestonePane.milestone.title}}</a></h2>\n    \n  </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], GithubIssues);
    return GithubIssues;
})();
var MilestonePane = (function () {
    function MilestonePane(milestone) {
        this.milestone = milestone;
        this.asignees = [];
        this.number = milestone.number;
    }
    MilestonePane.prototype.add = function (issue) { };
    return MilestonePane;
})();
var AsigneePane = (function () {
    function AsigneePane() {
    }
    return AsigneePane;
})();
var Set = (function () {
    function Set(keyGetter) {
        this.keyGetter = keyGetter;
        this.keys = {};
        this.items = [];
    }
    Set.prototype.getByKey = function (key) {
        return this.keys[key];
    };
    Set.prototype.set = function (item) {
        var key = this.keyGetter(item);
        var oldItem = this.keys[key];
        if (oldItem) {
            var index = this.items.indexOf(oldItem);
            this.items[index] = item;
        }
        else {
            this.items.push(item);
        }
        this.keys[key] = item;
        return item;
    };
    return Set;
})();
var Repository = (function () {
    function Repository(username, repository) {
        this.username = username;
        this.repository = repository;
        this.issues = {};
        this.previousIssues = {};
        this.prs = {};
        this.previousPrs = {};
        this.onNewIssue = function () { return null; };
        this.onRemovedIssue = function () { return null; };
        this.onNewPR = function () { return null; };
        this.onRemovedPR = function () { return null; };
        this.state = '';
    }
    Repository.prototype.clientId = function () {
        return localStorage.getItem('github.client_id');
    };
    Repository.prototype.clientSecret = function () {
        return localStorage.getItem('github.client_secret');
    };
    Repository.prototype.refresh = function () {
        var _this = this;
        this.state = 'refreshing';
        this.previousIssues = this.issues;
        this.previousPrs = this.prs;
        var fetchPage = function (page) {
            var http = new XMLHttpRequest();
            var params = "client_id=" + _this.clientId() + "&client_secret=" + _this.clientSecret() + "&per_page=100&page=" + page;
            var url = "https://api.github.com/repos/angular/angular/issues?" + params;
            http.open("GET", url, true);
            http.onreadystatechange = function () {
                var response = http.responseText;
                if (http.readyState == 4) {
                    if (http.status == 200) {
                        var issues = JSON.parse(response);
                        issues.forEach(_this._processIssues.bind(_this));
                        if (issues.length >= 100) {
                            fetchPage(page + 1);
                        }
                        else {
                            _this.state = '';
                            _this._notifyRemoves();
                        }
                    }
                    else {
                        console.error(response);
                    }
                }
            };
            http.send(params);
        };
        fetchPage(0);
    };
    Repository.prototype._processIssues = function (issue) {
        this._parseLabels(issue);
        issue.needsTriage = function () {
            if (this.pull_requst) {
                return false;
            }
            else {
                return !this.type || !this.priority || !this.comp || !this.effort;
            }
        };
        if (issue.pull_request) {
            this.issues[issue.number] = issue;
            this.onNewPR(issue);
        }
        else {
            this.prs[issue.number] = issue;
            this.onNewIssue(issue);
        }
    };
    Repository.prototype._notifyRemoves = function () {
        for (var issueNo in this.previousIssues) {
            if (!this.issues[issueNo]) {
                this.onRemovedIssue(this.previousIssues[issueNo]);
            }
        }
        for (var prNo in this.previousPrs) {
            if (!this.prs[prNo]) {
                this.onRemovedIssue(this.previousPrs[prNo]);
            }
        }
    };
    Repository.prototype._parseLabels = function (issue) {
        var other = issue.labels_other = [];
        issue.priority = '';
        issue.type = '';
        issue.component = '';
        issue.labels.forEach(function (label) {
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
    };
    return Repository;
})();
angular2_1.bootstrap(GithubIssues);
