# WordPress

## Démarrage rapide avec Codespace

1. Cliquez sur le badge "Open in GitHub Codespaces" ci-dessus
2. Attendez que l'environnement se configure automatiquement
3. L'application WordPress sera accessible sur le port 3000
4. La base de donnée sera accessible sur le port 8080

## Commandes Docker

```bash
# Démarrer l'environnement
./run

# Arrêter l'environnement
./quit

# Exporter la base de donnée
./export

# Importer la base de donnée
./import

# Voir les logs
docker-compose logs -f wordpress
```

## Accès au site

# Aller sur le lien
https://shiny-pancake-jjj9j5754vwvhqp66-3000.app.github.dev/wp-admin/

# Identifiant
Falz

# Mot de passe
Zucht24WP

## Journal de développement

### Jour 8
- Création d'un projet GitHub et migration du code
- Déploiement d'un Codespace et Docker WordPress pour pouvoir éditer plus facilement et n'importe où
- Refactor de la base de données
- Debug de refactor du code en créant des nouvelles classes pour bien diviser le code   