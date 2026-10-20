"""Deterministic reward and credit distribution engine."""
from typing import Dict, Any, List

class RewardEngine:
    @staticmethod
    def calculate_funded_payouts(
        budget_inr: int = 100000,
        fee_pct: float = 0.10,
        ai_reserve_pct: float = 0.05,
        expert_pct_of_rem: float = 0.30,
        student_equal_share_of_pool: float = 0.40,
        weights: Dict[str, float] = None,
        expert_name: str = "Prof. Kiran Shah"
    ) -> Dict[str, Any]:
        """
        Exact canonical funded calculation matching specification:
        Budget: ₹1,00,000
        Fee: ₹10,000
        AI reserve: ₹5,000
        Remaining: ₹85,000
        Expert: ₹25,500
        Student pool: ₹59,500
        Student equal part: ₹23,800
        Student weighted part: ₹35,700
        Priya (0.5): ₹25,783
        Arun (0.3): ₹18,643
        Meera (0.2): ₹15,074
        Expert: ₹25,500
        AI earns: ₹0
        Total: ₹1,00,000
        """
        weights = weights or {"Priya Sharma": 0.5, "Arun Kumar": 0.3, "Meera Patel": 0.2}

        fee = int(budget_inr * fee_pct)
        ai_reserve = int(budget_inr * ai_reserve_pct)
        remaining = budget_inr - fee - ai_reserve

        expert_amount = int(remaining * expert_pct_of_rem)
        student_pool = remaining - expert_amount

        student_equal_total = int(student_pool * student_equal_share_of_pool)
        student_weighted_total = student_pool - student_equal_total

        num_students = len(weights)
        base_equal = student_equal_total // num_students
        remainder_equal = student_equal_total - (base_equal * num_students)

        students_list = list(weights.items())

        # Compute preliminary weighted parts
        w_parts = [int(student_weighted_total * w) for _, w in students_list]
        remainder_weighted = student_weighted_total - sum(w_parts)

        students_breakdown = []
        total_distributed_students = 0

        for i, (name, weight) in enumerate(students_list):
            w_part = w_parts[i] + (remainder_weighted if i == num_students - 1 else 0)
            eq_part = base_equal + (remainder_equal if i == num_students - 1 else 0)
            final_payout = w_part + eq_part
            total_distributed_students += final_payout

            students_breakdown.append({
                "name": name,
                "role": "student",
                "weight": weight,
                "weighted_part": w_part,
                "equal_part": eq_part,
                "final_payout": final_payout,
                "currency": "INR",
                "explanation": f"Equal share (₹{eq_part:,}) + Weighted contribution ({int(weight*100)}% of ₹{student_weighted_total:,} = ₹{w_part:,})"
            })

        # Ensure budget conservation for odd integers
        leftover = budget_inr - (fee + ai_reserve + expert_amount + total_distributed_students)
        if leftover != 0:
            students_breakdown[-1]["final_payout"] += leftover
            students_breakdown[-1]["weighted_part"] += leftover
            total_distributed_students += leftover

        return {
            "budget_inr": budget_inr,
            "platform_fee_inr": fee,
            "ai_reserve_inr": ai_reserve,
            "ai_earned_inr": 0,
            "net_collaboration_pool_inr": remaining,
            "expert_payout": {
                "name": expert_name,
                "role": "expert",
                "final_payout": expert_amount,
                "currency": "INR",
                "explanation": f"Expert advisory & review share (30% of ₹{remaining:,})"
            },
            "student_pool_inr": student_pool,
            "student_equal_total_inr": student_equal_total,
            "student_weighted_total_inr": student_weighted_total,
            "students": students_breakdown,
            "total_settled_inr": fee + ai_reserve + expert_amount + total_distributed_students
        }

    @staticmethod
    def calculate_credit_payouts(
        total_cu: float = 100.0,
        expert_share_pct: float = 0.20,
        student_equal_portion_pct: float = 0.30,
        weights: Dict[str, float] = None,
        expert_name: str = "Prof. Kiran Shah"
    ) -> Dict[str, Any]:
        """
        Exact canonical credit calculation:
        100 CU total
        Expert: 20 CU
        Student pool: 80 CU
        Student equal portion: 30% of student pool = 24 CU (8 CU each)
        Weighted portion: 70% of student pool = 56 CU
        Weights: Priya = 0.5, Arun = 0.3, Meera = 0.2
        Weighted: Priya = 28 CU, Arun = 16.8 CU, Meera = 11.2 CU
        Final:
        Priya = 36.0 CU
        Arun = 24.8 CU
        Meera = 19.2 CU
        Expert = 20.0 CU
        Total: 100 CU
        """
        weights = weights or {"Priya Sharma": 0.5, "Arun Kumar": 0.3, "Meera Patel": 0.2}

        expert_cu = total_cu * expert_share_pct
        student_pool_cu = total_cu - expert_cu

        student_equal_total = student_pool_cu * student_equal_portion_pct
        student_weighted_total = student_pool_cu - student_equal_total

        num_students = len(weights)
        equal_each = student_equal_total / num_students

        students_breakdown = []
        for name, weight in weights.items():
            w_cu = round(student_weighted_total * weight, 2)
            eq_cu = round(equal_each, 2)
            final_cu = round(w_cu + eq_cu, 2)

            students_breakdown.append({
                "name": name,
                "role": "student",
                "weight": weight,
                "weighted_cu": w_cu,
                "equal_cu": eq_cu,
                "final_cu": final_cu,
                "unit": "CU",
                "explanation": f"Equal credit component ({eq_cu} CU) + Weighted research attribution ({int(weight*100)}% of {student_weighted_total} CU = {w_cu} CU)"
            })

        return {
            "total_cu": total_cu,
            "expert_credit": {
                "name": expert_name,
                "role": "expert",
                "final_cu": expert_cu,
                "unit": "CU",
                "explanation": f"Lead mentor and senior review attribution (20% of {total_cu} CU)"
            },
            "student_pool_cu": student_pool_cu,
            "student_equal_total_cu": student_equal_total,
            "student_weighted_total_cu": student_weighted_total,
            "students": students_breakdown,
            "total_awarded_cu": expert_cu + sum(s["final_cu"] for s in students_breakdown)
        }
