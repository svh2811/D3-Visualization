SELECT * 
FROM stocks.surf_eod
WHERE ticker in ('GOOGL')
and date >= "2016-01-01"
#LIMIT 10;