'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Edit2, MapPin, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/Loader';
import { createDestination, deactivateDestination, listDestinations, updateDestination } from '@/lib/destinations';
import { mapDestinations, type DestinationViewModel } from '@/lib/destinationMapper';
import describeApiError from '@/lib/apiError';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PressureRegion } from '@/types/destination-api';

const PRESSURE_REGIONS: PressureRegion[] = [
  'Ancient Cities',
  'Colombo City',
  'East Coast',
  'Greater Colombo',
  'Hill Country',
  'Northern Region',
  'South Coast',
];

interface EditValues {
  name: string;
  district: string;
  region: string;
  pressure_region: PressureRegion | '';
  landscape_type: string;
  image_url: string;
  typical_budget: number;
  recommended_min_trip_duration: number;
  recommended_max_trip_duration: number;
  is_active: boolean;
}

interface CreateValues extends EditValues {
  slug: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  activities: string;
  includeFactor: boolean;
  environmental_score: number;
  community_benefit_score: number;
  crowd_score: number;
  infrastructure_score: number;
  tourist_suitability_score: number;
  data_source: string;
  confidence_level: 'LOW' | 'MEDIUM' | 'HIGH';
  value_type: 'MEASURED' | 'ESTIMATED' | 'PROXY';
  last_updated: string;
}

const EMPTY_CREATE: CreateValues = {
  slug: '', name: '', district: '', region: '', pressure_region: '', description: '', image_url: '',
  latitude: 7, longitude: 80, landscape_type: '', typical_budget: 0,
  recommended_min_trip_duration: 1, recommended_max_trip_duration: 1,
  is_active: true, activities: '', includeFactor: false,
  environmental_score: 50, community_benefit_score: 50, crowd_score: 50,
  infrastructure_score: 50, tourist_suitability_score: 50, data_source: '',
  confidence_level: 'LOW', value_type: 'PROXY', last_updated: new Date().toISOString().slice(0, 16),
};

