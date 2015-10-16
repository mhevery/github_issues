import {Component, View, NgFor, NgIf} from 'angular2/angular2';
import {Repository} from './github';
import {OrderedSet} from './set';
import {IssueComponent} from './issue_component';
import {MentionComponent} from './mentions_component';
import {coreTeam} from './core_team';

var ref = new Firebase("https://ng2-projects.firebaseio.com");

function _strCmp(a: string, b: string) {
  if (a === undefined) a = '';
  if (b === undefined) b = '';
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function milestoneName(i: Issue) {
  return i.milestone ? i.milestone.title : '~';
}

function byNumber(a: Issue, b:Issue): number {
  return a.number - b.number;
}

function byPR(a: Issue, b:Issue): number {
  if (a.number === b.number) return 0;
  if (a.pr_action != b.pr_action) return _strCmp(a.pr_action, b.pr_action);
  if (a.pr_state != b.pr_state) return _strCmp(a.pr_state, b.pr_state);
  return a.number - b.number;
}

function byMilestonGroup(a: MilestoneGroup, b:MilestoneGroup): number {
  if (a.milestone.title == b.milestone.title) return 0;
  return a.milestone.title < b.milestone.title ? -1 : 1;
}

function byName(a:any, b:any) {
  return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
}

var prAssigneeMilestone: Milestone = {
  number: -1,
  html_url: null,
  state: null, 
  title: 'PRs by Assignee'
};
var prAuthorMilestone: Milestone = {
  number: -1,
  html_url: null,
  state: null, 
  title: 'PRs by Author'
};

class Presubmit {
  constructor(
    public branchName: string, 
    public travisJob: string, 
    public travisStatus: string) { }
}

@Component({
	selector: 'github-issues',
  directives: [NgFor, IssueComponent, MentionComponent, NgIf],
  templateUrl: 'github_issues.html' 
})
export class GithubIssues {
  presubmit = new OrderedSet<Presubmit>((a:Presubmit, b:Presubmit) => {
    return _strCmp(a.branchName, b.branchName);
  });
  triageIssues = new OrderedSet<Issue>(byNumber);
  repo = new Repository("angular", "angular");
  milestoneUsers = new OrderedSet<User>((a:User, b:User) => {
    var aLogin = a ? a.login.toLowerCase() : '';
    var aIsCore = coreTeam.has(aLogin);
    var bLogin = b ? b.login.toLowerCase() : '';
    var bIsCore = coreTeam.has(bLogin);
    if (aIsCore != bIsCore) return aIsCore ? -1 : 1;
    return _strCmp(aLogin, bLogin);
  });
  milestones = new OrderedSet<MilestoneGroup>(byMilestonGroup);
  backlogComponents = new OrderedSet<ComponentGroup>(byName);
  hotlistIssues = new OrderedSet<HotlistGroup>(byName);


  constructor() {
    this.repo.onNewIssue = this.onNewIssue.bind(this);
    this.repo.onNewPR = this.onNewPr.bind(this);
    this.loadIssues();
    this.loadPresubmit();
  }
  
  loadPresubmit() {
    this.repo.loadBranches((branchName, travisJob, travisStatus) => {
      this.presubmit.setIfAbsent(new Presubmit(branchName, travisJob, travisStatus));
    });
  }

  loadIssues() {
    this.repo.refresh();
  }

  onNewIssue(issue: Issue) {
    if (issue.needsTriage()) {
      this.triageIssues.set(issue);
    }
    if (issue.milestone) {
      if (issue.assignee) this.milestoneUsers.set(issue.assignee);
      this.milestones.setIfAbsent(new MilestoneGroup(issue.milestone)).addByAsignee(issue);
    } else {
      this.backlogComponents.setIfAbsent(new ComponentGroup(issue.comp)).add(issue);
    }
    if (issue.hotlist) {
      issue.hotlist.split(';').forEach((name) => {
        this.hotlistIssues.setIfAbsent(new HotlistGroup(name.trim())).add(issue);
      })
    }
  }

  onNewPr(pr: Issue) {
    // By Assignee
    if (pr.assignee) this.milestoneUsers.set(pr.assignee);
    this.milestones.setIfAbsent(new MilestoneGroup(prAssigneeMilestone)).addByAsignee(pr);

    // By Author
    if (pr.user) this.milestoneUsers.set(pr.user);
    this.milestones.setIfAbsent(new MilestoneGroup(prAuthorMilestone)).addByUser(pr);
  }

  setupAuthToken() {
    ref.authWithOAuthPopup("github", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
      }
    });
  }

  hasAuthToken() {
    return ref.getAuth();
  }

  getUsername() {
    return (<any>ref.getAuth()).github.username;
  }
}

function byUserGroup(a: UserGroup, b: UserGroup) {
  var aUser = a.user ? a.user.login.toLowerCase() : '';
  var bUser = b.user ? b.user.login.toLowerCase() : '';
  return _strCmp(aUser, bUser);
}

class MilestoneGroup {
  number: number;
  users = new OrderedSet<UserGroup>(byUserGroup);
  noUser = new OrderedSet<Issue>(byNumber);

  constructor(public milestone: Milestone) {
    this.number = milestone.number;
  }

  addByAsignee(issue: Issue) {
    if (issue.assignee) {
      this.users.setIfAbsent(new UserGroup(issue.assignee)).add(issue);
    } else {
      this.noUser.set(issue);
    }
  }

  addByUser(issue: Issue) {
    if (issue.user) {
      this.users.setIfAbsent(new UserGroup(issue.user)).add(issue);
    } else {
      this.noUser.set(issue);
    }
  }

  getIssues(assignee: User) {
    return this.users.setIfAbsent(new UserGroup(assignee)).issues.items;
  }
}

function byPriority(a: Issue, b:Issue): number {
  if (a.number === b.number) return 0;
  if (milestoneName(a) != milestoneName(b)) return _strCmp(milestoneName(a), milestoneName(b));
  if (a.priority != b.priority) return _strCmp(a.priority, b.priority);
  if (a.effort != b.effort) return _strCmp(a.effort, b.effort);
  return a.number - b.number;
}


class UserGroup {
  issues = new OrderedSet<Issue>(byPriority);
  constructor(public user:User) { }

  add(issue: Issue) {
    this.issues.set(issue);
  }
}

class ComponentGroup {
  issues = {
    'P0': new OrderedSet<Issue>(byPriority),
    'P1': new OrderedSet<Issue>(byPriority),
    'P2': new OrderedSet<Issue>(byPriority),
    'P3': new OrderedSet<Issue>(byPriority),
    'P4': new OrderedSet<Issue>(byPriority),
    'P!': new OrderedSet<Issue>(byPriority),
    '': new OrderedSet<Issue>(byPriority)
  }

  constructor(public name:string) { }

  add(issue:Issue) {
    (<any>this.issues)[issue.priority].set(issue);
  }
}

class HotlistGroup {
  issues = new OrderedSet<Issue>(byPriority);

  constructor(public name:string) { }

  add(issue:Issue) {
    this.issues.set(issue);
  }
}
