'use client'

import { useState, useEffect } from 'react'

interface Personality {
  traits: string[]
  communication_style: {
    tone: string
    greeting: string
    signature: string
  }
  decision_bias: string
  work_pace: string
  collaboration_style: string
}

interface AgentState {
  personality: string
  traits: string[]
  emotionalState: string
  workload: number
  lastInteraction: number
  communicationStyle: {
    tone: string
    greeting: string
    signature: string
  }
}

export default function AgentPersonalityDashboard() {
  const [agents, setAgents] = useState<Record<string, AgentState>>({})
  const [personalities, setPersonalities] = useState<Record<string, Personality>>({})
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string[]>([])
  const [teamDynamics, setTeamDynamics] = useState<any>(null)

  useEffect(() => {
    fetchPersonalities()
  }, [])

  const fetchPersonalities = async () => {
    try {
      const res = await fetch('/api/v1/agents/personality-agents/personalities')
      const data = await res.json()
      if (data.success) {
        setAgents(data.agents)
        setPersonalities(data.personalities)
      }
    } catch (error) {
      console.error('Failed to fetch personalities:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkTeamDynamics = async () => {
    if (selectedTeam.length < 2) {
      alert('Select at least 2 team members')
      return
    }

    try {
      const res = await fetch('/api/v1/agents/personality-agents/team-dynamics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMembers: selectedTeam })
      })
      const data = await res.json()
      if (data.success) {
        setTeamDynamics(data)
      }
    } catch (error) {
      console.error('Failed to check team dynamics:', error)
    }
  }

  const toggleTeamMember = (personality: string) => {
    setSelectedTeam(prev => 
      prev.includes(personality) 
        ? prev.filter(p => p !== personality)
        : [...prev, personality]
    )
  }

  const getWorkloadColor = (workload: number) => {
    if (workload < 0.3) return 'bg-green-500'
    if (workload < 0.7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getMoodEmoji = (mood: string) => {
    if (mood.includes('inspired')) return '😊'
    if (mood.includes('stress')) return '😰'
    if (mood.includes('conflict')) return '😤'
    if (mood.includes('focused')) return '🎯'
    if (mood.includes('optimizing')) return '⚡'
    if (mood.includes('vigilant')) return '👀'
    return '😐'
  }

  if (loading) return <div className="p-4">Loading personalities...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Agent Personality Dashboard</h1>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(agents).map(([agentId, agent]) => (
          <div 
            key={agentId}
            className={`border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
              selectedTeam.includes(agent.personality) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => toggleTeamMember(agent.personality)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{agentId}</h3>
              <span className="text-2xl">{getMoodEmoji(agent.emotionalState)}</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{agent.personality}</p>
            
            <div className="mb-3">
              <p className="text-xs font-semibold mb-1">Traits:</p>
              <div className="flex flex-wrap gap-1">
                {agent.traits.slice(0, 3).map((trait, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-semibold mb-1">Current Mood:</p>
              <p className="text-sm italic">{agent.emotionalState}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs font-semibold mb-1">Workload:</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getWorkloadColor(agent.workload)}`}
                  style={{ width: `${agent.workload * 100}%` }}
                />
              </div>
              <p className="text-xs mt-1">{Math.round(agent.workload * 100)}% capacity</p>
            </div>

            <div className="border-t pt-2">
              <p className="text-xs italic">"{agent.communicationStyle.greeting}"</p>
              <p className="text-xs text-gray-500 mt-1">- {agent.communicationStyle.signature}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Team Dynamics Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Team Dynamics Analyzer</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Selected team members: {selectedTeam.length}
          </p>
          <button
            onClick={checkTeamDynamics}
            disabled={selectedTeam.length < 2}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Analyze Team Dynamics
          </button>
        </div>

        {teamDynamics && (
          <div className="space-y-4">
            <div className="bg-white rounded p-4">
              <h3 className="font-semibold mb-2">Team Analysis</h3>
              <p className="text-sm">Team size: {teamDynamics.teamSize}</p>
              <p className="text-sm font-medium mt-2">{teamDynamics.recommendation}</p>
            </div>

            {teamDynamics.conflicts.length > 0 && (
              <div className="bg-red-50 rounded p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  ⚠️ Potential Conflicts ({teamDynamics.conflicts.length})
                </h3>
                {teamDynamics.conflicts.map((conflict: any, idx: number) => (
                  <div key={idx} className="mb-3 pb-3 border-b last:border-0">
                    <p className="text-sm font-medium">
                      {conflict.members.join(' ↔️ ')}
                    </p>
                    <p className="text-sm text-red-700">{conflict.issue}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Resolution:</strong> {conflict.resolution.strategy}
                    </p>
                    {conflict.resolution.mediator && (
                      <p className="text-sm text-gray-600">
                        <strong>Mediator:</strong> {conflict.resolution.mediator}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {teamDynamics.collaborations.length > 0 && (
              <div className="bg-green-50 rounded p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  ✅ Natural Collaborations ({teamDynamics.collaborations.length})
                </h3>
                {teamDynamics.collaborations.map((collab: any, idx: number) => (
                  <p key={idx} className="text-sm text-green-700">
                    {collab.members.join(' + ')} - {collab.strength}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personality Legend */}
      <div className="mt-8 bg-white rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Personality Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(personalities).slice(0, 6).map(([role, personality]) => (
            <div key={role} className="text-sm">
              <p className="font-semibold capitalize">{role.replace('_', ' ')}</p>
              <p className="text-gray-600">
                {personality.decision_bias.replace('_', ' ')} • {personality.work_pace.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}