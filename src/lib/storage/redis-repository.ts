import type { Project, Journey, AuditRun, Experiment, VerificationResult, Budget } from './types';
import type { AuditResult } from '@/types/telemetry';

// Upstash/Vercel Redis REST protocol. Each record is a separate hash field so
// concurrent serverless requests cannot overwrite unrelated experiment records.
export function createRedisRepository(url: string, token: string, seeds: {project: Project; journey: Journey; budget: Budget}) {
  const prefix = process.env.CARBONTERRA_STORAGE_PREFIX || 'carbonterra:v1';
  async function command<T>(...args: (string | number)[]): Promise<T> {
    const response = await fetch(url, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Shared storage unavailable (HTTP ${response.status}).`);
    const body = await response.json();
    if (body.error || !('result' in body)) throw new Error('Shared storage rejected the operation.');
    return body.result as T;
  }
  async function get<T>(group: string, id: string): Promise<T | null> {
    const raw = await command<string | null>('HGET', `${prefix}:${group}`, id);
    return raw === null ? null : JSON.parse(raw) as T;
  }
  async function list<T>(group: string): Promise<T[]> {
    const values = await command<string[]>('HVALS', `${prefix}:${group}`);
    return values.map(value => JSON.parse(value) as T);
  }
  async function save<T>(group: string, id: string, value: T, immutable = false): Promise<T> {
    const result = await command<number>(immutable ? 'HSETNX' : 'HSET', `${prefix}:${group}`, id, JSON.stringify(value));
    if (immutable && result === 0) {
      const original = await get<T>(group, id);
      if (JSON.stringify(original) !== JSON.stringify(value)) throw new Error('An immutable evidence record cannot be overwritten.');
    }
    return value;
  }
  async function readExperiment(id: string): Promise<Experiment | null> {
    const fields = await command<string[]>('HGETALL', `${prefix}:experiment:${id}`);
    if (!fields.length) return null;
    const record: Record<string, unknown> = {};
    for (let i=0; i<fields.length; i+=2) record[fields[i]] = JSON.parse(fields[i+1]);
    return record as unknown as Experiment;
  }
  function experimentFields(value: Partial<Experiment>): string[] {
    return Object.entries(value).filter(([,v]) => v !== undefined).flatMap(([k,v]) => [k, JSON.stringify(v)]);
  }
  return {
    saveTelemetry(audit: AuditResult) { return save('telemetry', audit.id || audit.url, audit); },
    async listTelemetry() { return (await list<AuditResult>('telemetry')).sort((a,b) => b.calculated_at.localeCompare(a.calculated_at)); },
    async getProjects() { const records = await list<Project>('projects'); return records.some(p => p.id === seeds.project.id) ? records : [seeds.project, ...records]; },
    async getProject(id: string) { return await get<Project>('projects', id) || (id === seeds.project.id ? seeds.project : null); },
    async getJourneys(projectId?: string) { const records = await list<Journey>('journeys'); if (!records.some(j => j.id === seeds.journey.id)) records.push(seeds.journey); return projectId ? records.filter(j => j.projectId === projectId) : records; },
    async getJourney(id: string) { return await get<Journey>('journeys', id) || (id === seeds.journey.id ? seeds.journey : null); },
    saveRun(run: AuditRun) { return save('runs', run.id, run, true); },
    getRun(id: string) { return get<AuditRun>('runs', id); },
    async listRuns(projectId?: string, journeyId?: string) { return (await list<AuditRun>('runs')).filter(r => (!projectId || r.projectId === projectId) && (!journeyId || r.journeyId === journeyId)).sort((a,b) => b.timestamp.localeCompare(a.timestamp)); },
    async saveExperiment(exp: Experiment) {
      const value = {...exp, updatedAt: new Date().toISOString()};
      await command('HSET', `${prefix}:experiment:${exp.id}`, ...experimentFields(value));
      await command('SADD', `${prefix}:experiments:index`, exp.id);
      return value;
    },
    getExperiment: readExperiment,
    async listExperiments(projectId?: string) {
      const ids = await command<string[]>('SMEMBERS', `${prefix}:experiments:index`);
      const records = (await Promise.all(ids.map(readExperiment))).filter((e): e is Experiment => !!e);
      return records.filter(e => !projectId || e.projectId === projectId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async updateExperiment(id: string, updates: Partial<Experiment>): Promise<Experiment | null> {
      if (!await command<number>('EXISTS', `${prefix}:experiment:${id}`)) return null;
      // Atomic field updates preserve simultaneous review/test changes and JSON arrays.
      await command('HSET', `${prefix}:experiment:${id}`, ...experimentFields({...updates, id, updatedAt: new Date().toISOString()}));
      return readExperiment(id);
    },
    saveVerification(value: VerificationResult) { return save('verifications', value.id, value, true); },
    getVerification(id: string) { return get<VerificationResult>('verifications', id); },
    async getVerificationByExperiment(id: string) { return (await list<VerificationResult>('verifications')).filter(v => v.experimentId === id).sort((a,b) => b.receiptGeneratedAt.localeCompare(a.receiptGeneratedAt))[0] || null; },
    async getBudget(id: string) { return await get<Budget>('budgets', id) || (id === seeds.budget.projectId ? seeds.budget : null); },
    saveBudget(budget: Budget) { return save('budgets', budget.projectId, {...budget, updatedAt: new Date().toISOString()}); },
    async resetDemo() { throw new Error('Shared production records cannot be reset through the demo repository.'); },
  };
}
