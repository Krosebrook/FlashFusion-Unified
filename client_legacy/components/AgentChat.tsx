'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface AgentChatProps {
  agents: Array<{
    id: string
    task: string
    description: string
  }>
}

export default function AgentChat({ agents }: AgentChatProps) {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.task || '')
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedAgent) return

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/v1/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          taskType: selectedAgent,
          input: input.trim(),
          userId: (await supabase.auth.getUser()).data.user?.id || 'anonymous'
        })
      })

      const data = await res.json()

      if (data.success) {
        setResponse(data.response)
        setInput('') // Clear input on success
      } else {
        setError(data.error || 'Failed to get response')
      }
    } catch (err) {
      setError('Failed to connect to agent service')
      console.error('Agent chat error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="agent-select" className="block text-sm font-medium mb-2">
            Select Agent
          </label>
          <select
            id="agent-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.task}>
                {agent.id} - {agent.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="input" className="block text-sm font-medium mb-2">
            Your Request
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your request here..."
            className="w-full p-3 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Send to Agent'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold mb-2">Agent Response:</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  )
}