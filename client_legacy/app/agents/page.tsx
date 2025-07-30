import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

interface AgentLog {
  id: string
  agent_id: string
  input: string
  output: string
  model_used: string
  user_id: string
  timestamp: string
  metadata: Record<string, any>
}

interface Agent {
  id: string
  task: string
  model: string
  fallback: string
  description: string
}

export default async function AgentsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch recent agent logs
  const { data: agentLogs, error: logsError } = await supabase
    .from('agent_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(10)

  // Fetch available agents from API
  const agents: Agent[] = [
    { id: 'writerbot', task: 'content_request', model: 'anthropic/claude-3-opus', fallback: 'openai/gpt-4o', description: 'Emotionally intelligent content writer' },
    { id: 'coderbot', task: 'code_request', model: 'openai/gpt-4o', fallback: 'cohere/command-r-plus', description: 'Full-stack developer assistant' },
    { id: 'logicbot', task: 'automation', model: 'cohere/command-r-plus', fallback: 'anthropic/claude-3-opus', description: 'Workflow automation designer' },
    { id: 'securitybot', task: 'security_analysis', model: 'anthropic/claude-3-opus', fallback: 'openai/gpt-4o', description: 'Defensive security expert' }
  ]

  if (logsError) {
    console.error('Error fetching agent logs:', logsError)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">FlashFusion Agent System</h1>
      
      {/* Available Agents */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg mb-2">{agent.id}</h3>
              <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
              <div className="text-xs">
                <p><span className="font-semibold">Task:</span> {agent.task}</p>
                <p><span className="font-semibold">Model:</span> {agent.model}</p>
                <p><span className="font-semibold">Fallback:</span> {agent.fallback}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Agent Activity</h2>
        {agentLogs && agentLogs.length > 0 ? (
          <div className="space-y-4">
            {agentLogs.map((log: AgentLog) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">{log.agent_id}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Input:</span>
                    <p className="text-sm text-gray-700">{log.input}</p>
                  </div>
                  <div>
                    <span className="font-medium">Output:</span>
                    <p className="text-sm text-gray-700">{log.output}</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Model: {log.model_used}</span>
                    <span>User: {log.user_id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No agent activity yet.</p>
        )}
      </section>
    </div>
  )
}