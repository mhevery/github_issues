import {bootstrap} from 'angular2/angular2';
import {GithubIssues} from './github_issues';
import {Mentions} from './github';
import {CoreTeam} from './core_team';

bootstrap(GithubIssues, [Mentions, CoreTeam]);

