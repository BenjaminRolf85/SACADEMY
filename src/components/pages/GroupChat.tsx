import { useState, useEffect, useRef } from 'react'
import { Group, Message } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../common/Avatar'
import { Send, Users, Star, Smile, Paperclip, MoreVertical } from 'lucide-react'

interface GroupChatProps {
  group: Group
}

export default function GroupChat({ group }: GroupChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadMessages()
  }, [group.id])

  const loadMessages = () => {
    // Load messages from localStorage for this group
    const chatKey = `group_chat_${group.id}`
    const savedMessages = localStorage.getItem(chatKey)
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Initialize with some sample messages
      const sampleMessages: Message[] = [
        {
          id: 'msg-1',
          conversationId: group.id,
          senderId: 'trainer-1',
          senderName: 'Trainer Sebastian',
          content: 'Willkommen in der Gruppe! Hier können wir uns austauschen und Fragen stellen. 👋',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-2',
          conversationId: group.id,
          senderId: 'user-2',
          senderName: 'Anna Schmidt',
          content: 'Hallo zusammen! Freue mich auf das Training!',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-3',
          conversationId: group.id,
          senderId: 'user-3',
          senderName: 'Max Mustermann',
          content: 'Guten Morgen! Wann ist unser nächster Termin?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        }
      ]
      setMessages(sampleMessages)
      localStorage.setItem(chatKey, JSON.stringify(sampleMessages))
    }
  }

  const saveMessages = (updatedMessages: Message[]) => {
    const chatKey = `group_chat_${group.id}`
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: group.id,
      senderId: user.id,
      senderName: user.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    saveMessages(updatedMessages)
    setNewMessage('')
    
    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Gestern ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
    }
  }

  const groupMembers = [
    { id: 'trainer-1', name: 'Trainer Sebastian', role: 'trainer', isOnline: true },
    { id: 'user-1', name: 'Max Mustermann', role: 'user', isOnline: true },
    { id: 'user-2', name: 'Anna Schmidt', role: 'user', isOnline: false },
    { id: 'user-3', name: 'John Smith', role: 'user', isOnline: true },
    { id: user?.id || '', name: user?.name || '', role: user?.role || 'user', isOnline: true }
  ]

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {groupMembers.filter(m => m.isOnline).length} Mitglieder online
                </p>
              </div>
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === user?.id
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
            const isTrainer = groupMembers.find(m => m.id === message.senderId)?.role === 'trainer'
            
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {showAvatar && !isOwnMessage && (
                    <Avatar 
                      name={message.senderName} 
                      role={isTrainer ? 'trainer' : 'user'} 
                      size="sm" 
                    />
                  )}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span className="text-xs font-medium text-gray-600">{message.senderName}</span>
                        {isTrainer && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-full break-words ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white'
                          : isTrainer
                            ? 'bg-yellow-100 text-gray-900'
                            : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar name="..." size="sm" />
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Nachricht an ${group.name}...`}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
                rows={1}
                style={{ minHeight: '44px' }}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Smile className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Drücke Eingabe zum Senden, Strg+Eingabe für neue Zeile
          </div>
        </div>
      </div>

      {/* Right Sidebar - Group Members */}
      <div className="w-64 border-l border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Gruppenmitglieder</h3>
          <p className="text-sm text-gray-500">{groupMembers.length} Mitglieder</p>
        </div>
        
        <div className="p-4 space-y-3">
          {groupMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-3">
              <div className="relative">
                <Avatar 
                  name={member.name} 
                  role={member.role} 
                  size="sm" 
                />
                {member.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                  {member.role === 'trainer' && (
                    <Star className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {member.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}