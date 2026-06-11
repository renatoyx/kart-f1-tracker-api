import argparse
import sqlite3
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.ui import WebDriverWait

from cleaner import clean_text, extract_year


MAX_VERSTAPPEN_URL = "https://en.wikipedia.org/wiki/Max_Verstappen"
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = PROJECT_ROOT / "data" / "kart-f1-tracker.db"


def extract_karting_records(driver: webdriver.Chrome) -> list[dict[str, str | int]]:
    wait = WebDriverWait(driver, 15)
    heading = wait.until(
        expected.presence_of_element_located(
            (By.ID, "Karting_career_summary")
        )
    )
    table = heading.find_element(By.XPATH, "following::table[1]")
    rows = table.find_elements(By.CSS_SELECTOR, "tbody tr")

    records: list[dict[str, str | int]] = []
    current_year: int | None = None

    for row in rows:
        cells = row.find_elements(By.CSS_SELECTOR, "th, td")
        values = [clean_text(cell.text) for cell in cells]

        if not values or values[0].lower() == "season":
            continue

        row_year = extract_year(values[0])

        if row_year is not None:
            current_year = row_year
            values = values[1:]

        if current_year is None or len(values) < 3:
            continue

        records.append(
            {
                "year": current_year,
                "championship": values[0],
                "team": values[1] or "",
                "result": values[2],
            }
        )

    return records


def get_driver_id(
    connection: sqlite3.Connection,
    name: str,
    nationality: str,
) -> int:
    row = connection.execute(
        "SELECT id FROM drivers WHERE name = ? COLLATE NOCASE",
        (name,),
    ).fetchone()

    if row:
        return int(row[0])

    cursor = connection.execute(
        "INSERT INTO drivers (name, nationality) VALUES (?, ?)",
        (name, nationality),
    )

    if cursor.lastrowid is None:
        raise RuntimeError(f"Não foi possível cadastrar o piloto {name}")

    return cursor.lastrowid


def split_championship(value: str) -> tuple[str, str | None]:
    parts = [part.strip() for part in value.rsplit("–", maxsplit=1)]

    if len(parts) == 2:
        return parts[0], parts[1]

    return value, None


def save_records(
    driver_name: str,
    nationality: str,
    records: list[dict[str, str | int]],
) -> int:
    if not DATABASE_PATH.exists():
        raise FileNotFoundError(
            "Banco não encontrado. Inicie o backend uma vez antes do scraper: "
            f"{DATABASE_PATH}"
        )

    inserted_records = 0

    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        driver_id = get_driver_id(connection, driver_name, nationality)

        for record in records:
            championship, category = split_championship(
                str(record["championship"])
            )
            team = str(record["team"]) or None
            result = str(record["result"]) or None

            existing_record = connection.execute(
                """
                SELECT id
                FROM karting_records
                WHERE driver_id = ?
                  AND year = ?
                  AND championship = ?
                  AND COALESCE(team, '') = COALESCE(?, '')
                  AND COALESCE(result, '') = COALESCE(?, '')
                """,
                (
                    driver_id,
                    int(record["year"]),
                    championship,
                    team,
                    result,
                ),
            ).fetchone()

            if existing_record:
                continue

            connection.execute(
                """
                INSERT INTO karting_records (
                  driver_id,
                  year,
                  championship,
                  category,
                  team,
                  result
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    driver_id,
                    int(record["year"]),
                    championship,
                    category,
                    team,
                    result,
                ),
            )
            inserted_records += 1

    return inserted_records


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Importa o histórico de kart de um piloto da Wikipedia."
    )
    parser.add_argument(
        "name",
        nargs="?",
        default="Max Verstappen",
        help="Nome usado para localizar ou cadastrar o piloto.",
    )
    parser.add_argument(
        "url",
        nargs="?",
        default=MAX_VERSTAPPEN_URL,
        help="URL da página do piloto na Wikipedia.",
    )
    parser.add_argument(
        "--nationality",
        default="Unknown",
        help="Nacionalidade usada caso o piloto ainda não esteja cadastrado.",
    )

    return parser.parse_args()


def scrape_driver(name: str, url: str, nationality: str) -> None:
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        records = extract_karting_records(driver)
        inserted_records = save_records(
            driver_name=name,
            nationality=nationality,
            records=records,
        )
        print(
            f"{len(records)} registros encontrados; "
            f"{inserted_records} inseridos para {name}"
        )
    finally:
        driver.quit()


def main() -> None:
    arguments = parse_arguments()
    scrape_driver(arguments.name, arguments.url, arguments.nationality)


if __name__ == "__main__":
    main()
