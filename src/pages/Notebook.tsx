import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, Users, Calendar, Tag, Plus, Folder, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export function Notebook() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const entries = [
    {
      id: '1',
      title: 'Chemical Reactions Observations',
      content: 'Today we observed the reaction between sodium bicarbonate and acetic acid...',
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      tags: ['chemistry', 'reactions', 'observations'],
      is_shared: false,
      collaborators: [],
      experiment_id: '1',
    },
    {
      id: '2',
      title: 'Physics Lab Notes - Pendulum Motion',
      content: 'Studying the relationship between pendulum length and period...',
      created_at: '2024-01-14',
      updated_at: '2024-01-14',
      tags: ['physics', 'motion', 'pendulum'],
      is_shared: true,
      collaborators: ['Alice', 'Bob'],
      experiment_id: '2',
    },
    {
      id: '3',
      title: 'Cell Biology Research Notes',
      content: 'Examining cell structures under microscope at different magnifications...',
      created_at: '2024-01-13',
      updated_at: '2024-01-14',
      tags: ['biology', 'cells', 'microscopy'],
      is_shared: false,
      collaborators: [],
      experiment_id: '3',
    },
    {
      id: '4',
      title: 'Weather Pattern Analysis',
      content: 'Analyzing local weather data to identify patterns and trends...',
      created_at: '2024-01-12',
      updated_at: '2024-01-13',
      tags: ['earth-science', 'weather', 'data-analysis'],
      is_shared: true,
      collaborators: ['Charlie'],
      experiment_id: '4',
    },
  ];

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTagColor = (tag: string) => {
    const colors = {
      chemistry: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      physics: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      biology: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'earth-science': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[tag as keyof typeof colors] || colors.default;
  };

  const handleEntryClick = (entryId: string) => {
    navigate(`/notebook/${entryId}`);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lab Notebook</h1>
            <p className="text-muted-foreground">
              Document your experiments and collaborate with others
            </p>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notebook entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="all">All Entries</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">All Notebook Entries</h3>
              <p className="text-muted-foreground">
                {filteredEntries.length} entries found
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          {entry.is_shared && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1 inline" />
                          {new Date(entry.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">{entry.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {entry.content}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className={`${getTagColor(tag)} text-xs`}>
                              <Tag className="w-2 h-2 mr-1" />
                              {tag.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                        {entry.collaborators.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <Users className="w-3 h-3 mr-1 inline" />
                            Collaborators: {entry.collaborators.join(', ')}
                          </div>
                        )}
                        <div className="flex items-center justify-end pt-2">
                          <Button size="sm" variant="ghost" className="text-xs">
                            View Details
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="shared">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries
              .filter(entry => entry.is_shared)
              .map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{entry.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{entry.content}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full text-white">View Entry</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="private">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries
              .filter(entry => !entry.is_shared)
              .map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{entry.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{entry.content}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full text-white">View Entry</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="space-y-4">
            {filteredEntries
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .slice(0, 5)
              .map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{entry.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{entry.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(entry.updated_at).toLocaleDateString()}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className={`${getTagColor(tag)} text-xs`}>
                                  {tag}
                                </Badge>
                              ))}
                              {entry.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{entry.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Folders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="h-5 w-5 mr-2" />
              Notebook Folders
            </CardTitle>
            <CardDescription>
              Organize your notes by subject or project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Folder className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Chemistry</h3>
                      <p className="text-sm text-gray-500">12 entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Folder className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Physics</h3>
                      <p className="text-sm text-gray-500">8 entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Folder className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Biology</h3>
                      <p className="text-sm text-gray-500">6 entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}