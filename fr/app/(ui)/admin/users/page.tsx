'use client';

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: 'TOURIST' | 'OPERATOR' | 'ADMIN';
  organization?: string;
  status: 'ACTIVE' | 'CERTIFIED' | 'PENDING';
  registeredDate: string;
  queriesCount: number;
  ecoScore: number;
}

const MOCK_USERS: DirectoryUser[] = [
  {
    id: 'usr-1',
    name: 'Nipun Dilshan',
    email: 'nipun@ceylontour.com',
    role: 'TOURIST',
    status: 'ACTIVE',
    registeredDate: 'Sep 12, 2026',
    queriesCount: 18,
    ecoScore: 92,
  },
  {
    id: 'usr-2',
    name: 'Dilhara Senanayake',
    email: 'd.senanayake@tourism.gov.lk',
    role: 'ADMIN',
    organization: 'Sri Lanka Tourism Development Authority',
    status: 'ACTIVE',
    registeredDate: 'Aug 04, 2026',
    queriesCount: 142,
    ecoScore: 98,
  },
  {
    id: 'usr-3',
    name: 'Ceylon Heritage Eco Tours',
    email: 'contact@ceylonheritage.lk',
    role: 'OPERATOR',
    organization: 'Licensed SLTDA Operator #842',
    status: 'CERTIFIED',
    registeredDate: 'Jul 21, 2026',
    queriesCount: 89,
    ecoScore: 95,
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@traveler.eu',
    role: 'TOURIST',
    status: 'ACTIVE',
    registeredDate: 'Sep 18, 2026',
    queriesCount: 9,
    ecoScore: 88,
  },
  {
    id: 'usr-5',
    name: 'Knuckles Wilderness Expeditions',
    email: 'guides@knuckleswild.lk',
    role: 'OPERATOR',
    organization: 'Community Ranger Guild',
    status: 'CERTIFIED',
    registeredDate: 'Aug 19, 2026',
    queriesCount: 64,
    ecoScore: 99,
  },
  {
    id: 'usr-6',
    name: 'Marcus Vance',
    email: 'marcus.v@adventure.com',
    role: 'TOURIST',
    status: 'ACTIVE',
    registeredDate: 'Sep 02, 2026',
    queriesCount: 14,
    ecoScore: 84,
  },
  {
    id: 'usr-7',
    name: 'Ruhuna Safari Operators Assoc.',
    email: 'info@ruhunasafari.org',
    role: 'OPERATOR',
    status: 'PENDING',
    registeredDate: 'Sep 21, 2026',
    queriesCount: 5,
    ecoScore: 72,
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.organization && user.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-bold">Authority Official</Badge>;
      case 'OPERATOR':
        return <Badge variant="secondary" className="bg-secondary/15 text-secondary border-secondary/30 font-bold">Eco Operator</Badge>;
      default:
        return <Badge variant="outline" className="border-border text-muted-foreground font-semibold">Conscious Traveler</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CERTIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Eco-Certified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> Audit Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground">
            Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44A6B5]">
              Identity &amp; Stakeholders
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black">
              <span className="size-2 rounded-full bg-[#44A6B5] animate-pulse" />
              Directory Active
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
            Travelers &amp; Eco-Operators Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Registry of verified tourists, certified community tour operators, and tourism authority personnel.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by traveler name, email, or licensed operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/40 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-muted/50 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-auto"
            >
              <option value="ALL">All Stakeholder Roles</option>
              <option value="TOURIST">Conscious Travelers</option>
              <option value="OPERATOR">Eco-Tour Operators</option>
              <option value="ADMIN">Authority Officials</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="rounded-3xl border border-border/80 shadow-sm overflow-hidden">
        <div className="p-6 pb-2">
          <h2 className="text-base font-bold text-foreground">
            Registered Stakeholders ({filteredUsers.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Stakeholder carrying compliance and environmental participation record.
          </p>
        </div>

        <div className="px-6 pb-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-muted-foreground uppercase tracking-wider text-[11px]">
                <TableHead className="py-3 px-3">Stakeholder</TableHead>
                <TableHead className="py-3 px-3">Role</TableHead>
                <TableHead className="py-3 px-3">Compliance Status</TableHead>
                <TableHead className="py-3 px-3">Eco Index</TableHead>
                <TableHead className="py-3 px-3">AI Queries / Loads</TableHead>
                <TableHead className="py-3 px-3 text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="default" className="shrink-0 ring-1 ring-border">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-bold text-foreground text-xs block">{user.name}</span>
                        <span className="text-[11px] text-muted-foreground block">{user.email}</span>
                        {user.organization && (
                          <span className="text-[10px] text-secondary font-semibold block">
                            {user.organization}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3">
                    {getRoleBadge(user.role)}
                  </TableCell>

                  <TableCell className="py-3.5 px-3">
                    {getStatusBadge(user.status)}
                  </TableCell>

                  <TableCell className="py-3.5 px-3">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      {user.ecoScore} / 100
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 font-mono text-xs text-foreground">
                    {user.queriesCount} runs
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-right text-xs text-muted-foreground">
                    {user.registeredDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
