# Environnement de Développement WordPress

## Démarrage Rapide avec Codespace

1. Cliquez sur le badge "Open in GitHub Codespaces" ci-dessus
2. Attendez que l'environnement se configure automatiquement
3. L'application WordPress sera accessible sur le port 3000
4. La base de données sera accessible sur le port 8080

## Commandes Docker

Rendez-vous dans le dossier `bin` pour toutes les commandes :

```bash
# Naviguer vers le dossier bin
cd bin

# Démarrer l'environnement
./run

# Arrêter l'environnement
./quit

# Exporter la base de données
./export

# Importer la base de données
./import

# Lire le fichier debug
./debug

# Éditer le fichier config dans nano
./config

# Voir les logs
docker-compose logs -f wordpress
```

## Identifiants d'Accès

### Site Web
- **Nom d'utilisateur :** Falz
- **Mot de passe :** Zucht24WP

### Base de Données
- **Nom d'utilisateur :** root
- **Mot de passe :** rootpassword

## Journal de Développement

### Jour 1 - 3
- Aprentissage de wordpress

### Jour 4
- Début de création d’un plugin de devis

### Jour 5
- Continuation de création d’un plugin de devis

### Jour 6
- Fini intégration fonctionnalité de base + ajout de css custom
- Optimisation du code

### Jour 7
- Migration des étapes dans une base custom

### Jour 8
- Création d'un projet GitHub et migration du code
- Déploiement d'un Codespace et Docker WordPress pour pouvoir éditer plus facilement et n'importe où
- Refactorisation de la base de données
- Débogage du code refactorisé en créant de nouvelles classes pour bien diviser le code

### Jour 9 - 10
- Continuation du plugin devis avec optimisation du code et ajout de fonctionnalités

### Jour 11
- Finition de la version 2 du plugin devis
- Début d'un plugin de QR code pour bouteilles de vin

### Jour 12
- Continuation du plugin QR code et finition d'une version basique v1

### Jour 13
- Finition du plugin QR code avec ajout de fonctionnalités
- Début de l'ajout de fonctionnalités au plugin devis