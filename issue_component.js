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
var IssueComponent = (function () {
    function IssueComponent() {
        this.compact = false;
    }
    IssueComponent.prototype.periorityIcon = function () {
        switch (this.issue.priority) {
            case 'P0': return '0';
            case 'P1': return '1';
            case 'P2': return '2';
            case 'P3': return '3';
            case 'P4': return '4';
            case 'P5': return '5';
            default: return IssueComponent.NOT_FOUND;
        }
    };
    IssueComponent.prototype.effortIcon = function () {
        var effort = this.issue.effort;
        if (effort)
            effort = effort.split(':')[0];
        switch (effort) {
            case '1': return '.';
            case '2': return 'o';
            case '3': return 'O';
            default: return IssueComponent.NOT_FOUND;
        }
    };
    IssueComponent.prototype.typeIcon = function () {
        switch (this.issue.type) {
            case 'RFC': return 'Q';
            case 'bug': return 'B';
            case 'feature': return 'F';
            case 'performance': return 'P';
            case 'refactor': return 'R';
            case 'chore': return 'C';
            default: return IssueComponent.NOT_FOUND;
        }
    };
    IssueComponent.prototype.actionIcon = function () {
        switch (this.issue.action || '') {
            case '': return '';
            case 'Design': return '?';
            case 'PR': return '*';
            case 'Blocked': return '!';
            default: return IssueComponent.NOT_FOUND;
        }
    };
    IssueComponent.NOT_FOUND = '⁉';
    IssueComponent = __decorate([
        angular2_1.Component({
            selector: 'issue',
            properties: { 'issue': 'issue', 'compact': 'compact' }
        }),
        angular2_1.View({
            template: "\n  <div>\n    <span title=\"{{issue.priority}}\" style=\"width: .6em; display: inline-block\">{{periorityIcon()}}</span\n    ><span title=\"{{issue.type}}\" style=\"width: .7em; display: inline-block\">{{typeIcon()}}</span\n    ><span title=\"{{issue.effort}}\" style=\"width: 1em; display: inline-block\">{{effortIcon()}}</span\n    ><a target=\"_blank\" title=\"[{{issue.comp}}] {{issue.title}}\" [href]=\"issue.html_url\">{{issue.number}}</a\n    ><span title=\"{{issue.action}}\">{{actionIcon()}}</span>\n    <span [hidden]=\"compact\">\n      <a target=\"_blank\" [href]=\"issue.html_url\">{{issue.title}}</a>\n      <span [hidden]=\"!issue.comp\">[<a href=\"https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Amilestone+label%3A%22comp%3A+{{issue.comp}}\" target=\"_blank\">{{issue.comp}}</a>]</span>\n      <span [hidden]=\"!issue.milestone\">&lt;<a href=\"https://github.com/angular/angular/milestones/{{(issue.milestone||{}).title}}\" target=\"_blank\">{{(issue.milestone||{}).title}}</a>&gt;</span>\n    </span>\n  </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], IssueComponent);
    return IssueComponent;
})();
exports.IssueComponent = IssueComponent;
//# sourceMappingURL=issue_component.js.map