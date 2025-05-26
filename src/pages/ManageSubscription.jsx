import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const packs = [
  {
    name: "Pack Gratuit",
    price: 0,
    description: "Commencez avec les bases et testez la plateforme.",
    benefits: [
      "2 produits maximum",
      "1 mois gratuit pour les nouveaux inscrits",
      "Support par email",
    ],
    color: "bg-gray-50 border-gray-500",
  },
  {
    name: "Pack Basique",
    price: 3500,
    description: "Idéal pour les petits vendeurs qui veulent se développer.",
    benefits: [
      "10 produits par mois",
      "1 mois gratuit pour les nouveaux inscrits",
      "Statistiques de base",
      "Support par email",
    ],
    color: "bg-green-50 border-green-500",
  },
  {
    name: "Pack Pro",
    price: 7500,
    description: "Boostez votre visibilité et atteignez plus de clients.",
    benefits: [
      "25 produits par mois",
      "1 mois gratuit pour les nouveaux inscrits",
      "Annonces prioritaires",
      "Support par chat",
    ],
    color: "bg-blue-50 border-blue-500",
  },
  {
    name: "Pack VIP",
    price: 20000,
    description: "Tous les avantages pour une boutique de référence.",
    benefits: [
      "Produits illimités",
      "Visibilité maximale",
      "Badge vérifié",
      "Support prioritaire 24/7",
    ],
    color: "bg-yellow-50 border-yellow-500",
  },
];

function ManageSubscription() {
  const [vendorData, setVendorData] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(1); // 1: Sélection du pack, 2: Paiement
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/connexion');
          return;
        }

        const response = await api.get('/vendors/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vendor = response.data;
        if (!vendor) {
          navigate('/devenir-vendeur');
          return;
        }
        setVendorData(vendor);
      } catch (err) {
        setError(err.response?.data?.error || "Une erreur est survenue.");
      }
    };

    fetchVendorData();
  }, [navigate]);

  const handlePackSelection = async (pack) => {
    setSelectedPack(pack);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Utilisateur non connecté.");

      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + 30); // Ajoute 30 jours

      const response = await api.put('/vendors/me', {
        pack: pack.name,
        subscription_end_date: newEndDate.toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (pack.price > 0) {
        setStep(2);
      } else {
        setSuccess(`Votre abonnement a été mis à jour vers le ${pack.name} ! Redirection vers le tableau de bord...`);
        setTimeout(() => navigate('/tableau-de-bord'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handlePayment = async () => {
    if (!selectedPack || selectedPack.price === 0) {
      setError("Aucun pack payant sélectionné.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/payments/create', {
        amount: selectedPack.price,
        description: `Paiement pour le ${selectedPack.name} - Boutique ${vendorData.shop_name}`,
        customer: {
          name: 'Utilisateur',
          email: vendorData.email || 'user@example.com',
          phone: vendorData.phone_number || '123456789',
        },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error("Échec de la création de la facture : " + JSON.stringify(response.data));
      }
    } catch (error) {
      setError(
        "Erreur lors de la création du paiement : " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  if (!vendorData) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600 text-lg">Chargement...</p>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl transform transition-all hover:shadow-3xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 font-poppins">
            Gérer votre abonnement
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-opensans">
            {step === 1
              ? "Choisissez un pack pour modifier ou renouveler votre abonnement"
              : "Finalisez votre changement d’abonnement avec le paiement"}
          </p>
          <p className="text-sm text-gray-500">
            Pack actuel : {vendorData.pack} | Fin : {vendorData.subscription_end_date ? new Date(vendorData.subscription_end_date).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-lg max-w-md text-center">
              <span>{success}</span>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {packs.map((pack) => (
                <div
                  key={pack.name}
                  className={`border-l-4 ${pack.color} p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer`}
                >
                  <h4 className="text-xl font-semibold text-gray-900">{pack.name}</h4>
                  <p className="mt-2 text-gray-600">{pack.description}</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {pack.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-lg font-bold text-gray-900">{pack.price} FCFA</p>
                  <button
                    onClick={() => handlePackSelection(pack)}
                    className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                  >
                    Choisir ce pack
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-bold text-gray-800">
              Finalisez votre changement
            </h3>
            <p className="text-gray-600">
              Vous avez choisi le <strong>{selectedPack.name}</strong> pour {selectedPack.price} FCFA.
            </p>
            <p className="text-sm text-gray-500">
              Payez avec Wave, Orange Money, ou carte bancaire via PayDunya.
            </p>
            <button
              onClick={handlePayment}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Payer avec PayDunya
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
            >
              Retourner à la sélection du pack
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageSubscription;