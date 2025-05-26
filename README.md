MarchéNet Afrique
MarchéNet Afrique est une plateforme e-commerce développée avec React et Vite, conçue pour faciliter l’achat et la vente de produits locaux à travers l’Afrique. Cette application permet aux utilisateurs de parcourir des produits, de gérer leurs favoris et leur panier, et aux vendeurs de s’inscrire pour proposer leurs articles.
Fonctionnalités principales

Recherche de produits : Recherche par mot-clé avec suggestions automatiques basées sur le nom et la catégorie des produits.
Gestion des favoris et du panier : Les utilisateurs authentifiés peuvent ajouter des produits à leurs favoris ou au panier.
Devenir vendeur : Les utilisateurs peuvent s’inscrire comme vendeurs et gérer leur boutique (ajouter des produits, voir leur tableau de bord).
Administration : Les admins peuvent gérer les produits, les quotas des vendeurs, les messages de contact, et envoyer des notifications.
Rôles et permissions : Supporte différents rôles (user, vendor, admin) avec des routes protégées.
Optimisation SEO : Métadonnées et mots-clés optimisés pour les recherches comme "produits africains" ou "e-commerce Afrique".
Intégration Supabase : Utilise Supabase pour l’authentification, la gestion des données (produits, profils, favoris), et les requêtes en temps réel.
Paiement : Intégration avec PayDunya pour les abonnements payants des vendeurs.

Structure du projet
Répertoires principaux

src/assets/ : Contient les ressources statiques (ex. logo logo-marchénet-afrique-site.png).
src/components/ : Composants réutilisables comme :
ProductCard.jsx : Affiche une carte de produit avec image, prix, et boutons pour favoris/panier.
SearchBar.jsx : Barre de recherche avec suggestions automatiques.
Sidebar.jsx : Menu latéral avec navigation conditionnelle selon le rôle.
Layout.jsx : Mise en page de base avec en-tête et sidebar.
ProtectedRoute.jsx : Composant pour protéger les routes selon l’authentification et les rôles.


src/hooks/ : Hooks personnalisés comme :
useAuth.js : Gère l’authentification et le nombre de notifications non lues.


src/pages/ : Pages principales comme :
Home.jsx : Page d’accueil avec liste de produits.
SearchResults.jsx : Résultats de recherche.
AddProduct.jsx : Formulaire pour ajouter un produit (vendeurs).
AdminDashboard.jsx : Tableau de bord pour les admins.
Cart.jsx : Gestion du panier.
BecomeVendor.jsx : Processus pour devenir vendeur.
Dashboard.jsx : Tableau de bord des vendeurs.
EditProduct.jsx : Édition d’un produit existant.
Login.jsx : Page de connexion.
MyShop.jsx : Page de gestion de boutique.
Notifications.jsx : Liste des notifications.
ProductDetails.jsx : Détails d’un produit.
Profile.jsx : Profil utilisateur.
Register.jsx : Page d’inscription.
SearchResults.jsx : Résultats de recherche paginés.
ShopDetails.jsx : Détails d’une boutique.
Shops.jsx : Liste des boutiques.
TopProducts.jsx : Top produits populaires.
ViewShops.jsx : Placeholder pour voir les boutiques.
Favorites.jsx : Liste des favoris.
HowToOpenShop.jsx : Guide pour ouvrir une boutique.
FAQ.jsx : Foire aux questions.
Contact.jsx : Page de contact.
Messages.jsx : Liste des messages.
ManageSubscription.jsx : Gestion de l’abonnement vendeur.


src/utils/ : Utilitaires comme :
packs.js : Liste des packs vendeurs.
errorHandler.js : Gestion des erreurs Supabase.



Fichiers clés

App.jsx : Point d’entrée principal définissant les routes de l’application.
main.jsx : Point d’entrée pour le rendu React.
App.css : Styles globaux (principalement pour le logo).
index.css : Styles principaux avec Tailwind et polices.
supabaseClient.js : Configuration du client Supabase avec fonctions utilitaires.

Prérequis

