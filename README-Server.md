Server - MarchéNet Afrique
Overview
Ce dossier server/ contient le code du serveur backend pour MarchéNet Afrique, une plateforme e-commerce permettant d’acheter et de vendre des produits locaux en Afrique. Le serveur agit comme un intermédiaire entre le front-end (l’application React) et les services externes tels que Supabase (base de données) et PayDunya (paiement). Cela garantit une architecture sécurisée, flexible et maintenable.
Objectifs du serveur

Centralisation : Gérer toutes les interactions avec Supabase et PayDunya, évitant ainsi l’exposition des clés API côté client.
Sécurité : Protéger les clés sensibles et les données utilisateur en centralisant la logique sensible dans le serveur.
Flexibilité : Permettre des modifications ou des changements de services (ex. base de données, passerelle de paiement) sans toucher au front-end.
Maintenabilité : Simplifier la gestion pour un débutant en centralisant la logique métier.

Prerequisites
Avant de démarrer, assurez-vous d’avoir les éléments suivants installés :

Node.js (version 18.x ou supérieure)
npm (version 9.x ou supérieure)
Un compte Supabase (pour la base de données)
Un compte PayDunya (pour les paiements)

Installation

Naviguez dans le dossier du serveur :
cd server


Installez les dépendances :
npm install

Les dépendances incluent :

express : Framework pour créer l’API.
cors : Gestion des requêtes cross-origin.
axios : Pour les appels HTTP (ex. PayDunya).
@supabase/supabase-js : Client pour interagir avec Supabase.
dotenv : Gestion des variables d’environnement.


Configurez les variables d’environnement :Créez un fichier .env à la racine du dossier server/ avec les informations suivantes :
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PAYDUNYA_MASTER_KEY=your_paydunya_master_key
PAYDUNYA_PRIVATE_KEY=your_paydunya_private_key
PAYDUNYA_TOKEN=your_paydunya_token
PAYDUNYA_CHECKOUT_URL=https://app.paydunya.com/api/v1/checkout-invoice/create
PORT=3001


Remplacez your_supabase_url et your_supabase_key par les valeurs de votre projet Supabase.
Remplacez your_paydunya_* par les clés de votre compte PayDunya (utilisez les clés de test si vous êtes en développement).



Usage

Démarrez le serveur :
node index.js

Le serveur démarre sur le port 3001 (ou le port spécifié dans PORT). Vous devriez voir un message comme :
Serveur démarré sur le port 3001 à <date>


Assurez-vous que le front-end est configuré :Le front-end doit être configuré pour appeler le serveur à l’adresse http://localhost:3001/api. Vérifiez que le front-end est lancé (voir le README.md principal).


API Endpoints
Le serveur expose une API REST pour gérer toutes les fonctionnalités de l’application. Voici la liste des endpoints disponibles :
Authentification

GET /api/auth/check

Vérifie si un utilisateur est connecté.
En-tête requis : Authorization: Bearer <token>
Réponse : { user: { id, email, country, role } } ou { error: "Utilisateur non authentifié" }


POST /api/auth/login

Connecte un utilisateur.
Corps : { email, password }
Réponse : { user, session } ou { error: "Erreur lors de la connexion" }


POST /api/auth/register

Inscrit un nouvel utilisateur.
Corps : { email, password, phone, country }
Réponse : { user, session } ou { error: "Erreur lors de l’inscription" }


POST /api/auth/logout

Déconnecte l’utilisateur.
Réponse : { message: "Déconnexion réussie" }



Produits

GET /api/products

Récupère la liste des produits.
Paramètres de requête : category, country, priceRange, condition, limit
Réponse : [{ id, name, price, stock, stock_status, category, countries, photo_urls, vendor_id, condition }, ...]


GET /api/products/:id

Récupère les détails d’un produit spécifique.
Réponse : { id, name, price, stock, stock_status, category, countries, photo_urls, vendor_id, condition, description }


POST /api/products

Ajoute un nouveau produit (réservé aux vendeurs).
En-tête requis : Authorization: Bearer <token>
Corps : { name, price, stock, category, countries, photo_urls, condition, description }
Réponse : { id, name, price, ... } ou { error: "Erreur lors de l’ajout" }



Favoris et Panier

GET /api/user/:userId/favorites-cart

Récupère les favoris et le panier d’un utilisateur.
En-tête requis : Authorization: Bearer <token>
Réponse : { favorites: [productId, ...], cart: [{ product_id, quantity }, ...] }


POST /api/favorites/toggle

