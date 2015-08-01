var CoreTeam = (function () {
    function CoreTeam() {
        var _this = this;
        this.members = [
            'mhevery',
            'IgorMinar',
            'bradlygreen',
            'btford',
            'jbdeboer',
            'jeffbcross',
            'naomiblack',
            'tbosch',
            'petebacondarwin',
            'matsko',
            'caitp',
            'juliemr',
            'rkirov',
            'vsavkin',
            'robertmesserle',
            'alexeagle',
            'alxhub',
            'rodyhaddad',
            'vicb',
            'mprobst'
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