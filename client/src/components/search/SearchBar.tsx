'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchSuggestions } from '@/features/search/useSearch';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  initialQuery = '',
  placeholder = 'Search stories, topics, authors...',
  autoFocus = false,
  onSearch,
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: suggestions } = useSearchSuggestions(
    debouncedQuery,
    isOpen && debouncedQuery.trim().length >= 2
  );

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const items: string[] = [
    ...(suggestions?.posts?.map((p) => p.title) ?? []),
    ...(suggestions?.tags?.map((t) => `#${t.name}`) ?? []),
    ...(suggestions?.users?.map((u) => `@${u.name}`) ?? []),
  ].slice(0, 8);

  const executeSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setIsOpen(false);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && items[selectedIndex]) {
      executeSearch(items[selectedIndex]);
    } else {
      executeSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.searchContainer} ${className}`}
    >
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <Search className={styles.searchIcon} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={styles.searchInput}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className={styles.clearBtn}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {isOpen && items.length > 0 && (
        <div className={styles.dropdown}>
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.suggestionItem} ${selectedIndex === idx ? styles.suggestionItemActive : ''}`}
              onClick={() => executeSearch(item)}
            >
              <TrendingUp className={styles.suggestionIcon} />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
