import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Search, PlusCircle } from 'lucide-react';

export function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Search className="h-6 w-6 text-primary" />
            <span>학교 분실물 찾기</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex items-center gap-2" onClick={() => navigate('/create')}>
              <PlusCircle className="h-4 w-4" />
              등록하기
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Outlet />
      </main>

      <footer className="bg-background border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 학교 분실물 찾기. All rights reserved.</p>
      </footer>

      {/* Mobile FAB for creating items */}
      <Button 
        className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => navigate('/create')}
      >
        <PlusCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