export default function AdminDestinationsRegistryPage() {
  const [destinations, setDestinations] = useState<DestinationViewModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [editingDest, setEditingDest] = useState<DestinationViewModel | null>(null);
  const [editValues, setEditValues] = useState<EditValues | null>(null);
  const [createValues, setCreateValues] = useState<CreateValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [active, inactive] = await Promise.all([
        listDestinations({ active: true }),
        listDestinations({ active: false }),
      ]);
      const mapped = mapDestinations([...active, ...inactive]);
      setDestinations(mapped.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (loadError) {
      setError(describeApiError(loadError, 'Unable to load the destination registry.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const districts = useMemo(
    () => ['All', ...Array.from(new Set(destinations.map((destination) => destination.district)))],
    [destinations],
  );

  const filteredList = useMemo(() => destinations.filter((destination) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = destination.name.toLowerCase().includes(query)
      || destination.district.toLowerCase().includes(query)
      || destination.api.activities.some((activity) => activity.includes(query));
    const matchesDistrict = districtFilter === 'All' || destination.district === districtFilter;
    const matchesStatus = statusFilter === 'All'
      || (statusFilter === 'Active' ? destination.api.is_active : !destination.api.is_active);
    return matchesSearch && matchesDistrict && matchesStatus;
  }), [destinations, districtFilter, searchQuery, statusFilter]);

  const showNotice = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEdit = (destination: DestinationViewModel) => {
    setEditingDest(destination);
    setEditValues({
      name: destination.api.name,
      district: destination.api.district,
      region: destination.api.region,
      pressure_region: destination.api.pressure_region ?? '',
      landscape_type: destination.api.landscape_type,
      image_url: destination.api.image_url ?? '',
      typical_budget: Number(destination.api.typical_budget),
      recommended_min_trip_duration: destination.api.recommended_min_trip_duration,
      recommended_max_trip_duration: destination.api.recommended_max_trip_duration,
      is_active: destination.api.is_active,
    });
  };

  const handleSave = async () => {
    if (!editingDest || !editValues) return;
    setIsSaving(true);
    setError(null);
    try {
      const { image_url, ...values } = editValues;
      await updateDestination(editingDest.api.id, {
        ...values,
        pressure_region: values.pressure_region || null,
        ...(image_url ? { image_url } : {}),
      });
      setEditingDest(null);
      setEditValues(null);
      showNotice(`${editingDest.name} was updated.`);
      await load();
    } catch (saveError) {
      setError(describeApiError(saveError, 'Unable to update this destination.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (destination: DestinationViewModel) => {
    if (!window.confirm(`Deactivate ${destination.name}? It will disappear from tourist listings.`)) return;
    setIsSaving(true);
    setError(null);
    try {
      await deactivateDestination(destination.api.id);
      showNotice(`${destination.name} was deactivated.`);
      await load();
    } catch (deactivateError) {
      setError(describeApiError(deactivateError, 'Unable to deactivate this destination.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!createValues) return;
    setIsSaving(true);
    setError(null);
    try {
      await createDestination({
        slug: createValues.slug,
        name: createValues.name,
        district: createValues.district,
        region: createValues.region,
        pressure_region: createValues.pressure_region || null,
        description: createValues.description,
        image_url: createValues.image_url || null,
        latitude: createValues.latitude,
        longitude: createValues.longitude,
        landscape_type: createValues.landscape_type,
        typical_budget: createValues.typical_budget,
        recommended_min_trip_duration: createValues.recommended_min_trip_duration,
        recommended_max_trip_duration: createValues.recommended_max_trip_duration,
        is_active: createValues.is_active,
        activities: createValues.activities.split(',').map((value) => value.trim()).filter(Boolean),
        factor: createValues.includeFactor ? {
          environmental_score: createValues.environmental_score,
          community_benefit_score: createValues.community_benefit_score,
          crowd_score: createValues.crowd_score,
          infrastructure_score: createValues.infrastructure_score,
          tourist_suitability_score: createValues.tourist_suitability_score,
          data_source: createValues.data_source,
          confidence_level: createValues.confidence_level,
          value_type: createValues.value_type,
          last_updated: new Date(createValues.last_updated).toISOString(),
        } : null,
      });
      showNotice(`${createValues.name} was created.`);
      setCreateValues(null);
      await load();
    } catch (createError) {
      setError(describeApiError(createError, 'Unable to create this destination.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && destinations.length === 0) {
    return <Loader label="Loading destination registry..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tourism Authority</span>
            <span className="text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" /> API Registry Active
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">Destinations Registry</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage destination records, sustainability provenance, and active status.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setCreateValues({ ...EMPTY_CREATE })} className="rounded-xl gap-1.5"><Plus className="w-4 h-4" /> Add destination</Button>
          <Link href="/admin/tourism-pressure"><Button size="sm" variant="outline" className="rounded-xl gap-1.5 cursor-pointer"><SlidersHorizontal className="w-4 h-4" /> Simulate Pressure</Button></Link>
        </div>
      </div>

      {toastMessage && <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-secondary" /><span className="font-semibold">{toastMessage}</span></div>}
      {error && <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-between gap-3 text-xs text-destructive"><span>{error}</span><Button size="sm" variant="outline" onClick={() => void load()}>Retry</Button></div>}

      <Card className="p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search destinations, districts, or activities..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-muted/40 rounded-xl" />
          </div>
          <select value={districtFilter} onChange={(event) => setDistrictFilter(event.target.value)} className="px-3 py-2 rounded-xl text-xs bg-muted/50 border border-border">
            {districts.map((district) => <option key={district}>{district}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="px-3 py-2 rounded-xl text-xs bg-muted/50 border border-border">
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
        </div>
      </Card>

      <Card className="rounded-3xl border border-border/80 shadow-sm overflow-hidden">
        <div className="p-6 pb-2"><h2 className="text-base font-bold text-foreground">Destination Registry ({filteredList.length} of {destinations.length})</h2><p className="text-xs text-muted-foreground">Values shown below come from the FastAPI destination records.</p></div>
        <div className="px-6 pb-6 overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="text-muted-foreground uppercase tracking-wider text-[11px]"><TableHead>Destination</TableHead><TableHead>District / Region</TableHead><TableHead>Data quality</TableHead><TableHead>Budget</TableHead><TableHead>Sustainability</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Management</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredList.map((destination) => (
                <TableRow key={destination.api.id}>
                  <TableCell className="font-bold"><div className="flex gap-2"><MapPin className="w-3.5 h-3.5 text-secondary" /><div>{destination.name}<span className="text-[10px] text-muted-foreground block font-normal">{destination.api.activities.join(' • ') || 'No activities'}</span></div></div></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{destination.district}<span className="block">{destination.api.region}</span><span className="block text-[10px] text-secondary">Pressure: {destination.api.pressure_region ?? 'Unavailable'}</span></TableCell>
                  <TableCell><span className="text-xs font-bold">{destination.api.factor?.value_type ?? 'NONE'}</span><span className="text-[10px] text-muted-foreground block">{destination.api.factor?.confidence_level ?? 'No confidence'}</span></TableCell>
                  <TableCell className="text-xs font-mono">LKR {Number(destination.api.typical_budget).toLocaleString()}</TableCell>
                  <TableCell>{destination.sustainabilityData ? <span className="font-bold text-success text-xs">{Number(destination.sustainabilityData.total_score).toFixed(1)} / 100</span> : <span className="text-xs text-muted-foreground">Unavailable</span>}</TableCell>
                  <TableCell><Badge variant={destination.api.is_active ? 'success' : 'secondary'}>{destination.api.is_active ? 'ACTIVE' : 'INACTIVE'}</Badge></TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1.5"><Button size="xs" variant="ghost" onClick={() => handleOpenEdit(destination)}><Edit2 className="w-3 h-3" /> Edit</Button>{destination.api.is_active && <><Button size="xs" variant="ghost" disabled={isSaving} onClick={() => void handleDeactivate(destination)} className="text-destructive"><Trash2 className="w-3 h-3" /> Deactivate</Button><Link href={`/destinations/${destination.api.slug}`}><Button size="xs" variant="outline">Inspect</Button></Link></>}</div></TableCell>
                </TableRow>
              ))}
              {filteredList.length === 0 && <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No destination records match these filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>

      {editingDest && editValues && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs">
          <Card className="max-w-xl w-full rounded-3xl border border-border shadow-2xl p-6 space-y-5 bg-card max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between border-b border-border pb-3"><div><span className="text-[10px] font-bold uppercase text-secondary">Backend destination record</span><h3 className="font-heading text-lg font-bold">Edit {editingDest.name}</h3></div><button onClick={() => setEditingDest(null)}><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['name', 'district', 'region', 'landscape_type', 'image_url'] as const).map((field) => <label key={field} className="text-xs font-bold capitalize">{field.replace('_', ' ')}<Input value={editValues[field]} onChange={(event) => setEditValues({ ...editValues, [field]: event.target.value })} className="mt-1" /></label>)}
              <label className="text-xs font-bold">Pressure model region<select value={editValues.pressure_region} onChange={(event) => setEditValues({ ...editValues, pressure_region: event.target.value as PressureRegion | '' })} className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3"><option value="">Unavailable / unmapped</option>{PRESSURE_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select></label>
              <label className="text-xs font-bold">Typical budget<Input type="number" min={0} value={editValues.typical_budget} onChange={(event) => setEditValues({ ...editValues, typical_budget: Number(event.target.value) })} className="mt-1" /></label>
              <label className="text-xs font-bold">Minimum trip days<Input type="number" min={1} value={editValues.recommended_min_trip_duration} onChange={(event) => setEditValues({ ...editValues, recommended_min_trip_duration: Number(event.target.value) })} className="mt-1" /></label>
              <label className="text-xs font-bold">Maximum trip days<Input type="number" min={1} value={editValues.recommended_max_trip_duration} onChange={(event) => setEditValues({ ...editValues, recommended_max_trip_duration: Number(event.target.value) })} className="mt-1" /></label>
              <label className="flex items-center gap-2 text-xs font-bold pt-6"><input type="checkbox" checked={editValues.is_active} onChange={(event) => setEditValues({ ...editValues, is_active: event.target.checked })} /> Active</label>
            </div>
            {editValues.recommended_max_trip_duration < editValues.recommended_min_trip_duration && <p className="text-xs text-destructive flex gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Maximum duration cannot be below minimum duration.</p>}
            <div className="flex justify-end gap-2 border-t border-border pt-3"><Button variant="ghost" onClick={() => setEditingDest(null)}>Cancel</Button><Button disabled={isSaving || editValues.recommended_max_trip_duration < editValues.recommended_min_trip_duration} onClick={() => void handleSave()}>{isSaving ? 'Saving...' : 'Save destination'}</Button></div>
          </Card>
        </div>
      )}

      {createValues && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs">
          <Card className="max-w-3xl w-full rounded-3xl border border-border shadow-2xl p-6 space-y-5 bg-card max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between border-b border-border pb-3"><div><span className="text-[10px] font-bold uppercase text-secondary">New backend record</span><h3 className="font-heading text-lg font-bold">Create destination</h3></div><button onClick={() => setCreateValues(null)}><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['slug', 'name', 'district', 'region', 'landscape_type', 'image_url'] as const).map((field) => <label key={field} className="text-xs font-bold capitalize">{field.replace('_', ' ')}{field !== 'image_url' && ' *'}<Input value={createValues[field]} onChange={(event) => setCreateValues({ ...createValues, [field]: event.target.value })} className="mt-1" placeholder={field === 'slug' ? 'lowercase-hyphenated-slug' : undefined} /></label>)}
              <label className="text-xs font-bold">Pressure model region<select value={createValues.pressure_region} onChange={(event) => setCreateValues({ ...createValues, pressure_region: event.target.value as PressureRegion | '' })} className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3"><option value="">Unavailable / unmapped</option>{PRESSURE_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select></label>
              <label className="text-xs font-bold sm:col-span-2">Description *<textarea value={createValues.description} onChange={(event) => setCreateValues({ ...createValues, description: event.target.value })} className="mt-1 min-h-24 w-full rounded-xl border border-border bg-background p-3 text-sm" /></label>
              {(['latitude', 'longitude', 'typical_budget', 'recommended_min_trip_duration', 'recommended_max_trip_duration'] as const).map((field) => <label key={field} className="text-xs font-bold capitalize">{field.replaceAll('_', ' ')} *<Input type="number" value={createValues[field]} onChange={(event) => setCreateValues({ ...createValues, [field]: Number(event.target.value) })} className="mt-1" /></label>)}
              <label className="text-xs font-bold sm:col-span-2">Activities <span className="font-normal text-muted-foreground">(comma-separated slugs)</span><Input value={createValues.activities} onChange={(event) => setCreateValues({ ...createValues, activities: event.target.value })} className="mt-1" placeholder="nature, hiking" /></label>
              <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={createValues.is_active} onChange={(event) => setCreateValues({ ...createValues, is_active: event.target.checked })} /> Active</label>
              <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={createValues.includeFactor} onChange={(event) => setCreateValues({ ...createValues, includeFactor: event.target.checked })} /> Include sustainability factors</label>
            </div>
            {createValues.includeFactor && <div className="rounded-2xl border border-border p-4 space-y-3"><h4 className="text-sm font-bold">Sustainability factor data</h4><div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{(['environmental_score', 'community_benefit_score', 'crowd_score', 'infrastructure_score', 'tourist_suitability_score'] as const).map((field) => <label key={field} className="text-[10px] font-bold capitalize">{field.replaceAll('_', ' ')}<Input type="number" min={0} max={100} value={createValues[field]} onChange={(event) => setCreateValues({ ...createValues, [field]: Number(event.target.value) })} className="mt-1" /></label>)}</div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><label className="text-xs font-bold">Data source *<Input value={createValues.data_source} onChange={(event) => setCreateValues({ ...createValues, data_source: event.target.value })} className="mt-1" /></label><label className="text-xs font-bold">Confidence<select value={createValues.confidence_level} onChange={(event) => setCreateValues({ ...createValues, confidence_level: event.target.value as CreateValues['confidence_level'] })} className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><label className="text-xs font-bold">Value type<select value={createValues.value_type} onChange={(event) => setCreateValues({ ...createValues, value_type: event.target.value as CreateValues['value_type'] })} className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3"><option>MEASURED</option><option>ESTIMATED</option><option>PROXY</option></select></label><label className="text-xs font-bold">Last updated<Input type="datetime-local" value={createValues.last_updated} onChange={(event) => setCreateValues({ ...createValues, last_updated: event.target.value })} className="mt-1" /></label></div></div>}
            <div className="flex justify-end gap-2 border-t border-border pt-3"><Button variant="ghost" onClick={() => setCreateValues(null)}>Cancel</Button><Button disabled={isSaving} onClick={() => void handleCreate()}>{isSaving ? 'Creating...' : 'Create destination'}</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}