Ajoute ou supprime un produit des favoris.
En-tête requis : Authorization: Bearer <token>
Corps : { productId }
Réponse : { action: "added" } ou { action: "removed" }


POST /api/cart/toggle

Ajoute ou supprime un produit du panier.
En-tête requis : Authorization: Bearer <token>
Corps : { productId, quantity }
Réponse : { action: "added" } ou { action: "removed" }



Notifications

GET /api/notifications/:userId

Récupère les notifications d’un utilisateur.
En-tête requis : Authorization: Bearer <token>
Réponse : [{ id, user_id, title, message, is_read, created_at }, ...]


POST /api/notifications/mark-read

Marque une notification comme lue.
En-tête requis : Authorization: Bearer <token>
Corps : { notificationId }
Réponse : { message: "Notification marquée comme lue" }



Recherche

GET /api/search
Recherche des produits.
Paramètres de requête : query, country, page, limit
Réponse : { products: [{ id, name, price, ... }], total: number }



Vendeurs

GET /api/vendors/check

Vérifie si l’utilisateur est un vendeur.
En-tête requis : Authorization: Bearer <token>
Réponse : { id, is_store_active, current_plan, subscription_end_date, ... } ou null


POST /api/vendors/register

Inscrit ou met à jour un vendeur.
En-tête requis : Authorization: Bearer <token>
Corps : { vendorName, shopName, address, country, phoneNumber, email, vendorCode, currentPlan, durationDays, quota }
Réponse : { message: "Inscription vendeur réussie" }



Paiements (PayDunya)

POST /api/payments/create

Crée une facture de paiement via PayDunya.
En-tête requis : Authorization: Bearer <token>
Corps : { amount, description, customer: { name, email, phone }, cancel_url, return_url, callback_url }
Réponse : { success: true, paymentUrl }


GET /api/payments/status/:token

Vérifie le statut d’un paiement.
Réponse : { success: true, status: "completed" | "pending" | "failed" }



Administration

GET /api/admin/products

Liste tous les produits (réservé aux admins).
En-tête requis : Authorization: Bearer <token>
Réponse : [{ id, name, price, ... }, ...]


GET /api/admin/vendors

Liste tous les vendeurs (réservé aux admins).
En-tête requis : Authorization: Bearer <token>
Réponse : [{ id, auth_id, vendor_name, shop_name, ... }, ...]


POST /api/admin/notifications/send

Envoie une notification (réservé aux admins).
En-tête requis : Authorization: Bearer <token>
Corps : { title, message, userId (optionnel) }
Réponse : { message: "Notification envoyée" }



Boutiques

GET /api/shops

Liste les boutiques actives.
Paramètres de requête : country
Réponse : [{ auth_id, shop_name, country }, ...]


GET /api/shops/:authId

Récupère les détails d’une boutique et ses produits.
Réponse : { vendor: { auth_id, shop_name, country, vendor_name }, products: [{ id, name, price, ... }] }



Testing

Testez chaque endpoint avec un outil comme Postman ou via le front-end.
Exemple de requête (connexion) :curl -X POST http://localhost:3001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "password"}'


Vérifiez les logs du serveur pour détecter les erreurs.

Security Considerations

Les clés Supabase et PayDunya sont stockées dans .env et ne doivent jamais être exposées.
Les endpoints protégés nécessitent un token d’authentification (Authorization: Bearer <token>).
Le serveur utilise CORS pour limiter les origines autorisées (actuellement http://localhost:5173).

Troubleshooting

Erreur "Cannot find module" : Assurez-vous d’avoir exécuté npm install.
Erreur "Supabase connection failed" : Vérifiez que SUPABASE_URL et SUPABASE_KEY sont corrects dans .env.
Erreur "PayDunya request failed" : Vérifiez les clés PayDunya dans .env et assurez-vous qu’elles sont valides.
Erreur CORS : Assurez-vous que l’origine du front-end (http://localhost:5173) est autorisée dans cors.

Future Improvements

Ajouter un système de journalisation plus avancé (ex. Winston).
Implémenter un cache (ex. Redis) pour les requêtes fréquentes.
Ajouter des tests unitaires pour les endpoints.
Déployer le serveur sur un hébergement comme Render ou Heroku.

Contributing
Si vous souhaitez contribuer :

Forkez le projet.
Créez une branche pour votre fonctionnalité (git checkout -b feature/nouvelle-fonction).
Commitez vos changements (git commit -m "Ajout de nouvelle fonctionnalité").
Poussez votre branche (git push origin feature/nouvelle-fonction).
Créez une Pull Request.

