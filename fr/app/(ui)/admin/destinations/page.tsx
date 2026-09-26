'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
} from 'lucide-react';
import { DESTINATIONS } from '@/lib/mockData';
import { Destination } from '@/types/ceylontour';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDestinationsRegistryPage() {
  const [destinations] = useState<Destination[]>(DESTINATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [pressureFilter, setPressureFilter] = useState('All');
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [capacityInput, setCapacityInput] = useState<number>(3000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const districts = ['All', ...Array.from(new Set(DESTINATIONS.map((d) => d.district)))];

  const filteredList = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDistrict = districtFilter === 'All' || dest.district === districtFilter;
    const matchesPressure = pressureFilter === 'All' || dest.pressure.level === pressureFilter;

    return matchesSearch && matchesDistrict && matchesPressure;
  });

  const handleOpenEdit = (dest: Destination) => {
    setEditingDest(dest);
    setCapacityInput(dest.pressure.score * 40); // Mock daily capacity limit formula
  };

  const handleSaveCapacity = () => {
    if (!editingDest) return;
    setToastMessage(`Updated carrying capacity limit for ${editingDest.name} to ${capacityInput.toLocaleString()} visitors/day.`);
    setEditingDest(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Admin System
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Destinations Active
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            Manage Places &amp; Crowd Limits
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitor and manage crowd limits and eco-friendly rules for all places.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setToastMessage('Exported crowd limit report to CSV.');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="rounded-xl gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export CSV</span>
          </Button>
          <Link href="/admin/tourism-pressure">
            <Button size="sm" className="rounded-xl gap-1.5 cursor-pointer bg-primary text-primary-foreground">
              <SlidersHorizontal className="w-4 h-4 text-secondary" />
              <span>Crowd Simulator</span>
            </Button>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-between gap-2 text-xs text-foreground animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search pilot destinations, district, or ecosystem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/40 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-muted/50 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Districts</option>
              {districts.filter((d) => d !== 'All').map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>

            <select
              value={pressureFilter}
              onChange={(e) => setPressureFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-muted/50 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Pressure Levels</option>
              <option value="LOW">Low Pressure (&lt;40%)</option>
              <option value="MEDIUM">Moderate Pressure (40-69%)</option>
              <option value="HIGH">High Pressure (70%+)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Registry Table */}
      <Card className="rounded-3xl border border-border/80 shadow-sm overflow-hidden">
        <div className="p-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Tracked Places ({filteredList.length} of {destinations.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage crowd limits to protect nature and improve traveler experience.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-muted-foreground uppercase tracking-wider text-[11px]">
                <TableHead className="py-3 px-3">Destination</TableHead>
                <TableHead className="py-3 px-3">District</TableHead>
                <TableHead className="py-3 px-3">Crowd Level</TableHead>
                <TableHead className="py-3 px-3">Daily Visitor Limit</TableHead>
                <TableHead className="py-3 px-3">Eco Score</TableHead>
                <TableHead className="py-3 px-3">Status</TableHead>
                <TableHead className="py-3 px-3 text-right">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((dest) => {
                const dailyCap = dest.pressure.score * 40;
                return (
                  <TableRow key={dest.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="py-3.5 px-3 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <div>
                          <span>{dest.name}</span>
                          <span className="text-[10px] text-muted-foreground block font-normal">
                            {dest.tags.slice(0, 2).join(' • ')}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-muted-foreground text-xs">
                      {dest.district}
                    </TableCell>

                    <TableCell className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs">{dest.pressure.score}%</span>
                        <Badge
                          variant={
                            dest.pressure.level === 'HIGH'
                              ? 'destructive'
                              : dest.pressure.level === 'MEDIUM'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {dest.pressure.level}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-3 font-mono text-xs text-foreground">
                      ~{dailyCap.toLocaleString()} / day
                    </TableCell>

                    <TableCell className="py-3.5 px-3">
                      <span className="font-bold text-success text-xs">
                        {dest.sustainability.overall} / 100
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-3">
                      {dest.pressure.level === 'HIGH' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive">
                          <AlertTriangle className="w-3.5 h-3.5" /> Overcrowded
                        </span>
                      ) : dest.pressure.level === 'MEDIUM' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning">
                          Getting Busy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Safe
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleOpenEdit(dest)}
                          className="rounded-lg gap-1 text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Cap</span>
                        </Button>

                        <Link href={`/destinations/${dest.id}`}>
                          <Button size="xs" variant="outline" className="rounded-lg">
                            Inspect
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Carrying Capacity Modal */}
      {editingDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in">
          <Card className="max-w-md w-full rounded-3xl border border-border shadow-2xl p-6 space-y-5 bg-card">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Update Limit
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Change Visitor Limit: {editingDest.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDest(null)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-muted/40 text-xs space-y-1">
                <span className="text-muted-foreground">Current Status:</span>
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Crowds: {editingDest.pressure.score}%</span>
                  <span>Eco Score: {editingDest.sustainability.overall}/100</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="capacity-input" className="text-xs font-bold text-foreground block">
                  Max Daily Visitors
                </label>
                <Input
                  id="capacity-input"
                  type="number"
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(Number(e.target.value))}
                  className="bg-muted/50 rounded-xl font-mono text-sm"
                />
                <span className="text-[10px] text-muted-foreground">
                  If visitors exceed this number, the AI will suggest other quieter places.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <Button size="sm" variant="ghost" onClick={() => setEditingDest(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveCapacity} className="rounded-xl bg-primary text-primary-foreground">
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
