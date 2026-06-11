from selenium import webdriver


MAX_VERSTAPPEN_URL = "https://en.wikipedia.org/wiki/Max_Verstappen"


def main() -> None:
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get(MAX_VERSTAPPEN_URL)
        print(f"Página aberta: {driver.title}")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
