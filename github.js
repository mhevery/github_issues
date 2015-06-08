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
    Repository.prototype.clientId = function () {
        return localStorage.getItem('github.client_id');
    };
    Repository.prototype.clientSecret = function () {
        return localStorage.getItem('github.client_secret');
    };
    Repository.prototype.refresh = function () {
        var _this = this;
        this.state = 'refreshing';
        this.previousIssues = this.issues;
        this.previousPrs = this.prs;
        var fetchPage = function (page) {
            var http = new XMLHttpRequest();
            var params = "client_id=" + _this.clientId() + "&client_secret=" + _this.clientSecret() + "&per_page=100&page=" + page;
            var url = "https://api.github.com/repos/angular/angular/issues?" + params;
            http.open("GET", url, true);
            http.onreadystatechange = function () {
                var response = http.responseText;
                if (http.readyState == 4) {
                    if (http.status == 200) {
                        var issues = JSON.parse(response);
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
                        console.error(response);
                    }
                }
            };
            http.send(params);
        };
        fetchPage(0);
    };
    Repository.prototype._processIssues = function (issue) {
        this._parseLabels(issue);
        issue.needsTriage = function () {
            if (this.pull_requst) {
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
        issue.component = '';
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
            switch (name) {
                case 'priority':
                case 'effort':
                case 'comp':
                case 'cla':
                case 'pr_state':
                case 'pr_action':
                case 'cust':
                case 'hotlist':
                case 'action':
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
//# sourceMappingURL=github.js.map