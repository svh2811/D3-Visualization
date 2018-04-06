import csv

rows = []
top5League = ["Spanish Primera División", "French Ligue 1", "German Bundesliga", "English Premier League", "Italian Serie A"]
i = 0

with open('fifa18-complete.csv') as csvfile:
	readCSV = csv.reader(csvfile, delimiter=',')
	for row in readCSV:
		if i == 0 or (row[7].strip() in top5League): 
			rows.append(row)
		i = 100

with open('fifa18-top5-league.csv', "w", newline='') as csvfile:
	writer = csv.writer(csvfile, delimiter=',')
	for row in rows:
		writer.writerow(row)
