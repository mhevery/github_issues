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
            case 'P0': return '0⃣';
            case 'P1': return '1⃣';
            case 'P2': return '2⃣';
            case 'P3': return '3⃣';
            case 'P4': return '4⃣';
            case 'P5': return '5⃣';
            default: return IssueComponent.NOT_FOUND;
        }
    };
    IssueComponent.prototype.effortIcon = function () {
        switch (this.issue.effort) {
            case 'easy': return '▏';
            case 'medium': return '▌';
            case 'tough': return '█';
            default: return IssueComponent.NOT_FOUND;
        }
    };
    IssueComponent.prototype.typeIcon = function () {
        switch (this.issue.type) {
            case 'RFC': return '❔';
            case 'bug': return '🐛';
            case 'feature': return '➕';
            case 'perf': return '📊';
            case 'refactor': return '❤';
            case 'chore': return '🔧';
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
            template: "\n  <div>\n    <span title=\"{{issue.priority}}\">{{periorityIcon()}}</span><span title=\"{{issue.type}}\">{{typeIcon()}}</span><span title=\"{{issue.effort}}\">{{effortIcon()}}</span><a target=\"_blank\" title=\"{{issue.title}}\" [href]=\"issue.html_url\">{{issue.number}}</a>\n    <span [hidden]=\"compact\">\n      <a target=\"_blank\" [href]=\"issue.html_url\">{{issue.title}}</a>\n      [ {{issue.comp}} ]\n    </span>\n  </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], IssueComponent);
    return IssueComponent;
})();
exports.IssueComponent = IssueComponent;
//# sourceMappingURL=issue_component.js.map