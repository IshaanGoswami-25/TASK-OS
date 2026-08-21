import { AgentVersion, RegressionResult, TestExecution, TestRun, TrustScore } from './types';
import { getExecutions, getScenarios, getTrustScore, saveRegressions } from './storage';

export interface VersionComparison {
  prevVersion: AgentVersion;
  newVersion: AgentVersion;
  prevScore: TrustScore | null;
  newScore: TrustScore | null;
  scoreDelta: number;
  resolvedFailuresCount: number;
  newFailuresCount: number;
  regressions: RegressionResult[];
}

export async function compareAgentVersions(
  prevVersion: AgentVersion,
  newVersion: AgentVersion,
  prevRun: TestRun,
  newRun: TestRun
): Promise<VersionComparison> {
  const prevScore = await getTrustScore(prevRun.id);
  const newScore = await getTrustScore(newRun.id);

  const prevExecutions = await getExecutions(prevRun.id);
  const newExecutions = await getExecutions(newRun.id);

  const prevScenarios = await getScenarios(prevRun.id);
  const newScenarios = await getScenarios(newRun.id);

  const regressions: RegressionResult[] = [];

  // Match scenarios by title/category to detect regressions (Passed in prev -> Failed in new)
  newExecutions.forEach(newExec => {
    const newScenario = newScenarios.find(s => s.id === newExec.scenario_id);
    if (!newScenario) return;

    const matchingPrevScenario = prevScenarios.find(s => s.title === newScenario.title || s.category === newScenario.category);
    if (!matchingPrevScenario) return;

    const prevExec = prevExecutions.find(e => e.scenario_id === matchingPrevScenario.id);
    if (!prevExec) return;

    const prevPassed = prevExec.status === 'passed';
    const newPassed = newExec.status === 'passed';

    if (prevPassed && !newPassed) {
      regressions.push({
        id: `reg_${Math.random().toString(36).substring(2, 9)}`,
        previous_version_id: prevVersion.id,
        new_version_id: newVersion.id,
        scenario_id: newScenario.id,
        scenario_title: newScenario.title,
        previous_result: 'passed',
        new_result: 'failed',
        regression_detected: true,
        created_at: new Date().toISOString()
      });
    }
  });

  if (regressions.length > 0) {
    await saveRegressions(regressions);
  }

  const prevScoreVal = prevScore?.overall_score || 0;
  const newScoreVal = newScore?.overall_score || 0;

  const resolvedCount = prevExecutions.filter(e => e.status === 'failed').length - newExecutions.filter(e => e.status === 'failed').length;

  return {
    prevVersion,
    newVersion,
    prevScore,
    newScore,
    scoreDelta: newScoreVal - prevScoreVal,
    resolvedFailuresCount: Math.max(0, resolvedCount),
    newFailuresCount: regressions.length,
    regressions
  };
}
