import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export function CreateItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found',
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const itemData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        status: 'open',
        authorUid: user.uid,
        authorName: user.displayName || '익명',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'items'), itemData);
      navigate('/');
    } catch (err) {
      console.error('Error adding document: ', err);
      setError('게시물 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">로그인이 필요합니다</h2>
        <p className="text-muted-foreground">게시물을 등록하려면 먼저 로그인해주세요.</p>
        <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        뒤로 가기
      </Button>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="space-y-1 pb-6 border-b bg-muted/20">
          <CardTitle className="text-2xl font-bold">새 게시물 등록</CardTitle>
          <CardDescription>
            분실물이나 습득물에 대한 정보를 자세히 적어주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                게시물 종류
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${formData.type === 'lost' ? 'border-destructive bg-destructive/5 text-destructive ring-1 ring-destructive' : 'hover:bg-muted/50'}`}>
                  <input
                    type="radio"
                    name="type"
                    value="lost"
                    checked={formData.type === 'lost'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-semibold">분실물 (찾아요)</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${formData.type === 'found' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 ring-1 ring-emerald-500' : 'hover:bg-muted/50'}`}>
                  <input
                    type="radio"
                    name="type"
                    value="found"
                    checked={formData.type === 'found'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-semibold">습득물 (주웠어요)</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none">
                제목
              </label>
              <Input
                id="title"
                name="title"
                placeholder="예: 파란색 에어팟 케이스 찾습니다"
                value={formData.title}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium leading-none">
                  장소
                </label>
                <Input
                  id="location"
                  name="location"
                  placeholder="예: 3층 도서관 앞 복도"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium leading-none">
                  날짜
                </label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">
                상세 설명
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="물건의 특징(색상, 브랜드, 흠집 등)을 자세히 적어주시면 찾는데 큰 도움이 됩니다."
                className="min-h-[150px] resize-y"
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                취소
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
