import json

# Charger le fichier openapi.json
with open('openapi.json', 'r', encoding='utf-8') as f:
    openapi_data = json.load(f)

# Supprimer les champs "goals" et "assists" du schéma Player
if 'components' in openapi_data and 'schemas' in openapi_data['components']:
    if 'Player' in openapi_data['components']['schemas']:
        player_schema = openapi_data['components']['schemas']['Player']
        if 'properties' in player_schema:
            if 'goals' in player_schema['properties']:
                del player_schema['properties']['goals']
            if 'assists' in player_schema['properties']:
                del player_schema['properties']['assists']
    
    # Supprimer les champs "goals" et "assists" du schéma ScoreboardPlayer
    if 'ScoreboardPlayer' in openapi_data['components']['schemas']:
        scoreboard_player_schema = openapi_data['components']['schemas']['ScoreboardPlayer']
        if 'properties' in scoreboard_player_schema:
            if 'goals' in scoreboard_player_schema['properties']:
                del scoreboard_player_schema['properties']['goals']
            if 'assists' in scoreboard_player_schema['properties']:
                del scoreboard_player_schema['properties']['assists']
        
        # Mettre à jour la liste des champs requis
        if 'required' in scoreboard_player_schema:
            scoreboard_player_schema['required'] = [field for field in scoreboard_player_schema['required'] if field not in ['goals', 'assists']]

# Enregistrer le fichier openapi.json mis à jour
with open('openapi.json', 'w', encoding='utf-8') as f:
    json.dump(openapi_data, f)

print("Les champs 'goals' et 'assists' ont été supprimés du fichier openapi.json.") 