Node.js : Version 14.x ou supérieure.
npm ou yarn : Pour installer les dépendances.
Compte Supabase : Nécessaire pour l’authentification et la gestion des données.
Compte PayDunya : Nécessaire pour les paiements (packs payants des vendeurs).

Installation

Clone le dépôt :git clone https://github.com/votre-utilisateur/marcenet-afrique.git
cd marcenet-afrique


Installe les dépendances :npm install


Configure les variables d’environnement :
Crée un fichier .env à la racine du projet.
Ajoute tes clés Supabase et PayDunya :VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
VITE_PAYDUNYA_MASTER_KEY=votre_paydunya_master_key
VITE_PAYDUNYA_PUBLIC_KEY=votre_paydunya_public_key
VITE_PAYDUNYA_PRIVATE_KEY=votre_paydunya_private_key
VITE_PAYDUNYA_TOKEN=votre_paydunya_token




Lance l’application en mode développement :npm run dev

Ouvre http://localhost:5173 dans ton navigateur.

Comportement de l’application
Pages principales

Page d’accueil (Home.jsx) :
Affiche une liste de produits filtrée par catégorie, pays, prix, et état.
Inclut une barre de recherche fixe et des filtres déroulants.
Les utilisateurs non authentifiés sont invités à s’inscrire.


Recherche (SearchResults.jsx) :
Affiche les résultats de recherche paginés (10 produits par page) basés sur une requête.
Supporte un filtre par pays et gère les favoris/panier.


Ajouter un produit (AddProduct.jsx) :
Accessible aux vendeurs actifs via /ajouter-produit.
Formulaire pour ajouter un produit avec validation (max 3 images, prix/stock positifs, etc.).
Télécharge les images vers Supabase Storage et enregistre le produit.


Tableau de bord admin (AdminDashboard.jsx) :
Accessible aux admins via /admin.
Permet de gérer les produits (approuver, rejeter, supprimer), les quotas des vendeurs, les messages de contact, et d’envoyer des notifications.


Panier (Cart.jsx) :
Accessible via /panier.
Affiche les articles ajoutés au panier, permet de modifier les quantités, supprimer des articles, et contacter les vendeurs via WhatsApp.


Devenir vendeur (BecomeVendor.jsx) :
Accessible via /devenir-vendeur.
Processus en 3 étapes : saisir les informations, choisir un pack, et payer (si pack payant).
Intègre PayDunya pour les paiements.


Tableau de bord vendeur (Dashboard.jsx) :
Accessible via /tableau-de-bord pour les vendeurs.
Affiche des statistiques (nom de la boutique, produits, quota) et une liste de produits avec options pour modifier, supprimer, ou changer le statut.


Modifier un produit (EditProduct.jsx) :
Accessible via /modifier-produit/:id.
Permet de modifier les détails d’un produit existant, avec gestion des images et validation.


Connexion (Login.jsx) :
Accessible via /connexion.
Permet aux utilisateurs de se connecter avec email/mot de passe et propose une réinitialisation de mot de passe.


Ma boutique (MyShop.jsx) :
Accessible via /ma-boutique.
Affiche un message de bienvenue avec des instructions pour gérer la boutique.


Notifications (Notifications.jsx) :
Accessible via /notifications.
Affiche une liste de notifications avec détails et marque comme lues au clic.


Détails d’un produit (ProductDetails.jsx) :
Accessible via /details-produit/:id.
Affiche les détails d’un produit avec carrousel d’images, options favoris/panier, et contact via WhatsApp.


Profil (Profile.jsx) :
Accessible via /mon-profil.
Affiche les informations utilisateur/vendeur et gère le retour de paiement PayDunya.


Inscription (Register.jsx) :
Accessible via /inscription.
Permet de créer un compte avec validation du téléphone et du mot de passe.


Résultats de recherche (SearchResults.jsx) :
Accessible via /search.
Affiche les produits correspondant à une requête avec pagination et filtre par pays.


Détails d’une boutique (ShopDetails.jsx) :
Accessible via /boutique/:auth_id.
Affiche les informations d’une boutique et ses produits (limite 10).


Liste des boutiques (Shops.jsx) :
Accessible via /boutiques.
Liste toutes les boutiques avec filtre par pays.


