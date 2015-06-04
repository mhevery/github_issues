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
  pull_request: PullRequest,
  assignee: Assignee;
  
  priority: string;
  component: string;
  type: string;
  effort: string;
  pr_state: string;
  pr_action: string;
  cust: string;
  labels_other: Array<string>;
  
  parseLabels(): void;
  needsTriage(): boolean;
}

interface PullRequest {
  
}

interface Assignee {
  login: string;
  id: number;
  avatar_url: string;
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
