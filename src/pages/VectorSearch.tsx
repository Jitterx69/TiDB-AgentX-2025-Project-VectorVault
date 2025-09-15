import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdvancedFiltersModal from "@/components/modals/AdvancedFiltersModal";
import { useToast } from "@/hooks/use-toast";
import { useTiDBConnection, useVectorSearch, useSearchStats } from "@/hooks/use-tidb";
import { 
  Search, 
  Database, 
  Zap, 
  Filter,
  History,
  Sparkles,
  ArrowRight,
  Clock,
  Target,
  Crosshair,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const VectorSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { isConnected, isConnecting, error: connectionError } = useTiDBConnection();
  const { isSearching, searchResults, searchError, performSearch, clearSearch } = useVectorSearch();
  const { stats, isLoading: statsLoading } = useSearchStats();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
    }
    
    await performSearch(searchQuery, appliedFilters || {}, 10);
  };

  // Initialize with some default recent searches
  useEffect(() => {
    if (recentSearches.length === 0) {
      setRecentSearches([
        "SQL injection attempts database compromise",
        "Malware detection email gateway",
        "Brute force authentication failure",
        "Data exfiltration suspicious activity",
        "Phishing campaign user credentials"
      ]);
    }
  }, [recentSearches.length]);

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return "text-success";
    if (similarity >= 0.8) return "text-primary";
    if (similarity >= 0.7) return "text-warning";
    return "text-muted-foreground";
  };

  const getSimilarityBg = (similarity: number) => {
    if (similarity >= 0.9) return "bg-success/20 border-success/30";
    if (similarity >= 0.8) return "bg-primary/20 border-primary/30";
    if (similarity >= 0.7) return "bg-warning/20 border-warning/30";
    return "bg-muted/20 border-muted/30";
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    toast({
      title: "Filters Applied",
      description: "Search results will be updated with your filter criteria",
    });
  };

  const handleClearSearch = () => {
    clearSearch();
    setSearchQuery("");
  };

  const handleApplySolution = (result: any) => {
    toast({
      title: "Solution Applied",
      description: `Applying resolution from incident ${result.incident} to current situation`,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Vector Search Engine
        </h1>
        <p className="text-muted-foreground">AI-powered similarity search across historical incidents and security data</p>
        
        {/* Connection Status */}
        <div className="mt-4 flex items-center space-x-2">
          {isConnecting ? (
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span>Connecting to TiDB...</span>
            </Badge>
          ) : isConnected ? (
            <Badge variant="outline" className="flex items-center space-x-1 text-success">
              <CheckCircle className="h-3 w-3" />
              <span>Connected to TiDB Serverless</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center space-x-1 text-warning">
              <AlertCircle className="h-3 w-3" />
              <span>Mock Mode - No Database Connection</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Search Interface */}
      <Card className="card-gradient border-border/50 glow-primary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <span>Intelligent Search Query</span>
          </CardTitle>
          <CardDescription>
            Describe your incident or search for similar security events using natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe the incident or security event you want to search for...&#10;Example: 'DDoS attack targeting web servers with high traffic volume'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[120px] bg-input/50 border-border/50 focus:border-primary"
              rows={4}
            />
          </div>
          
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                  {appliedFilters && <Badge variant="secondary" className="ml-1 text-xs">Active</Badge>}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching || !isConnected}
              className="glow-primary"
            >
              {isSearching ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Similar Incidents
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {searchError && (
            <Card className="card-gradient border-destructive/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Search Error: {searchError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {searchQuery && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="status-success">
                    {searchResults.length} matches found
                  </Badge>
                  {searchResults.length > 0 && (
                    <Button size="sm" variant="outline" onClick={handleClearSearch}>
                      Clear Results
                    </Button>
                  )}
                </div>
              </div>

              {searchResults.map((result) => (
                <Card key={result.id} className="card-gradient border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{result.title}</h3>
                          <Badge variant="outline" className={getSimilarityBg(result.similarity || 0)}>
                            <Crosshair className="h-3 w-3 mr-1" />
                            {Math.round((result.similarity || 0) * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
                        
                        <div className="bg-muted/20 p-3 rounded-lg mb-3">
                          <p className="text-sm"><span className="font-medium text-success">Resolution:</span> {result.resolution}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className={`text-right ml-4 font-mono text-2xl font-bold ${getSimilarityColor(result.similarity || 0)}`}>
                        {Math.round((result.similarity || 0) * 100)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>ID: {result.id}</span>
                          <span>Category: {result.category}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {result.timestamp}
                          </span>
                        </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Full Details
                        </Button>
                        <Button size="sm" className="glow-primary" onClick={() => handleApplySolution(result)}>
                          Apply Solution
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {!searchQuery && (
            <Card className="card-gradient border-border/50 text-center p-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-primary/20 rounded-full glow-primary">
                  <Target className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Ready to Search</h3>
                <p className="text-muted-foreground max-w-md">
                  Enter a description of your security incident to find similar historical cases and their solutions
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Recent Searches */}
          <Card className="card-gradient border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <History className="h-4 w-4 mr-2 text-primary" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="w-full text-left p-2 text-sm bg-muted/20 hover:bg-muted/40 rounded border border-border/30 transition-colors"
                >
                  {search}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Search Stats */}
          <Card className="card-gradient border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Search Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : stats ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Incidents</span>
                    <span className="font-semibold">{stats.totalIncidents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Indexed Vectors</span>
                    <span className="font-semibold">{stats.indexedVectors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Search Accuracy</span>
                    <span className="font-semibold text-success">{stats.searchAccuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Response Time</span>
                    <span className="font-semibold">{stats.avgResponseTime}s</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No statistics available
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Modals */}
      <AdvancedFiltersModal 
        open={showAdvancedFilters} 
        onOpenChange={setShowAdvancedFilters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default VectorSearch;