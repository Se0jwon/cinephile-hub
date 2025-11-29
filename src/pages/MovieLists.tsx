import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Share2, Lock, Globe, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useMovieLists, 
  usePublicMovieLists, 
  useCreateMovieList,
  useListMovies,
  useDeleteMovieList
} from "@/hooks/useMovieLists";
import { Link } from "react-router-dom";

const MovieLists = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const { data: myLists, isLoading: myListsLoading } = useMovieLists(user?.id);
  const { data: publicLists, isLoading: publicListsLoading } = usePublicMovieLists();
  const createList = useCreateMovieList();
  const deleteList = useDeleteMovieList();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleCreateList = async () => {
    if (!user || !listName.trim()) return;

    await createList.mutateAsync({
      user_id: user.id,
      name: listName,
      description: listDescription || undefined,
      is_public: isPublic,
    });

    setListName("");
    setListDescription("");
    setIsPublic(false);
    setDialogOpen(false);
  };

  const handleDeleteList = async (listId: string) => {
    if (!user || !confirm("정말 이 리스트를 삭제하시겠습니까?")) return;
    await deleteList.mutateAsync({ listId, userId: user.id });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">영화 리스트</h1>
            <p className="text-muted-foreground">
              나만의 영화 컬렉션을 만들고 친구들과 공유하세요
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                새 리스트 만들기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 리스트 만들기</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">리스트 이름</Label>
                  <Input
                    id="name"
                    placeholder="예: 내가 좋아하는 SF 영화"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">설명 (선택)</Label>
                  <Textarea
                    id="description"
                    placeholder="이 리스트에 대한 설명을 입력하세요"
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">공개 리스트로 만들기</Label>
                </div>
                <Button 
                  onClick={handleCreateList} 
                  disabled={!listName.trim() || createList.isPending}
                  className="w-full"
                >
                  {createList.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "만들기"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="my-lists" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="my-lists">내 리스트</TabsTrigger>
            <TabsTrigger value="public-lists">공개 리스트</TabsTrigger>
          </TabsList>

          <TabsContent value="my-lists">
            {myListsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myLists && myLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myLists.map((list: any) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    onDelete={() => handleDeleteList(list.id)}
                    isOwner={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    아직 만든 리스트가 없습니다
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    첫 리스트 만들기
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="public-lists">
            {publicListsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : publicLists && publicLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicLists.map((list: any) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    username={list.profiles?.username}
                    isOwner={false}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    공개된 리스트가 없습니다
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ListCard = ({ 
  list, 
  username, 
  onDelete, 
  isOwner 
}: { 
  list: any; 
  username?: string; 
  onDelete?: () => void; 
  isOwner: boolean;
}) => {
  const { data: movies = [] } = useListMovies(list.id);

  return (
    <Card className="hover:ring-2 hover:ring-primary transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{list.name}</CardTitle>
            {username && (
              <p className="text-sm text-muted-foreground">
                by {username}
              </p>
            )}
          </div>
          <Badge variant={list.is_public ? "default" : "secondary"}>
            {list.is_public ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                공개
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                비공개
              </>
            )}
          </Badge>
        </div>
        {list.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {list.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {movies.length}개의 영화
          </p>
        </div>
        {movies.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {movies.slice(0, 4).map((movie: any) => (
              <Link key={movie.id} to={`/movie/${movie.tmdb_id}`}>
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                      : '/placeholder.svg'
                  }
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded"
                />
              </Link>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="h-3 w-3 mr-1" />
            공유
          </Button>
          {isOwner && onDelete && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieLists;
