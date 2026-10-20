"""Deterministic word 5-gram Jaccard similarity checker."""
import re
from typing import Set, Tuple, Dict, Any

class SimilarityService:
    @staticmethod
    def get_word_5grams(text: str) -> Set[Tuple[str, ...]]:
        # Tokenize by alphanumeric words lowercase
        words = re.findall(r"\b[a-zA-Z0-9_]+\b", text.lower())
        if len(words) < 5:
            # If fewer than 5 words, return tuple of whatever words exist
            return {tuple(words)} if words else set()
        
        ngrams = set()
        for i in range(len(words) - 4):
            ngrams.add(tuple(words[i:i+5]))
        return ngrams

    @staticmethod
    def compute_jaccard(text_a: str, text_b: str) -> float:
        grams_a = SimilarityService.get_word_5grams(text_a)
        grams_b = SimilarityService.get_word_5grams(text_b)

        if not grams_a or not grams_b:
            return 0.0

        intersection = grams_a.intersection(grams_b)
        union = grams_a.union(grams_b)

        if not union:
            return 0.0

        return round(len(intersection) / len(union), 4)

    @staticmethod
    def evaluate_submission(content: str, corpus: list[Dict[str, str]], threshold: float = 0.35) -> Dict[str, Any]:
        """
        Evaluate new content against existing corpus submissions.
        Returns highest similarity score and match info.
        """
        max_score = 0.0
        matched_id = None
        matched_title = None

        for item in corpus:
            score = SimilarityService.compute_jaccard(content, item.get("content", ""))
            if score > max_score:
                max_score = score
                matched_id = item.get("id")
                matched_title = item.get("title", "Existing Submission")

        is_flagged = max_score >= threshold

        return {
            "score": max_score,
            "threshold": threshold,
            "flagged": is_flagged,
            "matched_submission_id": matched_id,
            "matched_submission_title": matched_title,
            "requires_human_review": is_flagged,
            "reason": f"5-gram Jaccard similarity {int(max_score*100)}% exceeds {int(threshold*100)}% threshold against submission {matched_id}" if is_flagged else "Within acceptable similarity variance"
        }
