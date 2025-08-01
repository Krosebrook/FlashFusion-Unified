interface AgentTask {
  role: string;
  input: any;
  execute(): Promise<any>;
}

export class AgentManager {
  private agents: Record<string, AgentTask[]> = {};

  register(role: string, agent: AgentTask) {
    if (!this.agents[role]) this.agents[role] = [];
    this.agents[role].push(agent);
  }

  async run(role: string, input: any) {
    const results = [];
    for (const agent of this.agents[role] || []) {
      results.push(await agent.execute());
    }
    return results;
  }
}