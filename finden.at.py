import csv
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time

def accept_cookies(driver):
    try:
        iframe = driver.find_element(By.ID, "sp_message_iframe_1005932")
        driver.switch_to.frame(iframe)
        accept_button = driver.find_element(By.XPATH, "//button[@title='Alle akzeptieren']")
        accept_button.click()
        driver.switch_to.default_content()
        return True
    except:
        return False

def extract_job_data(driver, href, csv_writer):
    driver.get(href)

    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//h1[@class='detail-header-title']")))
        print(f"Job details found on {href}")
    except TimeoutException:
        print(f"Timed out waiting for job details on {href}")
        return

    try:
        job_title = driver.find_element(By.XPATH, "//h1[@class='detail-header-title']").text.strip()
        location = driver.find_element(By.XPATH, "//div[@class='sc-icon-text sc-icon-text-big'][1]/span").text.strip()
        salary = driver.find_element(By.XPATH, "//div[@class='sc-icon-text sc-icon-text-big'][2]/span").text.strip()

        try:
            company_name_button = driver.find_element(By.XPATH, "//button[@class='detail-header-company']")
            company_name = company_name_button.get_attribute('title')
        except NoSuchElementException:
            company_name = "Not available"

        email = find_email_in_job_description(driver)

        print(f"Data extracted from {href}")
        
        # Write data to CSV file immediately
        csv_writer.writerow([job_title, location, salary, email, company_name, href])

    except NoSuchElementException as e:
        print(f"Error extracting data from {href}: {e}")

def find_email_in_job_description(driver):
    try:
        job_description_div = driver.find_element(By.XPATH, "//div[@class='job-detail-body']//div[@class='job-detail-job-description']")
        job_description_text = job_description_div.text

        # Using regular expression to find email address in the text
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', job_description_text)
        if email_match:
            return email_match.group()

    except NoSuchElementException:
        return None

# Set up Chrome options for headless mode
chrome_options = Options()
chrome_options.add_argument('--headless')

# Set up the Chrome driver with options
driver = webdriver.Chrome(options=chrome_options)

base_urls = [
    "https://www.finden.at/jobs/search/16239/",
    "https://www.finden.at/jobs/search/16239/it/"
]

for base_url in base_urls:
    driver.get(base_url)

    if accept_cookies(driver):
        print("Cookies accepted.")
    else:
        print("Cookies acceptance failed.")

    start_page = 1
    end_page = 3

    # Open CSV file in append mode
    with open('finden.at.csv', 'a', newline='', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)

        # Write header row if file is empty
        if csv_file.tell() == 0:
            csv_writer.writerow(['Job Title', 'Location', 'Salary', 'Email', 'Company Name', 'Href'])

        for current_page in range(start_page, end_page + 1):
            try:
                next_page_url = f"{base_url}?page={current_page}"
                driver.get(next_page_url)

                accept_cookies(driver)

                hrefs = [a.get_attribute('href') for a in driver.find_elements(By.XPATH, ".//a[contains(@class, 'job-ad-container')]")][:15]

                for href in hrefs:
                    extract_job_data(driver, href, csv_writer)

            except Exception as e:
                print(f"Error on page {current_page}: {e}")

driver.quit()
