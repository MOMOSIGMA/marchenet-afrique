Intégration PayDunya
Ce document décrit l'intégration de l'API PayDunya dans notre serveur Node.js pour gérer les paiements via l'API "Paiement Avec Redirection" (PAR).
Prérequis

Clés API PayDunya : Obtenez les clés suivantes auprès de PayDunya :
PAYDUNYA_MASTER_KEY
PAYDUNYA_PRIVATE_KEY
PAYDUNYA_TOKEN


Environnement : Configurez ces clés dans les variables d'environnement sur Render (ne les stockez pas dans .env localement pour des raisons de sécurité).
Mode test : Clés avec préfixe test_ (ex. test_private_rMIdJM3PLLhLjyArx9tF3VURAF5).
Mode production : Clés sans préfixe test_ (à obtenir auprès de PayDunya).


Dépendances : Assurez-vous que axios est installé (npm install axios).

Endpoints
1. Création d'un paiement (/api/payments/create)

Méthode : POST

URL : /api/payments/create

Corps de la requête :
{
  "vendorId": "vendeur123",
  "amount": 5000,
  "description": "Abonnement mensuel",
  "customer": {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "phone": "771111111"
  },
  "cancel_url": "http://www.example.com/cancel",
  "return_url": "http://www.example.com/return",
  "callback_url": "http://www.example.com/callback"
}


vendorId : ID du vendeur (requis).
amount : Montant en FCFA (minimum 100).
description : Description du paiement (requis).
customer.name : Nom complet du client (requis).
customer.email : Email du client (requis, format email).
customer.phone : Numéro de téléphone du client (requis, 9 chiffres).
cancel_url : URL de redirection en cas d'annulation (optionnel).
return_url : URL de redirection après paiement réussi (optionnel, PayDunya ajoute ?token=invoice_token).
callback_url : URL pour l'IPN (optionnel, reçoit les données via POST application/x-www-form-urlencoded).


Réponse :

Succès (200) :{
  "success": true,
  "paymentUrl": "https://app.paydunya.com/checkout/invoice/test_RHICF0HboN",
  "invoiceToken": "test_RHICF0HboN",
  "message": "Paiement initié avec succès"
}


Erreur (400 ou 500) :{
  "success": false,
  "message": "Erreur lors de l'initiation du paiement",
  "error": "..."
}





2. Vérification de l'état du paiement (/api/payments/status/:invoiceToken)

Méthode : GET
URL : /api/payments/status/test_RHICF0HboN
Paramètres : invoiceToken dans l'URL.
Réponse :
Succès (200) :{
  "success": true,
  "status": "completed",
  "details": { ... },
  "message": "Statut du paiement récupéré avec succès"
}


Statuts possibles : pending, cancelled, completed, failed.
Erreur (500) :{
  "success": false,
  "message": "Erreur lors de la vérification du statut",
  "error": "..."
}





Détails techniques

API PayDunya utilisée : "Paiement Avec Redirection" (PAR).
Endpoints PayDunya :
Test : https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create
Production : https://app.paydunya.com/api/v1/checkout-invoice/create
Statut (test/production) : https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/[invoice_token] ou /api/v1/checkout-invoice/confirm/[invoice_token].


En-têtes :
Content-Type: application/json
PAYDUNYA-MASTER-KEY
PAYDUNYA-PRIVATE-KEY
PAYDUNYA-TOKEN


Pré-remplissage : Les champs name, email, et phone sont pré-remplis via le nœud customer.
Redirections :
cancel_url : Redirection après annulation.
return_url : Redirection après paiement (avec ?token=invoice_token).
callback_url : IPN pour notifications instantanées (format application/x-www-form-urlencoded).


Vérification du statut : Utilise le token pour interroger l'état via GET.

Prochaines étapes

Configurer les URLs : Remplacez les URLs par défaut par celles de votre domaine (ex. http://www.magasin-le-choco.com/...).
Implémenter le callback : Créez un endpoint pour traiter les données IPN (par exemple, /api/payments/callback) et validez le hash avec SHA-512.
Production : Remplacez les clés de test par des clés de production dans .env et déploiez.

Dépannage

Assurez-vous que les clés PayDunya sont correctes et configurées sur Render.
Vérifiez les logs pour les erreurs (console.error dans le code).
Testez localement avec Postman avant de déployer.

