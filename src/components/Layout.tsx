import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Search, LogOut, LogIn, PlusCircle } from 'lucide-react';

export function Layout() {
  const { user, signIn, signOut } = useAuth();
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
            {user ? (
              <>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2" onClick={() => navigate('/create')}>
                  <PlusCircle className="h-4 w-4" />
                  등록하기
                </Button>
                <div className="flex items-center gap-3 ml-2 border-l pl-4">
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium hidden md:block">{user.displayName}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={signOut} title="로그아웃">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={signIn} className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                로그인
              </Button>
            )}
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
      {user && (
        <Button 
          className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          onClick={() => navigate('/create')}
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
