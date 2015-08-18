var ref = new Firebase("https://ng2-projects.firebaseio.com");
var GIT_API = 'https://api.github.com/repos/angular/angular/';
var TRAVIS_API = 'https://api.travis-ci.org/repos/angular/angular/';
function gitToken() {
    if (ref.getAuth()) {
        return ref.getAuth().github.accessToken;
    }
    return null;
}
function urlGET(url, token, cb) {
    var http = new XMLHttpRequest();
    http.open('GET', url);
    if (token) {
        http.setRequestHeader("Authorization", "token " + token);
    }
    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            var status = http.status;
            var data = http.responseText;
            if (data.length && (data.charAt(0) == '[' || data.charAt(0) == '{')) {
                data = JSON.parse(data);
            }
            cb(status, data);
        }
    };
    http.send();
}
var Repository = (function () {
    function Repository(username, repository) {
        this.username = username;
        this.repository = repository;
        this.issues = {};
        this.previousIssues = {};
        this.prs = {};
        this.previousPrs = {};
        this.onNewIssue = function () { return null; };
        this.onRemovedIssue = function () { return null; };
        this.onNewPR = function () { return null; };
        this.onRemovedPR = function () { return null; };
        this.state = '';
    }
    Repository.prototype.loadBranches = function (notify) {
        urlGET(GIT_API + 'branches', gitToken(), function (code, data) {
            data.forEach(function (branch) {
                if (branch.name.indexOf('presubmit-') == 0) {
                    urlGET(TRAVIS_API + 'branches/' + branch.name, null, function (code, travis) {
                        notify(branch.name, travis.branch.id, travis.branch.state);
                    });
                }
            });
        });
    };
    Repository.prototype.refresh = function () {
        var _this = this;
        this.state = 'refreshing';
        this.previousIssues = this.issues;
        this.previousPrs = this.prs;
        var fetchPage = function (page) {
            var http = new XMLHttpRequest();
            var url = buildUrl('/repos/angular/angular/issues', {
                per_page: 100,
                page: page
            });
            urlGET(url, gitToken(), function (status, data) {
                if (status == 200) {
                    var issues = data;
                    issues.forEach(_this._processIssues.bind(_this));
                    if (issues.length >= 100) {
                        fetchPage(page + 1);
                    }
                    else {
                        _this.state = '';
                        _this._notifyRemoves();
                    }
                }
                else {
                    console.error(data);
                }
            });
        };
        fetchPage(0);
    };
    Repository.prototype._processIssues = function (issue) {
        this._parseLabels(issue);
        issue.needsTriage = function () {
            if (this.pull_request) {
                return false;
            }
            else {
                return !this.type || !this.priority || !this.comp || !this.effort;
            }
        };
        if (issue.pull_request) {
            this.issues[issue.number] = issue;
            this.onNewPR(issue);
        }
        else {
            this.prs[issue.number] = issue;
            this.onNewIssue(issue);
        }
    };
    Repository.prototype._notifyRemoves = function () {
        for (var issueNo in this.previousIssues) {
            if (!this.issues[issueNo]) {
                this.onRemovedIssue(this.previousIssues[issueNo]);
            }
        }
        for (var prNo in this.previousPrs) {
            if (!this.prs[prNo]) {
                this.onRemovedIssue(this.previousPrs[prNo]);
            }
        }
    };
    Repository.prototype._parseLabels = function (issue) {
        var other = issue.labels_other = [];
        issue.priority = '';
        issue.type = '';
        //issue.component = '';
        issue.labels.forEach(function (label) {
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
                    issue[name] = (issue[name] ? issue[name] + '; ' : '') + value;
                    break;
                default:
                    other.push(label.name);
            }
        });
    };
    return Repository;
})();
exports.Repository = Repository;
var Mentions = (function () {
    function Mentions() {
        this.list = [];
    }
    Mentions.prototype.refresh = function (username, org, days, from) {
        var _this = this;
        this.list = [];
        var xhr = new XMLHttpRequest();
        var url = buildUrl('/search/issues', {
            q: this._buildQuery(username, org, days, from)
        });
        xhr.onload = function () {
            var status = xhr.status;
            if (200 <= status && status <= 300) {
                var mentions = JSON.parse(xhr.responseText);
                mentions.items.forEach(function (mention) {
                    _this.list.push({
                        number: mention.number,
                        title: mention.title,
                        url: mention.html_url,
                        state: mention.state
                    });
                });
            }
            else {
                console.error(xhr.responseText);
            }
        };
        xhr.open("GET", url);
        if (ref.getAuth()) {
            xhr.setRequestHeader("Authorization", "token " + ref.getAuth().github.accessToken);
        }
        xhr.send();
    };
    Mentions.prototype._buildQuery = function (username, org, days, from) {
        var date = new Date(Date.now() - days * 24 * 3600 * 1000);
        var query = "mentions:" + username + "+user:" + org + "+created:>=" + date.toISOString().substring(0, 10);
        if (from && from.length) {
            from.forEach(function (u) {
                query += "+involves:" + u;
            });
        }
        return query;
    };
    return Mentions;
})();
exports.Mentions = Mentions;
function buildUrl(ep, params) {
    var strParams = [];
    for (var p in params) {
        strParams.push(p + "=" + params[p]);
    }
    if (ep[0] == '/')
        ep = ep.substring(1);
    return "https://api.github.com/" + ep + "?" + strParams.join('&');
}
//# sourceMappingURL=github.js.map