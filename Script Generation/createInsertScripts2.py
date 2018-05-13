import json

prefix = "INSERT INTO country VALUES ("
suffix = ");\n"

queries = []

with open("countries.json") as countries_file:
    countries = json.load(countries_file)

for country in countries:
    query = prefix
    query += "\"" + country["name"]["common"] + "\", "
    query += str(country["latlng"][1]) + ", "
    query += str(country["latlng"][0])
    query += suffix

    print(query)
    # break
    # queries.append(query)

"""
file = open("insert-country.sql", "w")
file.writelines(queries)
file.close()
"""
