export class CoreTeam {
  members: string[] = [
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
  memberSet: any = {}
 
  constructor() {
    this.members.forEach(user => this.memberSet[user.toLowerCase()] = true);
  }
    
  has(name:string): boolean {
    return this.memberSet.hasOwnProperty(name.toLowerCase());
  }
}

export var coreTeam = new CoreTeam();