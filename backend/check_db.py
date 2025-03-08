import sqlite3

# Connexion à la base de données
conn = sqlite3.connect('babyfoot_tournament.db')
cursor = conn.cursor()

# Lister toutes les tables
print("Liste des tables dans la base de données:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for table in tables:
    table_name = table[0]
    print(f"\nStructure de la table {table_name}:")
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    for column in columns:
        print(column)

# Fermer la connexion
conn.close() 