"use client"
import React from 'react'
import { useMeetingsFilters } from '../../hooks/use-meetings-filters';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

const MeetingSearchFilter = () => {
    const [filter , setFilter] = useMeetingsFilters();

  return (
    <div className='relative'>
        <Input placeholder='filter by name' className='h-9 bg-background w-[200px] pl-7' value={filter.search} onChange={(e) => setFilter({ search: e.target.value })} />
        <SearchIcon className='size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground' />
    </div>
  )
}

export default MeetingSearchFilter