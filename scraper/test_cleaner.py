import unittest

from cleaner import clean_text, extract_year


class CleanerTest(unittest.TestCase):
    def test_removes_references_and_normalizes_whitespace(self) -> None:
        value = "  WSK\nEuro\xa0Series [12] [a] "

        self.assertEqual(clean_text(value), "WSK Euro Series")

    def test_extracts_year_from_dirty_text(self) -> None:
        self.assertEqual(extract_year("2013[4]\n"), 2013)

    def test_returns_none_when_year_is_missing(self) -> None:
        self.assertIsNone(extract_year("CIK-FIA Championship"))


if __name__ == "__main__":
    unittest.main()
