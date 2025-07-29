import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Conversation, Message, User } from '../../types'
import Avatar from '../common/Avatar'
import { MessageSquare, Send, Users, Phone, Video, Plus, X, User as UserIcon, Shield, Star, ChevronDown, ChevronUp } from 'lucide-react'

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showGroupChats, setShowGroupChats] = useState(true)
  const [showDirectMessages, setShowDirectMessages] = useState(true)

  useEffect(() => {
    loadConversations()
    loadAvailableContacts()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      // Mock conversations based on role
      const mockConversations: Conversation[] = [
        {
          id: 'conv-trainer-1',
          participants: [user?.id || '', 'trainer-1'],
          participantNames: ['Trainer Sebastian'],
          title: 'Trainer Sebastian',
          type: 'trainer',
          lastMessage: 'Hi Digital sales trainer!',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          priority: 'medium'
        },
        {
          id: 'conv-group-1',
          participants: [user?.id || '', 'group-1'],
          participantNames: ['Group Chat'],
          title: 'Group Chat',
          type: 'group',
          lastMessage: 'Welcome to the group!',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          priority: 'medium'
        },
        {
          id: 'conv-admin-1',
          participants: [user?.id || '', 'admin-1'],
          participantNames: ['Admin Support'],
          title: 'Admin Support',
          type: 'support',
          lastMessage: 'Hi admin!',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          priority: 'high'
        }
      ]

      // Add individual user conversations
      const mockUsers = [
        { id: 'user-test', name: 'Test User', role: 'user' },
        { id: 'user-isha', name: 'Isha Salania', role: 'user' },
        { id: 'user-john', name: 'John Smith', role: 'user' },
        { id: 'user-adam', name: 'Adam Mathew', role: 'user' }
      ]

      mockUsers.forEach(mockUser => {
        mockConversations.push({
          id: `conv-${mockUser.id}`,
          participants: [user?.id || '', mockUser.id],
          participantNames: [mockUser.name],
          title: mockUser.name,
          type: 'direct',
          lastMessage: 'Hey there!',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          priority: 'medium'
        })
      })

      setConversations(mockConversations)
      
      // Auto-select trainer conversation
      const trainerConv = mockConversations.find(c => c.type === 'trainer')
      if (trainerConv) {
        setSelectedConversation(trainerConv)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableContacts = () => {
    const mockContacts: User[] = [
      {
        id: 'trainer-1',
        name: 'Trainer Sebastian',
        email: 'trainer@example.com',
        role: 'trainer',
        company: 'Sales Academy',
        position: 'Senior Trainer',
        status: 'active',
        points: 1000,
        level: 10,
        acceptedTerms: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin-1',
        name: 'Admin Support',
        email: 'admin@example.com',
        role: 'admin',
        company: 'Sales Academy',
        position: 'Administrator',
        status: 'active',
        points: 1000,
        level: 10,
        acceptedTerms: true,
        createdAt: new Date().toISOString()
      }
    ]
    setAvailableContacts(mockContacts)
  }

  const loadMessages = (conversationId: string) => {
    const mockMessages: Message[] = []

    if (conversationId === 'conv-trainer-1') {
      mockMessages.push({
        id: 'msg-1',
        conversationId,
        senderId: 'trainer-1',
        senderName: 'Trainer Sebastian',
        content: 'Hi Digital sales trainer!',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'text'
      })
    } else if (conversationId === 'conv-admin-1') {
      // Admin chat messages like in screenshot 3
      mockMessages.push(
        {
          id: 'msg-admin-1',
          conversationId,
          senderId: 'admin-1',
          senderName: 'Admin Support',
          content: 'Super, works?',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-admin-2',
          conversationId,
          senderId: 'admin-1',
          senderName: 'Admin Support',
          content: 'Hi Adam! Works good??',
          timestamp: new Date(Date.now() - 1500000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-user-1',
          conversationId,
          senderId: user?.id || '',
          senderName: user?.name || 'User',
          content: 'Yesssss',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-user-2',
          conversationId,
          senderId: user?.id || '',
          senderName: user?.name || 'User',
          content: 'Yesssss',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-admin-3',
          conversationId,
          senderId: 'admin-1',
          senderName: 'Admin Support',
          content: 'hi adam!',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-user-3',
          conversationId,
          senderId: user?.id || '',
          senderName: user?.name || 'User',
          content: 'hi',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-user-4',
          conversationId,
          senderId: user?.id || '',
          senderName: user?.name || 'User',
          content: 'Hi admin!',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-admin-4',
          conversationId,
          senderId: 'admin-1',
          senderName: 'Admin Support',
          content: 'Hi adam!',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-user-5',
          conversationId,
          senderId: user?.id || '',
          senderName: user?.name || 'User',
          content: 'Hi admin',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          type: 'text'
        },
        {
          id: 'msg-user-6',
          conversationId,
          senderId: user?.id || '',
          senderName: user?.name || 'User',
          content: 'hi',
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      )
    }

    setMessages(mockMessages)
  }

  const handleStartNewChat = async (contactId: string) => {
    try {
      const contact = availableContacts.find(c => c.id === contactId)
      if (!contact) return

      const conversationType = contact.role === 'admin' ? 'support' : 
                              contact.role === 'trainer' ? 'trainer' : 'direct'
      
      const newConversation: Conversation = {
        id: `conv-${contactId}`,
        participants: [user?.id || '', contactId],
        participantNames: [contact.name],
        title: contact.name,
        type: conversationType,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        priority: contact.role === 'admin' ? 'high' : 'medium'
      }
      
      setConversations([newConversation, ...conversations])
      setSelectedConversation(newConversation)
      setShowNewChat(false)
      loadConversations()
    } catch (error) {
      console.error('Error starting new chat:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: user?.id || '',
      senderName: user?.name || 'User',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages([...messages, newMsg])
    setNewMessage('')

    // Update conversation
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: newMsg.timestamp }
        : conv
    )
    setConversations(updatedConversations)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />
      case 'trainer': return <Star className="h-4 w-4 text-green-600" />
      default: return <UserIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-600'
      case 'trainer': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const trainerConversations = conversations.filter(c => c.type === 'trainer')
  const groupConversations = conversations.filter(c => c.type === 'group')
  const directConversations = conversations.filter(c => c.type === 'direct')
  const supportConversations = conversations.filter(c => c.type === 'support')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Trainer Section */}
          <div className="p-3">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Star className="h-4 w-4 mr-2 text-green-600" />
              Trainer
            </div>
            {trainerConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 border-2 border-blue-500 rounded-lg cursor-pointer hover:bg-gray-50 mb-2 ${
                  selectedConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                      <Star className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{conversation.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Group Chats Section */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => setShowGroupChats(!showGroupChats)}
              className="w-full p-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Group Chats
              </div>
              {showGroupChats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showGroupChats && (
              <div className="px-3 pb-3">
                <div
                  onClick={() => setSelectedConversation(groupConversations[0])}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.type === 'group' ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">Group Chat</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Direct Messages Section */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => setShowDirectMessages(!showDirectMessages)}
              className="w-full p-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Direct Messages
              </div>
              {showDirectMessages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showDirectMessages && (
              <div className="px-3 pb-3 space-y-1">
                {[...directConversations, ...supportConversations].map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 ${
                        conversation.type === 'support' ? 'bg-blue-600' : 'bg-gray-600'
                      } rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                        {conversation.title.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{conversation.title}</h3>
                      {conversation.type === 'support' && <span className="text-xs text-gray-500">user</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {/* New Chat Modal */}
        {showNewChat && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Start New Conversation</h3>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {availableContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleStartNewChat(contact.id)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`w-10 h-10 ${getRoleColor(contact.role)} rounded-full flex items-center justify-center text-white font-medium`}>
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        {getRoleIcon(contact.role)}
                      </div>
                      <p className="text-sm text-gray-500">{contact.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${
                    selectedConversation.type === 'trainer' ? 'bg-green-600' :
                    selectedConversation.type === 'support' ? 'bg-blue-600' :
                    selectedConversation.type === 'group' ? 'bg-primary-600' : 'bg-gray-600'
                  } rounded-full flex items-center justify-center text-white font-medium`}>
                    {selectedConversation.type === 'group' ? (
                      <Users className="h-5 w-5" />
                    ) : selectedConversation.type === 'trainer' ? (
                      <Star className="h-5 w-5" />
                    ) : (
                      selectedConversation.participantNames[0]?.charAt(0) || 'S'
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedConversation.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      {selectedConversation.type === 'trainer' && <span>Trainer • Training</span>}
                      {selectedConversation.type === 'support' && <span>Admin Support</span>}
                      {selectedConversation.type === 'group' && <span>Group Chat</span>}
                      {selectedConversation.type === 'direct' && <span>Direct Message</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Video className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === user?.id
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-6 h-6 ${
                            selectedConversation.type === 'trainer' ? 'bg-green-600' :
                            selectedConversation.type === 'support' ? 'bg-blue-600' : 'bg-gray-600'
                          } rounded-full flex items-center justify-center text-white font-medium text-xs`}>
                            {selectedConversation.type === 'support' ? 'AS' : message.senderName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-600">{message.senderName}</span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-right text-gray-500' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedConversation.title}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging.</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Group Info (when in group context) */}
      {selectedConversation?.type === 'group' && (
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Digital Sales</h3>
            <p className="text-sm text-gray-600">Advanced digital sales techniques</p>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <Star className="h-4 w-4 mr-2 text-green-600" />
                Zugewiesener Trainer
              </div>
              <div className="text-sm text-gray-600">Trainer Sebastian</div>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <Users className="h-4 w-4 mr-2" />
                Gruppenmitglieder
              </div>
              <div className="text-sm text-gray-600 mb-2">4 Mitglieder</div>
              
              <div className="space-y-2">
                {[
                  { name: 'Test User', role: 'user' },
                  { name: 'Isha Salania', role: 'user' },
                  { name: 'John Smith', role: 'user' },
                  { name: 'Adam Mathew', role: 'user' }
                ].map((member, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Avatar name={member.name} role={member.role} size="lg" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}