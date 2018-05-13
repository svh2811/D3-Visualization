import csv

i = 0

prefix = "INSERT INTO fifa18 VALUES ("
suffix = ");\n"

queries = []

with open('complete.csv') as csvfile:
    readCSV = csv.reader(csvfile, delimiter=',')
    for rowElements in readCSV:
        if i == 0:
            i += 1
            continue

        query = prefix
        rE_l = len(rowElements)
        for idx, rowElement in enumerate(rowElements):
            elem = None
            if rowElement.isdigit():
                elem = rowElement
            elif len(rowElement) == 0:
                elem = 'null'
            else:
                elem = "\"" + rowElement + "\""

            if (idx + 1) == rE_l:
                query += elem
            else:
                query += elem + ", "
        query += suffix

        # print(query)
        queries.append(query)

        i += 1
        # if i == 2:
        # break
        # for element in elements:
        #   if ()


file = open("insert-fifa18.sql", "w")
file.writelines(queries)
file.close()
