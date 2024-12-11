# Guide de déploiement sur O2switch

## Prérequis

1. Accès SSH à votre hébergement O2switch
2. WordPress installé sur le sous-domaine tri-photos.happywd.com
3. Node.js et npm installés localement
4. Git installé localement

## Configuration initiale

1. **Configuration de la base de données**
   - Créez une base de données dans votre panel O2switch
   - Modifiez le fichier `wp-config-production.php` avec vos identifiants

2. **Configuration DNS**
   - Pointez tri-photos.happywd.com vers votre hébergement O2switch
   - Activez le SSL via Let's Encrypt dans votre panel O2switch

3. **Configuration SSH**
   ```bash
   # Générez une clé SSH si ce n'est pas déjà fait
   ssh-keygen -t rsa -b 4096
   
   # Ajoutez votre clé publique à O2switch
   ssh-copy-id -i ~/.ssh/id_rsa.pub happywd@tri-photos.happywd.com
   ```

## Déploiement

1. **Préparation locale**
   ```bash
   # Installation des dépendances
   npm install
   
   # Build du projet
   npm run build
   ```

2. **Déploiement automatique**
   ```bash
   # Rendre le script de déploiement exécutable
   chmod +x deploy.sh
   
   # Lancer le déploiement
   ./deploy.sh
   ```

## Vérifications post-déploiement

1. **Permissions des fichiers**
   ```bash
   # Connexion SSH à O2switch
   ssh happywd@tri-photos.happywd.com
   
   # Correction des permissions
   chmod 755 /homez.XXX/happywd/www/tri-photos
   find /homez.XXX/happywd/www/tri-photos -type f -exec chmod 644 {} \;
   find /homez.XXX/happywd/www/tri-photos -type d -exec chmod 755 {} \;
   ```

2. **Cache et optimisation**
   - Videz le cache WordPress
   - Testez la compression Gzip
   - Vérifiez les temps de chargement
   - Validez le SSL avec SSL Labs

3. **Sécurité**
   - Vérifiez les permissions des fichiers
   - Testez l'accès aux fichiers sensibles
   - Validez les en-têtes de sécurité

## Maintenance

1. **Sauvegardes**
   - Configurez les sauvegardes automatiques dans le panel O2switch
   - Exportez régulièrement la base de données

2. **Mises à jour**
   - Mettez à jour WordPress régulièrement
   - Vérifiez les logs d'erreurs
   - Surveillez les performances

## Support

En cas de problème :
1. Vérifiez les logs dans `/homez.XXX/happywd/www/tri-photos/wp-content/uploads/wps-logs/`
2. Contactez le support O2switch
3. Consultez la documentation WordPress
