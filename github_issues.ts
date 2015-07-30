import {Component, View, NgFor, NgIf} from 'angular2/angular2';
import {Repository} from 'github';
import {OrderedSet} from 'set';
import {IssueComponent} from 'issue_component';
import {MentionComponent} from 'mentions_component';

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

@Component({
	selector: 'github-issues'
})
@View({
  directives: [NgFor, IssueComponent, MentionComponent, NgIf],
  templateUrl: 'github_issues.html' 
})
export class GithubIssues {
  triageIssues = new OrderedSet<Issue>(byNumber);
  prIssues = new OrderedSet<Issue>(byPR);
  repo = new Repository("angular", "angular");
  milestoneAssignees = new OrderedSet<Assignee>((a:Assignee, b:Assignee) =>
    a.login == b.login ? 0 : a.login < b.login ? -1 : 1);
  milestones = new OrderedSet<MilestoneGroup>(byMilestonGroup);
  backlogComponents = new OrderedSet<ComponentGroup>(byName);
  hotlistIssues = new OrderedSet<HotlistGroup>(byName);


  constructor() {
    this.repo.onNewIssue = this.onNewIssue.bind(this);
    this.repo.onNewPR = this.onNewPr.bind(this);
    this.loadIssues();
  }

  loadIssues() {
    this.repo.refresh();
  }

  onNewIssue(issue: Issue) {
    if (issue.needsTriage()) {
      this.triageIssues.set(issue);
    } else if (issue.milestone) {
      if (issue.assignee) this.milestoneAssignees.set(issue.assignee);
      this.milestones.setIfAbsent(new MilestoneGroup(issue.milestone)).add(issue);
    } else {
      this.backlogComponents.setIfAbsent(new ComponentGroup(issue.comp)).add(issue);
    }
    if (issue.hotlist) {
      issue.hotlist.split(';').forEach((name) => {
        this.hotlistIssues.setIfAbsent(new HotlistGroup(name.trim())).add(issue);
      })
    }
  }

  onNewPr(issue: Issue) {
    this.prIssues.set(issue);
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

function byAssigneeGroup(a: AssigneeGroup, b: AssigneeGroup) {
  return _strCmp(a.assignee.login, b.assignee.login);
}

class MilestoneGroup {
  number: number;
  assignees = new OrderedSet<AssigneeGroup>(byAssigneeGroup);
  noAssignee = new OrderedSet<Issue>(byNumber);

  constructor(public milestone: Milestone) {
    this.number = milestone.number;
  }

  add(issue: Issue) {
    if (issue.assignee) {
      this.assignees.setIfAbsent(new AssigneeGroup(issue.assignee)).add(issue);
    } else {
      this.noAssignee.set(issue);
    }
  }

  getIssues(assignee: Assignee) {
    return this.assignees.setIfAbsent(new AssigneeGroup(assignee)).issues.items;
  }
}

function byPriority(a: Issue, b:Issue): number {
  if (a.number === b.number) return 0;
  if (milestoneName(a) != milestoneName(b)) return _strCmp(milestoneName(a), milestoneName(b));
  if (a.priority != b.priority) return _strCmp(a.priority, b.priority);
  if (a.effort != b.effort) return _strCmp(a.effort, b.effort);
  return a.number - b.number;
}


class AssigneeGroup {
  issues = new OrderedSet<Issue>(byPriority);
  constructor(public assignee:Assignee) { }

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
    'P4': new OrderedSet<Issue>(byPriority)
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
