import re


REFERENCE_PATTERN = re.compile(r"\[(?:\d+|[a-z]{1,3})\]", re.IGNORECASE)
CONTROL_CHARACTER_PATTERN = re.compile(r"[\u200b-\u200f\u202a-\u202e\u2060\ufeff]")
WHITESPACE_PATTERN = re.compile(r"\s+")
YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")


def clean_text(value: str | None) -> str:
    if not value:
        return ""

    without_references = REFERENCE_PATTERN.sub("", value)
    without_controls = CONTROL_CHARACTER_PATTERN.sub("", without_references)
    normalized_spaces = without_controls.replace("\xa0", " ")

    return WHITESPACE_PATTERN.sub(" ", normalized_spaces).strip()


def extract_year(value: str | None) -> int | None:
    cleaned_value = clean_text(value)
    match = YEAR_PATTERN.search(cleaned_value)

    return int(match.group()) if match else None