Top produits (TopProducts.jsx) :
Accessible via /top-produits.
Affiche les 5 produits les plus populaires, filtrables par pays.


Voir les boutiques (ViewShops.jsx) :
Accessible via /voir-les-boutiques.
Placeholder avec message indiquant une implémentation future.


Favoris (Favorites.jsx) :
Accessible via /mes-favoris.
Liste les produits favoris de l’utilisateur.


Messages (Messages.jsx) :
Accessible via /mes-messages.
Liste les messages de l’utilisateur.


Gérer abonnement (ManageSubscription.jsx) :
Accessible via /gérer-abonnement.
Permet aux vendeurs de gérer leur abonnement.



Fonctionnalités clés

Ajout de produit (AddProduct.jsx) :
Formulaire avec validation des champs (ex. images max 3, taille < 5 Mo, format JPEG/PNG/WebP).
Gère les quotas et limites quotidiennes des vendeurs (via packs.js).
Affiche un modal de confirmation avant ajout final.


Administration (AdminDashboard.jsx) :
Liste paginée des produits avec options d’approbation/rejet/suppression.
Liste des vendeurs avec leurs quotas et dates de fin d’abonnement.
Liste paginée des messages de contact (filtrable par type).
Envoi de notifications à tous les utilisateurs ou à un vendeur spécifique.


Panier (Cart.jsx) :
Affiche les articles du panier avec options pour modifier la quantité, supprimer, ou contacter le vendeur via WhatsApp.
Met à jour en temps réel grâce à un abonnement postgres_changes.
Calcule le prix total.


Devenir vendeur (BecomeVendor.jsx) :
Processus en 3 étapes : informations, sélection de pack, paiement.
Supporte un Pack Gratuit (activation immédiate) et des packs payants via PayDunya.
Pré-remplit les informations si l’utilisateur est un vendeur existant.


Recherche et suggestions (SearchBar.jsx) :
Utilise ilike pour trouver des produits par nom ou catégorie.
Suggestions mises en cache dans localStorage (valides 5 minutes).
Filtrage par pays de l’utilisateur (si connecté).


Favoris et panier (ProductCard.jsx, ProductDetails.jsx, SearchResults.jsx, etc.) :
Les utilisateurs authentifiés peuvent ajouter des produits à leurs favoris ou au panier.
Actions désactivées pendant le chargement pour éviter les clics multiples.


Rôles et permissions (ProtectedRoute.jsx) :
Protège les routes sensibles (ex. /tableau-de-bord pour les vendeurs, /admin pour les admins).
Les rôles sont stockés dans la table profiles de Supabase.


Sidebar (Sidebar.jsx) :
Menu latéral avec liens conditionnels selon l’état d’authentification et le rôle.
Permet de changer le pays via un prompt (à améliorer).


Notifications (Notifications.jsx) :
Récupère et affiche les notifications avec marquage "lu" au clic.
Ouvre un modal pour les détails.


Profil et paiement (Profile.jsx) :
Gère les informations utilisateur et le retour de paiement PayDunya.
Navigation contextuelle selon le rôle.


Recherche paginée (SearchResults.jsx) :
Gère la pagination et le filtrage par pays avec mise à jour des favoris/panier.


Détails de boutique (ShopDetails.jsx) :
Affiche les produits d’une boutique avec gestion des favoris/panier.


Liste des boutiques (Shops.jsx) :
Filtre les boutiques par pays avec lien vers les détails.


Top produits (TopProducts.jsx) :
Calcule et affiche les produits populaires basés sur les favoris.


Authentification (useAuth.js) :
Gère l’état d’authentification et le nombre de notifications non lues.



Problèmes connus

Rendu de Home.jsx :
Les modifications peuvent ne pas s’appliquer immédiatement en raison de problèmes de cache ou de build. Utilise Ctrl + F5 pour forcer un rechargement.


Recherche (SearchResults.jsx) :
Les requêtes to_tsquery ont échoué précédemment (erreur 404). La recherche utilise maintenant ilike, mais il faut tester avec des utilisateurs non connectés.
Les favoris/panier sont limités à 100 sans pagination.


