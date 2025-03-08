import sqlite3
import os

# Chemin vers la base de données
DB_PATH = 'babyfoot_tournament.db'

def migrate():
    """
    Ajoute la colonne losses à la table teams si elle n'existe pas déjà.
    """
    # Vérifier si le fichier de base de données existe
    if not os.path.exists(DB_PATH):
        print(f"Erreur: Le fichier de base de données '{DB_PATH}' n'existe pas.")
        return False

    conn = None
    try:
        # Connexion à la base de données
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Vérifier si la colonne existe déjà
        cursor.execute("PRAGMA table_info(teams)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'losses' not in columns:
            # Ajouter la colonne losses
            cursor.execute("ALTER TABLE teams ADD COLUMN losses INTEGER DEFAULT 0")
            conn.commit()
            print("Migration réussie: Colonne 'losses' ajoutée à la table 'teams'.")
        else:
            print("La colonne 'losses' existe déjà dans la table 'teams'.")
        
        return True
    except sqlite3.Error as e:
        print(f"Erreur SQLite: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate() 