import fs from 'fs';
import path from 'path';
import { GigListing } from '../scrapers/base.js';
import { EvaluationResult } from '../evaluator/evaluator.js';

export type PipelineStatus =
  | 'discovered'
  | 'evaluated'
  | 'proposal_drafted'
  | 'applied'
  | 'interviewing'
  | 'won'
  | 'lost'
  | 'skipped'
  | 'withdrawn';

export interface PipelineEntry {
  id: string;
  url: string;
  platform: string;
  title: string;
  budget_raw: string;
  status: PipelineStatus;
  score?: number;
  grade?: string;
  proposal_sent?: boolean;
  proposal_sent_at?: string;
  response?: string;
  response_at?: string;
  earnings?: number;
  notes?: string;
  discovered_at: string;
  updated_at: string;
}

export class PipelineTracker {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? process.env.PIPELINE_FILE ?? './pipeline/pipeline.jsonl';
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  readAll(): PipelineEntry[] {
    if (!fs.existsSync(this.filePath)) return [];
    const lines = fs.readFileSync(this.filePath, 'utf-8').split('\n').filter(Boolean);
    return lines.map((line) => JSON.parse(line) as PipelineEntry);
  }

  findById(id: string): PipelineEntry | undefined {
    return this.readAll().find((e) => e.id === id);
  }

  findByUrl(url: string): PipelineEntry | undefined {
    return this.readAll().find((e) => e.url === url);
  }

  upsert(entry: PipelineEntry): void {
    const entries = this.readAll();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...entry, updated_at: new Date().toISOString() };
    } else {
      entries.push(entry);
    }
    this.writeAll(entries);
  }

  addFromListing(listing: GigListing, evaluation?: EvaluationResult): PipelineEntry {
    const existing = this.findById(listing.id);
    const entry: PipelineEntry = {
      id: listing.id,
      url: listing.url,
      platform: listing.platform,
      title: listing.title,
      budget_raw: listing.budget.raw,
      status: existing?.status ?? (evaluation ? 'evaluated' : 'discovered'),
      score: evaluation?.ai_analysis.score ?? evaluation?.heuristic.total,
      grade: evaluation?.ai_analysis.grade ?? evaluation?.heuristic.grade,
      discovered_at: existing?.discovered_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.upsert(entry);
    return entry;
  }

  updateStatus(id: string, status: PipelineStatus, notes?: string): PipelineEntry | null {
    const entries = this.readAll();
    const idx = entries.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    entries[idx] = {
      ...entries[idx],
      status,
      notes: notes ?? entries[idx].notes,
      updated_at: new Date().toISOString(),
    };
    this.writeAll(entries);
    return entries[idx];
  }

  markProposalSent(id: string): PipelineEntry | null {
    const entries = this.readAll();
    const idx = entries.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    entries[idx] = {
      ...entries[idx],
      status: 'applied',
      proposal_sent: true,
      proposal_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.writeAll(entries);
    return entries[idx];
  }

  getStats(): Record<string, number> {
    const entries = this.readAll();
    const stats: Record<string, number> = {
      total: entries.length,
      applied: 0,
      won: 0,
      in_progress: 0,
      avg_score: 0,
    };
    let scoreSum = 0, scoreCount = 0;
    for (const e of entries) {
      if (e.status === 'applied' || e.status === 'proposal_drafted') stats.applied++;
      if (e.status === 'won') stats.won++;
      if (['applied', 'interviewing'].includes(e.status)) stats.in_progress++;
      if (e.score) { scoreSum += e.score; scoreCount++; }
    }
    stats.avg_score = scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : 0;
    stats.win_rate = stats.applied > 0 ? Math.round((stats.won / stats.applied) * 100) : 0;
    return stats;
  }

  private writeAll(entries: PipelineEntry[]): void {
    const content = entries.map((e) => JSON.stringify(e)).join('\n') + (entries.length > 0 ? '\n' : '');
    fs.writeFileSync(this.filePath, content, 'utf-8');
  }
}
