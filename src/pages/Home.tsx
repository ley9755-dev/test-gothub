import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { MapPin, Clock, CheckCircle, Search, Trash2 } from 'lucide-react';

interface Item {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  date: string;
  status: 'open' | 'resolved';
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('open');

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      }) as Item[];
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleResolve = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'items', itemId), {
        status: 'resolved',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'items', itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filteredItems = items.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">분실물/습득물 게시판</h1>
          <p className="text-muted-foreground mt-2">학교에서 잃어버리거나 주운 물건을 찾아주세요.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-background rounded-md border p-1 flex">
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filterType === 'all' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}
              onClick={() => setFilterType('all')}
            >전체</button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filterType === 'lost' ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground hover:bg-secondary/50'}`}
              onClick={() => setFilterType('lost')}
            >분실물</button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filterType === 'found' ? 'bg-emerald-500/10 text-emerald-600' : 'text-muted-foreground hover:bg-secondary/50'}`}
              onClick={() => setFilterType('found')}
            >습득물</button>
          </div>
          
          <div className="bg-background rounded-md border p-1 flex">
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filterStatus === 'all' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}
              onClick={() => setFilterStatus('all')}
            >전체 상태</button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filterStatus === 'open' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}
              onClick={() => setFilterStatus('open')}
            >진행중</button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filterStatus === 'resolved' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}
              onClick={() => setFilterStatus('resolved')}
            >해결됨</button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-xl border border-dashed">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">등록된 게시물이 없습니다</h3>
          <p className="text-muted-foreground mt-1">새로운 분실물이나 습득물을 등록해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-md ${item.status === 'resolved' ? 'opacity-75 bg-secondary/30' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={item.type === 'lost' ? 'destructive' : 'default'} className={item.type === 'found' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                    {item.type === 'lost' ? '분실물 (찾아요)' : '습득물 (주웠어요)'}
                  </Badge>
                  {item.status === 'resolved' && (
                    <Badge variant="outline" className="bg-background text-muted-foreground border-muted-foreground/30">
                      <CheckCircle className="w-3 h-3 mr-1" /> 해결됨
                    </Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-1 text-xl">{item.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(item.date), 'yyyy년 MM월 dd일')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-foreground/80 line-clamp-3 min-h-[60px]">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md">
                  <MapPin className="w-4 h-4 shrink-0 text-primary/60" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 pt-4 flex justify-between items-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="font-medium text-foreground/70">{item.authorName}</span>
                  <span>•</span>
                  <span>{item.createdAt ? format(new Date(item.createdAt), 'MM/dd') : ''}</span>
                </div>
                
                <div className="flex gap-2">
                  {item.status === 'open' && (
                    <Button variant="outline" size="sm" onClick={() => handleResolve(item.id)} className="h-8 text-xs">
                      해결 완료
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
