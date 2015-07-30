var ref = new Firebase("https://ng2-projects.firebaseio.com");

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
      http.open("GET", url, true);

      http.onreadystatechange = () => {
        var response = http.responseText;
        if (http.readyState == 4) {
          if(http.status == 200) {
            var issues: Array<Issue> = JSON.parse(response);
            issues.forEach(this._processIssues.bind(this));
            if (issues.length >= 100) {
              fetchPage(page + 1);
            } else {
              this.state = '';
              this._notifyRemoves();
            }
          } else {
            console.error(response);
          }
        }
      }
      http.send();
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
  list: {title: string, url: string, number: number}[] = [];

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
            url: mention.html_url
          });
        });
      } else {
        console.error(xhr.responseText);
      }
    }

    xhr.open("GET", url);
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
  var auth: FirebaseAuthData;
  if (auth = ref.getAuth()) {
    params.access_token = (<any>auth).github.accessToken;
  }

  var strParams: Array<string> = [];
  for (let p in params) {
    strParams.push(`${p}=${params[p]}`);
  }

  if (ep[0] == '/') ep = ep.substring(1);

  return `https://api.github.com/${ep}?${strParams.join('&')}`;
}
