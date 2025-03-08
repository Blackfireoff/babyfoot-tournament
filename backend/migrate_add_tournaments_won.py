import sqlite3

def migrate():
    """
    Script de migration pour ajouter la colonne tournaments_won à la table teams
    """
    # Connexion à la base de données
    conn = sqlite3.connect('babyfoot_tournament.db')
    cursor = conn.cursor()
    
    try:
        # Vérifier si la colonne existe déjà
        cursor.execute("PRAGMA table_info(teams)")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        if 'tournaments_won' not in column_names:
            print("Ajout de la colonne tournaments_won à la table teams...")
            cursor.execute("ALTER TABLE teams ADD COLUMN tournaments_won INTEGER DEFAULT 0")
            print("Colonne ajoutée avec succès!")
        else:
            print("La colonne tournaments_won existe déjà dans la table teams.")
        
        conn.commit()
    except Exception as e:
        print(f"Erreur lors de la migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate() 