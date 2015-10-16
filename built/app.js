var angular2_1 = require('angular2/angular2');
var github_issues_1 = require('./github_issues');
var github_1 = require('./github');
var core_team_1 = require('./core_team');
angular2_1.bootstrap(github_issues_1.GithubIssues, [github_1.Mentions, core_team_1.CoreTeam]);
//# sourceMappingURL=app.js.map