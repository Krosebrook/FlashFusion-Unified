import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import AgentChat from '@/components/AgentChat'

export default async function AgentChatPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  // Available agents configuration
  const agents = [
    { 
      id: 'writerbot', 
      task: 'content_request', 
      description: 'Emotionally intelligent content writer' 
    },
    { 
      id: 'coderbot', 
      task: 'code_request', 
      description: 'Full-stack developer assistant' 
    },
    { 
      id: 'logicbot', 
      task: 'automation', 
      description: 'Workflow automation designer' 
    },
    { 
      id: 'securitybot', 
      task: 'security_analysis', 
      description: 'Defensive security expert' 
    }
  ]

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">
            Please log in to use the FlashFusion Agent Chat system.
          </p>
          <a 
            href="/login" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">FlashFusion Agent Chat</h1>
        <p className="text-gray-600 mb-8">
          Chat with specialized AI agents powered by OpenRouter's multi-model system.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <AgentChat agents={agents} />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎯 How it works</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Select an agent based on your task</li>
              <li>• Type your request in natural language</li>
              <li>• Get intelligent responses powered by AI</li>
              <li>• All conversations are logged to Supabase</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔐 Security Features</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Authenticated access only</li>
              <li>• Rate-limited requests</li>
              <li>• Secure API key management</li>
              <li>• Automatic model fallbacks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}