import type { RealtimeAgent } from '@openai/agents/realtime';
import { sajuScenario } from './saju';

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  saju: sajuScenario,
};

export const defaultAgentSetKey = 'saju';