Ajout de produit (AddProduct.jsx) :
Les images uploadées ne sont pas nettoyées en cas d’échec, ce qui peut laisser des fichiers orphelins dans Supabase Storage.
Validation basique des champs (ex. description accepte des entrées courtes).


Tableau de bord admin (AdminDashboard.jsx) :
Chargement de tous les produits/vendeurs en une fois, ce qui peut être lourd pour de grandes bases de données.
Utilisation d’alert() pour les messages complets (UX à améliorer).


Panier (Cart.jsx) :
L’abonnement postgres_changes peut entraîner des mises à jour inutiles pour d’autres utilisateurs.
Pas de confirmation visuelle après modification de la quantité.


Devenir vendeur (BecomeVendor.jsx) :
Les appels PayDunya exposent les clés API côté client, ce qui pose un risque de sécurité.
Les messages de succès disparaissent automatiquement sans option de fermeture manuelle.


Tableau de bord vendeur (Dashboard.jsx) :
Chargement de tous les produits sans pagination, pouvant affecter les performances.
Les boutons manquent d’aria-label pour l’accessibilité.


Modifier un produit (EditProduct.jsx) :
Les anciennes images supprimées ne sont pas effacées de Supabase Storage.
Les uploads d’images sont séquentiels, ce qui peut être lent.


Connexion (Login.jsx) :
Les métadonnées du profil ne sont pas validées avant insertion.
Les erreurs sont statiques sans option de fermeture.


Ma boutique (MyShop.jsx) :
Pas de lien ou d’action pour gérer la boutique.
Manque d’accessibilité (pas d’aria-label).


Notifications (Notifications.jsx) :
Pas de pagination pour les notifications.
Le modal manque de rôle dialog et les boutons manquent d’aria-label.


Détails d’un produit (ProductDetails.jsx) :
Les boutons manquent d’aria-label, et alert() est utilisé pour les non-connectés.


Profil (Profile.jsx) :
Les clés PayDunya sont exposées côté client.
Le bouton "Modifier" affiche une alerte statique.


Inscription (Register.jsx) :
Le modal de succès n’a pas de fermeture manuelle.
Pas de protection contre les bots (ex. reCAPTCHA).


Résultats de recherche (SearchResults.jsx) :
Favoris/panier limités à 100 sans pagination.
Boutons de pagination manquent d’aria-label détaillé.


Détails de boutique (ShopDetails.jsx) :
Limite de 10 produits sans pagination.
Pas de lien WhatsApp pour contacter.


Liste des boutiques (Shops.jsx) :
Pas de pagination pour les boutiques.
Select manque d’aria-label détaillé.


Top produits (TopProducts.jsx) :
Récupère tous les produits sans limite initiale.
Select manque d’aria-label.


Voir les boutiques (ViewShops.jsx) :
Placeholder sans contenu dynamique.


Packs (packs.js) :
Liste statique, difficile à maintenir.
Couleurs sans vérification de contraste.


Gestion des erreurs (errorHandler.js) :
Messages d’erreur génériques, manquent de détails.


Styles (App.css) :
Contient des styles inutiles (logo animé).
Animation sans contrôle pour les utilisateurs sensibles.


Client Supabase (supabaseClient.js) :
Clé anonyme exposée côté client.
Appels non optimisés dans checkVendorQuota.


Routes (App.jsx) :
Pas de lazy-loading pour les pages.
Pas de gestion du focus pour la sidebar.


Styles globaux (index.css) :
Polices Google Fonts sans optimisation.
Pas de polices de secours.


Rendu (main.jsx) :
Pas de StrictMode pour le développement.
Pas de configuration pour les anciens navigateurs.


Authentification (useAuth.js) :
Appels fréquents à fetchNotifications sans debounce robuste.
Erreurs non affichées à l’utilisateur.


Performance :
La barre de recherche envoie des requêtes fréquentes à Supabase. Un debounce plus robuste (ex. lodash.debounce) est recommandé.
La logique d’authentification est répétée dans plusieurs composants (ProtectedRoute.jsx, Sidebar.jsx), ce qui peut causer des appels redondants à Supabase.


