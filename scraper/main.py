from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.ui import WebDriverWait

from cleaner import clean_text, extract_year


MAX_VERSTAPPEN_URL = "https://en.wikipedia.org/wiki/Max_Verstappen"


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


def main() -> None:
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get(MAX_VERSTAPPEN_URL)
        records = extract_karting_records(driver)
        print(f"{len(records)} registros encontrados em {driver.title}")

        for record in records:
            print(record)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
