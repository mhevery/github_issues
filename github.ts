var ref = new Firebase("https://ng2-projects.firebaseio.com");

const GIT_API = 'https://api.github.com/repos/angular/angular/';
const TRAVIS_API = 'https://api.travis-ci.org/repos/angular/angular/';

function gitToken() {
  if (ref.getAuth()) {
    return (<any>ref.getAuth()).github.accessToken    
  }
  return null;
}

function urlGET(url: string, token: string, cb:(statusCode: number, data:any) => void) {
  var http = new XMLHttpRequest();
  http.open('GET', url);
  if (token) {
    http.setRequestHeader("Authorization", "token " + token);
  }
  http.onreadystatechange = () => {
    if (http.readyState == 4) {
      var status = http.status;
      var data = http.responseText;
      if (data.length && (data.charAt(0) == '[' || data.charAt(0) == '{')) {
        data = JSON.parse(data);
      }
      cb(status, data);
    }
  }
  http.send();
}



export class Repository {
  state: string;

  issues:  { [s: string]: Issue; } = {};
  previousIssues:  { [s: string]: Issue; } = {};
  prs:  { [s: string]: Issue; } = {};
  previousPrs:  { [s: string]: Issue; } = {};

  onNewIssue: (issue: Issue) => void = () => null;
  onRemovedIssue: (issue: Issue) => void = () => null;
  onNewPR: (issue: Issue) => void = () => null;
  onRemovedPR: (issue: Issue) => void = () => null;

  constructor(public username: string, public repository: string) {
    this.state = '';
  }
  
  loadBranches(notify:(name: string, job: string, status: string) => void) {
    urlGET(GIT_API + 'branches', gitToken(), (code: number, data: List<Branch>) => {
      data.forEach((branch: Branch) => {
        if (branch.name.indexOf('presubmit-') == 0) {
          urlGET(TRAVIS_API + 'branches/' + branch.name, null, (code: number, travis: TravisBranch) => {
            notify(branch.name, travis.branch.id, travis.branch.state);
          });
        }
      });
    });
  }
  
  refresh() {
    this.state = 'refreshing';
    this.previousIssues = this.issues;
    this.previousPrs = this.prs;

    var fetchPage = (page: number) => {
      var http = new XMLHttpRequest();

      var url = buildUrl('/repos/angular/angular/issues', {
        per_page: 100,
        page: page
      });
      urlGET(url, gitToken(), (status, data) => {
        if(status == 200) {
          var issues: Array<Issue> = data;
          issues.forEach(this._processIssues.bind(this));
          if (issues.length >= 100) {
            fetchPage(page + 1);
          } else {
            this.state = '';
            this._notifyRemoves();
          }
        } else {
          console.error(data);
        }
      });
    }
    fetchPage(0);
  }

  _processIssues(issue: Issue) {
    this._parseLabels(issue);
    issue.needsTriage = function() {
      if (this.pull_request) {
        return false;
      } else {
        return !this.type || !this.priority || !this.comp || !this.effort;
      }
    }

    if (issue.pull_request) {
      this.issues[issue.number] = issue;
      this.onNewPR(issue);
    } else {
      this.prs[issue.number] = issue;
      this.onNewIssue(issue);
    }
  }

  _notifyRemoves() {
    for(var issueNo in this.previousIssues) {
      if (!this.issues[issueNo]) {
        this.onRemovedIssue(this.previousIssues[issueNo]);
      }
    }
    for(var prNo in this.previousPrs) {
      if (!this.prs[prNo]) {
        this.onRemovedIssue(this.previousPrs[prNo]);
      }
    }
  }

  _parseLabels(issue: Issue) {
    var other: Array<string> = issue.labels_other = [];
    issue.priority = '';
    issue.type = '';
    //issue.component = '';

    issue.labels.forEach((label: Label) => {
      var match = /^([A-Za-z]+)(\d*):\s*(.*)$/.exec(label.name);
      var name = match && match[1] || '';
      var level = match && match[2] || 0;
      var value = match && match[3] || '';
      if (value) {
        value = value.split(' / ')[0].trim();
      }
      if (name == 'P') {
        name = 'priority';
        value = 'P' + level;
      }
      if (name == 'effort') {
        value = level + ': ' + value;
      }
      if (name == 'state') {
        name = 'issue_state';
      }
      switch (name) {
        case 'priority':
        case 'effort':
        case 'comp':
        case 'cla':
        case 'pr_state':
        case 'pr_action':
        case 'cust':
        case 'hotlist':
        case 'issue_state':
        case 'type':
          (<any>issue)[name] = ((<any>issue)[name] ? (<any>issue)[name] + '; ' : '') + value;
          break;
        default:
          other.push(label.name);
      }
    });
  }
}

export class Mentions {
  list: {title: string, url: string, number: number, state: string}[] = [];

  refresh(username: string, org: string, days: any, from: string[]) {
    this.list = [];

    var xhr = new XMLHttpRequest();

    var url = buildUrl('/search/issues', {
      q: this._buildQuery(username, org, days, from)
    });

    xhr.onload = () => {
      var status = xhr.status;
      if (200 <= status && status <= 300) {
        var mentions = JSON.parse(xhr.responseText);
        mentions.items.forEach((mention: Mention) => {
          this.list.push({
            number: mention.number,
            title: mention.title,
            url: mention.html_url,
            state: mention.state
          });
        });
      } else {
        console.error(xhr.responseText);
      }
    }

    xhr.open("GET", url);
    if (ref.getAuth()) {
      xhr.setRequestHeader("Authorization", "token " + (<any>ref.getAuth()).github.accessToken);
    }
    xhr.send();
  }

  _buildQuery(username: string, org: string, days: any, from: string[]) {
    let date: Date = new Date(Date.now() - days * 24 * 3600 * 1000);

    let query = `mentions:${username}+user:${org}+created:>=${date.toISOString().substring(0, 10)}`;

    if (from && from.length) {
      from.forEach(u => {
        query += `+involves:${u}`;
      })
    }

    return query;
  }
}

function buildUrl(ep: string, params: any): string {
  var strParams: Array<string> = [];
  for (let p in params) {
    strParams.push(`${p}=${params[p]}`);
  }

  if (ep[0] == '/') ep = ep.substring(1);

  return `https://api.github.com/${ep}?${strParams.join('&')}`;
}
