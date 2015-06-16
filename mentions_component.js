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
var github_1 = require('./github');
var core_team_1 = require('core_team');
var MentionComponent = (function () {
    function MentionComponent(mentions, coreTeam) {
        this.username = '';
        this.fetched = false;
        this.from = coreTeam.members;
        this.mentions = mentions;
        this.username = localStorage.getItem('github.username');
    }
    MentionComponent.prototype.onKeyUp = function (value) {
        this.username = value;
        localStorage.setItem('github.username', value);
    };
    MentionComponent.prototype.refresh = function () {
        var username = this.username.trim();
        this.mentions.refresh(username, this.org, this.days, this.from);
        this.fetched = true;
    };
    MentionComponent = __decorate([
        angular2_1.Component({
            selector: 'gh-mentions',
            properties: ['org', 'days'],
            appInjector: [github_1.Mentions, core_team_1.CoreTeam]
        }),
        angular2_1.View({
            template: "\n  <div>\n    <input (keyup)=\"onKeyUp($event.target.value)\" [value]=\"username\">\n    <button (click)=\"refresh()\">Refresh</button>\n    <ul>\n      <li *ng-for=\"#mention of mentions.list\">\n        <a href=\"{{mention.url}}\" target=\"_blank\">{{'#' + mention.number + ': ' + mention.title}}</a>\n      </li>\n    </ul>\n    <p *ng-if=\"!fetched\">Refresh to see mentions</p>\n  </div>\n  ",
            directives: [angular2_1.NgFor, angular2_1.NgIf]
        }), 
        __metadata('design:paramtypes', [github_1.Mentions, core_team_1.CoreTeam])
    ], MentionComponent);
    return MentionComponent;
})();
exports.MentionComponent = MentionComponent;
//# sourceMappingURL=mentions_component.js.map