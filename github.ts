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
  
  clientId() {
    return localStorage.getItem('github.client_id');
  }
  
  clientSecret() {
    return localStorage.getItem('github.client_secret');
  }
  
  refresh() {
    this.state = 'refreshing';
    this.previousIssues = this.issues;
    this.previousPrs = this.prs;
    
    var fetchPage = (page: number) => {
      var http = new XMLHttpRequest();
      var params = `client_id=${this.clientId()}&client_secret=${this.clientSecret()}&per_page=100&page=${page}`;
      var url = `https://api.github.com/repos/angular/angular/issues?${params}`;
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
      http.send(params);
    }
    fetchPage(0);
  }
  
  _processIssues(issue: Issue) {
    this._parseLabels(issue);
    issue.needsTriage = function() {
      if (this.pull_requst) {
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
    var other = issue.labels_other = [];
    issue.priority = '';
    issue.type = '';
    issue.component = '';
    
    issue.labels.forEach((label: Label) => {
      var split = label.name.split(':');
      var name = split[0];
      var value = split[1];
      if (value) {
        value = value.split('/')[0].trim();
      }
      switch (name) {
        case 'P0':
        case 'P1':
        case 'P2':
        case 'P3':
        case 'P4':
          value = name;
          name = 'priority';
        case 'comp':
        case 'cla':
        case 'pr_state':
        case 'pr_action':
        case 'cust':
        case 'effort':
        case 'type':
          issue[name] = (issue[name] ? issue[name] + '; ' : '') + value;
          break;
        default:
          other.push(label.name);
      }
    }); 
  }
}
