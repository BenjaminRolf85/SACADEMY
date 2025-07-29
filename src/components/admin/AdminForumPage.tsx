import { useEffect, useState } from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';
import { supabaseService } from '../../lib/supabaseService';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  replies: number;
  likes_count: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: Comment[];
  isExpanded?: boolean;
  isNew?: boolean;
  isLiked?: boolean;
  image_url?: string;
  group_id?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  isLiked?: boolean;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

const AdminForumPage: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchGroups();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all posts from localStorage (these are the forum posts)
      const allPosts = await supabaseService.getPosts();
      console.log('📊 Loaded posts for admin forum:', allPosts.length);
      
      // Map posts to ForumPost interface
      const mappedPosts: ForumPost[] = allPosts.map(post => ({
        id: post.id,
        title: post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content,
        content: post.content,
        user_id: post.userId,
        created_at: post.timestamp,
        replies: 0, // Would need to implement comments system
        likes_count: post.likes || 0,
        status: post.status,
        profiles: {
          full_name: post.userName,
          avatar_url: undefined
        }
      }));
      
      // Sort by creation date, newest first
      mappedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPosts(mappedPosts);
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Fehler beim Laden der Forum-Posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const groupsData = await supabaseService.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unbekannte Gruppe';
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const rejectPost = async (postId: string) => {
    setActionLoading(prev => ({ ...prev, [postId]: true }));
    
    try {
      console.log('❌ Rejecting post:', postId);
      await supabaseService.rejectPost(postId);
      
      // Reload posts to get updated status
      await fetchPosts();
      
      setSuccessMessage('Post wurde abgelehnt');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error rejecting post:', error);
      setError('Fehler beim Ablehnen des Posts');
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const approvePost = async (postId: string) => {
    setActionLoading(prev => ({ ...prev, [postId]: true }));
    
    try {
      console.log('✅ Approving post:', postId);
      await supabaseService.approvePost(postId);
      
      // Reload posts to get updated status
      await fetchPosts();
      
      setSuccessMessage('Post wurde genehmigt');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error approving post:', error);
      setError('Fehler beim Genehmigen des Posts');
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Genehmigt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ Abgelehnt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Ausstehend
          </span>
        );
    }
  };

  const getPostStats = () => {
    const pending = posts.filter(p => p.status === 'pending').length;
    const approved = posts.filter(p => p.status === 'approved').length;
    const rejected = posts.filter(p => p.status === 'rejected').length;
    
    return { pending, approved, rejected };
  };

  const stats = getPostStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#0052CC] to-[#0747A6] bg-clip-text text-transparent">
                Forum-Verwaltung
              </h1>
              <p className="text-gray-600">Forum-Posts moderieren und verwalten</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-gray-500">Ausstehend</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-gray-500">Genehmigt</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-gray-500">Abgelehnt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Forum-Posts ({posts.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{post.profiles?.full_name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{post.replies} Antworten</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span>❤️ {post.likes_count}</span>
                    </div>
                  </div>
                  
                  {/* Show group if available */}
                  {post.group_id && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Gruppe:</span> {getGroupName(post.group_id)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {/* Show different buttons based on status */}
                  {post.status === 'pending' ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => approvePost(post.id)}
                        disabled={actionLoading[post.id]}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        title="Post genehmigen"
                      >
                        ✓ Genehmigen
                      </button>
                      <button
                        onClick={() => rejectPost(post.id)}
                        disabled={actionLoading[post.id]}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        title="Post ablehnen"
                      >
                        ✗ Ablehnen
                      </button>
                    </div>
                  ) : post.status === 'approved' ? (
                    <button
                      onClick={() => rejectPost(post.id)}
                      disabled={actionLoading[post.id]}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      title="Post ablehnen"
                    >
                      ✗ Ablehnen
                    </button>
                  ) : (
                    <button
                      onClick={() => approvePost(post.id)}
                      disabled={actionLoading[post.id]}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      title="Post genehmigen"
                    >
                      ✓ Genehmigen
                    </button>
                  )}
                  
                  <button
                    onClick={() => togglePostExpansion(post.id)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                    title={expandedPost === post.id ? "Weniger anzeigen" : "Details anzeigen"}
                  >
                    {expandedPost === post.id ? "Weniger" : "Details"}
                  </button>
                </div>
              </div>
              
              {/* Expanded Content */}
              {expandedPost === post.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vollständiger Inhalt:</h4>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.image_url && (
                      <div className="mt-3">
                        <img src={post.image_url} alt="Post image" className="max-w-xs rounded-lg" />
                      </div>
                    )}
                  </div>
                  
                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-4 border-l-2 border-gray-200 pl-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Kommentare ({post.comments.length})
                      </h4>
                      <div className="space-y-3">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">{comment.profiles?.full_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Forum-Posts vorhanden</h3>
              <p className="mt-1 text-sm text-gray-500">Noch keine Posts zum Moderieren vorhanden.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Information</h3>
        <p className="text-sm text-blue-700">
          Genehmigte Posts werden automatisch im Haupt-Feed für alle Benutzer und Trainer sichtbar. 
          Abgelehnte Posts sind nur für Administratoren sichtbar.
        </p>
      </div>
    </div>
  );
};

export default AdminForumPage;