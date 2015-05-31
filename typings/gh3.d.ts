declare var Gh3: {
  User: new (name:string) => gh3.User;
  Repository: new (name:string, user:gh3.User) => gh3.Repository;
  Issue: any;
};

declare module gh3 {
  interface User {
    getRepositoryByName(name:String): Repository;
  }
  
  interface Issue {
    number: number,
    html_url: string,
    state: string, 
    title: string,
    body: string,
    labels: Array<Label>,
    milestone: Milestone,
    
    priority: string;
    component: string;
    type: string;
    effort: string;
    pr_state: string;
    cust: string;
    labels_other: Array<string>;
    
    parseLabels(): void;
    needsTriage(): boolean;
  }
  
  interface Label {
    color: string,
    name: string,
    url: string
  }
  
  interface Milestone {
    number: number,
    html_url: string,
    state: string, 
    title: string
  }
  
  interface Repository {
    issues: Array<Issue>;
    name: string;
    user: User;
    
    fetchIssues(callback:(err, res:Repository)=>void):void;
    fetchAllIssues(callback:(err, res:Repository)=>void):void;
  }
  
}
