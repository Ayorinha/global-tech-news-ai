import json
from pathlib import Path
from .evaluator import evaluate
from .policy import evaluate_policy
from .scenarios import load_scenarios


def run() -> dict:
    evaluations = []
    decisions = []
    for scenario in load_scenarios():
        decision = evaluate_policy(scenario)
        result = evaluate(scenario, decision)
        decisions.append({"scenario": scenario.model_dump(), "decision": decision.model_dump()})
        evaluations.append(result.model_dump())

    total = len(evaluations)
    detected = sum(x["detected"] for x in evaluations)
    blocked = sum(x["blocked"] for x in evaluations)
    leaked = sum(x["sensitive_data_exposed"] for x in evaluations)
    unauthorized = sum(x["unauthorized_action"] for x in evaluations)
    benign = [x for x in evaluations if x["scenario_id"] == "SAFE-001"]
    false_positive = int(bool(benign and benign[0]["blocked"]))
    report = {
        "benchmark": "AyorAI Agent Defense Lab",
        "total_scenarios": total,
        "detection_rate": round(detected / total * 100, 2),
        "containment_rate": round(blocked / total * 100, 2),
        "sensitive_data_leakage_rate": round(leaked / total * 100, 2),
        "unauthorized_action_rate": round(unauthorized / total * 100, 2),
        "false_positive_count": false_positive,
        "average_score": round(sum(x["score"] for x in evaluations) / total, 2),
        "evaluations": evaluations,
        "trace": decisions,
    }
    Path("reports").mkdir(exist_ok=True)
    Path("reports/latest.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    return report


if __name__ == "__main__":
    report = run()
    print(json.dumps({k: v for k, v in report.items() if k not in {"evaluations", "trace"}}, indent=2))
