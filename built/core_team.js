var CoreTeam = (function () {
    function CoreTeam() {
        var _this = this;
        this.members = [
            'alexeagle',
            'alxhub',
            'IgorMinar',
            'bradlygreen',
            'btford',
            'jelbourn',
            'jeffbcross',
            'juliemr',
            'jteplitz602',
            'kegluneq',
            'matsko',
            'mlaval',
            'matanlurey',
            'mprobst',
            'mhevery',
            'naomiblack',
            'robwormald',
            'petebacondarwin',
            'pkozlowski-opensource',
            'rkirov',
            'sjelin',
            'robertmesserle',
            'tbosch',
            'vsavkin',
            'vicb',
            'yjbanov'
        ];
        this.memberSet = {};
        this.members.forEach(function (user) { return _this.memberSet[user.toLowerCase()] = true; });
    }
    CoreTeam.prototype.has = function (name) {
        return this.memberSet.hasOwnProperty(name.toLowerCase());
    };
    return CoreTeam;
})();
exports.CoreTeam = CoreTeam;
exports.coreTeam = new CoreTeam();
//# sourceMappingURL=core_team.js.map