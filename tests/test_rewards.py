"""Unit tests for Reward and Credit engine."""
import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from backend.services.reward_engine import RewardEngine

class TestRewards(unittest.TestCase):
    def test_canonical_funded_payouts(self):
        """
        Must test exact canonical distribution:
        Priya: ₹25,783
        Arun: ₹18,643
        Meera: ₹15,074
        Expert: ₹25,500
        Total: ₹1,00,000
        AI: ₹0
        """
        result = RewardEngine.calculate_funded_payouts(budget_inr=100000)

        # AI earns 0
        self.assertEqual(result["ai_earned_inr"], 0)

        # Expert payout
        self.assertEqual(result["expert_payout"]["final_payout"], 25500)

        # Students
        students = {s["name"]: s["final_payout"] for s in result["students"]}
        self.assertEqual(students["Priya Sharma"], 25783)
        self.assertEqual(students["Arun Kumar"], 18643)
        self.assertEqual(students["Meera Patel"], 15074)

        # Platform fee & reserve
        self.assertEqual(result["platform_fee_inr"], 10000)
        self.assertEqual(result["ai_reserve_inr"], 5000)

        # Grand total
        self.assertEqual(result["total_settled_inr"], 100000)

    def test_canonical_credit_payouts(self):
        """
        Must test exact canonical credit distribution:
        Priya: 36.0 CU
        Arun: 24.8 CU
        Meera: 19.2 CU
        Expert: 20.0 CU
        Total: 100.0 CU
        """
        result = RewardEngine.calculate_credit_payouts(total_cu=100.0)

        self.assertEqual(result["expert_credit"]["final_cu"], 20.0)

        students = {s["name"]: s["final_cu"] for s in result["students"]}
        self.assertEqual(students["Priya Sharma"], 36.0)
        self.assertEqual(students["Arun Kumar"], 24.8)
        self.assertEqual(students["Meera Patel"], 19.2)

        self.assertEqual(result["total_awarded_cu"], 100.0)

    def test_rounding_ties_integrity(self):
        """Test that odd budget integer divisions never leak a single rupee."""
        budgets = [50000, 75000, 100000, 123456, 99999]
        for b in budgets:
            res = RewardEngine.calculate_funded_payouts(budget_inr=b)
            self.assertEqual(res["total_settled_inr"], b)

    def test_stipend_variant(self):
        """Stipend model should allocate fixed equal base without penalty."""
        res = RewardEngine.calculate_funded_payouts(
            budget_inr=60000,
            expert_pct_of_rem=0.20,
            student_equal_share_of_pool=0.50
        )
        self.assertEqual(res["total_settled_inr"], 60000)
        self.assertEqual(res["ai_earned_inr"], 0)

if __name__ == "__main__":
    unittest.main()