Accessibilité :
Les boutons de favoris/panier dans ProductCard.jsx, ProductDetails.jsx, etc., manquent d’attributs aria-label.
Les suggestions de recherche dans SearchBar.jsx ne mettent pas à jour aria-selected dynamiquement.
Les formulaires (AddProduct.jsx, EditProduct.jsx, Login.jsx, Register.jsx) manquent d’aria-describedby pour associer les erreurs.
Les selects dans SearchResults.jsx, Shops.jsx, et TopProducts.jsx manquent d’aria-label détaillé.


Expérience utilisateur :
Changer le pays via prompt() dans Sidebar.jsx n’est pas intuitif. Un formulaire ou une liste déroulante serait mieux.


Dépendances externes :
ProductCard.jsx utilise un placeholder externe (https://via.placeholder.com/150). Une image locale est préférable.
Cart.jsx utilise /default-product.jpg sans vérifier son existence.



Améliorations suggérées

Centralisation de l’authentification :
Utilise un contexte global (ex. via useAuth) pour centraliser la logique d’authentification et éviter les appels redondants à Supabase.


Accessibilité :
Ajoute des attributs aria-label aux boutons et icônes (ex. favoris, panier, recherche, carrousel, pagination).
Ajoute aria-describedby pour associer les erreurs aux champs des formulaires.
Mets à jour aria-selected dans les suggestions de recherche.
Ajoute un rôle dialog au modal dans Notifications.jsx.
Gère le focus pour la sidebar dans App.jsx.


Performance :
Implémente la pagination côté serveur pour AdminDashboard.jsx, Dashboard.jsx, Notifications.jsx, SearchResults.jsx, ShopDetails.jsx, Shops.jsx, et TopProducts.jsx.
Utilise Promise.all pour uploader les images en parallèle dans AddProduct.jsx et EditProduct.jsx.
Filtre l’abonnement postgres_changes dans Cart.jsx pour ne réagir qu’aux changements de l’utilisateur actuel.
Ajoute le lazy-loading pour les pages dans App.jsx.
Optimise les appels dans supabaseClient.js.
Utilise lodash.debounce pour fetchNotifications dans useAuth.js.


Expérience utilisateur :
Remplace le prompt() pour changer le pays par un formulaire ou une liste déroulante dans Sidebar.jsx.
Ajoute un bouton pour fermer manuellement les messages de succès dans BecomeVendor.jsx, Register.jsx, et les erreurs dans Login.jsx.
Remplace alert() par un modal pour les messages dans AdminDashboard.jsx, Home.jsx, ProductDetails.jsx, SearchResults.jsx, etc.
Ajoute une confirmation visuelle (ex. toast) après modification de la quantité dans Cart.jsx.
Affiche les erreurs de useAuth.js via un composant UI (ex. toast).


Sécurité :
Déplace les appels PayDunya vers une fonction serveur dans BecomeVendor.jsx et Profile.jsx pour éviter d’exposer les clés API.
Déplace les appels sensibles de supabaseClient.js vers une API serveur.
Valide les métadonnées du profil dans Login.jsx avant insertion.
Ajoute un reCAPTCHA dans Register.jsx.


Tests :
Ajoute des tests unitaires pour les composants clés (ex. ProductCard, SearchBar, AddProduct, Notifications, SearchResults) avec Jest et React Testing Library.
Teste les cas limites (ex. utilisateur non connecté, images manquantes, erreurs réseau).


Styles :
Héberge les polices localement dans index.css.
Supprime les styles inutiles dans App.css.



Contribution

Crée une branche pour tes modifications :git checkout -b feature/nouvelle-fonctionnalite


Fais tes changements et commite-les :git commit -m "Ajouter une nouvelle fonctionnalité"


Envoie ta branche et ouvre une pull request.

Déploiement

Hébergement : Déployé via Netlify (voir netlify.toml pour la configuration).
Variables d’environnement : Assure-toi que VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, et les clés PayDunya sont configurées dans le tableau de bord Netlify.

Licence
MIT - Voir le fichier LICENSE pour plus de détails.
© 2025 MarchéNet Afrique. Tous droits réservés.
