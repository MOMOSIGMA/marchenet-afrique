import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import packs from '../utils/packs';

function BecomeVendor() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vendorName: '',
    shopName: '',
    address: '',
    country: 'Sénégal',
    dialCode: '+221',
    phoneNumber: '',
    email: '',
    vendorCode: '',
  });
  const [selectedPack, setSelectedPack] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExistingVendor, setIsExistingVendor] = useState(false);
  const [existingVendorData, setExistingVendorData] = useState(null);
  const navigate = useNavigate();

  const countries = [
    { name: 'Sénégal', code: 'SN', dialCode: '+221' },
    { name: 'Mali', code: 'ML', dialCode: '+223' },
    { name: "Côte d'Ivoire", code: 'CI', dialCode: '+225' },
    { name: 'Guinée', code: 'GN', dialCode: '+224' },
    { name: 'Burkina Faso', code: 'BF', dialCode: '+226' },
    { name: 'Togo', code: 'TG', dialCode: '+228' },
    { name: 'Bénin', code: 'BJ', dialCode: '+229' },
  ];

  useEffect(() => {
    const checkVendorStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/connexion');
        return;
      }

      const userId = session.user.id;
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, is_store_active, current_plan, subscription_end_date, vendor_name, shop_name, address, country, phone_number, email, vendor_code')
        .eq('auth_id', userId)
        .single();

      if (vendorError && vendorError.code !== 'PGRST116') {
        setError('Erreur lors de la vérification de votre statut vendeur : ' + vendorError.message);
        return;
      }

      if (vendor && vendor.is_store_active) {
        setSuccess('Vous êtes déjà vendeur ! Redirection vers votre tableau de bord...');
        setTimeout(() => navigate('/tableau-de-bord'), 5000);
      } else if (vendor && !vendor.is_store_active) {
        setIsExistingVendor(true);
        setExistingVendorData(vendor);
        setFormData({
          vendorName: vendor.vendor_name || '',
          shopName: vendor.shop_name || '',
          address: vendor.address || '',
          country: vendor.country || 'Sénégal',
          dialCode: countries.find(c => c.name === (vendor.country || 'Sénégal'))?.dialCode || '+221',
          phoneNumber: vendor.phone_number ? vendor.phone_number.replace(/^\+\d+/, '') : '',
          email: vendor.email || '',
          vendorCode: vendor.vendor_code || '',
        });
        setStep(2);
      }
    };

    checkVendorStatus();
  }, [navigate]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const selectedCountry = countries.find((c) => c.name === value);
      setFormData({
        ...formData,
        country: value,
        dialCode: selectedCountry.dialCode,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (step === 1) {
      if (!formData.vendorName || !formData.shopName || !formData.address || !formData.country || !formData.phoneNumber || !formData.email) {
        setError('Veuillez remplir tous les champs.');
        return;
      }

      const prefix = 'VEND-';
      const random = Math.random().toString(36).substr(2, 8).toUpperCase();
      const uniqueCode = `${prefix}${random}`;

      setFormData(prev => ({ ...prev, vendorCode: uniqueCode }));
      setSuccess(`Informations enregistrées ! Choisissez un pack pour continuer.`);
      setStep(2);
    }
  };

  const handlePackSelection = async (pack) => {
    setSelectedPack(pack);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Erreur lors de la récupération de l’utilisateur : ' + userError.message);
      if (!user) throw new Error("Utilisateur non connecté.");

      // Vérifier si c'est un nouveau vendeur
      const { data: existingVendor, error: vendorCheckError } = await supabase
        .from('vendors')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (vendorCheckError && vendorCheckError.code !== 'PGRST116') throw vendorCheckError;

      if (pack.name === 'Pack Gratuit') {
        // Le Pack Gratuit est réservé aux nouveaux vendeurs
        if (existingVendor) {
          setError('Le Pack Gratuit est réservé aux nouveaux vendeurs. Choisissez un autre pack pour renouveler votre abonnement.');
          return;
        }

        // Activer immédiatement le Pack Gratuit pour un nouveau vendeur
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + pack.durationDays);

        const { error: insertError } = await supabase
          .from('vendors')
          .insert({
            auth_id: user.id,
            vendor_name: formData.vendorName,
            shop_name: formData.shopName,
            address: formData.address,
            country: formData.country,
            phone_number: `${formData.dialCode}${formData.phoneNumber}`,
            email: formData.email,
            vendor_code: formData.vendorCode,
            current_plan: pack.name,
            subscription_end_date: subscriptionEndDate.toISOString(),
            quota_limit: pack.quota,
            is_store_active: true,
          });

        if (insertError) throw insertError;

        setSuccess(`Félicitations, ${formData.vendorName} ! Votre boutique "${formData.shopName}" est prête avec le ${pack.name}. Code vendeur : ${formData.vendorCode}. Redirection vers votre tableau de bord...`);
        setTimeout(() => navigate('/tableau-de-bord'), 5000);
      } else {
        // Pour les packs payants, passer à l'étape de paiement
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
      console.error('Erreur lors de la sélection du pack:', err);
    }
  };

  const handlePayment = async () => {
    if (!selectedPack || selectedPack.price === 0) {
      setError("Aucun pack payant sélectionné.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const response = await axios.post(
        'https://app.paydunya.com/api/v1/checkout-invoice/create',
        {
          invoice: {
            total_amount: selectedPack.price,
            description: `Paiement pour le ${selectedPack.name} - Boutique ${formData.shopName}`,
            currency: 'XOF',
            items: [
              {
                name: selectedPack.name,
                quantity: 1,
                unit_price: selectedPack.price,
                description: `Abonnement ${selectedPack.name} pour ${formData.shopName}`,
              },
            ],
          },
          store: {
            name: "MarchéNet Afrique",
            tagline: "La plateforme des vendeurs africains",
            phone: "+221123456789",
            website_url: "https://marche-net-afrique.netlify.app/",
          },
          actions: {
            callback_url: "https://marche-net-afrique.netlify.app/profile",
            return_url: "https://marche-net-afrique.netlify.app/profile",
            cancel_url: "https://marche-net-afrique.netlify.app/devenir-vendeur",
          },
          custom_data: {
            mode: "test",
            user_id: user.id,
            pack_name: selectedPack.name,
            vendor_data: {
              vendor_name: formData.vendorName,
              shop_name: formData.shopName,
              address: formData.address,
              country: formData.country,
              phone_number: `${formData.dialCode}${formData.phoneNumber}`,
              email: formData.email,
              vendor_code: formData.vendorCode,
            },
          },
        },
        {
          headers: {
            'PAYDUNYA-MASTER-KEY': import.meta.env.VITE_PAYDUNYA_MASTER_KEY,
            'PAYDUNYA-PUBLIC-KEY': import.meta.env.VITE_PAYDUNYA_PUBLIC_KEY,
            'PAYDUNYA-PRIVATE-KEY': import.meta.env.VITE_PAYDUNYA_PRIVATE_KEY,
            'PAYDUNYA-TOKEN': import.meta.env.VITE_PAYDUNYA_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.response_code === "00") {
        const paymentUrl = response.data.response_text || `https://paydunya.com/checkout/invoice/${response.data.token}`;
        window.location.href = paymentUrl;
      } else {
        throw new Error("Échec de la création de la facture : " + JSON.stringify(response.data));
      }
    } catch (error) {
      setError(
        "Erreur lors de la création du paiement : " +
        (error.response?.data?.response_text || error.message)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl transform transition-all hover:shadow-3xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 font-poppins">
            Rejoignez MarchéNet Afrique
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-opensans">
            {step === 1
              ? "Remplissez vos informations pour devenir vendeur"
              : step === 2
              ? "Choisissez un pack pour lancer ou renouveler votre boutique"
              : "Finalisez votre inscription avec le paiement"}
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {showSuccess && success && (
          <div className="fixed top-0 left-0 right-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-lg max-w-md text-center">
              <span className="block sm:inline">{success}</span>
            </div>
          </div>
        )}
        {step === 1 && !isExistingVendor && (
          <form className="space-y-6" onSubmit={handleNext}>
            <div className="space-y-4">
              <div>
                <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">
                  Nom du vendeur
                </label>
                <input
                  id="vendorName"
                  name="vendorName"
                  type="text"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                  placeholder="Votre nom complet"
                  value={formData.vendorName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                  Nom de la boutique
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                  placeholder="Nom de votre boutique"
                  value={formData.shopName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                  placeholder="Adresse de la boutique"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Pays
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                  value={formData.country}
                  onChange={handleChange}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name} ({country.dialCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-4 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                    {formData.dialCode}
                  </span>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-r-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                    placeholder="Numéro de téléphone"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
              >
                Continuer
              </button>
            </div>
          </form>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-800">
              Choisissez votre pack
            </h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
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
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        {step === 3 && (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-bold text-gray-800">
              Finalisez votre inscription
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
              onClick={() => setStep(2)}
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

export default BecomeVendor;