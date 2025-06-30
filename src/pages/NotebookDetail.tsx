import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Share2, 
  Trash2, 
  Calendar, 
  Tag, 
  Users, 
  FileText,
  Edit,
  Clock,
  Eye,
  MessageSquare,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/useAuthStore';

export function NotebookDetail() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(`# Chemistry Lab: Acid-Base Titration

## Objective
To determine the concentration of an unknown acid solution using a standardized base solution.

## Materials
- Burette
- Erlenmeyer flask
- Phenolphthalein indicator
- Unknown acid solution
- Standardized NaOH solution (0.1 M)
- pH meter

## Procedure
1. Filled the burette with the standardized NaOH solution
2. Pipetted 25.0 mL of the unknown acid solution into the Erlenmeyer flask
3. Added 3 drops of phenolphthalein indicator
4. Slowly added NaOH solution while swirling the flask
5. Stopped titration when solution turned pale pink
6. Recorded the volume of NaOH used

## Data
| Trial | Initial NaOH Volume (mL) | Final NaOH Volume (mL) | NaOH Used (mL) |
|-------|--------------------------|------------------------|----------------|
| 1     | 0.0                      | 23.5                   | 23.5           |
| 2     | 0.0                      | 23.7                   | 23.7           |
| 3     | 0.0                      | 23.6                   | 23.6           |

Average volume of NaOH used: 23.6 mL

## Calculations
Using the equation: $M_a V_a = M_b V_b$

Where:
- $M_a$ = Molarity of acid (unknown)
- $V_a$ = Volume of acid (25.0 mL)
- $M_b$ = Molarity of base (0.1 M)
- $V_b$ = Volume of base used (23.6 mL)

$M_a = \frac{M_b V_b}{V_a} = \frac{0.1 \times 23.6}{25.0} = 0.0944 \text{ M}$

## Conclusion
The concentration of the unknown acid solution is 0.0944 M.

## Error Analysis
Possible sources of error:
- Endpoint determination (subjective color change)
- Parallax error when reading burette
- Incomplete mixing during titration

## Questions
1. How would the results change if we used a different indicator?
2. What would happen if the acid was diprotic instead of monoprotic?
3. How could we improve the precision of our measurements?`);
  
  const [title, setTitle] = useState('Acid-Base Titration Lab Notes');
  const [tags, setTags] = useState(['chemistry', 'titration', 'lab-report']);
  const [isShared, setIsShared] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  
  // Mock data for comments
  const comments = [
    {
      id: '1',
      author: 'Dr. Smith',
      authorAvatar: 'https://i.pravatar.cc/150?u=1',
      content: 'Great work on the titration! Your calculations are correct.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      author: 'Lab Partner',
      authorAvatar: 'https://i.pravatar.cc/150?u=2',
      content: 'I think we should add more detail about the endpoint determination.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    }
  ];
  
  // Mock data for version history
  const versionHistory = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      author: 'You',
      changes: 'Created initial document',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      author: 'You',
      changes: 'Added data table and calculations',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      author: 'Lab Partner',
      changes: 'Added conclusion section',
    }
  ];
  
  const handleSave = () => {
    setIsEditing(false);
    // In a real app, save to database
  };
  
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleShare = () => {
    setIsShared(!isShared);
    // In a real app, update sharing settings
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this notebook entry?')) {
      navigate('/notebook');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/notebook')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notebook
            </Button>
            
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold"
              />
            ) : (
              <h1 className="text-2xl font-bold">{title}</h1>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <Button onClick={handleSave} className="text-white">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button 
              variant={isShared ? "default" : "outline"}
              onClick={handleShare}
              className={isShared ? "text-white" : ""}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isShared ? 'Shared' : 'Share'}
            </Button>
            
            <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Created: {new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Updated: {new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">{content.length} characters</span>
              </div>
              
              {isShared && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {collaborators.length > 0 
                      ? `Shared with ${collaborators.length} people` 
                      : 'Publicly shared'}
                  </span>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-800">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                
                {isEditing && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    Edit Tags
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notebook Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Notebook Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="font-mono min-h-[600px]"
                  />
                ) : (
                  <div className="prose max-w-none">
                    {/* In a real app, render markdown content */}
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                      {content}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatar_url} alt={user?.display_name} />
                    <AvatarFallback>
                      {user?.display_name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.display_name || 'Current User'}</p>
                    <p className="text-sm text-gray-500">{user?.role || 'Student'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Tabs for Comments and History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs defaultValue="comments">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="comments" className="space-y-4 pt-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                      <AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{comment.author}</p>
                        <p className="text-xs text-gray-500">{formatDate(comment.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4">
                  <Textarea placeholder="Add a comment..." className="mb-2" />
                  <Button size="sm" className="text-white">Post Comment</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4 pt-4">
                {versionHistory.map((version) => (
                  <div key={version.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{version.author}</p>
                        <p className="text-xs text-gray-500">{formatDate(version.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-700">{version.changes}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>
          
          {/* Related Experiments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Experiments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">pH Measurement Lab</p>
                    <p className="text-xs text-gray-500">Chemistry</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Buffer Solutions</p>
                    <p className="text-xs text-gray-500">Chemistry</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Indicators and Color Change</p>
                    <p className="text-xs text-gray-500">Chemistry</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}