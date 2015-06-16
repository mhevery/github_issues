/// <reference path="typings/angular2/angular2.d.ts" />
var angular2_1 = require('angular2/angular2');
var github_issues_component_1 = require('github_issues_component');
var github_1 = require('github');
var core_team_1 = require('core_team');
angular2_1.bootstrap(github_issues_component_1.GithubIssues, [
    angular2_1.bind(github_1.Mentions).toClass(github_1.Mentions),
    angular2_1.bind(core_team_1.CoreTeam).toClass(core_team_1.CoreTeam)
]);
//# sourceMappingURL=app.js.map