import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from tests.test_ledger import TestLedger

if __name__ == "__main__":
    unittest.main()
