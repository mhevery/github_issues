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
    }
    IssueComponent.prototype.perfIcon = function () {
        switch (this.issue.priority) {
            case 'P0': return '0⃣';
            case 'P1': return '1⃣';
            case 'P2': return '2⃣';
            case 'P3': return '3⃣';
            case 'P4': return '4⃣';
            case 'P5': return '5⃣';
            default: return '❓';
        }
    };
    IssueComponent.prototype.effortIcon = function () {
        switch (this.issue.effort) {
            case 'easy': return '😀';
            case 'medium': return '😐';
            case 'tough': return '😕';
            default: return '❓';
        }
    };
    IssueComponent = __decorate([
        angular2_1.Component({
            selector: 'issue',
            properties: { 'issue': 'issue' }
        }),
        angular2_1.View({
            template: "\n  <div>\n    <a target=\"_blank\" [href]=\"issue.html_url\">{{perfIcon()}}{{effortIcon()}}{{issue.number}}</a>\n    <!--<a [href]=\"issue.html_url\">{{issue.title}}</a>-->\n  </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], IssueComponent);
    return IssueComponent;
})();
exports.IssueComponent = IssueComponent;
//# sourceMappingURL=issue_component.js.map