const packs = [
  {
    name: "Pack Gratuit",
    price: 0,
    durationDays: 30,
    description: "Commencez avec les bases et testez la plateforme.",
    benefits: [
      "2 produits maximum",
      "1 mois gratuit pour les nouveaux inscrits",
      "Support par email",
    ],
    color: "bg-gray-50 border-gray-500",
    quota: 2,
    dailyLimit: 1,
  },
  {
    name: "Pack Basique",
    price: 3500,
    durationDays: 30,
    description: "Idéal pour les petits vendeurs qui veulent se développer.",
    benefits: [
      "10 produits par mois",
      "1 mois gratuit pour les nouveaux inscrits",
      "Statistiques de base",
      "Support par email",
    ],
    color: "bg-green-50 border-green-500",
    quota: 10,
    dailyLimit: 5,
  },
  {
    name: "Pack Pro",
    price: 7500,
    durationDays: 30,
    description: "Boostez votre visibilité et atteignez plus de clients.",
    benefits: [
      "25 produits par mois",
      "1 mois gratuit pour les nouveaux inscrits",
      "Annonces prioritaires",
      "Support par chat",
    ],
    color: "bg-blue-50 border-blue-500",
    quota: 25,
    dailyLimit: 10,
  },
  {
    name: "Pack VIP",
    price: 20000,
    durationDays: 30,
    description: "Tous les avantages pour une boutique de référence.",
    benefits: [
      "Produits illimités",
      "Visibilité maximale",
      "Badge vérifié",
      "Support prioritaire 24/7",
    ],
    color: "bg-yellow-50 border-yellow-500",
    quota: 9999,
    dailyLimit: Infinity,
  },
];

export default packs;