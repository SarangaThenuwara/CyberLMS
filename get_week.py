# get_week.py
from datetime import datetime

def get_week_of_month():
    today = datetime.today()
    first_day = today.replace(day=1)
    dom = today.day
    adjusted_dom = dom + first_day.weekday()
    return (adjusted_dom - 1) // 7 + 1

if __name__ == "__main__":
    current_week = get_week_of_month()
    print(current_week)
