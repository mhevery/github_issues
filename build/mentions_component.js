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
// https://github.com/Microsoft/TypeScript/issues/4092
//import {Mentions} from './github';
//import {CoreTeam} from 'core_team';
var m = require('./github');
var c = require('core_team');
var MentionComponent = (function () {
    function MentionComponent(mentions, coreTeam) {
        this.username = '';
        this.fetched = false;
        this.from = coreTeam.members;
        this.mentions = mentions;
        var ref = new Firebase("https://ng2-projects.firebaseio.com");
        var auth;
        if (auth = ref.getAuth()) {
            this.username = auth.github.username;
        }
    }
    MentionComponent.prototype.refresh = function () {
        var username = this.username.trim();
        if (username.length) {
            this.mentions.refresh(username, this.org, this.days, this.from);
            this.fetched = true;
        }
    };
    MentionComponent = __decorate([
        angular2_1.Component({
            selector: 'gh-mentions',
            properties: ['org', 'days'],
            appInjector: [m.Mentions, c.CoreTeam]
        }),
        angular2_1.View({
            template: "\n  <div>\n    <input (keyup)=\"username = $event.target.value\" [value]=\"username\" placeholder=\"username\">\n    <button (click)=\"refresh()\" [disabled]=\"username.trim().length == 0\">Refresh</button>\n    <ul>\n      <li *ng-for=\"#mention of mentions.list\">\n        <a href=\"{{mention.url}}\" target=\"_blank\">#{{mention.number}}: {{mention.title}}</a> ({{mention.state}})\n      </li>\n    </ul>\n    <p *ng-if=\"!fetched\">Refresh to see mentions</p>\n  </div>\n  ",
            directives: [angular2_1.NgFor, angular2_1.NgIf]
        }), 
        __metadata('design:paramtypes', [m.Mentions, c.CoreTeam])
    ], MentionComponent);
    return MentionComponent;
})();
exports.MentionComponent = MentionComponent;
//# sourceMappingURL=mentions_component.js.map