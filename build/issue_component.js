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
    IssueComponent.prototype.stateIcon = function () {
        switch (this.issue.issue_state || '') {
            case '': return '';
            case 'Needs Design': return '?';
            case 'PR': return '*';
            case 'Blocked': return '!';
            default: return IssueComponent.NOT_FOUND;
        }
    };
    IssueComponent.NOT_FOUND = '⁉';
    IssueComponent = __decorate([
        angular2_1.Component({
            selector: 'issue',
            properties: ['issue', 'compact']
        }),
        angular2_1.View({
            templateUrl: 'issue_component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], IssueComponent);
    return IssueComponent;
})();
exports.IssueComponent = IssueComponent;
//# sourceMappingURL=issue_component.js.map