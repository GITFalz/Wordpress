# WordPress

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/votre-username/votre-repo)

## 🚀 Démarrage rapide avec Codespace

1. Cliquez sur le badge "Open in GitHub Codespaces" ci-dessus
2. Attendez que l'environnement se configure automatiquement
3. L'application WordPress sera accessible sur le port 3000
4. La base de donnée sera accessible sur le port 8080

## 🐳 Commandes Docker

```bash
# Démarrer l'environnement
./run.sh

# Arrêter l'environnement
./quit.sh

# Exporter la base de donnée
./export-db.sh

# Importer la base de donnée
./import-db.sh

# Voir les logs
docker-compose logs -f wordpress
```

## 📝 Journal de développement

### Jour 8
- Création d'un projet GitHub et migration du code
- Déploiement d'un Codespace et Docker WordPress pour pouvoir éditer plus facilement et n'importe où
- Refactor de la base de données
- Debug de refactor du code en créant des nouvelles classes pour bien diviser le code