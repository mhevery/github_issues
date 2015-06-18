/// <reference path="typings/angular2/angular2.d.ts" />

import {bootstrap, bind} from 'angular2/angular2';
import {GithubIssues} from 'github_issues';
import {Mentions} from 'github';
import {CoreTeam} from 'core_team';

bootstrap(GithubIssues, [
    bind(Mentions).toClass(Mentions),
    bind(CoreTeam).toClass(CoreTeam)
]);

