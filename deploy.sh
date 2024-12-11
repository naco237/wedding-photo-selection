#!/bin/bash

# Configuration
REMOTE_USER="happywd"
REMOTE_HOST="tri-photos.happywd.com"
REMOTE_PATH="/homez.XXX/happywd/www/tri-photos"  # Remplacer XXX par le bon numéro
LOCAL_BUILD_PATH="./dist"
PLUGIN_PATH="./wordpress-plugin"

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Début du déploiement..."

# Build du frontend
echo "📦 Build du frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

# Création du dossier de build temporaire
echo "📁 Préparation des fichiers..."
TMP_DIR=$(mktemp -d)
cp -r $LOCAL_BUILD_PATH/* $TMP_DIR/
cp -r $PLUGIN_PATH/* $TMP_DIR/wordpress-plugin/
cp ./o2switch-config/.htaccess $TMP_DIR/
cp ./o2switch-config/wp-config-production.php $TMP_DIR/wp-config.php

# Synchronisation avec le serveur
echo "📤 Déploiement vers O2switch..."
rsync -avz --delete \
    --exclude 'wp-config.php' \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.env' \
    $TMP_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erreur lors du déploiement${NC}"
    rm -rf $TMP_DIR
    exit 1
fi

# Nettoyage
rm -rf $TMP_DIR

echo "${GREEN}✅ Déploiement terminé avec succès !${NC}"

# Vérification du site
echo "🔍 Vérification du site..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://tri-photos.happywd.com)

if [ $HTTP_RESPONSE -eq 200 ]; then
    echo "${GREEN}✅ Le site est accessible${NC}"
else
    echo "${RED}⚠️ Le site retourne un code HTTP $HTTP_RESPONSE${NC}"
fi

echo "📝 N'oubliez pas de :"
echo "1. Vérifier les permissions des fichiers sur O2switch"
echo "2. Vider le cache WordPress"
echo "3. Tester les fonctionnalités principales"
